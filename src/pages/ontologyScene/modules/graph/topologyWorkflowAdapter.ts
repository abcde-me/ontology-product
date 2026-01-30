import dagre from '@dagrejs/dagre';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import type { Node, Edge } from '@ceai-front/workflow';
import { BlockEnum } from '@ceai-front/workflow';
import type { GetWorkflowResponse } from '@ceai-front/workflow';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

function layoutNodesAndEdges(originNodes: Node[], originEdges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });

  originNodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  originEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const nodes = originNodes.map((node) => {
    const nodeWithPos = g.node(node.id);
    if (!nodeWithPos) return node;
    return {
      ...node,
      position: {
        x: nodeWithPos.x - NODE_WIDTH / 2,
        y: nodeWithPos.y - NODE_HEIGHT / 2
      }
    };
  });

  return { nodes, edges: originEdges };
}

export function buildWorkflowFromTopology(
  data: GetOntologyTopologyResponse
): GetWorkflowResponse {
  const topologyNodes = data.nodes ?? [];
  const topologyEdges = data.edges ?? [];

  const nodes: Node[] = topologyNodes.map((n) => ({
    id: String(n.id ?? n.code ?? n.name),
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      title: n.name ?? n.code ?? '未命名节点',
      desc: n.description ?? '',
      type: BlockEnum.HttpRequest,
      ontologyNode: n
    }
  })) as unknown as Node[];

  const edges: Edge[] = topologyEdges.map((e) => ({
    id: String(e.id ?? `${e.sourceId}-${e.targetId}`),
    source: String(e.sourceId),
    target: String(e.targetId),
    data: {
      sourceType: BlockEnum.HttpRequest,
      targetType: BlockEnum.HttpRequest
    }
  })) as unknown as Edge[];

  const { nodes: layoutedNodes, edges: layoutedEdges } = layoutNodesAndEdges(
    nodes,
    edges
  );

  const now = Math.ceil(Date.now() / 1000);

  const workflow: GetWorkflowResponse = {
    id: 'ontology-topology-workflow',
    graph: {
      nodes: layoutedNodes,
      edges: layoutedEdges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      }
    },
    features: {},
    created_at: now,
    created_by: {
      id: 'system',
      name: 'system',
      email: ''
    },
    hash: String(now),
    updated_at: now,
    updated_by: {
      id: 'system',
      name: 'system',
      email: ''
    },
    tool_published: false,
    environment_variables: [],
    conversation_variables: [],
    version: 'draft',
    marked_name: '',
    marked_comment: ''
  };

  return workflow;
}
