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

  // ========== 节点高亮相关 ==========
  /** 高亮的节点 code */
  highlightedNodeCode: string | null;

  // ========== Actions ==========
  /** 打开底部面板 */
  openBottomPanel: (data: BottomPanelData) => void;
  /** 关闭底部面板 */
  closeBottomPanel: () => void;
  /** 设置底部面板高度 */
  setBottomPanelHeight: (height: number) => void;
  /** 高亮节点 */
  highlightNode: (code: string) => void;
  /** 清除高亮 */
  clearHighlight: () => void;
  /** 重置状态 */
  reset: () => void;
}

const initialState = {
  bottomPanelVisible: false,
  bottomPanelData: null,
  bottomPanelHeight: 400, // 默认高度 400px
  highlightedNodeCode: null
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

    // ========== 节点高亮相关 Actions ==========
    highlightNode: (code) => {
      console.log('[AIWorkbenchGraphStore] 高亮节点:', code);
      set({ highlightedNodeCode: code });
      // 3秒后自动清除高亮
      setTimeout(() => {
        set({ highlightedNodeCode: null });
      }, 3000);
    },
    clearHighlight: () => set({ highlightedNodeCode: null }),

    // ========== 重置状态 ==========
    reset: () => set(initialState)
  })
);
