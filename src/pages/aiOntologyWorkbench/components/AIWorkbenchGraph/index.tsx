import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import { MyNode, MyNodeDefault } from './nodes';
import {
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  setDraft,
  setActiveWorkflowSceneId
} from '@/pages/ontologyScene/modules/graph/common/api';
import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import dagre from '@dagrejs/dagre';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import styles from './index.module.scss';
import { CustomLabel } from './edges';
import { Spin } from '@arco-design/web-react';
import classNames from 'classnames';
import { MarkerType } from 'reactflow';
import { useAIWorkbenchGraphStore } from './store';
import { useAIWorkbenchStore } from '../../store';
import { useHistory } from 'react-router-dom';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import BottomPanel from './panels/BottomPanel';
import { ZoomInOut } from '@ceai-front/workflow';
import { Space } from '@arco-design/web-react';
import {
  useNodes,
  useNodesInitialized,
  useReactFlow,
  useEdges
} from 'reactflow';
import { buildWorkflowNodeLookup } from '@/pages/ontologyScene/modules/graph/utils/layoutOntologyGraph';
import { mapTopologyEdgesToWorkflowEdges } from '@/pages/ontologyScene/modules/graph/utils/topologyEdgeIdentity';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;

// 自动适应视图组件
function AutoFitView() {
  const nodes = useNodes();
  const edges = useEdges();
  const nodesInitialized = useNodesInitialized();
  const { fitView, setCenter, getZoom } = useReactFlow();
  const hasFittedRef = React.useRef(false);

  useEffect(() => {
    if (!nodesInitialized || nodes.length === 0 || hasFittedRef.current) {
      return;
    }

    hasFittedRef.current = true;

    const frameId = window.requestAnimationFrame(() => {
      fitView({
        padding: 0.16,
        minZoom: 0.3,
        maxZoom: 1
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [fitView, nodes, nodesInitialized]);

  // 监听节点/边居中事件
  useEffect(() => {
    const handleCenterNode = (event: CustomEvent) => {
      const { code, zoom } = event.detail;
      console.log('[AutoFitView] 收到居中事件，code:', code, 'zoom:', zoom);

      // 先查找节点
      const targetNode = nodes.find(
        (node) => (node.data as any)?.code === code
      );
      if (targetNode) {
        console.log('[AutoFitView] 找到目标节点:', targetNode);
        // 使用指定的缩放级别，如果没有指定则使用当前缩放级别
        const targetZoom = zoom !== undefined ? zoom : getZoom();
        // 居中到节点
        setCenter(
          targetNode.position.x + NODE_WIDTH / 2,
          targetNode.position.y + NODE_HEIGHT / 2,
          { zoom: targetZoom, duration: 800 } // 800ms 动画
        );
        return;
      }

      // 如果没找到节点，查找边
      const targetEdge = edges.find(
        (edge) => (edge.data as any)?.code === code
      );
      if (targetEdge) {
        console.log('[AutoFitView] 找到目标边:', targetEdge);

        // 找到边的源节点和目标节点
        const sourceNode = nodes.find((node) => node.id === targetEdge.source);
        const targetNode = nodes.find((node) => node.id === targetEdge.target);

        if (sourceNode && targetNode) {
          // 计算边的中点位置
          const centerX =
            (sourceNode.position.x +
              NODE_WIDTH / 2 +
              targetNode.position.x +
              NODE_WIDTH / 2) /
            2;
          const centerY =
            (sourceNode.position.y +
              NODE_HEIGHT / 2 +
              targetNode.position.y +
              NODE_HEIGHT / 2) /
            2;

          console.log('[AutoFitView] 边的中点位置:', { centerX, centerY });

          // 使用指定的缩放级别，如果没有指定则使用当前缩放级别
          const targetZoom = zoom !== undefined ? zoom : getZoom();
          // 居中到边的中点
          setCenter(centerX, centerY, { zoom: targetZoom, duration: 800 });
        } else {
          console.warn('[AutoFitView] 未找到边的源节点或目标节点');
        }
        return;
      }

      console.warn('[AutoFitView] 未找到目标节点或边，code:', code);
    };

    window.addEventListener(
      'centerGraphNode',
      handleCenterNode as EventListener
    );

    return () => {
      window.removeEventListener(
        'centerGraphNode',
        handleCenterNode as EventListener
      );
    };
  }, [nodes, edges, setCenter, getZoom]);

  return null;
}

// 子头部组件
function CustomSubHeader() {
  return (
    <Space size="large">
      <AutoFitView />
      <ZoomInOut />
    </Space>
  );
}

// 使用 dagre 进行布局计算
function layoutNodesWithDagre(
  topologyData: GetOntologyTopologyResponse,
  newNode: GenerateNewNode
) {
  const topologyNodes = topologyData.nodes ?? [];
  const topologyEdges = topologyData.edges ?? [];

  if (topologyNodes.length === 0) {
    return { nodes: [], edges: [], draft: true };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 280 });

  const nodeLookup = buildWorkflowNodeLookup(topologyNodes);
  const workflowNodes: any[] = [];

  // 创建所有节点
  topologyNodes.forEach((topologyNode) => {
    const numericId = Number(topologyNode.id);
    const nodeId = String(
      Number.isFinite(numericId)
        ? numericId
        : (topologyNode.code ?? topologyNode.name ?? Date.now())
    );

    const { newNode: workflowNode } = newNode({
      id: nodeId,
      data: {
        ...MyNodeDefault.defaultValue,
        // @ts-expect-error - type field is required by workflow but not in defaultValue
        type: 'default',
        desc: topologyNode.description ?? '',
        title: topologyNode.name || '未命名节点',
        selected: false,
        syncStatus: topologyNode.syncStatus,
        code: topologyNode.code ?? '',
        icon: topologyNode.icon ?? '',
        id: topologyNode.id
      },
      position: { x: 0, y: 0 }
    });

    workflowNodes.push(workflowNode);
    g.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  const workflowEdges = mapTopologyEdgesToWorkflowEdges(
    topologyEdges,
    nodeLookup,
    { includeCode: true }
  ).map((edge) => {
    if (edge.source && edge.target) {
      g.setEdge(edge.source, edge.target);
    }
    return edge;
  });

  // 执行布局
  dagre.layout(g);

  // 更新节点位置
  const layoutedNodes = workflowNodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    if (nodeWithPos) {
      return {
        ...node,
        position: {
          x: nodeWithPos.x - NODE_WIDTH / 2,
          y: nodeWithPos.y - NODE_HEIGHT / 2
        }
      };
    }
    return node;
  });

  // 居中显示
  if (layoutedNodes.length > 0) {
    const minX = Math.min(...layoutedNodes.map((node) => node.position.x));
    const maxX = Math.max(
      ...layoutedNodes.map((node) => node.position.x + NODE_WIDTH)
    );

    const graphCenterX = (minX + maxX) / 2;
    const canvasWidth =
      typeof window !== 'undefined' ? window.innerWidth - 200 : 1720;
    const canvasCenterX = canvasWidth / 2;
    const centerOffsetX = canvasCenterX - graphCenterX;

    const centeredNodes = layoutedNodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x + centerOffsetX,
        y: node.position.y
      }
    }));

    return {
      nodes: centeredNodes,
      edges: workflowEdges,
      draft: true
    };
  }

  return {
    nodes: layoutedNodes,
    edges: workflowEdges,
    draft: true
  };
}

// 创建节点配置
const createNodesConfig = (
  OSId: string,
  history: ReturnType<typeof useHistory>
) => [
  {
    type: 'default',
    node: MyNode,
    panel: () => null, // AI工作台使用底部面板，不需要右侧面板
    nodeDefault: MyNodeDefault,
    classification: 'ontology',
    title: '', // 设置为空字符串，不显示标题
    showDefaultSourceHandle: true,
    showDefaultTargetHandle: true,
    showNodeControl: false,
    // 提供一个空的 iconRender，返回 null
    iconRender: () => null
  }
];

// 创建初始化工作流
const createInitWorkflow = (
  topologyData: GetOntologyTopologyResponse | null
) => {
  return (newNode: GenerateNewNode) => {
    if (!topologyData) {
      return {
        nodes: [],
        edges: [],
        draft: true
      };
    }

    return layoutNodesWithDagre(topologyData, newNode);
  };
};

/**
 * AI 工作台图谱组件
 */
export default function AIWorkbenchGraph() {
  const [topologyData, setTopologyData] =
    useState<GetOntologyTopologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新组件
  const { openBottomPanel } = useAIWorkbenchGraphStore();
  const { currentOntology } = useAIWorkbenchStore();
  const history = useHistory();

  // 从 store 中获取当前本体 ID
  const OSId = currentOntology?.id?.toString() || '';

  const nodesConfig = useMemo(
    () => createNodesConfig(OSId, history),
    [OSId, history]
  );

  // 禁用右键菜单
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // 检查是否在图谱区域内
      const target = e.target as HTMLElement;
      const isInWorkflow = target.closest('.react-flow');

      if (isInWorkflow) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 添加事件监听器，使用捕获阶段以确保优先处理
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // 监听本体切换，重新加载图谱数据
  useEffect(() => {
    console.log(
      '[AIWorkbenchGraph] 本体切换，当前本体ID:',
      currentOntology?.id
    );

    // 如果没有选中本体，不加载数据
    if (!currentOntology?.id) {
      setLoading(false);
      setTopologyData(null);
      setRefreshKey((prev) => prev + 1); // 强制刷新组件
      return;
    }

    // 清理状态和缓存
    setLoading(true);
    setTopologyData(null);
    setRefreshKey((prev) => prev + 1); // 强制刷新组件

    // 清理工作流缓存
    try {
      setActiveWorkflowSceneId(Number(currentOntology.id));
      setDraft(null, Number(currentOntology.id));
    } catch (error) {
      console.warn('清理工作流缓存失败:', error);
    }

    console.log(
      '[AIWorkbenchGraph] 开始加载本体拓扑数据，本体ID:',
      currentOntology.id
    );

    getOntologyTopology({
      id: Number(currentOntology.id)
    })
      .then((res) => {
        console.log('[AIWorkbenchGraph] 获取拓扑数据响应:', res);
        if (res.status === 200 && res.code === '' && res.data) {
          console.log('[AIWorkbenchGraph] 设置新的拓扑数据:', res.data);
          setTopologyData(res.data);
        } else {
          console.warn('[AIWorkbenchGraph] 获取拓扑数据失败:', res.message);
          setTopologyData(null);
        }
      })
      .catch((err) => {
        console.error('获取本体拓扑数据失败:', err);
        setTopologyData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentOntology?.id]); // 依赖本体 ID，当本体切换时重新加载

  const nodesReadonlyChecker = useCallback(() => {
    return true;
  }, []);

  const initWorkflow = useCallback(createInitWorkflow(topologyData), [
    topologyData
  ]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spin block />
      </div>
    );
  }

  // 如果没有当前本体，显示空状态
  if (!currentOntology?.id) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-2 text-[14px] text-[var(--color-text-3)]">
            请先选择一个本体
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white">
      <AIWorkflowProvider
        key={`workflow-${currentOntology.id}-${refreshKey}`} // 使用refreshKey确保本体切换时重新创建
        nodes={nodesConfig}
        initWorkflow={initWorkflow}
        nodesDraggableWhenReadonly
        autoRefreshWhenTabVisible={false}
        api={{
          workflowNotExistedMarks: ['ResourceNotFound', '资源不存在'],
          getWorkflow,
          createWorkflow,
          updateWorkflow
        }}
        nodesReadonlyChecker={nodesReadonlyChecker}
        headerHeight={0}
        edge={{
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: '#C3C7D4'
          },
          targetXOffset: -8,
          labelRenderer: CustomLabel
        }}
        events={{
          onNodeClick: (node) => {
            // 阻止节点被选中（防止右侧面板打开）
            if (node.data) {
              node.data.selected = false;
            }

            const nodeData = node?.data as any;
            openBottomPanel({
              type: 'object',
              id: nodeData?.id || node.id,
              data: nodeData
            });
          }
        }}
        contextMenu={null} // 禁用右键菜单（隐藏"添加节点"和"添加注释"面板）
        rightPanels={[]} // 禁用右侧面板
        subHeader={{ fullyCustomSubheader: <CustomSubHeader /> }}
      >
        <AIWorflow
          className={classNames(styles['ai-workflow'], styles['edge-style'])}
        />
      </AIWorkflowProvider>

      {/* 底部面板 */}
      <BottomPanel />
    </div>
  );
}
