import React from 'react';
import { OrchestrationNode } from '../OrchestrationNode';
import { AddNodePlaceholder } from '../AddNodePlaceholder';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';

export const OrchestrationCanvas: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const selectNode = useUIStore((state) => state.selectNode);

  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const removeNode = useBusinessStore((state) => state.removeNode);

  const handleNodeClick = (nodeId: string) => {
    selectNode(nodeId);
  };

  const handleNodeDelete = (nodeId: string) => {
    removeNode(nodeId);
    if (selectedNodeId === nodeId) {
      selectNode(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-[600px] flex-col gap-3">
      {orchestrationNodes.map((node) => (
        <OrchestrationNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onClick={() => handleNodeClick(node.id)}
          onDelete={() => handleNodeDelete(node.id)}
        />
      ))}
      <AddNodePlaceholder />
    </div>
  );
};
