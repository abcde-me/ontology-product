import { create } from 'zustand';
import { BehaviorLogItem } from '../../types';
import { ParamItem, OutputParamItem } from './types';
import { fetchBehaviorLogDetail } from '../../services/behaviorLogApi';

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
    activeTab: 'logs',

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
      set({ executionId: id, activeTab: 'logs' }); // 重置为默认 tab
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
        // 只调用详情接口，所有数据都从这个接口获取
        const detail = await fetchBehaviorLogDetail(Number(id));

        // 解析入参（JSON字符串转数组）
        let params: ParamItem[] = [];
        try {
          params = detail.input_params ? JSON.parse(detail.input_params) : [];
        } catch (e) {
          console.error('解析入参失败:', e);
          params = [];
        }

        // 解析出参（JSON字符串转对象）
        let outputParams: OutputParamItem[] = [];
        try {
          const returnData = detail.return_params
            ? JSON.parse(detail.return_params)
            : {};
          // 将对象转换为数组格式 [{name: 'var1', type: 'ObjectRef', value: 'ObjectRef'}, ...]
          outputParams = Object.entries(returnData).map(([name, type]) => ({
            name,
            type: type as string,
            value: type as string
          }));
        } catch (e) {
          console.error('解析出参失败:', e);
          outputParams = [];
        }

        const logs = detail.run_log || '';
        const functionCode = detail.execute_code || '';

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
        // 可以在这里添加错误提示
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
        activeTab: 'logs'
      });
    }
  })
);
