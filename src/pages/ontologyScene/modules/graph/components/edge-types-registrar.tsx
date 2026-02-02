import React, { useEffect } from 'react';
import { useStoreApi } from 'reactflow';
import { CustomEdge } from '../edges';

/**
 * 组件：用于在 AIWorflow 内部注册自定义 edgeTypes
 *
 * 原理：
 * 1. @ceai-front/workflow 的 AIWorflow 内部已经包含了 ReactFlowProvider
 * 2. 通过 useStoreApi 可以访问 ReactFlow 的内部 store
 * 3. ReactFlow 的 edgeTypes 存储在 store 的内部状态中
 *
 * 使用方式：
 * 将这个组件放在 AIWorflow 组件旁边（在同一个 ReactFlowProvider 内部）
 *
 * <AIWorkflowProvider ...>
 *   <AIWorflow />
 *   <EdgeTypesRegistrar />
 * </AIWorkflowProvider>
 *
 * 注意：
 * - 这个组件必须在 ReactFlowProvider 内部使用
 * - AIWorflow 内部已经包含了 ReactFlowProvider，所以可以放在同一层级
 */
export const EdgeTypesRegistrar: React.FC = () => {
  const store = useStoreApi();

  useEffect(() => {
    try {
      // ReactFlow 的 edgeTypes 存储在内部状态中
      // 我们需要通过内部 API 来访问和修改
      const state = store.getState() as any;

      // 尝试获取当前的 edgeTypes（可能在不同的位置）
      const currentEdgeTypes = state.edgeTypes || state.__rf?.edgeTypes || {};

      // 如果 'custom' 类型还没有被注册，则注册我们的自定义 Edge 组件
      if (!currentEdgeTypes['custom']) {
        // 通过内部方法更新 edgeTypes
        // 注意：这依赖于 ReactFlow 的内部实现，可能需要根据版本调整
        if (state.__rf) {
          state.__rf.edgeTypes = {
            ...currentEdgeTypes,
            custom: CustomEdge
          };
        }

        // 或者尝试通过 setState 更新（如果支持）
        try {
          (store as any).setState({
            edgeTypes: {
              ...currentEdgeTypes,
              custom: CustomEdge
            }
          });
        } catch (e) {
          // 如果 setState 不支持 edgeTypes，尝试其他方式
          console.warn('[EdgeTypesRegistrar] 无法通过 setState 更新 edgeTypes');
        }

        console.log('[EdgeTypesRegistrar] 自定义 edge 类型已注册');
      }
    } catch (error) {
      console.warn('[EdgeTypesRegistrar] 注册 edgeTypes 失败:', error);
      console.warn(
        '[EdgeTypesRegistrar] 提示：如果自定义 edge 未生效，请检查 edges 数据中的 type 字段是否正确设置为 "custom"'
      );
    }
  }, [store]);

  return null; // 这个组件不渲染任何内容
};
