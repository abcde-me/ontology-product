import { Model, createAsyncEffect } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import React from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';
import { CatalogTypeEnum, RootTypeEnum, subLeafKeys } from '../consts';
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
  children?: {
    db_item?: BaseTreeData[];
  };
  extendsObj?: {
    db_name?: string;
    table_name?: string;
  };
}

interface ITreeData extends BaseTreeData {
  children?: {
    volume?: BaseTreeData[];
    db?: BaseTreeData[];
    metadata?: BaseTreeData[];
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
  extendsObj: Record<string, unknown>;
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
        selectedPath: '',
        extendsObj: {}
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
      search: props?.searchValue
    });

    const treeData = this.convertRawDataToTreeData({
      data: res?.data?.[activeKey] || [],
      activeKey
    });

    return treeData;
  }

  async initTreeData(options: Parameters<Effects['fetchData']>[0]) {
    const { activeTab } = this.getState();
    const activeKey = options?.activeTab || activeTab;

    try {
      const cacheTreeData = await this.getRawData({
        activeKey
      });

      let defaultExpand: string[] = [];
      let defaultNode = cacheTreeData?.[0];
      let selectedNode = defaultNode?.children?.[0]?.children?.[0];

      if (options?.parent_id && options.id) {
        // 根据新的key格式查找节点
        const parentKey = `${activeKey}-catalog-${options.parent_id}`;
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
        activeTab: activeKey,
        treeData: cacheTreeData,
        rawTreeData: cacheTreeData,
        expandedKeys: defaultExpand,
        extendsObj: selectedNode?.extends ?? {},
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

  /**
   * 转换 volume 类型数据为树节点
   */
  private convertVolumeType(
    activeKey: string,
    catalogId: number,
    volumeData: BaseTreeData[]
  ): TreeDataType {
    const typeKey = `${activeKey}-${catalogId}-volume`;
    const typeData = volumeData || [];

    return {
      title: subLeafKeys.volume,
      key: typeKey,
      type: 'volume',
      parent_id: catalogId,
      fullPath: '',
      children: typeData.map((item) => {
        const { children, ...rest } = item;
        return {
          ...rest,
          title: item.name,
          key: `${activeKey}-${catalogId}-volume-${item.id}`,
          parent_id: catalogId,
          isLastLeaf: true,
          fullPath: ''
        };
      })
    };
  }

  /**
   * 转换 db 类型数据为树节点
   */
  private convertDbType(
    activeKey: string,
    catalogId: number,
    dbData: BaseTreeData[]
  ): TreeDataType {
    const typeKey = `${activeKey}-${catalogId}-db`;
    const typeData = dbData || [];

    return {
      title: subLeafKeys.db,
      key: typeKey,
      type: 'db',
      parent_id: catalogId,
      fullPath: '',
      children: typeData.map((item) => {
        const { children, ...rest } = item;
        return {
          ...rest,
          title: item.name,
          key: `${activeKey}-${catalogId}-db-${item.id}`,
          parent_id: catalogId,
          isLastLeaf: false,
          fullPath: '',
          children:
            item.children?.db_item && item.children.db_item.length > 0
              ? item.children.db_item.map((table) => {
                  const { children: tableChildren, ...tableRest } = table || {};
                  return {
                    ...tableRest,
                    title: table?.name || '',
                    key: `${activeKey}-${catalogId}-db-${item.id}-table-${table?.id || ''}`,
                    parent_id: item.id,
                    type: table?.type,
                    type_name: 'db_item',
                    isLastLeaf: true,
                    fullPath: ''
                  };
                })
              : []
        };
      })
    };
  }

  /**
   * 转换 metadata 类型数据为树节点
   */
  private convertMetaDataType(
    activeKey: string,
    catalogId: number,
    metaData: BaseTreeData[]
  ): TreeDataType {
    const typeKey = `${activeKey}-${catalogId}-metadata`;
    const typeData = metaData || [];

    return {
      title: subLeafKeys.metadata || '元数据',
      key: typeKey,
      type: 'metadata',
      parent_id: catalogId,
      fullPath: '',
      children: typeData.map((item) => {
        const { children, ...rest } = item;
        return {
          ...rest,
          title: item.name,
          key: `${activeKey}-${catalogId}-metadata-${item.id}`,
          parent_id: catalogId,
          isLastLeaf: true,
          fullPath: '',
          // TODO: 需要根据item.children.item的类型来决定children的类型
          children: [],
          type: CatalogTypeEnum.metadata
        };
      })
    };
  }

  convertRawDataToTreeData(options: { data: ITreeData[]; activeKey?: string }) {
    const { data } = options;
    if (!Array.isArray(data)) return [];

    const { activeTab } = this.getState();
    const activeKey = options.activeKey || activeTab;

    return data.map((catalog) => {
      const childrenArr: TreeDataType[] = [];

      // 根据activeKey决定支持的类型：源数据支持volume、db和metadata，目标数据只支持volume
      if (activeKey === 'src') {
        // 源数据：始终渲染 volume、db、metadata 三个分组
        childrenArr.push(
          this.convertVolumeType(
            activeKey,
            catalog.id,
            catalog.children?.volume ?? []
          )
        );

        childrenArr.push(
          this.convertDbType(activeKey, catalog.id, catalog.children?.db ?? [])
        );

        childrenArr.push(
          this.convertMetaDataType(
            activeKey,
            catalog.id,
            catalog.children?.metadata ?? []
          )
        );
      } else {
        // 目标数据：始终渲染 volume 分组
        childrenArr.push(
          this.convertVolumeType(
            activeKey,
            catalog.id,
            catalog.children?.volume ?? []
          )
        );
      }

      return {
        ...catalog,
        title: catalog.name,
        key: `${activeKey}-catalog-${catalog.id}`,
        children: childrenArr
      };
    });
  }
}
