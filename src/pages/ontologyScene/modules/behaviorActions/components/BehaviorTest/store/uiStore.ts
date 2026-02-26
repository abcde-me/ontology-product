import { create } from 'zustand';

interface UIStore {
  // ===== 选中状态 =====
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;

  // ===== 展开/收起状态 =====
  expandedNodes: Set<string>;
  toggleNodeExpand: (nodeId: string) => void;

  // ===== 搜索/筛选状态 =====
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  selectedObjectType: string | null;
  setSelectedObjectType: (type: string | null) => void;

  // ===== 加载状态 =====
  loadingBehaviors: boolean;
  setLoadingBehaviors: (loading: boolean) => void;
  isTestRunning: boolean;
  setIsTestRunning: (running: boolean) => void;

  // ===== 空状态 =====
  isEmpty: boolean;
  setIsEmpty: (empty: boolean) => void;

  // ===== 抽屉状态 =====
  behaviorDetailVisible: boolean;
  setBehaviorDetailVisible: (visible: boolean) => void;
  testHistoryVisible: boolean;
  setTestHistoryVisible: (visible: boolean) => void;
  testResultVisible: boolean;
  setTestResultVisible: (visible: boolean) => void;

  // ===== 重置 =====
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // 初始状态
  selectedNodeId: null,
  expandedNodes: new Set(),
  searchKeyword: '',
  selectedObjectType: null,
  loadingBehaviors: false,
  isTestRunning: false,
  isEmpty: true,
  behaviorDetailVisible: false,
  testHistoryVisible: false,
  testResultVisible: false,

  // Actions
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  toggleNodeExpand: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodes: newExpanded };
    }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  setSelectedObjectType: (type) => set({ selectedObjectType: type }),

  setLoadingBehaviors: (loading) => set({ loadingBehaviors: loading }),

  setIsTestRunning: (running) => set({ isTestRunning: running }),

  setIsEmpty: (empty) => set({ isEmpty: empty }),

  setBehaviorDetailVisible: (visible) =>
    set({ behaviorDetailVisible: visible }),

  setTestHistoryVisible: (visible) => set({ testHistoryVisible: visible }),

  setTestResultVisible: (visible) => set({ testResultVisible: visible }),

  resetUI: () =>
    set({
      selectedNodeId: null,
      expandedNodes: new Set(),
      searchKeyword: '',
      selectedObjectType: null,
      loadingBehaviors: false,
      isTestRunning: false,
      isEmpty: true,
      behaviorDetailVisible: false,
      testHistoryVisible: false,
      testResultVisible: false
    })
}));
