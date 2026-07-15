import type {
  ConfirmedGraphEdge,
  DiscoveredImplicitRelation,
  ImplicitDiscoveryGraphNode,
  ImplicitDiscoveryResult
} from '../types';
import { CONFIRMED_EDGE_COLOR, IMPLICIT_EDGE_COLOR } from '../constants';
import type {
  RelationGraphEdge,
  RelationGraphNode
} from '@/pages/exploreAnalysis/relationInsight/types';
import { layoutRelationGraph } from '@/pages/exploreAnalysis/relationInsight/utils/graphLayout';
import { getCategoryColor } from '@/pages/exploreAnalysis/relationInsight/utils/nodeColors';
import { parseInstanceNodeKey } from './scopeInstances';

export interface ImplicitGraphData {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
}

const NODE_SIZE = 64;

const hashToNumber = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/** 优先使用结果中的全部节点；旧数据无 nodes 时从边端点反推 */
const resolveGraphNodes = (
  result: ImplicitDiscoveryResult
): ImplicitDiscoveryGraphNode[] => {
  if (Array.isArray(result.nodes) && result.nodes.length > 0) {
    return result.nodes;
  }

  const nameMap = new Map<string, string>();
  const remember = (edge: ConfirmedGraphEdge | DiscoveredImplicitRelation) => {
    nameMap.set(edge.sourceNodeId, edge.sourceNodeName);
    nameMap.set(edge.targetNodeId, edge.targetNodeName);
  };
  result.confirmedEdges.forEach(remember);
  result.discoveries.forEach(remember);

  return Array.from(nameMap.entries()).map(([id, label]) => {
    const parsed = parseInstanceNodeKey(id);
    return {
      id,
      label,
      objectTypeId: parsed?.objectTypeId,
      instanceId: parsed?.instanceId
    };
  });
};

export const buildDiscoveryGraph = (
  result: ImplicitDiscoveryResult | null,
  options?: { highlightDiscoveryId?: string }
): ImplicitGraphData => {
  if (!result) {
    return { nodes: [], edges: [] };
  }

  const communityOf = (id: string) => result.communities?.[id];
  const graphNodes = resolveGraphNodes(result);

  const nodes: RelationGraphNode[] = graphNodes.map((node) => {
    const community = communityOf(node.id);
    const parsed = parseInstanceNodeKey(node.id);
    const objectTypeId = node.objectTypeId ?? parsed?.objectTypeId;
    return {
      id: node.id,
      type: 'knowledgeNode',
      data: {
        label: node.label || node.id,
        subLabel:
          community != null
            ? `社区 #${community}`
            : node.objectTypeName ||
              (objectTypeId != null ? `类型 #${objectTypeId}` : undefined),
        objectTypeId,
        objectTypeName: node.objectTypeName || node.label,
        instanceId: node.instanceId ?? parsed?.instanceId,
        color: getCategoryColor(objectTypeId ?? hashToNumber(node.id)),
        size: NODE_SIZE,
        algoCommunity: community,
        detailFields: [
          ...(node.objectTypeName
            ? [{ label: '对象类型', value: node.objectTypeName }]
            : objectTypeId != null
              ? [{ label: '对象类型', value: String(objectTypeId) }]
              : []),
          ...(node.instanceId || parsed
            ? [
                {
                  label: '实例 ID',
                  value: node.instanceId ?? parsed!.instanceId
                }
              ]
            : []),
          ...(community != null
            ? [{ label: '社区', value: String(community) }]
            : []),
          ...(node.attributes?.length
            ? node.attributes.filter(
                (field) =>
                  field.label !== '对象类型' &&
                  field.label !== '实例 ID' &&
                  field.label !== '社区'
              )
            : [])
        ]
      },
      position: { x: 0, y: 0 }
    };
  });

  const confirmedEdges: RelationGraphEdge[] = result.confirmedEdges.map(
    (edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: 'knowledgeEdge',
      label: edge.linkName,
      data: {
        linkName: edge.linkName,
        edgeColor: CONFIRMED_EDGE_COLOR,
        isImplicit: false
      }
    })
  );

  const discoveryEdges: RelationGraphEdge[] = result.discoveries.map(
    (edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: 'knowledgeEdge',
      label: edge.suggestedName,
      data: {
        linkName: edge.suggestedName,
        edgeColor:
          options?.highlightDiscoveryId === edge.id
            ? '#C41E3A'
            : IMPLICIT_EDGE_COLOR,
        isImplicit: true,
        discoveryId: edge.id,
        confidence: edge.confidence
      }
    })
  );

  const edges = [...confirmedEdges, ...discoveryEdges];
  const laidOutNodes = layoutRelationGraph(nodes, edges, 'force');
  return { nodes: laidOutNodes, edges };
};
