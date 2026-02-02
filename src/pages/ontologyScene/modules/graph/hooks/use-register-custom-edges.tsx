import { useEffect } from 'react';
import { useStoreApi } from 'reactflow';
import { CustomEdge } from '../edges';

/**
 * Hook 用于在 ReactFlow 中动态注册自定义 edgeTypes
 *
 * 原理：
 * 1. ReactFlow 使用内部 store 管理 edgeTypes
 * 2. 通过 useStoreApi 可以访问 ReactFlow 的 store
 * 3. 使用 store.setState 可以动态更新 edgeTypes
 *
 * 注意：
 * - 这个 hook 必须在 ReactFlowProvider 内部使用
 * - 需要在 AIWorflow 组件渲染后调用
 */
export const useRegisterCustomEdges = () => {
  const store = useStoreApi();

  useEffect(() => {
    // 获取当前的 edgeTypes
    const currentState = store.getState();
    const currentEdgeTypes = currentState.edgeTypes || {};

    // 如果 'custom' 类型还没有被注册，则注册我们的自定义 Edge 组件
    if (!currentEdgeTypes['custom']) {
      store.setState({
        edgeTypes: {
          ...currentEdgeTypes,
          custom: CustomEdge
        }
      });
    }

    // 清理函数：如果需要，可以在卸载时恢复
    return () => {
      // 通常不需要清理，因为 edgeTypes 是全局配置
    };
  }, [store]);
};
