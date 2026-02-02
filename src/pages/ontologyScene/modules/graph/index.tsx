import React, { useCallback, useState, useEffect } from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  BlockEnum,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import {
  MyNode,
  MyNodePanel,
  MyNodeDefault,
  MyNodeControlPanel
} from './nodes';
import { getWorkflow, createWorkflow, updateWorkflow } from './demo/api';
import { getOntologyTopology } from '@/api/ontologyScene/graph';
import dagre from '@dagrejs/dagre';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import styles from './index.module.scss';
import { CustomEdge } from './edges';

const nodesConfig = [
  {
    type: 'default',
    node: MyNode,
    panel: MyNodePanel,
    nodeDefault: MyNodeDefault,
    classification: 'ontology',
    title: '本体节点',
    showDefaultSourceHandle: true,
    showDefaultTargetHandle: true,
    showNodeControl: true,
    nodeControlPanel: MyNodeControlPanel
  }
];

const edgeTypes = {
  'custom-edge': CustomEdge
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

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

  // 创建 dagre 图
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });

  // 创建节点映射，用于后续查找
  const nodeIdMap = new Map<number, string>();
  const workflowNodes: any[] = [];

  // 先创建所有节点（不设置位置）
  topologyNodes.forEach((topologyNode) => {
    const nodeId = String(
      topologyNode.id ?? topologyNode.code ?? topologyNode.name ?? Date.now()
    );
    if (topologyNode.id !== undefined) {
      nodeIdMap.set(topologyNode.id, nodeId);
    }

    const { newNode: workflowNode } = newNode({
      id: nodeId,
      data: {
        // @ts-expect-error
        type: 'default',
        desc: topologyNode.description ?? '',
        title: topologyNode.name ?? topologyNode.code ?? '未命名节点',
        ...MyNodeDefault.defaultValue
      },
      position: { x: 0, y: 0 } // 临时位置，稍后由 dagre 计算
    });

    workflowNodes.push(workflowNode);
    // 添加到 dagre 图
    g.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // 创建边并添加到 dagre 图
  const workflowEdges = topologyEdges
    .filter(
      (topologyEdge) =>
        topologyEdge.sourceId !== undefined &&
        topologyEdge.targetId !== undefined
    )
    .map((topologyEdge) => {
      const sourceId = nodeIdMap.get(topologyEdge.sourceId!);
      const targetId = nodeIdMap.get(topologyEdge.targetId!);

      if (sourceId && targetId) {
        // 添加到 dagre 图
        g.setEdge(sourceId, targetId);
      }

      return {
        id: String(
          topologyEdge.id ?? `${topologyEdge.sourceId}-${topologyEdge.targetId}`
        ),
        source: sourceId ?? String(topologyEdge.sourceId),
        sourceHandle: 'source',
        target: targetId ?? String(topologyEdge.targetId),
        targetHandle: 'target',
        type: 'custom-edge',
        data: {
          // 可以在这里添加 edge 的自定义数据
          label: topologyEdge.name || '',
          labelIcon: '🔗', // 链式图标
          labelColor: '#f1f5f9' // 浅灰色背景
        },
        style: {
          stroke: '#94a3b8', // 灰色
          strokeWidth: 2,
          strokeDasharray: '5,5' // 虚线样式
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#94a3b8'
        }
      };
    });

  // 执行 dagre 布局
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

  return {
    nodes: layoutedNodes,
    edges: workflowEdges,
    draft: true
  };
}

// 创建基于接口数据的 initWorkflow
const createInitWorkflow = (
  topologyData: GetOntologyTopologyResponse | null
) => {
  return (newNode: GenerateNewNode) => {
    if (!topologyData) {
      // 如果没有数据，返回默认的空工作流
      return {
        nodes: [],
        edges: [],
        draft: true
      };
    }

    const ttt = layoutNodesWithDagre(topologyData, newNode);

    console.log('--------------', ttt);

    return ttt;
  };
};

// 本体图谱拓扑（基于 AIWorkflow 工作流组件）
export default function OntologySceneGraph() {
  const [topologyData, setTopologyData] =
    useState<GetOntologyTopologyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取本体拓扑数据
    getOntologyTopology({})
      .then((res) => {
        if (res.code === 0 && res.data) {
          setTopologyData(res.data);
        }
      })
      .catch((err) => {
        console.error('获取本体拓扑数据失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const nodesReadonlyChecker = useCallback(() => {
    return true;
  }, []);

  // 基于获取的数据创建 initWorkflow
  const initWorkflow = useCallback(createInitWorkflow(topologyData), [
    topologyData
  ]);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <AIWorkflowProvider
      nodes={nodesConfig}
      initWorkflow={initWorkflow}
      api={{
        workflowNotExistedMarks: ['ResourceNotFound', '资源不存在'],
        getWorkflow,
        createWorkflow,
        updateWorkflow
      }}
      nodesReadonlyChecker={nodesReadonlyChecker}
      headerHeight={0}
    >
      <AIWorflow className={styles['ai-workflow']} />
    </AIWorkflowProvider>
  );
}
