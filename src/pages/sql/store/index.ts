import { create } from 'zustand';
import { DATAFRAMES_LIST, DATASETS_LIST, SCRIPTS_LIST } from '../constant';
import {
  // getCatalogList,
  // CatalogListParams,
  // CatalogListResponse,
  getDatasetList,
  DatasetListParams,
  DatasetListResponse
} from '@/api/sql';

export interface SqlIndexStore {
  scriptsList: any[];
  // dataframesList: any[];
  // datasetsList: any[];
  // dataFramesLoaded: boolean;
  // loadDataFrames: (params?: CatalogListParams) => Promise<void>;
  // loadDatasets: (props: DatasetListParams) => Promise<void>;
}

export const useSqlIndexStore = create<SqlIndexStore>((set, get) => ({
  scriptsList: SCRIPTS_LIST
  // dataframesList: DATAFRAMES_LIST,
  // datasetsList: DATASETS_LIST,
  // dataFramesLoaded: false,
  // loadDataFrames: async (params) => {
  //   if (get().dataFramesLoaded) return;

  //   try {
  //     const defaultParam: CatalogListParams = {
  //       root_type: 1,
  //       dir_type: 3,
  //       search: ''
  //     }
  //     const res: CatalogListResponse = await getCatalogList({ ...defaultParam, ...params });
  //     set({ dataFramesLoaded: true });
  //     console.log('loadDataFrames res.data.src:', res.data.src);
  //     set({ dataframesList: res.data.src || [] });
  //   } catch (err) {
  //   }
  // },
  // loadDatasets: async (props: DatasetListParams) => {
  //   const res: DatasetListResponse = await getDatasetList({
  //     sort_order: 'asc'
  //   });

  //   console.log('loadDataFrames res:', res);
  // },
  // loadScripts: async (props: any) => { }
}));
