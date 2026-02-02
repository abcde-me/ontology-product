import React, { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { CustomEdge } from '../edges';

/**
 * 包装组件，用于在 AIWorflow 内部注册自定义 edgeTypes
 * 这个组件需要在 ReactFlowProvider 内部使用
 */
export const WorkflowWithCustomEdges: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    // 尝试通过 ReactFlow 的内部 API 注册 edgeTypes
    // 注意：这可能需要根据 ReactFlow 的实际 API 调整
    if (reactFlowInstance) {
      // ReactFlow 的 edgeTypes 通常在组件初始化时设置
      // 我们可以尝试通过 store API 来扩展
      const store = (reactFlowInstance as any).getStore?.();
      if (store) {
        const currentEdgeTypes = store.getState()?.edgeTypes || {};
        store.setState({
          edgeTypes: {
            ...currentEdgeTypes,
            custom: CustomEdge
          }
        });
      }
    }
  }, [reactFlowInstance]);

  return <>{children}</>;
};
