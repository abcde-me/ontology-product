import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { GeneratedRichRelation, RichRelationKind } from '../types';
import type {
  GetOntologyTopologyResponse,
  Ontologymetadataservicev1TopologyEdge,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';

const nodeName = (
  nodes: Map<number, Ontologymetadataservicev1TopologyNode>,
  id?: number
) => (id != null ? nodes.get(id)?.name : undefined) || `节点#${id ?? '?'}`;

const edgeKey = (sourceId?: number, targetId?: number, linkId?: number) =>
  `${sourceId ?? 0}-${targetId ?? 0}-${linkId ?? 0}`;

const hasDirectedEdge = (
  edges: Ontologymetadataservicev1TopologyEdge[],
  sourceId: number,
  targetId: number
) =>
  edges.some(
    (edge) => edge.sourceId === sourceId && edge.targetId === targetId
  );

const buildSymmetricRelations = (
  sceneId: number,
  topology: GetOntologyTopologyResponse,
  nodes: Map<number, Ontologymetadataservicev1TopologyNode>,
  now: string
): GeneratedRichRelation[] => {
  const edges = topology.edges || [];
  const results: GeneratedRichRelation[] = [];
  const seen = new Set<string>();

  edges.forEach((edge) => {
    if (edge.sourceId == null || edge.targetId == null) {
      return;
    }
    if (edge.sourceId === edge.targetId) {
      return;
    }
    if (hasDirectedEdge(edges, edge.targetId, edge.sourceId)) {
      return;
    }

    const key = edgeKey(edge.targetId, edge.sourceId, edge.id);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    results.push({
      id: `symmetric-${key}-${Date.now()}`,
      sceneId,
      kind: 'symmetric',
      name: `对称·${edge.name || edge.code || '链接'}`,
      description: `由 ${nodeName(nodes, edge.sourceId)} → ${nodeName(nodes, edge.targetId)} 推导对称关系`,
      sourceNodeId: edge.targetId,
      targetNodeId: edge.sourceId,
      sourceNodeName: nodeName(nodes, edge.targetId),
      targetNodeName: nodeName(nodes, edge.sourceId),
      basedOnLinkId: edge.id,
      basedOnLinkName: edge.name || edge.code,
      enabled: true,
      createdAt: now
    });
  });

  return results;
};

const buildTransitiveRelations = (
  sceneId: number,
  topology: GetOntologyTopologyResponse,
  nodes: Map<number, Ontologymetadataservicev1TopologyNode>,
  now: string
): GeneratedRichRelation[] => {
  const edges = topology.edges || [];
  const results: GeneratedRichRelation[] = [];
  const seen = new Set<string>();

  edges.forEach((edge1) => {
    if (edge1.sourceId == null || edge1.targetId == null) {
      return;
    }

    edges.forEach((edge2) => {
      if (edge2.sourceId == null || edge2.targetId == null) {
        return;
      }
      if (edge1.targetId !== edge2.sourceId) {
        return;
      }
      if (edge1.sourceId === edge2.targetId) {
        return;
      }
      if (hasDirectedEdge(edges, edge1.sourceId, edge2.targetId)) {
        return;
      }

      const key = edgeKey(edge1.sourceId, edge2.targetId, edge1.id);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);

      results.push({
        id: `transitive-${key}-${Date.now()}`,
        sceneId,
        kind: 'transitive',
        name: `传递·${edge1.name || '链接'}+${edge2.name || '链接'}`,
        description: `${nodeName(nodes, edge1.sourceId)} → ${nodeName(nodes, edge1.targetId)} → ${nodeName(nodes, edge2.targetId)}`,
        sourceNodeId: edge1.sourceId,
        targetNodeId: edge2.targetId,
        sourceNodeName: nodeName(nodes, edge1.sourceId),
        targetNodeName: nodeName(nodes, edge2.targetId),
        basedOnLinkId: edge1.id,
        basedOnLinkName: edge1.name || edge1.code,
        viaNodeId: edge1.targetId,
        viaNodeName: nodeName(nodes, edge1.targetId),
        enabled: true,
        createdAt: now
      });
    });
  });

  return results;
};

const buildInverseRelations = (
  sceneId: number,
  topology: GetOntologyTopologyResponse,
  nodes: Map<number, Ontologymetadataservicev1TopologyNode>,
  now: string
): GeneratedRichRelation[] => {
  const edges = topology.edges || [];
  const results: GeneratedRichRelation[] = [];
  const seen = new Set<string>();

  edges.forEach((edge) => {
    if (edge.sourceId == null || edge.targetId == null) {
      return;
    }
    if (edge.sourceId === edge.targetId) {
      return;
    }

    const key = edgeKey(edge.targetId, edge.sourceId, edge.id);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    results.push({
      id: `inverse-${key}-${Date.now()}`,
      sceneId,
      kind: 'inverse',
      name: `逆·${edge.name || edge.code || '链接'}`,
      description: `${edge.name || edge.code || '链接'} 的逆关系：${nodeName(nodes, edge.targetId)} → ${nodeName(nodes, edge.sourceId)}`,
      sourceNodeId: edge.targetId,
      targetNodeId: edge.sourceId,
      sourceNodeName: nodeName(nodes, edge.targetId),
      targetNodeName: nodeName(nodes, edge.sourceId),
      basedOnLinkId: edge.id,
      basedOnLinkName: edge.name || edge.code,
      enabled: true,
      createdAt: now
    });
  });

  return results;
};

export const generateRichRelations = async (
  sceneId: number,
  kinds: RichRelationKind[]
): Promise<GeneratedRichRelation[]> => {
  const response = await getOntologyTopology({ id: sceneId });
  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '获取图谱拓扑失败');
  }

  const topology = response.data || {};
  const nodes = new Map<number, Ontologymetadataservicev1TopologyNode>();
  (topology.nodes || []).forEach((node) => {
    if (node.id != null) {
      nodes.set(node.id, node);
    }
  });

  if (!(topology.edges || []).length) {
    throw new Error('当前图谱暂无链接，无法生成补充链接/关系');
  }

  const now = new Date().toISOString();
  const generated: GeneratedRichRelation[] = [];

  if (kinds.includes('symmetric')) {
    generated.push(...buildSymmetricRelations(sceneId, topology, nodes, now));
  }
  if (kinds.includes('transitive')) {
    generated.push(...buildTransitiveRelations(sceneId, topology, nodes, now));
  }
  if (kinds.includes('inverse')) {
    generated.push(...buildInverseRelations(sceneId, topology, nodes, now));
  }

  return generated;
};

export const mergeRichRelations = (
  existing: GeneratedRichRelation[],
  incoming: GeneratedRichRelation[]
) => {
  const keyOf = (item: GeneratedRichRelation) =>
    `${item.kind}-${item.sourceNodeId}-${item.targetNodeId}-${item.basedOnLinkId ?? 0}-${item.viaNodeId ?? 0}`;
  const seen = new Set(existing.map(keyOf));
  const merged = [...existing];

  incoming.forEach((item) => {
    const key = keyOf(item);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(item);
  });

  return merged;
};
