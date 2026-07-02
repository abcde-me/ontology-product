import type { GetOntologyTopologyResponse } from '@/types/graphApi';

export const resolveTopologyFocusNodeId = (
  topology: GetOntologyTopologyResponse | null | undefined,
  params: {
    objectTypeId?: string;
    objectTypeCode?: string;
  }
): number | undefined => {
  const nodes = topology?.nodes ?? [];
  if (!nodes.length) {
    return undefined;
  }

  if (params.objectTypeId) {
    const matchedById = nodes.find(
      (node) => String(node.id ?? '') === String(params.objectTypeId)
    );
    if (matchedById?.id != null) {
      return matchedById.id;
    }
  }

  if (params.objectTypeCode) {
    const matchedByCode = nodes.find(
      (node) => String(node.code ?? '') === String(params.objectTypeCode)
    );
    if (matchedByCode?.id != null) {
      return matchedByCode.id;
    }
  }

  return undefined;
};

export const filterTopologyNeighbors = (
  topology: GetOntologyTopologyResponse,
  focusNodeId: number
): GetOntologyTopologyResponse => {
  const nodes = topology.nodes ?? [];
  const edges = topology.edges ?? [];
  const visibleNodeIds = new Set<number>([focusNodeId]);

  edges.forEach((edge) => {
    if (edge.sourceId === focusNodeId && edge.targetId != null) {
      visibleNodeIds.add(edge.targetId);
    }
    if (edge.targetId === focusNodeId && edge.sourceId != null) {
      visibleNodeIds.add(edge.sourceId);
    }
  });

  return {
    nodes: nodes.filter(
      (node) => node.id != null && visibleNodeIds.has(node.id)
    ),
    edges: edges.filter(
      (edge) =>
        edge.sourceId != null &&
        edge.targetId != null &&
        visibleNodeIds.has(edge.sourceId) &&
        visibleNodeIds.has(edge.targetId)
    )
  };
};
