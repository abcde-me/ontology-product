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
  /** 保存为新数据集表单 弹框 */
  datasetFormVisible?: boolean;
  /** 保存为新版本表单 弹框 */
  datasetVersionFormVisible?: boolean;
  /** 选中的数据卷 ID */
  selectedVolumnId?: string | number | null;
  /** 选中的运行结果 ID */
  currentRunResult?: null | {};

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
  showDatasetForm?: () => void;
  closeDatasetForm?: () => void;
  showDatasetVersionForm?: () => void;
  closeDatasetVersionForm?: () => void;
  setSelectedVolumnId?: (id: string | number) => void;
  setCurrentRunResult?: (value: {}) => void;
}

export const useSqlIndexStore = create<SqlIndexStore>((set, get) => ({
  volumnDetailVisible: false,
  dbDetailVisible: false,
  tableDetailVisible: false,
  datasetDetailVisible: false,
  scriptDetailVisible: false,
  datasetFormVisible: false,
  datasetVersionFormVisible: false,
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
  showDatasetForm: () => {
    set({ datasetFormVisible: true });
  },
  closeDatasetForm: () => {
    set({ datasetFormVisible: false });
  },
  showDatasetVersionForm: () => {
    set({ datasetVersionFormVisible: true });
  },
  closeDatasetVersionForm: () => {
    set({ datasetVersionFormVisible: false });
  },
  setSelectedVolumnId: (id: string | number) => {
    set({ selectedVolumnId: id });
  },
  setCurrentRunResult: (value: {}) => {
    set({ currentRunResult: value });
  }
}));
