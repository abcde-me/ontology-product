import type {
  GetOntologyTopologyResponse,
  Ontologymetadataservicev1TopologyEdge,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';
import { getTopologyEdgeDedupeKey } from './topologyEdgeIdentity';

const toFiniteId = (value: unknown): number | undefined => {
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

const normalizeTopologyNode = (
  node: Ontologymetadataservicev1TopologyNode
): Ontologymetadataservicev1TopologyNode => {
  const normalizedId = toFiniteId(node.id);
  if (normalizedId == null) {
    return node;
  }

  return normalizedId === node.id ? node : { ...node, id: normalizedId };
};

const normalizeTopologyEdge = (
  edge: Ontologymetadataservicev1TopologyEdge
): Ontologymetadataservicev1TopologyEdge => {
  const sourceId = toFiniteId(edge.sourceId);
  const targetId = toFiniteId(edge.targetId);

  return {
    ...edge,
    ...(sourceId != null ? { sourceId } : {}),
    ...(targetId != null ? { targetId } : {})
  };
};

const getTopologyNodeDedupeKey = (
  node: Ontologymetadataservicev1TopologyNode
): string => {
  if (node.id != null && String(node.id) !== '') {
    return `id:${node.id}`;
  }
  const code = node.code?.trim();
  if (code) {
    return `code:${code}`;
  }
  const name = node.name?.trim();
  if (name) {
    return `name:${name}`;
  }
  return `fallback:${JSON.stringify(node)}`;
};

const pickRicherTopologyNode = (
  current: Ontologymetadataservicev1TopologyNode,
  candidate: Ontologymetadataservicev1TopologyNode
) => {
  const currentAttrCount = current.ontologyPhysicalPropertiesList?.length ?? 0;
  const candidateAttrCount =
    candidate.ontologyPhysicalPropertiesList?.length ?? 0;

  if (candidateAttrCount > currentAttrCount) {
    return candidate;
  }

  if (candidateAttrCount < currentAttrCount) {
    return current;
  }

  const currentDesc = current.description?.trim().length ?? 0;
  const candidateDesc = candidate.description?.trim().length ?? 0;
  return candidateDesc > currentDesc ? candidate : current;
};

/** 拓扑节点按对象类型 id（或 code）去重，与对象类型列表口径一致 */
export const dedupeTopologyNodes = (
  nodes: Ontologymetadataservicev1TopologyNode[] = []
): Ontologymetadataservicev1TopologyNode[] => {
  const map = new Map<string, Ontologymetadataservicev1TopologyNode>();

  nodes.forEach((node) => {
    const normalizedNode = normalizeTopologyNode(node);
    const key = getTopologyNodeDedupeKey(normalizedNode);
    const existing = map.get(key);
    map.set(
      key,
      existing
        ? pickRicherTopologyNode(existing, normalizedNode)
        : normalizedNode
    );
  });

  return Array.from(map.values());
};

export const dedupeTopologyEdges = (
  edges: Ontologymetadataservicev1TopologyEdge[] = [],
  validNodeIds: Set<number>
): Ontologymetadataservicev1TopologyEdge[] => {
  const seen = new Set<string>();
  const samePairCounters = new Map<string, number>();
  const result: Ontologymetadataservicev1TopologyEdge[] = [];

  edges.forEach((edge) => {
    const normalizedEdge = normalizeTopologyEdge(edge);
    const sourceId = normalizedEdge.sourceId;
    const targetId = normalizedEdge.targetId;

    if (sourceId == null || targetId == null) {
      return;
    }

    if (!validNodeIds.has(sourceId) || !validNodeIds.has(targetId)) {
      return;
    }

    const pairKey = `${sourceId}-${targetId}`;
    const samePairIndex = samePairCounters.get(pairKey) ?? 0;
    const key = getTopologyEdgeDedupeKey(normalizedEdge, samePairIndex);

    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    samePairCounters.set(pairKey, samePairIndex + 1);
    result.push(normalizedEdge);
  });

  return result;
};

/** 归一化拓扑：节点与对象类型列表一致（每个对象类型仅一个节点） */
export const normalizeOntologyTopology = (
  data?: GetOntologyTopologyResponse | null
): GetOntologyTopologyResponse => {
  const nodes = dedupeTopologyNodes(data?.nodes ?? []);
  const validNodeIds = new Set(
    nodes
      .map((node) => node.id)
      .filter((id): id is number => id != null && Number.isFinite(id))
  );
  const edges = dedupeTopologyEdges(data?.edges ?? [], validNodeIds);

  return {
    nodes,
    edges
  };
};
