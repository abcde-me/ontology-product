import { create } from 'zustand';
import { DATAFRAMES_LIST } from '../constant';

export interface SqlIndexStore {
  dataframesList: any[];
  datesetsList: any[];
}

export const useSqlIndexStore = create<SqlIndexStore>((set) => ({
  dataframesList: DATAFRAMES_LIST,
  datesetsList: []
}));
