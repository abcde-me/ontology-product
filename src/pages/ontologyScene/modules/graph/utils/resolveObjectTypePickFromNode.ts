import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import type { GraphObjectTypePick } from '../context/GraphCreateContext';

export const resolveObjectTypePickFromNodeElement = (
  nodeEl: Element,
  topologyData?: GetOntologyTopologyResponse | null,
  resolveObjectTypePick?: (objectTypeId: number) => GraphObjectTypePick | null
): GraphObjectTypePick | null => {
  const nodeId = nodeEl.getAttribute('data-id');
  if (!nodeId) {
    return null;
  }

  const numericId = Number(nodeId);
  if (Number.isFinite(numericId) && numericId > 0) {
    return (
      resolveObjectTypePick?.(numericId) ?? {
        id: numericId,
        name: nodeId,
        code: ''
      }
    );
  }

  const topologyNode = topologyData?.nodes?.find(
    (node) =>
      String(node.code ?? '') === nodeId || String(node.name ?? '') === nodeId
  );

  if (topologyNode?.id != null) {
    return {
      id: topologyNode.id,
      name: topologyNode.name || topologyNode.code || String(topologyNode.id),
      code: topologyNode.code || ''
    };
  }

  return null;
};
