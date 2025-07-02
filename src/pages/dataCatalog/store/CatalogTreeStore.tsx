import { Model, createAsyncEffect } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import React from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';
import { RootTypeEnum, subLeafKeys } from '../consts';
import { getCatalogList } from '@/api/dataCatalog';

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
}

interface ITreeData extends BaseTreeData {
  children?: {
    volume?: BaseTreeData[];
    // TODO 下一期做
    db?: BaseTreeData[];
  };
}

interface CatalogTreeState {
  activeTab: string;
  searchValue: string;
  inputValue: string;
  treeData: TreeDataType[];
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
  }) => Promise<Partial<CatalogTreeState>>;
}

export class CatalogTreeStore extends Model<CatalogTreeState, Effects> {
  constructor(public member: DataCatalog) {
    super({
      state: {
        activeTab: 'src',
        searchValue: '',
        inputValue: '',
        treeData: [],
        expandedKeys: [],
        selectedKey: '',
        inputRef: React.createRef<RefInputType>(),
        selectedPath: ''
      },
      effects: {
        fetchData: createAsyncEffect(
          async (options?: {
            showLoading?: boolean;
            activeTab?: string;
          }): Promise<Partial<CatalogTreeState>> => {
            const { activeTab } = this.getState();
            return await this.initTreeData(options?.activeTab || activeTab);
          },
          { loadingKey: 'loading' }
        )
      }
    });
  }

  async getRawData(activeKey?: string) {
    const { activeTab: stateActiveTab } = this.getState();
    const activeTab = activeKey || stateActiveTab;

    const res = await getCatalogList({
      root_type: RootTypeEnum[activeTab]
    });
    return this.convertRawDataToTreeData(res?.data?.[activeTab] || []);
  }

  async initTreeData(activeTab: string) {
    try {
      const cacheTreeData = await this.getRawData(activeTab);

      const defaultNode = cacheTreeData?.[0];
      const defaultExpand = [
        defaultNode?.key || '',
        defaultNode?.children?.[0]?.key || '',
        defaultNode?.children?.[1]?.key || ''
      ];
      const defaultSelectedNode = defaultNode?.children?.[0]?.children?.[0];

      return {
        treeData: cacheTreeData,
        expandedKeys: defaultExpand,
        searchValue: '',
        selectedKey: defaultSelectedNode?.key || '',
        selectedPath: defaultSelectedNode?.fullPath || ''
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

  convertRawDataToTreeData(data: ITreeData[]) {
    if (!Array.isArray(data)) return [];

    return data.map((catalog) => {
      const childrenArr: TreeDataType[] = [];

      if (catalog.children) {
        Object.entries(catalog.children).forEach(([type, arr]) => {
          const volumeKey = `${catalog.id}-${type}`;
          const subChildren = {
            title: subLeafKeys[type],
            key: volumeKey,
            type: type,
            parent_id: catalog.id,
            children:
              arr?.map((item) => {
                return {
                  ...item,
                  title: item.name,
                  key: String(item.id), // 转换为字符串
                  parent_id: catalog.id,
                  isLastLeaf: true,
                  fullPath: `${item.base_dir}src/${catalog.name}/volume/${item.name}`
                };
              }) || []
          };
          childrenArr.push(subChildren);
        });
      }

      return {
        ...catalog,
        title: catalog.name,
        key: String(catalog.id), // 转换为字符串
        children: childrenArr
      };
    });
  }
}
