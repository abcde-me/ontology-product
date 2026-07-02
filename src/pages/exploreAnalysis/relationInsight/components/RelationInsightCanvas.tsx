import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  useStore,
  MarkerType,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Spin } from '@arco-design/web-react';
import { CanvasModeProvider } from '../context/CanvasModeContext';
import type {
  CanvasModeKey,
  KnowledgeGraphNodeData,
  RelationGraphEdge,
  RelationGraphNode
} from '../types';
import { KnowledgeGraphEdge } from './KnowledgeGraphEdge';
import { KnowledgeGraphNode } from './KnowledgeGraphNode';
import { NodeInstanceDetailPanel } from './NodeInstanceDetailPanel';
import { DEFAULT_EDGE_COLOR } from '../utils/nodeColors';
import styles from '../index.module.scss';

const nodeTypes = {
  knowledgeNode: KnowledgeGraphNode
};

const edgeTypes = {
  knowledgeEdge: KnowledgeGraphEdge
};

const defaultEdgeOptions = {
  type: 'knowledgeEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: DEFAULT_EDGE_COLOR
  }
};

const DEFAULT_CANVAS_ZOOM = 1;

const FIT_VIEW_OPTIONS = {
  padding: 0.2,
  minZoom: 0.25,
  maxZoom: 1.5,
  duration: 350
};

const CENTER_AT_DEFAULT_ZOOM_OPTIONS = {
  padding: 0.2,
  duration: 350
};

const ZOOM_LIMITS = {
  minZoom: 0.15,
  maxZoom: 2.5
};

const toFlowEdges = (edges: RelationGraphEdge[]) =>
  edges.map((edge) => ({
    ...edge,
    label: undefined,
    labelShowBg: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: edge.data?.edgeColor ?? DEFAULT_EDGE_COLOR
    }
  }));

const toFlowNodes = (nodes: RelationGraphNode[]) =>
  nodes.map((node) => ({
    ...node,
    draggable: true,
    selected: false
  }));

interface RelationInsightCanvasProps {
  loading: boolean;
  cleared: boolean;
  canvasMode: CanvasModeKey;
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
  hasSelectedObjects: boolean;
  graphRevision: number;
}

const InitializeViewportAtDefaultZoom: React.FC<{ graphRevision: number }> = ({
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
        setViewport(
          { x: 0, y: 0, zoom: DEFAULT_CANVAS_ZOOM },
          { duration: CENTER_AT_DEFAULT_ZOOM_OPTIONS.duration }
        );
        return;
      }

      const bounds = getNodesBounds(flowNodes);
      const viewport = getViewportForBounds(
        bounds,
        viewportSize.width,
        viewportSize.height,
        CENTER_AT_DEFAULT_ZOOM_OPTIONS.padding,
        DEFAULT_CANVAS_ZOOM,
        DEFAULT_CANVAS_ZOOM
      );

      setViewport(viewport, {
        duration: CENTER_AT_DEFAULT_ZOOM_OPTIONS.duration
      });
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

const CanvasZoomIndicator: React.FC = () => {
  const zoom = useStore((state) => state.transform[2]);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <span className={styles['canvas-zoom-label']} aria-live="polite">
      {zoomPercent}%
    </span>
  );
};

const CanvasContent: React.FC<RelationInsightCanvasProps> = ({
  loading,
  cleared,
  canvasMode,
  nodes,
  edges,
  hasSelectedObjects,
  graphRevision
}) => {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeData, setSelectedNodeData] =
    useState<KnowledgeGraphNodeData | null>(null);
  const syncedRevisionRef = useRef(0);

  useEffect(() => {
    if (graphRevision === syncedRevisionRef.current) {
      return;
    }

    syncedRevisionRef.current = graphRevision;
    setFlowNodes(toFlowNodes(nodes));
    setFlowEdges(toFlowEdges(edges));
    setSelectedNodeData(null);
  }, [edges, graphRevision, nodes, setFlowEdges, setFlowNodes]);

  useEffect(() => {
    if (canvasMode !== 'minimal') {
      setSelectedNodeData(null);
      setFlowNodes((current) =>
        current.map((node) => ({ ...node, selected: false }))
      );
    }
  }, [canvasMode, setFlowNodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<KnowledgeGraphNodeData>) => {
      if (canvasMode !== 'minimal') {
        return;
      }

      setSelectedNodeData(node.data ?? null);
      setFlowNodes((current) =>
        current.map((item) => ({
          ...item,
          selected: item.id === node.id
        }))
      );
    },
    [canvasMode, setFlowNodes]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeData(null);
    setFlowNodes((current) =>
      current.map((node) => ({ ...node, selected: false }))
    );
  }, [setFlowNodes]);

  const handleCloseDetail = useCallback(() => {
    setSelectedNodeData(null);
    setFlowNodes((current) =>
      current.map((node) => ({ ...node, selected: false }))
    );
  }, [setFlowNodes]);

  const emptyTip = useMemo(() => {
    if (cleared) {
      return '画布已清空，点击「选择对象」重新载入关系图';
    }
    if (!hasSelectedObjects) {
      return '点击「选择对象」选中一个或多个实例并载入画布，或拖拽到此处';
    }
    return '当前对象暂无可用关系数据，请尝试切换图算法或重新选择对象';
  }, [cleared, hasSelectedObjects]);

  const showEmptyTip = !loading && nodes.length === 0;
  const showGraph = nodes.length > 0;

  return (
    <CanvasModeProvider mode={canvasMode}>
      {!showGraph ? (
        <div className={styles['canvas-grid-bg']} aria-hidden />
      ) : null}

      {loading ? (
        <div className={styles['canvas-loading']}>
          <Spin tip="关系分析中..." />
        </div>
      ) : null}

      {showEmptyTip ? (
        <div className={styles['canvas-empty-tip']}>{emptyTip}</div>
      ) : null}

      {showGraph ? (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          defaultViewport={{ x: 0, y: 0, zoom: DEFAULT_CANVAS_ZOOM }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesConnectable={false}
          nodesDraggable
          elementsSelectable={canvasMode === 'minimal'}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          preventScrolling
          selectionOnDrag={false}
          deleteKeyCode={null}
          {...ZOOM_LIMITS}
          proOptions={{ hideAttribution: true }}
          className={styles['relation-flow']}
        >
          <InitializeViewportAtDefaultZoom graphRevision={graphRevision} />
          <Background color="#DDE3EB" gap={20} size={1} />
          <Panel
            position="bottom-left"
            className={styles['canvas-bottom-left-panel']}
          >
            <div className={styles['canvas-controls-wrap']}>
              <Controls
                showInteractive={false}
                fitViewOptions={FIT_VIEW_OPTIONS}
                className={styles['canvas-controls']}
              />
              <CanvasZoomIndicator />
            </div>
          </Panel>
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => node.data?.color ?? '#CBD5E1'}
            maskColor="rgba(255, 255, 255, 0.6)"
            className={styles['canvas-minimap']}
          />
        </ReactFlow>
      ) : null}

      {canvasMode === 'minimal' && selectedNodeData ? (
        <NodeInstanceDetailPanel
          data={selectedNodeData}
          onClose={handleCloseDetail}
        />
      ) : null}
    </CanvasModeProvider>
  );
};

export const RelationInsightCanvas: React.FC<RelationInsightCanvasProps> = (
  props
) => {
  return (
    <div className={styles['canvas-wrap']}>
      <ReactFlowProvider>
        <CanvasContent {...props} />
      </ReactFlowProvider>
    </div>
  );
};
