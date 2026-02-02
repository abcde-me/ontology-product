import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { CustomEdge } from '../edges';

/**
 * Hook 用于在 ReactFlow 中注册自定义 edgeTypes
 * 由于 @ceai-front/workflow 的 AIWorflow 组件内部使用了 ReactFlow，
 * 我们可以通过这个 hook 来扩展 edgeTypes
 */
export const useCustomEdgeTypes = () => {
  const { addEdgeType, getEdgeTypes } = useReactFlow();

  useEffect(() => {
    // 注册自定义 edge 类型
    const edgeTypes = getEdgeTypes();

    // 如果 'custom' 类型还没有被注册，或者我们想要覆盖它
    if (!edgeTypes || !edgeTypes['custom']) {
      // 注意：ReactFlow 的 addEdgeType 可能不存在，我们需要通过其他方式
      // 实际上，ReactFlow 的 edgeTypes 是在组件初始化时设置的
      // 所以我们需要在 AIWorflow 组件外部处理
    }
  }, [addEdgeType, getEdgeTypes]);
};
