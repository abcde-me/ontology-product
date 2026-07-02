import dagre from '@dagrejs/dagre';
import type { GenerateNewNode } from '@ceai-front/workflow';
import type {
  GetOntologyTopologyResponse,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';
import {
  mapTopologyEdgesToWorkflowEdges,
  WORKFLOW_EDGE_MARKER_END
} from './topologyEdgeIdentity';

const NODE_WIDTH = 244;
const NODE_HEIGHT = 112;

export const DEFAULT_WORKFLOW_EDGE_MARKER = WORKFLOW_EDGE_MARKER_END;

const toFiniteId = (value: unknown): number | undefined => {
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

export interface WorkflowNodeLookup {
  byNumericId: Map<number, string>;
  byCode: Map<string, string>;
  byName: Map<string, string>;
}

export const buildWorkflowNodeLookup = (
  topologyNodes: Ontologymetadataservicev1TopologyNode[] = []
): WorkflowNodeLookup => {
  const byNumericId = new Map<number, string>();
  const byCode = new Map<string, string>();
  const byName = new Map<string, string>();
  const seenWorkflowNodeIds = new Set<string>();

  topologyNodes.forEach((topologyNode) => {
    const numericId = toFiniteId(topologyNode.id);
    const nodeId = String(
      numericId ?? topologyNode.code?.trim() ?? topologyNode.name?.trim() ?? ''
    );

    if (!nodeId || seenWorkflowNodeIds.has(nodeId)) {
      return;
    }

    seenWorkflowNodeIds.add(nodeId);

    if (numericId != null) {
      byNumericId.set(numericId, nodeId);
    }

    const code = topologyNode.code?.trim();
    if (code) {
      byCode.set(code, nodeId);
    }

    const name = topologyNode.name?.trim();
    if (name) {
      byName.set(name, nodeId);
    }
  });

  return { byNumericId, byCode, byName };
};

export interface LayoutOntologyGraphOptions {
  topologyData: GetOntologyTopologyResponse;
  newNode: GenerateNewNode;
  selectedObjectType?: {
    code?: string;
    id?: number;
  };
  sidebarOffset?: number;
  buildNodeData: (
    topologyNode: Ontologymetadataservicev1TopologyNode,
    selectedObjectType?: LayoutOntologyGraphOptions['selectedObjectType']
  ) => Record<string, unknown>;
}

export const layoutOntologyGraphWithDagre = ({
  topologyData,
  newNode,
  selectedObjectType,
  sidebarOffset = 200,
  buildNodeData
}: LayoutOntologyGraphOptions) => {
  const topologyNodes = topologyData.nodes ?? [];
  const topologyEdges = topologyData.edges ?? [];

  if (topologyNodes.length === 0) {
    return { nodes: [], edges: [], draft: true };
  }

  const nodeLookup = buildWorkflowNodeLookup(topologyNodes);
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 280 });

  const workflowNodes: any[] = [];
  const seenWorkflowNodeIds = new Set<string>();

  topologyNodes.forEach((topologyNode) => {
    const numericId = toFiniteId(topologyNode.id);
    const nodeId = String(
      numericId ?? topologyNode.code?.trim() ?? topologyNode.name?.trim() ?? ''
    );

    if (!nodeId || seenWorkflowNodeIds.has(nodeId)) {
      return;
    }

    seenWorkflowNodeIds.add(nodeId);

    const { newNode: workflowNode } = newNode({
      id: nodeId,
      data: buildNodeData(topologyNode, selectedObjectType),
      position: { x: 0, y: 0 }
    });

    workflowNodes.push(workflowNode);
    g.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  const workflowNodeIds = new Set(workflowNodes.map((node) => node.id));

  const workflowEdges = mapTopologyEdgesToWorkflowEdges(
    topologyEdges,
    nodeLookup
  ).filter((edge) => {
    if (
      !workflowNodeIds.has(edge.source) ||
      !workflowNodeIds.has(edge.target)
    ) {
      return false;
    }

    g.setEdge(edge.source, edge.target);
    return true;
  });

  dagre.layout(g);

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

  if (layoutedNodes.length > 0) {
    const minX = Math.min(...layoutedNodes.map((node) => node.position.x));
    const maxX = Math.max(
      ...layoutedNodes.map((node) => node.position.x + NODE_WIDTH)
    );
    const graphCenterX = (minX + maxX) / 2;
    const canvasWidth =
      typeof window !== 'undefined'
        ? window.innerWidth - sidebarOffset
        : 1920 - sidebarOffset;
    const canvasCenterX = canvasWidth / 2;
    const centerOffsetX = canvasCenterX - graphCenterX;

    return {
      nodes: layoutedNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + centerOffsetX,
          y: node.position.y
        }
      })),
      edges: workflowEdges,
      draft: true
    };
  }

  return {
    nodes: layoutedNodes,
    edges: workflowEdges,
    draft: true
  };
};
