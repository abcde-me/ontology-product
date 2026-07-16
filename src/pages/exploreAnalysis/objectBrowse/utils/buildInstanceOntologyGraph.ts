import type {
  InstanceGraphEdge,
  InstanceGraphNode,
  InstanceRelationGraph
} from '@/pages/exploreAnalysis/implicitRelation/services/buildInstanceGraph';
import type {
  RelationGraphEdge,
  RelationGraphNode
} from '@/pages/exploreAnalysis/relationInsight/types';
import { getCategoryColor } from '@/pages/exploreAnalysis/relationInsight/utils/nodeColors';

export const CARD_NODE_WIDTH = 168;
export const CARD_NODE_HEIGHT = 132;
const CONFIRMED_EDGE_COLOR = '#3B82F6';

const buildDetailFields = (node: InstanceGraphNode) => {
  const fields: Array<{ label: string; value: string }> = [];

  if (node.objectTypeName) {
    fields.push({ label: '对象类型', value: node.objectTypeName });
  }

  if (node.attributes?.length) {
    node.attributes.forEach((item) => {
      if (
        item.label !== '对象类型' &&
        !fields.some((field) => field.label === item.label)
      ) {
        fields.push(item);
      }
    });
  }

  if (!fields.length) {
    fields.push({ label: '实例 ID', value: node.instanceId });
  }

  return fields.slice(0, 5);
};

export const buildInstanceOntologyGraphData = (
  graph: InstanceRelationGraph,
  focusKey: string
): { nodes: RelationGraphNode[]; edges: RelationGraphEdge[] } => {
  const relatedNodeKeys = new Set<string>([focusKey]);

  graph.edges.forEach((edge) => {
    if (edge.sourceKey === focusKey) {
      relatedNodeKeys.add(edge.targetKey);
    }
    if (edge.targetKey === focusKey) {
      relatedNodeKeys.add(edge.sourceKey);
    }
  });

  const visibleNodes = graph.nodes.filter((node) =>
    relatedNodeKeys.has(node.key)
  );

  const nodes: RelationGraphNode[] = visibleNodes.map((node) => ({
    id: node.key,
    type: 'instanceCardNode',
    data: {
      label: node.label || node.instanceId,
      subLabel: node.objectTypeName,
      isFocus: node.key === focusKey,
      objectTypeId: node.objectTypeId,
      objectTypeName: node.objectTypeName,
      instanceId: node.instanceId,
      color: getCategoryColor(node.objectTypeId),
      size: CARD_NODE_HEIGHT,
      detailFields: buildDetailFields(node)
    },
    position: { x: 0, y: 0 }
  }));

  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const edges: RelationGraphEdge[] = graph.edges
    .filter(
      (edge) =>
        nodeIdSet.has(edge.sourceKey) &&
        nodeIdSet.has(edge.targetKey) &&
        (edge.sourceKey === focusKey || edge.targetKey === focusKey)
    )
    .map((edge) => toRelationEdge(edge));

  return {
    nodes: layoutInstanceCardGraph(nodes, edges, focusKey),
    edges
  };
};

const toRelationEdge = (edge: InstanceGraphEdge): RelationGraphEdge => ({
  id: edge.id,
  source: edge.sourceKey,
  target: edge.targetKey,
  type: 'instanceOntologyEdge',
  label: edge.linkName,
  data: {
    linkName: edge.linkName,
    edgeColor: CONFIRMED_EDGE_COLOR,
    isImplicit: false
  }
});

const layoutInstanceCardGraph = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[],
  focusKey: string
): RelationGraphNode[] => {
  if (!nodes.length) {
    return nodes;
  }

  const focusNode = nodes.find((node) => node.id === focusKey);
  if (!focusNode) {
    return layoutGrid(nodes);
  }

  const neighbors = nodes.filter((node) => node.id !== focusKey);
  if (!neighbors.length) {
    return nodes.map((node) => ({
      ...node,
      position: { x: 120, y: 80 }
    }));
  }

  const centerX = 196;
  const centerY = 188;
  const radius = Math.max(150, 96 + neighbors.length * 18);

  const positioned = nodes.map((node) => {
    if (node.id === focusKey) {
      return {
        ...node,
        position: {
          x: centerX - CARD_NODE_WIDTH / 2,
          y: centerY - CARD_NODE_HEIGHT / 2
        }
      };
    }

    const index = neighbors.findIndex((item) => item.id === node.id);
    const angle = (Math.PI * 2 * index) / neighbors.length - Math.PI / 2;

    return {
      ...node,
      position: {
        x: centerX + Math.cos(angle) * radius - CARD_NODE_WIDTH / 2,
        y: centerY + Math.sin(angle) * radius - CARD_NODE_HEIGHT / 2
      }
    };
  });

  return positioned;
};

const layoutGrid = (nodes: RelationGraphNode[]): RelationGraphNode[] => {
  const columnCount = Math.min(2, nodes.length);
  const gapX = 24;
  const gapY = 24;

  return nodes.map((node, index) => {
    const row = Math.floor(index / columnCount);
    const column = index % columnCount;

    return {
      ...node,
      position: {
        x: column * (CARD_NODE_WIDTH + gapX),
        y: row * (CARD_NODE_HEIGHT + gapY)
      }
    };
  });
};
