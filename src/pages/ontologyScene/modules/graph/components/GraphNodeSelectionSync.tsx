import { useEffect } from 'react';
import { useStore } from 'reactflow';
import { useGraphCreate } from '../context/GraphCreateContext';

export default function GraphNodeSelectionSync() {
  const { setActiveObjectType, setActiveLink, buildPickFromWorkflowNode } =
    useGraphCreate();

  const selectedNode = useStore(
    (state) =>
      state.getNodes().find((node) => node.selected || node.data?.selected),
    (prev, next) => prev?.id === next?.id
  );

  useEffect(() => {
    if (!selectedNode) {
      setActiveObjectType(null);
      return;
    }

    const pick = buildPickFromWorkflowNode(selectedNode);
    if (!pick) {
      return;
    }

    setActiveLink(null);
    setActiveObjectType((prev) => (prev?.id === pick.id ? prev : pick));
  }, [
    buildPickFromWorkflowNode,
    selectedNode,
    setActiveLink,
    setActiveObjectType
  ]);

  return null;
}
