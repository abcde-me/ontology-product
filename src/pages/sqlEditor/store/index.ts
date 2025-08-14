import { create } from 'zustand';
import { DATAFRAMES_LIST, DATASETS_LIST, SCRIPTS_LIST } from '../constant';

export interface SqlIndexStore {
  dataframesList: any[];
  datesetsList: any[];
  scriptsList: any[];
}

export const useSqlIndexStore = create<SqlIndexStore>((set) => ({
  dataframesList: DATAFRAMES_LIST,
  datesetsList: DATASETS_LIST,
  scriptsList: SCRIPTS_LIST
}));
