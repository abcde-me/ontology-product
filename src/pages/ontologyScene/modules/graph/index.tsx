import React, { useCallback, useState, useEffect } from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  BlockEnum,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import { MyNode, MyNodePanel, MyNodeDefault } from './nodes';
import {
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  setDraft
} from './common/api';
import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import dagre from '@dagrejs/dagre';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import styles from './index.module.scss';
import { CustomLabel, EdgePanel } from './edges';
import { Spin } from '@arco-design/web-react';
import SubHeader from './subHeader';
import classNames from 'classnames';
import { MarkerType } from 'reactflow';
import { useDemoStore } from './common/store';
import { useParams } from 'react-router-dom';
import { OsEmptyStatusWrapper } from '@/pages/ontologyScene/componens';
import GraphEmptyImage from '@/pages/ontologyScene/assets/graph-empty.png';

const nodesConfig = [
  {
    type: 'default', // 节点类型
    node: MyNode, // 画布展示的节点
    panel: MyNodePanel, // 节点配置面板
    nodeDefault: MyNodeDefault, // 节点默认配置
    classification: 'ontology', // 节点分类
    title: '本体节点', // 节点标题
    showDefaultSourceHandle: true, // 是否显示默认的源连接点
    showDefaultTargetHandle: true, // 是否显示默认的目标连接点
    showNodeControl: false // 是否显示节点控制按钮
  }
];

const NODE_WIDTH = 256;
const NODE_HEIGHT = 112;

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
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 200 });

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
        ...MyNodeDefault.defaultValue,
        // @ts-expect-error
        type: 'default',
        desc: topologyNode.description ?? '',
        title: topologyNode.name || '未命名节点',
        attributes: topologyNode.ontologyPhysicalPropertiesList || [],
        syncStatus: topologyNode.syncStatus
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
          id: topologyEdge.id, // 保存原始的数字ID
          name: topologyEdge.name || '',
          syncStatus: topologyEdge.syncStatus
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

  // 计算所有节点的边界框，用于X轴方向居中显示
  if (layoutedNodes.length > 0) {
    const minX = Math.min(...layoutedNodes.map((node) => node.position.x));
    const maxX = Math.max(
      ...layoutedNodes.map((node) => node.position.x + NODE_WIDTH)
    );

    // 计算图谱在X轴方向的中心点
    const graphCenterX = (minX + maxX) / 2;

    // 计算X轴偏移量，使图谱中心移动到画布中心 (X=0)
    const centerOffsetX = graphCenterX;

    // 调整所有节点位置，使图谱在X轴方向居中
    const centeredNodes = layoutedNodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x + centerOffsetX,
        y: node.position.y // Y轴位置保持不变
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

    return layoutNodesWithDagre(topologyData, newNode);
  };
};

// 本体图谱拓扑（基于 AIWorkflow 工作流组件）
export default function OntologySceneGraph() {
  const [topologyData, setTopologyData] =
    useState<GetOntologyTopologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const { id: OSId } = useParams<{ id: string }>();

  // 计算是否为空：当 nodes 和 edges 都是空数组时，isEmpty 为 true
  const isEmpty =
    !loading &&
    topologyData !== null &&
    (!topologyData.nodes || topologyData.nodes.length === 0) &&
    (!topologyData.edges || topologyData.edges.length === 0);

  useEffect(() => {
    // 重置 loading 状态和拓扑数据
    setLoading(true);
    setTopologyData(null);
    // 清除之前的 draft 缓存，避免显示旧数据
    setDraft(null);

    // 获取本体拓扑数据
    getOntologyTopology({
      id: Number(OSId)
    })
      .then((res) => {
        if (res.status === 200 && res.code === '' && res.data) {
          setTopologyData(res.data);
        }
      })
      .catch((err) => {
        console.error('获取本体拓扑数据失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [OSId]);

  const nodesReadonlyChecker = useCallback(() => {
    return true;
  }, []);

  // 基于获取的数据创建 initWorkflow
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {isEmpty ? (
        <div className="flex h-full w-full items-center justify-center">
          <img className="w-[702px]" src={GraphEmptyImage} alt="empty" />
        </div>
      ) : (
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
              setShowCustomEdgePanel(false);
            }
          }}
          subHeader={{ fullyCustomSubheader: <SubHeader /> }}
          rightPanels={[
            {
              id: 'custom-edge-panel',
              isShow: showCustomEdgePanel,
              panel: EdgePanel
            }
          ]}
        >
          <AIWorflow
            className={classNames(styles['ai-workflow'], styles['edge-style'])}
          />
        </AIWorkflowProvider>
      )}
    </div>
  );
}
