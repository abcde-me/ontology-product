import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  useStore,
  MarkerType,
  type Edge,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Spin } from '@arco-design/web-react';
import { KnowledgeGraphEdge } from '@/pages/exploreAnalysis/relationInsight/components/KnowledgeGraphEdge';
import { KnowledgeGraphNode } from '@/pages/exploreAnalysis/relationInsight/components/KnowledgeGraphNode';
import { CanvasModeProvider } from '@/pages/exploreAnalysis/relationInsight/context/CanvasModeContext';
import type {
  KnowledgeGraphNodeData,
  RelationGraphEdge,
  RelationGraphNode
} from '@/pages/exploreAnalysis/relationInsight/types';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { resolveRowFieldValue } from '@/pages/exploreAnalysis/objectBrowse/services/instanceQuery';
import {
  getInstanceDisplayFields,
  resolveInstanceId
} from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import { CONFIRMED_EDGE_COLOR, IMPLICIT_EDGE_COLOR } from '../constants';
import ImplicitNodeDetailPanel from './ImplicitNodeDetailPanel';
import styles from './ImplicitRelationCanvas.module.scss';

const nodeTypes = {
  knowledgeNode: KnowledgeGraphNode
};

const edgeTypes = {
  knowledgeEdge: KnowledgeGraphEdge
};

const loadNodeAttributes = async (
  data: KnowledgeGraphNodeData
): Promise<Array<{ label: string; value: string }>> => {
  if (data.detailFields && data.detailFields.length > 2) {
    return data.detailFields;
  }
  if (data.objectTypeId == null || !data.instanceId) {
    return data.detailFields || [];
  }

  try {
    const res = await listOntologyObjectTypeData({
      id: data.objectTypeId,
      page: 1,
      pageSize: 500
    });
    if (!isOntologyApiSuccess(res) || !res.data?.result?.length) {
      return data.detailFields || [];
    }

    const target = String(data.instanceId);
    const row = res.data.result.find((item) => {
      const id = resolveInstanceId(item);
      if (id != null && String(id) === target) {
        return true;
      }
      return ['id', 'ID', 'code', 'Code'].some((field) => {
        const value = resolveRowFieldValue(item, field);
        return value != null && String(value) === target;
      });
    });

    if (!row) {
      return data.detailFields || [];
    }

    const fields = getInstanceDisplayFields(row as InstanceQueryRow);
    return [
      ...(data.objectTypeName
        ? [{ label: '对象类型', value: data.objectTypeName }]
        : []),
      { label: '实例 ID', value: target },
      ...fields.filter(
        (item) => item.label !== '对象类型' && item.label !== '实例 ID'
      )
    ];
  } catch {
    return data.detailFields || [];
  }
};

interface ImplicitRelationCanvasProps {
  loading: boolean;
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
  graphRevision: number;
  selectedDiscoveryId?: string;
  onSelectDiscovery?: (discoveryId: string | null) => void;
}

const InitializeViewport: React.FC<{ graphRevision: number }> = ({
  graphRevision
}) => {
  const { getNodes, setViewport } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const viewportSize = useStore((state) => ({
    width: state.width,
    height: state.height
  }));
  const prevRevisionRef = useRef(-1);

  useEffect(() => {
    if (
      !nodesInitialized ||
      graphRevision <= 0 ||
      graphRevision === prevRevisionRef.current ||
      !viewportSize.width ||
      !viewportSize.height
    ) {
      return;
    }

    prevRevisionRef.current = graphRevision;
    const frameId = window.requestAnimationFrame(() => {
      const flowNodes = getNodes();
      if (flowNodes.length === 0) {
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
        return;
      }
      const bounds = getNodesBounds(flowNodes);
      const viewport = getViewportForBounds(
        bounds,
        viewportSize.width,
        viewportSize.height,
        0.2,
        1,
        1
      );
      setViewport(viewport, { duration: 300 });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    getNodes,
    graphRevision,
    nodesInitialized,
    setViewport,
    viewportSize.height,
    viewportSize.width
  ]);

  return null;
};

const HIGHLIGHT_EDGE_COLOR = '#C41E3A';

const FocusOnDiscovery: React.FC<{
  selectedDiscoveryId?: string;
  edges: RelationGraphEdge[];
}> = ({ selectedDiscoveryId, edges }) => {
  const { fitView, getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const prevFocusRef = useRef<string | undefined>();

  useEffect(() => {
    if (!nodesInitialized) {
      return;
    }
    if (!selectedDiscoveryId) {
      prevFocusRef.current = undefined;
      return;
    }
    if (prevFocusRef.current === selectedDiscoveryId) {
      return;
    }
    prevFocusRef.current = selectedDiscoveryId;

    const focusEdge = edges.find(
      (edge) => edge.data?.discoveryId === selectedDiscoveryId
    );
    if (!focusEdge) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const flowNodes = getNodes().filter(
        (node) => node.id === focusEdge.source || node.id === focusEdge.target
      );
      if (!flowNodes.length) {
        return;
      }
      void fitView({
        nodes: flowNodes,
        padding: 0.45,
        duration: 320,
        maxZoom: 1.35
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [edges, fitView, getNodes, nodesInitialized, selectedDiscoveryId]);

  return null;
};

const CanvasInner: React.FC<ImplicitRelationCanvasProps> = ({
  loading,
  nodes,
  edges,
  graphRevision,
  selectedDiscoveryId,
  onSelectDiscovery
}) => {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeData, setSelectedNodeData] =
    useState<KnowledgeGraphNodeData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const syncedRevisionRef = useRef(0);
  const detailReqRef = useRef(0);

  const applyDiscoveryHighlight = useCallback(
    (nextNodes: RelationGraphNode[], nextEdges: RelationGraphEdge[]) => {
      const focusEdge = selectedDiscoveryId
        ? nextEdges.find(
            (edge) => edge.data?.discoveryId === selectedDiscoveryId
          )
        : undefined;
      const focusNodeIds = focusEdge
        ? new Set([focusEdge.source, focusEdge.target])
        : null;

      setFlowNodes(
        nextNodes.map((node) => {
          const focused = Boolean(focusNodeIds?.has(node.id));
          return {
            ...node,
            draggable: true,
            selected: false,
            className: focused ? 'implicit-discovery-focus-node' : undefined,
            style: {
              ...node.style,
              opacity: !focusNodeIds || focused ? 1 : 0.28,
              transition: 'opacity 0.2s ease'
            },
            zIndex: focused ? 10 : 1
          };
        })
      );

      setFlowEdges(
        nextEdges.map((edge) => {
          const isImplicit = Boolean(edge.data?.isImplicit);
          const highlighted =
            Boolean(selectedDiscoveryId) &&
            edge.data?.discoveryId === selectedDiscoveryId;
          const dimmed = Boolean(selectedDiscoveryId) && !highlighted;
          const edgeColor = highlighted
            ? HIGHLIGHT_EDGE_COLOR
            : isImplicit
              ? IMPLICIT_EDGE_COLOR
              : CONFIRMED_EDGE_COLOR;

          return {
            ...edge,
            label: undefined,
            labelShowBg: false,
            interactionWidth: 24,
            selected: highlighted,
            className: highlighted
              ? 'implicit-discovery-focus-edge'
              : undefined,
            zIndex: highlighted ? 20 : 1,
            style: {
              opacity: dimmed ? 0.18 : 1,
              transition: 'opacity 0.2s ease'
            },
            data: {
              ...edge.data,
              edgeColor,
              isImplicit
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: highlighted ? 16 : 14,
              height: highlighted ? 16 : 14,
              color: edgeColor
            }
          };
        })
      );
    },
    [selectedDiscoveryId, setFlowEdges, setFlowNodes]
  );

  useEffect(() => {
    if (graphRevision === syncedRevisionRef.current) {
      return;
    }
    syncedRevisionRef.current = graphRevision;
    applyDiscoveryHighlight(nodes, edges);
    setSelectedNodeData(null);
    setDetailLoading(false);
  }, [applyDiscoveryHighlight, edges, graphRevision, nodes]);

  useEffect(() => {
    // 选中发现关系变化时，在当前图上突出相关节点/边（无需重建 revision）
    if (syncedRevisionRef.current === 0 && nodes.length === 0) {
      return;
    }
    applyDiscoveryHighlight(nodes, edges);
    if (selectedDiscoveryId) {
      setSelectedNodeData(null);
      setDetailLoading(false);
    }
  }, [applyDiscoveryHighlight, edges, nodes, selectedDiscoveryId]);

  const clearNodeSelection = useCallback(() => {
    setSelectedNodeData(null);
    setDetailLoading(false);
  }, []);

  const handleNodeClick = useCallback(
    async (_: React.MouseEvent, node: Node<KnowledgeGraphNodeData>) => {
      onSelectDiscovery?.(null);
      setFlowNodes((current) =>
        current.map((item) => ({
          ...item,
          selected: item.id === node.id,
          style: {
            ...item.style,
            opacity: 1
          },
          zIndex: item.id === node.id ? 10 : 1
        }))
      );
      setFlowEdges((current) =>
        current.map((edge) => {
          const isImplicit = Boolean(edge.data?.isImplicit);
          const edgeColor = isImplicit
            ? IMPLICIT_EDGE_COLOR
            : CONFIRMED_EDGE_COLOR;
          return {
            ...edge,
            selected: false,
            style: {
              ...edge.style,
              opacity: 1
            },
            data: {
              ...edge.data,
              edgeColor
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: edgeColor
            }
          };
        })
      );

      const data = node.data ?? null;
      if (!data) {
        setSelectedNodeData(null);
        return;
      }

      setSelectedNodeData(data);
      const reqId = detailReqRef.current + 1;
      detailReqRef.current = reqId;
      setDetailLoading(true);
      const detailFields = await loadNodeAttributes(data);
      if (detailReqRef.current !== reqId) {
        return;
      }
      setSelectedNodeData({
        ...data,
        detailFields
      });
      setDetailLoading(false);
    },
    [onSelectDiscovery, setFlowEdges, setFlowNodes]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      clearNodeSelection();
      if (!edge.data?.isImplicit || !edge.data?.discoveryId) {
        onSelectDiscovery?.(null);
        return;
      }
      onSelectDiscovery?.(String(edge.data.discoveryId));
    },
    [clearNodeSelection, onSelectDiscovery]
  );

  const handlePaneClick = useCallback(() => {
    clearNodeSelection();
    onSelectDiscovery?.(null);
  }, [clearNodeSelection, onSelectDiscovery]);

  const empty = !loading && nodes.length === 0;

  return (
    <div className={styles.canvasWrap}>
      {loading ? (
        <div className={styles.loadingMask}>
          <Spin tip="正在进行关系挖掘..." />
        </div>
      ) : null}
      {empty ? (
        <div className={styles.emptyTip}>
          点击「执行发现」后，将展示节点、显性关系与隐性关系；已执行后可重新执行以同步实例关系变化
        </div>
      ) : null}
      <CanvasModeProvider mode="minimal">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
          fitView={false}
          minZoom={0.15}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          className={`${styles.flow} ${
            selectedDiscoveryId ? styles.discoveryFocus : ''
          }`}
        >
          <Background gap={18} size={1} color="#e8ecf2" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable />
          <InitializeViewport graphRevision={graphRevision} />
          <FocusOnDiscovery
            selectedDiscoveryId={selectedDiscoveryId}
            edges={edges}
          />
        </ReactFlow>
      </CanvasModeProvider>

      {selectedNodeData ? (
        <div className={styles.nodeDetailWrap}>
          {detailLoading ? (
            <div className={styles.nodeDetailLoading}>
              <Spin size={20} tip="加载属性..." />
            </div>
          ) : null}
          <ImplicitNodeDetailPanel
            data={selectedNodeData}
            onClose={clearNodeSelection}
          />
        </div>
      ) : null}
    </div>
  );
};

export default function ImplicitRelationCanvas(
  props: ImplicitRelationCanvasProps
) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
