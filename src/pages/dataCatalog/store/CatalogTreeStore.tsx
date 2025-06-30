import { Model } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import React from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';
import { subLeafKeys } from '../components/editable-tree/consts';

interface ITreeData {
  id: string | number;
  name: string;
  type: string;
  parent_id?: string | number;
  children?: {
    volume?: Array<{
      id: number;
      name: string;
      parent_id: number;
    }>;
    db?: Array<{
      id: number;
      name: string;
      parent_id: number;
    }>;
  };
}

const fakeData: ITreeData[] = [
  {
    type: 'catalog',
    id: 1,
    name: '目录1',
    children: {
      volume: [
        {
          id: 10,
          name: 'source-vol',
          parent_id: 1
        },
        {
          id: 11,
          name: 'source-vol-22222',
          parent_id: 1
        }
      ],
      db: [
        {
          id: 20,
          name: 'source-db-1',
          parent_id: 1
        },
        {
          id: 21,
          name: 'source-db-2',
          parent_id: 1
        }
      ]
    }
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
}

interface Effects {
  fetchData: () => Promise<void>;
}

export class CatalogTreeStore extends Model<CatalogTreeState, Effects> {
  // public inputRef = React.createRef<RefInputType>();

  constructor(public member: DataCatalog) {
    super({
      state: {
        activeTab: 'source',
        searchValue: '',
        inputValue: '',
        treeData: [],
        expandedKeys: [],
        selectedKey: '',
        inputRef: React.createRef<RefInputType>()
      },
      effects: {
        fetchData: () => {
          const tmpData = this.convertRawDataToTreeData(fakeData);
          this.setState({
            treeData: tmpData,
            expandedKeys: [
              tmpData?.[0]?.key || '',
              tmpData?.[0]?.children?.[0]?.key || '',
              tmpData?.[0]?.children?.[1]?.key || ''
            ],
            searchValue: '',
            selectedKey: tmpData?.[0]?.children?.[0]?.children?.[0]?.key || ''
          });
          return new Promise((resolve) => {
            setTimeout(resolve, 500);
          });
        }
      }
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

  focusAndSelectInput() {
    const { inputRef } = this.getState();
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom.select();
    }, 0);
  }

  convertRawDataToTreeData(fakeData: ITreeData[]) {
    if (!Array.isArray(fakeData)) return [];

    const cache = fakeData.map((catalog) => {
      const childrenArr: TreeDataType[] = [];
      if (catalog.children) {
        Object.entries(catalog.children).forEach(([type, arr]) => {
          const subChildren = {
            title: subLeafKeys[type],
            key: `${catalog.id}-${type}`,
            type: type,
            children:
              arr?.map((item) => {
                return {
                  title: item.name,
                  key: `${type}-${item.id}`,
                  isLeaf: true,
                  isLastLeaf: true,
                  type: `${type}-child`
                };
              }) || []
          };
          childrenArr.push(subChildren);
        });
      }

      return {
        title: catalog.name,
        key: `catalog-${catalog.id}`,
        type: catalog.type,
        children: childrenArr
      };
    });

    return cache;
  }
}
