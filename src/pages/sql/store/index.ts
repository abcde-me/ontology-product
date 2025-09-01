import { create } from 'zustand';
export interface SqlIndexStore {
  /** 卷详情 弹框 */
  volumnDetailVisible?: boolean;
  /** 库详情 弹框 */
  dbDetailVisible?: boolean;
  /** 表详情 弹框 */
  tableDetailVisible?: boolean;
  /** 数据集详情 弹框 */
  datasetDetailVisible?: boolean;
  /** 脚本详情 弹框 */
  scriptDetailVisible?: boolean;
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
  showScriptDetail?: () => void;
  closeScriptDetail?: () => void;
  setSelectedVolumnId?: (id: string | number) => void;
}

export const useSqlIndexStore = create<SqlIndexStore>((set, get) => ({
  volumnDetailVisible: false,
  dbDetailVisible: false,
  tableDetailVisible: false,
  datasetDetailVisible: false,
  scriptDetailVisible: false,
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
    set({ datasetDetailVisible: true });
  },
  closeDatasetDetail: () => {
    set({ datasetDetailVisible: false });
  },
  showScriptDetail: () => {
    set({ scriptDetailVisible: true });
  },
  closeScriptDetail: () => {
    set({ scriptDetailVisible: false });
  },
  setSelectedVolumnId: (id: string | number) => {
    set({ selectedVolumnId: id });
  }
}));
