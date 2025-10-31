import { Model, createAsyncEffect } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import React from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';
import { RootTypeEnum, subLeafKeys } from '../consts';
import { getCatalogList } from '@/api/dataCatalog';
import { searchTreeData } from '../utils';

interface BaseTreeData {
  id: number;
  parent_id: number;
  type: number;
  type_name?: string;
  name: string;
  base_dir: string;
  isLastLeaf?: boolean;
  fullPath?: string;
  isAdd?: boolean;
  defaultName?: string;
}

interface ITreeData extends BaseTreeData {
  children?: {
    volume?: BaseTreeData[];
    db?: BaseTreeData[];
    db_item?: BaseTreeData[];
  };
}

export interface CatalogTreeState {
  activeTab: string;
  searchValue: string;
  inputValue: string;
  treeData: TreeDataType[];
  rawTreeData: TreeDataType[];
  expandedKeys: string[];
  selectedKey: string; // 存储实际的数据ID，用于API调用
  selectedTreeKey: string; // 存储完整的树节点key，用于显示选中样式
  selectedNodeType: string; // 新增：存储选中节点的类型
  selectedParentId: string; // 新增：存储选中节点的父节点ID
  inputRef: React.RefObject<RefInputType>;
  selectedPath: string;
  loading?: boolean;
}

interface Effects {
  fetchData: (options?: {
    showLoading?: boolean;
    activeTab?: string;
    parent_id?: string;
    id?: string;
  }) => Promise<Partial<CatalogTreeState>>;
}

export class CatalogTreeStore extends Model<CatalogTreeState, Effects> {
  constructor(public member: DataCatalog) {
    super({
      state: {
        activeTab: '',
        searchValue: '',
        inputValue: '',
        treeData: [],
        rawTreeData: [],
        expandedKeys: [],
        selectedKey: '', // 实际的数据ID
        selectedTreeKey: '', // 完整的树节点key
        selectedNodeType: '', // 初始化选中节点类型
        selectedParentId: '', // 初始化选中节点的父节点ID
        inputRef: React.createRef<RefInputType>(),
        selectedPath: ''
      },
      effects: {
        fetchData: createAsyncEffect(
          async (
            options?: Parameters<Effects['fetchData']>[0]
          ): Promise<Partial<CatalogTreeState>> => {
            return await this.initTreeData(options);
          },
          { loadingKey: 'loading' }
        )
      },
      computed: [
        {
          keys: ['searchValue', 'rawTreeData'],
          hander: (state: CatalogTreeState) => {
            const { searchValue, rawTreeData } = state;

            if (!searchValue.trim()) {
              return {
                treeData: rawTreeData
              };
            }

            const result = searchTreeData(rawTreeData, searchValue.trim());

            return {
              treeData: result.filteredData,
              expandedKeys: result.expandedKeys
            };
          }
        }
      ]
    });
  }

  async getRawData(props?: { activeKey?: string; searchValue?: string }) {
    const { activeTab } = this.getState();
    const activeKey = props?.activeKey || activeTab;

    const res = await getCatalogList({
      root_type: RootTypeEnum[activeKey],
      search: props?.searchValue
    });

    return this.convertRawDataToTreeData({
      data: res?.data?.[activeKey] || [],
      activeKey
    });
  }

  async initTreeData(options: Parameters<Effects['fetchData']>[0]) {
    const { activeTab } = this.getState();

    try {
      const cacheTreeData = await this.getRawData({
        activeKey: options?.activeTab || activeTab
      });

      let defaultExpand: string[] = [];
      let defaultNode = cacheTreeData?.[0];
      let selectedNode = defaultNode?.children?.[0]?.children?.[0];

      if (options?.parent_id && options.id) {
        // 根据新的key格式查找节点
        const parentKey = `${activeTab}-catalog-${options.parent_id}`;
        defaultNode =
          cacheTreeData.find((d) => d.key === parentKey) || defaultNode;
        selectedNode =
          defaultNode?.children?.[0]?.children?.find((item: any) => {
            return item.key.includes(`-${options.id}`);
          }) || selectedNode;
      }

      defaultExpand = [
        defaultNode?.key || '',
        defaultNode?.children?.[0]?.key || ''
      ];

      return {
        searchValue: '',
        activeTab: options?.activeTab || activeTab,
        treeData: cacheTreeData,
        rawTreeData: cacheTreeData,
        expandedKeys: defaultExpand,
        selectedKey: selectedNode?.id ? String(selectedNode.id) : '', // 存储实际ID
        selectedTreeKey: selectedNode?.key || '', // 存储完整的树节点key
        selectedPath: selectedNode?.fullPath || ''
      };
    } catch (err) {
      console.log(err);
    }

    return {};
  }

  setActiveTab(value: string) {
    this.setState({
      activeTab: value
    });
  }

  setInputValue(value: string) {
    this.setState({
      inputValue: value
    });
  }

  setSearchValue(value: string) {
    this.setState({
      searchValue: value
    });
  }

  convertRawDataToTreeData(options: { data: ITreeData[]; activeKey?: string }) {
    const { data } = options;
    if (!Array.isArray(data)) return [];

    const { activeTab } = this.getState();
    const activeKey = options.activeKey || activeTab;

    return data.map((catalog) => {
      const childrenArr: TreeDataType[] = [];

      // 根据activeKey决定支持的类型：源数据支持volume和db，目标数据只支持volume
      const supportedTypes =
        activeKey === 'src' ? ['volume', 'db'] : ['volume'];

      supportedTypes.forEach((type) => {
        // 修复key重复问题：加入catalog.id和activeKey确保唯一性
        const typeKey = `${activeKey}-${catalog.id}-${type}`;
        // 获取该类型下的实际数据，如果没有则使用空数组
        const typeData = catalog.children?.[type] || [];

        const subChildren = {
          title: subLeafKeys[type], // 显示"数据卷"或"数据库"
          key: typeKey,
          type: type,
          parent_id: catalog.id,
          // 为分类节点也设置fullPath，便于选中时使用
          fullPath: `${catalog.base_dir === '/' ? catalog.base_dir : `${catalog.base_dir}/`}${activeKey}/${catalog.name}/${type === 'volume' ? 'volume' : 'database'}`,
          children: typeData.map((item) => {
            // 根据类型设置不同的路径格式
            const pathType = type === 'volume' ? 'volume' : 'database';
            return {
              ...item,
              title: item.name,
              // 修复key重复问题：确保数据库/数据卷节点key的唯一性
              key: `${activeKey}-${catalog.id}-${type}-${item.id}`,
              parent_id: catalog.id,
              // 对于数据库类型，始终不是叶子节点；对于数据卷，总是叶子节点
              isLastLeaf: type === 'volume',
              fullPath: `${item.base_dir === '/' ? item.base_dir : `${item.base_dir}/`}${activeKey}/${catalog.name}/${pathType}/${item.name}`,
              // 如果是数据库且有表，则添加表作为子节点；否则初始化为空数组
              children:
                type === 'db'
                  ? item.children?.db_item && item.children.db_item.length > 0
                    ? item.children.db_item.map((table) => ({
                        ...table,
                        title: table.name,
                        // 修复key重复问题：确保数据库表key的唯一性
                        key: `${activeKey}-${catalog.id}-${type}-${item.id}-table-${table.id}`,
                        parent_id: item.id,
                        type: table.type,
                        type_name: 'db_item',
                        isLastLeaf: true,
                        fullPath: `${item.base_dir === '/' ? item.base_dir : `${item.base_dir}/`}${activeKey}/${catalog.name}/${pathType}/${item.name}/${table.name}`
                      }))
                    : []
                  : undefined
            };
          })
        };
        childrenArr.push(subChildren);
      });

      return {
        ...catalog,
        title: catalog.name,
        // 修复key重复问题：确保catalog节点key的唯一性
        key: `${activeKey}-catalog-${catalog.id}`,
        children: childrenArr
      };
    });
  }
}
