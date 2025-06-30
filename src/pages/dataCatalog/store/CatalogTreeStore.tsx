import { Model } from '@/models';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import { useRef } from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { DataCatalog } from '../components/DataCatalogProvider/DataCatalog';

interface CatalogTreeState {
  activeTab: string;
  searchValue: string;
  inputValue: string;
  treeData: TreeDataType[];
  expandedKeys: string[];
  selectedKeys: string[];
  // inputRef: RefInputType | null;
}

interface Effects {
  fetchData: () => Promise<void>;
}

export class CatalogTreeStore extends Model<CatalogTreeState, Effects> {
  constructor(public member: DataCatalog) {
    super({
      state: {
        activeTab: 'source',
        searchValue: '',
        inputValue: '',
        treeData: [],
        expandedKeys: [],
        selectedKeys: []
      }
    });
  }
}
