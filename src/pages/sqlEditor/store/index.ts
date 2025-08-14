import { create } from 'zustand';
import { DATAFRAMES_LIST, DATASETS_LIST } from '../constant';

export interface SqlIndexStore {
  dataframesList: any[];
  datesetsList: any[];
}

export const useSqlIndexStore = create<SqlIndexStore>((set) => ({
  dataframesList: DATAFRAMES_LIST,
  datesetsList: DATASETS_LIST
}));
