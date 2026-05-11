import { create } from 'zustand';

/**
 * 底部面板类型
 */
export type BottomPanelType = 'object' | 'link' | 'behavior' | null;

/**
 * 底部面板数据
 */
export interface BottomPanelData {
  type: BottomPanelType;
  id: string | number;
  data?: any;
}

/**
 * AI 工作台图谱状态
 */
interface AIWorkbenchGraphState {
  // ========== 底部面板相关 ==========
  /** 底部面板是否显示 */
  bottomPanelVisible: boolean;
  /** 底部面板数据 */
  bottomPanelData: BottomPanelData | null;
  /** 底部面板高度 */
  bottomPanelHeight: number;

  // ========== Actions ==========
  /** 打开底部面板 */
  openBottomPanel: (data: BottomPanelData) => void;
  /** 关闭底部面板 */
  closeBottomPanel: () => void;
  /** 设置底部面板高度 */
  setBottomPanelHeight: (height: number) => void;
  /** 重置状态 */
  reset: () => void;
}

const initialState = {
  bottomPanelVisible: false,
  bottomPanelData: null,
  bottomPanelHeight: 400 // 默认高度 400px
};

export const useAIWorkbenchGraphStore = create<AIWorkbenchGraphState>(
  (set) => ({
    ...initialState,

    // ========== 底部面板相关 Actions ==========
    openBottomPanel: (data) =>
      set({
        bottomPanelVisible: true,
        bottomPanelData: data
      }),
    closeBottomPanel: () =>
      set({
        bottomPanelVisible: false,
        bottomPanelData: null
      }),
    setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),

    // ========== 重置状态 ==========
    reset: () => set(initialState)
  })
);
