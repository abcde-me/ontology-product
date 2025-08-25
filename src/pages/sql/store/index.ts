import { create } from 'zustand';
import { DATAFRAMES_LIST, DATASETS_LIST, SCRIPTS_LIST } from '../constant';
import {
  getCatalogList,
  CatalogListParams,
  CatalogListResponse,
  getDatasetList,
  DatasetListParams,
  DatasetListResponse
} from '@/api/sql';

export interface SqlIndexStore {
  dataframesList: any[];
  datasetsList: any[];
  scriptsList: any[];
  loadDataFrames: (props: CatalogListParams) => Promise<void>;
  loadDatasets: (props: DatasetListParams) => Promise<void>;
}

export const useSqlIndexStore = create<SqlIndexStore>((set) => ({
  dataframesList: DATAFRAMES_LIST,
  datasetsList: DATASETS_LIST,
  scriptsList: SCRIPTS_LIST,
  loadDataFrames: async (props: CatalogListParams) => {
    const res: CatalogListResponse = await getCatalogList({
      root_type: 0,
      search: ''
    });

    console.log('loadDataFrames res:', res);
  },
  loadDatasets: async (props: DatasetListParams) => {
    const res: DatasetListResponse = await getDatasetList({
      sort_order: 'asc'
    });

    console.log('loadDataFrames res:', res);
  },
  loadScripts: async (props: any) => {}
}));
