import { Model, createAsyncEffect } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import React from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';
import { subLeafKeys } from '../consts';
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
  isEditing: boolean;
  selectedFullPath: string;
  loading?: boolean;
}

interface Effects {
  fetchData: (options?: {
    showLoading?: boolean;
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
        isEditing: false,
        inputRef: React.createRef<RefInputType>(),
        selectedFullPath: ''
      },
      effects: {
        fetchData: createAsyncEffect(
          async (options?: {
            showLoading?: boolean;
          }): Promise<Partial<CatalogTreeState>> => {
            try {
              const cacheTreeData = await this.getRawData();

              return {
                treeData: cacheTreeData,
                expandedKeys: [
                  cacheTreeData?.[0]?.key || '',
                  cacheTreeData?.[0]?.children?.[0]?.key || '',
                  cacheTreeData?.[0]?.children?.[1]?.key || ''
                ],
                searchValue: '',
                selectedKey: String(
                  cacheTreeData?.[0]?.children?.[0]?.children?.[0]?.key || ''
                )
              };
            } catch (err) {
              console.log(err);
            }

            return {};
          },
          { loadingKey: 'loading' }
        )
      }
    });
  }

  async getRawData() {
    const { activeTab } = this.getState();

    const res = await getCatalogList({
      root_type: activeTab === 'src' ? 1 : 2
    });

    return this.convertRawDataToTreeData(res.data?.[activeTab] || []);
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

    const cache = data.map((catalog) => {
      const childrenArr: TreeDataType[] = [];

      if (catalog.children) {
        Object.entries(catalog.children).forEach(([type, arr]) => {
          const volumeKey = `${catalog.id}-${type}`;
          const subChildren = {
            title: subLeafKeys[type],
            key: volumeKey,
            type: type,
            children:
              arr?.map((item) => {
                return {
                  ...item,
                  title: item.name,
                  key: String(item.id), // 转换为字符串
                  parent_id: volumeKey,
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

    return cache;
  }
}
