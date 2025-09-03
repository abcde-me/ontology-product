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
    // TODO 下一期做
    db?: BaseTreeData[];
  };
}

export interface CatalogTreeState {
  activeTab: string;
  searchValue: string;
  inputValue: string;
  treeData: TreeDataType[];
  rawTreeData: TreeDataType[];
  expandedKeys: string[];
  selectedKey: string;
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
        selectedKey: '',
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
        defaultNode =
          cacheTreeData.find((d) => d.key === options?.parent_id) ||
          defaultNode;
        selectedNode =
          defaultNode?.children?.[0]?.children?.find((item) => {
            return item.key === options?.id;
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
        selectedKey: selectedNode?.key || '',
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
        const typeKey = `${catalog.id}-${type}`;
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
              key: String(item.id), // 转换为字符串
              parent_id: catalog.id,
              isLastLeaf: true,
              fullPath: `${item.base_dir === '/' ? item.base_dir : `${item.base_dir}/`}${activeKey}/${catalog.name}/${pathType}/${item.name}`
            };
          })
        };
        childrenArr.push(subChildren);
      });

      return {
        ...catalog,
        title: catalog.name,
        key: String(catalog.id), // 转换为字符串
        children: childrenArr
      };
    });
  }
}
