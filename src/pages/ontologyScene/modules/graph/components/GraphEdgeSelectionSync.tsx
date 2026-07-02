import { useEffect } from 'react';
import { useStoreApi } from 'reactflow';
import { useDemoStore } from '../common/store';
import { useGraphCreate } from '../context/GraphCreateContext';
import {
  isSameLinkIdentity,
  resolveLinkIdentityFromEdge
} from '../utils/resolveLinkTypeId';

export default function GraphEdgeSelectionSync() {
  const store = useStoreApi();
  const selectedEdgeId = useDemoStore((s) => s.selectedEdgeId);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const { setActiveLink, buildPickFromWorkflowEdge } = useGraphCreate();

  useEffect(() => {
    if (!showCustomEdgePanel || selectedEdgeId == null) {
      return;
    }

    const edges = store.getState().edges;
    const matchedEdge = edges.find((edge) => {
      const linkIdentity = resolveLinkIdentityFromEdge(
        edge.data as { id?: unknown; linkTypeId?: unknown; code?: unknown },
        edge.id
      );
      return isSameLinkIdentity(linkIdentity, selectedEdgeId);
    });

    const pick = matchedEdge
      ? buildPickFromWorkflowEdge(matchedEdge)
      : typeof selectedEdgeId === 'number'
        ? {
            id: selectedEdgeId,
            name: String(selectedEdgeId)
          }
        : {
            code: selectedEdgeId,
            name: String(selectedEdgeId)
          };

    if (!pick) {
      return;
    }

    const { getNodes, setNodes, setEdges } = store.getState();
    setNodes(
      getNodes().map((node) => ({
        ...node,
        selected: false,
        data: {
          ...node.data,
          selected: false
        }
      }))
    );
    setEdges(
      edges.map((edge) => {
        const linkIdentity = resolveLinkIdentityFromEdge(
          edge.data as { id?: unknown; linkTypeId?: unknown; code?: unknown },
          edge.id
        );
        const isSelected = isSameLinkIdentity(linkIdentity, selectedEdgeId);
        return {
          ...edge,
          selected: isSelected,
          data: {
            ...edge.data,
            selected: isSelected
          }
        };
      })
    );
    setActiveLink((prev) => {
      const samePick =
        prev?.id != null && pick.id != null
          ? prev.id === pick.id
          : prev?.code && pick.code
            ? prev.code === pick.code
            : false;
      return samePick ? prev : pick;
    });
  }, [
    buildPickFromWorkflowEdge,
    selectedEdgeId,
    setActiveLink,
    showCustomEdgePanel,
    store
  ]);

  return null;
}
