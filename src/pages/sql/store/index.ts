import { create } from 'zustand';
export interface SqlIndexStore {
  /** 卷详情 弹框 */
  volumnDetailVisible?: boolean;
  /** 库详情 弹框 */
  dbDetailVisible?: boolean;
  /** 表详情 弹框 */
  tableDetailVisible?: boolean;
  /** 数据集详情 弹框 */
  DatasetDetailVisible?: boolean;
  /** 选中的数据卷 ID */
  selectedVolumnId?: string | number | null;

  /** 动作 */
  showVolumnDetail?: () => void;
  closeVolumnDetail?: () => void;
  showDbDetail?: () => void;
  closeDbDetail?: () => void;
  showTableDetail?: () => void;
  closeTableDetail?: () => void;
  showDatasetDetail?: () => void;
  closeDatasetDetail?: () => void;
  setSelectedVolumnId?: (id: string | number) => void;
}

export const useSqlIndexStore = create<SqlIndexStore>((set, get) => ({
  volumnDetailVisible: false,
  dbDetailVisible: false,
  tableDetailVisible: false,
  DatasetDetailVisible: false,
  selectedVolumnId: null,
  showVolumnDetail: () => {
    set({ volumnDetailVisible: true });
  },
  closeVolumnDetail: () => {
    set({ volumnDetailVisible: false });
  },
  showDbDetail: () => {
    set({ dbDetailVisible: true });
  },
  closeDbDetail: () => {
    set({ dbDetailVisible: false });
  },
  showTableDetail: () => {
    set({ tableDetailVisible: true });
  },
  closeTableDetail: () => {
    set({ tableDetailVisible: false });
  },
  showDatasetDetail: () => {
    set({ DatasetDetailVisible: true });
  },
  closeDatasetDetail: () => {
    set({ DatasetDetailVisible: false });
  },
  setSelectedVolumnId: (id: string | number) => {
    set({ selectedVolumnId: id });
  }
}));
