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

  // ========== 缩放相关 ==========
  /** 目标缩放比例 */
  targetZoom: number | null;

  // ========== Actions ==========
  /** 打开底部面板 */
  openBottomPanel: (data: BottomPanelData) => void;
  /** 关闭底部面板 */
  closeBottomPanel: () => void;
  /** 设置底部面板高度 */
  setBottomPanelHeight: (height: number) => void;
  /** 高亮节点并居中 */
  highlightNode: (
    code: string,
    options?: { duration?: number; center?: boolean; zoom?: number }
  ) => void;
  /** 清除高亮 */
  clearHighlight: () => void;
  /** 设置目标缩放比例 */
  setTargetZoom: (zoom: number | null) => void;
  /** 重置状态 */
  reset: () => void;
}

const initialState = {
  bottomPanelVisible: false,
  bottomPanelData: null,
  bottomPanelHeight: 400, // 默认高度 400px
  highlightedNodeCode: null,
  targetZoom: null
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
    highlightNode: (code, options = {}) => {
      const { duration = 5000, center = true, zoom } = options; // 默认5秒，默认居中
      console.log('[AIWorkbenchGraphStore] 高亮节点:', code, '选项:', options);
      set({ highlightedNodeCode: code });

      // 如果指定了缩放比例，设置目标缩放
      if (zoom !== undefined) {
        set({ targetZoom: zoom });
      }

      // 如果需要居中，触发自定义事件
      if (center) {
        window.dispatchEvent(
          new CustomEvent('centerGraphNode', { detail: { code, zoom } })
        );
      }

      // 延迟后自动清除高亮
      setTimeout(() => {
        set((state) => {
          // 只有当前高亮的节点是这个节点时才清除（避免被新的高亮覆盖）
          if (state.highlightedNodeCode === code) {
            return { highlightedNodeCode: null };
          }
          return state;
        });
      }, duration);
    },
    clearHighlight: () => set({ highlightedNodeCode: null }),
    setTargetZoom: (zoom) => set({ targetZoom: zoom }),

    // ========== 重置状态 ==========
    reset: () => set(initialState)
  })
);
