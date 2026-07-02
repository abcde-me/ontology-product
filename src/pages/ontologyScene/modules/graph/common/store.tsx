import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 创建 zustand store
export const useDemoStore = create<any>()(
  devtools(
    (set, get) => ({
      // 初始状态
      showPanel: true,
      setShowPanel: (show: boolean) => {
        set({ showPanel: show });
      },

      showCustomEdgePanel: false,
      setShowCustomEdgePanel: (
        show: boolean | ((prev: boolean) => boolean)
      ) => {
        set((state) => ({
          showCustomEdgePanel:
            typeof show === 'function' ? show(state.showCustomEdgePanel) : show
        }));
      },

      showRightPanel1: false,
      setShowRightPanel1: (show: boolean) => {
        set({ showRightPanel1: show });
      },
      showRightPanel2: false,
      setShowRightPanel2: (show: boolean) => {
        set({ showRightPanel2: show });
      },

      showTracingPanel: false,
      setShowTracingPanel: (show: boolean) => {
        console.log('setShowTracingPanel', show);
        set({ showTracingPanel: show });
      },

      readonly: false,
      setReadonly: (readonly: boolean) => {
        set({ readonly: readonly });
      },

      sourceNode: null,
      setSourceNode: (node: any) => {
        set({ sourceNode: node });
      },

      targetNode: null,
      setTargetNode: (node: any) => {
        set({ targetNode: node });
      },

      selectedEdgeId: null as number | string | null,
      setSelectedEdgeId: (edgeId: number | string | null) => {
        set({ selectedEdgeId: edgeId });
      }
    }),
    {
      name: 'demo-store' // devtools 中显示的名称
    }
  )
);
