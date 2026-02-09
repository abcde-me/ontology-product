import { useCallback } from 'react';
import { useNodes } from 'reactflow';
import { CommonNodeType, useNodeDataUpdate } from '@ceai-front/workflow';

/**
 * 控制节点面板隐藏的 hook
 * @returns hideNodePanel - 隐藏当前选中节点面板的函数
 */
export const useHideNodePanel = () => {
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const nodes = useNodes<CommonNodeType>();

  const hideNodePanel = useCallback(() => {
    const selectedNode = nodes.find((node) => node.data.selected);

    if (selectedNode) {
      handleNodeDataUpdate({
        id: selectedNode.id,
        data: {
          selected: false
        }
      });
    }
  }, [nodes, handleNodeDataUpdate]);

  return {
    hideNodePanel
  };
};
