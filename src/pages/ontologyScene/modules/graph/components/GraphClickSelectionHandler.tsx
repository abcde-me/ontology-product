import { useCallback, useEffect } from 'react';
import { useStoreApi } from 'reactflow';
import { useGraphCreate } from '../context/GraphCreateContext';
import { useDemoStore } from '../common/store';
import { resolveLinkIdentityFromEdge } from '../utils/resolveLinkTypeId';
import graphStyles from '../index.module.scss';

const getFlowElement = () =>
  document.querySelector(`.${graphStyles['ai-workflow']} .react-flow`);

export default function GraphClickSelectionHandler() {
  const store = useStoreApi();
  const { setActiveLink, setActiveObjectType, buildPickFromWorkflowEdge } =
    useGraphCreate();
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSelectedEdgeId = useDemoStore((s) => s.setSelectedEdgeId);
  const setSourceNode = useDemoStore((s) => s.setSourceNode);
  const setTargetNode = useDemoStore((s) => s.setTargetNode);

  const clearSelection = useCallback(() => {
    const { getNodes, setNodes, setEdges, edges } = store.getState();
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
      edges.map((edge) => ({
        ...edge,
        selected: false,
        data: {
          ...edge.data,
          selected: false
        }
      }))
    );
    setShowCustomEdgePanel(false);
    setSelectedEdgeId(null);
    setSourceNode(null);
    setTargetNode(null);
    setActiveLink(null);
    setActiveObjectType(null);
  }, [
    setActiveLink,
    setActiveObjectType,
    setSelectedEdgeId,
    setShowCustomEdgePanel,
    setSourceNode,
    setTargetNode,
    store
  ]);

  const selectNode = useCallback(
    (nodeId: string) => {
      const { getNodes, setNodes, setEdges, edges } = store.getState();
      setShowCustomEdgePanel(false);
      setSelectedEdgeId(null);
      setNodes(
        getNodes().map((node) => ({
          ...node,
          selected: node.id === nodeId,
          data: {
            ...node.data,
            selected: node.id === nodeId
          }
        }))
      );
      setEdges(
        edges.map((edge) => ({
          ...edge,
          selected: false,
          data: {
            ...edge.data,
            selected: false
          }
        }))
      );
    },
    [setSelectedEdgeId, setShowCustomEdgePanel, store]
  );

  const selectEdge = useCallback(
    (edgeId: string) => {
      const { getNodes, setNodes, setEdges, edges } = store.getState();
      const edge = edges.find((item) => item.id === edgeId);
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
        edges.map((item) => ({
          ...item,
          selected: item.id === edgeId,
          data: {
            ...item.data,
            selected: item.id === edgeId
          }
        }))
      );

      if (!edge) {
        return;
      }

      const linkIdentity = resolveLinkIdentityFromEdge(
        edge.data as { id?: unknown; linkTypeId?: unknown; code?: unknown },
        edge.id
      );
      const pick = buildPickFromWorkflowEdge(edge);
      setActiveObjectType(null);
      setActiveLink(pick);
      setSelectedEdgeId(linkIdentity);
      setSourceNode(getNodes().find((node) => node.id === edge.source));
      setTargetNode(getNodes().find((node) => node.id === edge.target));
      setShowCustomEdgePanel(true);
    },
    [
      buildPickFromWorkflowEdge,
      setActiveLink,
      setActiveObjectType,
      setSelectedEdgeId,
      setShowCustomEdgePanel,
      setSourceNode,
      setTargetNode,
      store
    ]
  );

  useEffect(() => {
    let flowEl: Element | null = null;
    let frameId = 0;
    let cancelled = false;

    const handleClick = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement | null;
      if (!target?.closest(`.${graphStyles['ai-workflow']}`)) {
        return;
      }

      if (target.closest('.react-flow__edge')) {
        const edgeEl = target.closest('.react-flow__edge');
        const edgeId = edgeEl?.getAttribute('data-id');
        if (edgeId) {
          selectEdge(edgeId);
        }
        return;
      }

      const nodeEl = target.closest('.react-flow__node');
      if (nodeEl) {
        const nodeId = nodeEl.getAttribute('data-id');
        if (nodeId) {
          selectNode(nodeId);
        }
        return;
      }

      if (target.closest('.react-flow__pane')) {
        clearSelection();
      }
    };

    const attach = () => {
      if (cancelled) {
        return;
      }

      flowEl = getFlowElement();
      if (!flowEl) {
        frameId = window.requestAnimationFrame(attach);
        return;
      }

      flowEl.addEventListener('click', handleClick, true);
    };

    attach();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      flowEl?.removeEventListener('click', handleClick, true);
    };
  }, [clearSelection, selectEdge, selectNode]);

  return null;
}
