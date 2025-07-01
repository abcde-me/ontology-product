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
}

interface ITreeData extends BaseTreeData {
  children?: {
    volume?: BaseTreeData[];
    // TODO 下一期做
    db?: BaseTreeData[];
  };
}

const fakeData: ITreeData[] = [
  {
    id: 1,
    parent_id: 0,
    type: 1,
    type_name: 'catalog',
    name: 'test1',
    base_dir: '/user/xxd',
    children: {
      volume: [
        {
          id: 2,
          parent_id: 1,
          type: 2,
          type_name: 'volume',
          name: 'test11',
          base_dir: '/user/xxd'
        },
        {
          id: 4,
          parent_id: 1,
          type: 2,
          type_name: 'volume',
          name: 'test12',
          base_dir: '/user/xxd'
        }
      ]
    }
  },
  {
    id: 5,
    parent_id: 0,
    type: 1,
    type_name: 'catalog',
    name: '新建的',
    base_dir: '/user/xxd'
  },
  {
    id: 6,
    parent_id: 0,
    type: 1,
    type_name: 'catalog',
    name: '9999',
    base_dir: '/user/xxd'
  },
  {
    id: 7,
    parent_id: 0,
    type: 1,
    type_name: 'catalog',
    name: '8888',
    base_dir: '/user/xxd'
  }
];

interface CatalogTreeState {
  activeTab: string;
  searchValue: string;
  inputValue: string;
  treeData: TreeDataType[];
  expandedKeys: string[];
  selectedKey: string;
  inputRef: React.RefObject<RefInputType>;
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
        inputRef: React.createRef<RefInputType>()
      },
      effects: {
        fetchData: createAsyncEffect(
          async (options?: {
            showLoading?: boolean;
          }): Promise<Partial<CatalogTreeState>> => {
            const { activeTab } = this.getState();
            try {
              const res = await getCatalogList({
                root_type: activeTab === 'src' ? 1 : 2
              });

              const cacheTreeData = this.convertRawDataToTreeData(
                res.data?.[activeTab] || []
              );
              // debugger
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
                  // isLeaf: true,
                  isLastLeaf: true
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
