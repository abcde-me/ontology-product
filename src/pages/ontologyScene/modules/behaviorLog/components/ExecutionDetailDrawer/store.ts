import { create } from 'zustand';
import { BehaviorLogItem } from '../../types';
import { ParamItem, OutputParamItem } from './types';
import {
  fetchBehaviorLogDetail,
  fetchBehaviorLogInputParams,
  fetchBehaviorLogOutputParams,
  fetchBehaviorLogRunLogs,
  fetchBehaviorLogExecutionDetail
} from '../../services/behaviorLogApi';

interface ExecutionDetailStore {
  // 状态
  visible: boolean;
  executionId: string | null;
  detailData: BehaviorLogItem | null;
  params: ParamItem[];
  outputParams: OutputParamItem[];
  logs: string;
  functionCode: string;
  loading: boolean;
  activeTab: string;

  // Actions
  setVisible: (visible: boolean) => void;
  setExecutionId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  loadExecutionDetail: (id: string) => Promise<void>;
  reset: () => void;
}

export const useExecutionDetailStore = create<ExecutionDetailStore>(
  (set, get) => ({
    // 初始状态
    visible: false,
    executionId: null,
    detailData: null,
    params: [],
    outputParams: [],
    logs: '',
    functionCode: '',
    loading: false,
    activeTab: 'params',

    // 设置抽屉可见性
    setVisible: (visible) => {
      set({ visible });
      if (!visible) {
        // 关闭时重置数据
        get().reset();
      }
    },

    // 设置执行ID
    setExecutionId: (id) => {
      set({ executionId: id });
      if (id) {
        get().loadExecutionDetail(id);
      }
    },

    // 设置活动Tab
    setActiveTab: (tab) => set({ activeTab: tab }),

    // 加载执行详情
    loadExecutionDetail: async (id: string) => {
      set({ loading: true });
      try {
        // 并行请求所有数据
        const [detail, params, outputParams, logs, functionCode] =
          await Promise.all([
            fetchBehaviorLogDetail(id),
            fetchBehaviorLogInputParams(id),
            fetchBehaviorLogOutputParams(id),
            fetchBehaviorLogRunLogs(id),
            fetchBehaviorLogExecutionDetail(id)
          ]);

        set({
          detailData: detail,
          params,
          outputParams,
          logs,
          functionCode,
          loading: false
        });
      } catch (error) {
        console.error('加载执行详情失败:', error);
        set({ loading: false });
      }
    },

    // 重置状态
    reset: () => {
      set({
        executionId: null,
        detailData: null,
        params: [],
        outputParams: [],
        logs: '',
        functionCode: '',
        loading: false,
        activeTab: 'params'
      });
    }
  })
);
