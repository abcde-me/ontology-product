import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  CubeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { V3_THEME } from '../../v3DesignConfig';
import dagre from 'dagre';

const LAYOUT_STORAGE_PREFIX = 'ontology-topology-layout-';

/**
 * 8. 图谱可视化规范 (Graph Visualization - React Flow)
 * 使用 Dagre 引擎进行自动层次布局
 */

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR'
) => {
  // 每次创建新的 dagre 图实例，避免状态污染
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

type LayoutStore = {
  nodeIds: string[];
  positions: Record<string, { x: number; y: number }>;
};

function loadLayout(projectId: string): LayoutStore | null {
  if (!projectId) return null;
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_PREFIX + projectId);
    if (!raw) return null;
    const data = JSON.parse(raw) as LayoutStore;
    return data?.nodeIds &&
      data?.positions &&
      typeof data.positions === 'object'
      ? data
      : null;
  } catch {
    return null;
  }
}

function saveLayout(projectId: string, nodes: Node[]): void {
  if (!projectId || !nodes.length) return;
  try {
    const nodeIds = nodes.map((n) => n.id);
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      positions[n.id] = { x: n.position.x, y: n.position.y };
    });
    localStorage.setItem(
      LAYOUT_STORAGE_PREFIX + projectId,
      JSON.stringify({ nodeIds, positions })
    );
  } catch (e) {
    console.warn('Failed to persist topology layout', e);
  }
}

function nodeSetMatches(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((id) => set.has(id));
}

// Custom Object Node
const ObjectTypeNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
            min-w-[180px] rounded-none border bg-white shadow-sm transition-all duration-300
            ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-300'}
        `}
    >
      {/* Header */}
      <div className="flex h-7 items-center justify-between rounded-none border-b border-slate-200 bg-slate-100 px-2">
        <div className="flex items-center space-x-1.5">
          <CubeIcon className="h-3.5 w-3.5 text-blue-600" />
          <span className="max-w-[100px] truncate font-mono text-[10px] font-bold uppercase tracking-tight text-blue-600">
            {data.apiName}
          </span>
        </div>
        <div className="flex space-x-1">
          <div
            className={`
                        h-1.5 w-1.5 rounded-none
                        ${
                          ['success', 'active', 'ready', '成功'].includes(
                            (data.syncStatus || 'success').toLowerCase()
                          )
                            ? 'bg-green-500'
                            : ['failed', 'error', '失败'].includes(
                                  (data.syncStatus || '').toLowerCase()
                                )
                              ? 'animate-pulse bg-rose-500'
                              : 'animate-pulse bg-blue-500'
                        }
                    `}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5">
        <div className={`${V3_THEME.fontSize.tiny} font-bold text-slate-700`}>
          {data.label}
        </div>
        <div
          className={`${V3_THEME.fontSize.micro} mt-1 font-mono uppercase tracking-tighter text-slate-400`}
        >
          {data.propertyCount || 0} 项属性
        </div>
      </div>

      {/* Handles - Four handles to support bi-directional flow */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{ top: '50%', transform: 'translateY(-4px)' }}
        className="-left-1 h-2 w-2 !rounded-none border-none !bg-slate-400"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style={{ top: '50%', transform: 'translateY(4px)' }}
        className="-left-1 h-2 w-2 !rounded-none border-none !bg-blue-600"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        style={{ top: '50%', transform: 'translateY(-4px)' }}
        className="-right-1 h-2 w-2 !rounded-none border-none !bg-slate-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{ top: '50%', transform: 'translateY(4px)' }}
        className="-right-1 h-2 w-2 !rounded-none border-none !bg-blue-600"
      />
    </div>
  );
};

const nodeTypes = {
  objectType: ObjectTypeNode
};

interface TopologyOverviewProps {
  projectId: string;
  objectTypes: any[];
  linkTypes: any[];
  onViewObjectTypeDetail?: (type: any) => void;
  onViewLinkTypeDetail?: (link: any) => void;
}

const TopologyOverview: React.FC<TopologyOverviewProps> = ({
  projectId,
  objectTypes,
  linkTypes,
  onViewObjectTypeDetail,
  onViewLinkTypeDetail
}) => {
  // 1. Calculate initial layout: dagre auto-layout, then optionally restore user-saved positions
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes: Node[] = objectTypes.map((ot) => ({
      id: ot.id,
      type: 'objectType',
      data: {
        label: ot.name,
        apiName: ot.apiName,
        syncStatus: ot.syncStatus,
        propertyCount: (ot.properties || []).length
      },
      position: { x: 0, y: 0 }
    }));

    const rawEdges: Edge[] = [];
    linkTypes.forEach((lt) => {
      const sourceNode = objectTypes.find(
        (ot) =>
          ot.id === lt.source ||
          ot.id === lt.sourceId ||
          ot.name === lt.source ||
          ot.apiName === lt.source
      );
      const targetNode = objectTypes.find(
        (ot) =>
          ot.id === lt.target ||
          ot.id === lt.targetId ||
          ot.name === lt.target ||
          ot.apiName === lt.target
      );

      if (!sourceNode || !targetNode) return;

      rawEdges.push({
        id: lt.id,
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'source-right',
        targetHandle: 'target-left',
        label: lt.name,
        type: 'default',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 2' },
        labelStyle: {
          fill: '#64748b',
          fontWeight: 700,
          fontSize: 10,
          fontFamily: 'monospace'
        },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 0,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8'
        }
      });
    });

    const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges);
    const stored = loadLayout(projectId);
    const currentIds = nodes.map((n) => n.id);
    if (stored && nodeSetMatches(currentIds, stored.nodeIds)) {
      nodes.forEach((n) => {
        const p = stored.positions[n.id];
        if (p) n.position = { x: p.x, y: p.y };
      });
    }
    return { initialNodes: nodes, initialEdges: edges };
  }, [objectTypes, linkTypes, projectId]);

  // 2. Local state to enable interactivity
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 3. 用 ref 跟踪最新节点，解决闭包问题
  const nodesRef = useRef<Node[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // 4. Sync local state when domain data changes (e.g. switching projects)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleApplyAutoLayout = useCallback(() => {
    const { nodes: layouted } = getLayoutedElements(
      [...nodesRef.current],
      [...edges]
    );
    setNodes(layouted);
    saveLayout(projectId, layouted);
  }, [edges, setNodes, projectId]);

  const handleNodeDragStop = useCallback(() => {
    // 使用 setTimeout 确保 React Flow 内部状态已同步到 nodes state
    setTimeout(() => {
      if (projectId && nodesRef.current.length > 0) {
        saveLayout(projectId, nodesRef.current);
      }
    }, 50);
  }, [projectId]);

  return (
    <div
      ref={containerRef}
      className={`animate-in fade-in relative border border-slate-200 bg-slate-50 duration-500 ${isFullScreen ? 'h-screen w-screen' : 'h-[calc(100vh-180px)] w-full'}`}
      style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '12px 12px'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={(_, node) => {
          const ot = objectTypes.find((t) => t.id === node.id);
          if (ot) onViewObjectTypeDetail?.(ot);
        }}
        onEdgeClick={(_, edge) => {
          const lt = linkTypes.find((l) => l.id === edge.id);
          if (lt) onViewLinkTypeDetail?.(lt);
        }}
        onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          maxZoom: 1.5
        }}
        minZoom={0.1}
        maxZoom={4}
        className="rounded-none shadow-inner"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="#E2E8F0"
        />
        <Controls className="!rounded-none !border-slate-200 !bg-white !shadow-sm" />
        <MiniMap
          className="!rounded-none !border-slate-200 !bg-white/80"
          maskColor="rgba(248, 250, 252, 0.6)"
          nodeColor={(n) => (n.type === 'objectType' ? '#2563eb' : '#94a3b8')}
        />
      </ReactFlow>

      {/* Visual Indicator Layer */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col space-y-2">
        <div className="flex items-center space-x-2 border border-slate-200 bg-white/80 px-3 py-1 text-slate-500 shadow-sm backdrop-blur-sm">
          <div className="h-2 w-2 bg-blue-500" />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">
            本体建模引擎：运行中
          </span>
        </div>
      </div>

      {/* Buttons Layer - Top Right */}
      <div className="absolute right-4 top-4 z-10 flex items-center space-x-2">
        <button
          onClick={handleApplyAutoLayout}
          className="flex items-center space-x-1.5 border border-slate-200 bg-white/80 px-3 py-2 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          title="自动布局"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span className="text-xs font-medium">自动布局</span>
        </button>
        <button
          onClick={toggleFullScreen}
          className="group flex items-center justify-center border border-slate-200 bg-white/80 p-2 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          title={isFullScreen ? '退出全屏' : '全屏展示'}
        >
          {isFullScreen ? (
            <ArrowsPointingInIcon className="h-5 w-5" />
          ) : (
            <ArrowsPointingOutIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Zoom Level Indicator - Bottom Right */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10">
        <span
          className={`${V3_THEME.fontSize.tiny} rounded-sm bg-white/50 px-1.5 py-0.5 font-mono font-black uppercase tracking-widest text-slate-400/80 backdrop-blur-sm`}
        >
          {(zoomLevel * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default TopologyOverview;
