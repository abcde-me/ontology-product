import { MarkerType } from 'reactflow';
import type { Ontologymetadataservicev1TopologyEdge } from '@/types/graphApi';
import type { WorkflowNodeLookup } from './layoutOntologyGraph';

const toPositiveFiniteId = (value: unknown): number | undefined => {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : undefined;
};

const toFiniteId = (value: unknown): number | undefined => {
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

/** workflow / React Flow 共用的箭头 marker（使用字符串避免多实例枚举不一致） */
export const WORKFLOW_EDGE_MARKER_END = {
  type: MarkerType.ArrowClosed || 'arrowclosed',
  width: 14,
  height: 14,
  color: '#C3C7D4'
} as const;

export const WORKFLOW_EDGE_STYLE = {
  stroke: '#C3C7D4',
  strokeWidth: 1
} as const;

/** 拓扑边去重键：同一对节点允许多条链接（按链接 id / code / 序号区分） */
export const getTopologyEdgeDedupeKey = (
  edge: Ontologymetadataservicev1TopologyEdge,
  samePairIndex = 0
): string => {
  const sourceId = edge.sourceId;
  const targetId = edge.targetId;

  if (sourceId == null || targetId == null) {
    return '';
  }

  const code = edge.code?.trim();
  if (code) {
    return `code:${code}`;
  }

  const linkId = toPositiveFiniteId(edge.id);
  if (linkId != null) {
    return `id:${linkId}:${sourceId}-${targetId}:${samePairIndex}`;
  }

  const name = edge.name?.trim();
  if (name) {
    return `pair:${sourceId}-${targetId}:name:${name}`;
  }

  return `pair:${sourceId}-${targetId}:index:${samePairIndex}`;
};

/** React Flow 边 id：保证同对节点多条链接时 id 唯一 */
export const buildWorkflowEdgeId = (
  edge: Ontologymetadataservicev1TopologyEdge,
  samePairIndex = 0
): string => {
  const code = edge.code?.trim();
  const sourceId = edge.sourceId ?? 'unknown';
  const targetId = edge.targetId ?? 'unknown';
  if (code) {
    return `link-code-${code}`;
  }

  const linkId = toPositiveFiniteId(edge.id);
  if (linkId != null) {
    return `link-${linkId}-${sourceId}-${targetId}-${samePairIndex}`;
  }

  const name = edge.name?.trim();
  if (name) {
    return `link-${sourceId}-${targetId}-${samePairIndex}-${encodeURIComponent(name)}`;
  }

  return `link-${sourceId}-${targetId}-${samePairIndex}`;
};

export interface WorkflowTopologyEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type: string;
  markerEnd: typeof WORKFLOW_EDGE_MARKER_END;
  style: typeof WORKFLOW_EDGE_STYLE;
  data: {
    id?: number;
    code?: string;
    name: string;
    syncStatus?: Ontologymetadataservicev1TopologyEdge['syncStatus'];
  };
}

const resolveWorkflowNodeId = (
  endpointId: unknown,
  lookup: WorkflowNodeLookup
): string | undefined => {
  const numericId = toFiniteId(endpointId);
  if (numericId != null && lookup.byNumericId.has(numericId)) {
    return lookup.byNumericId.get(numericId);
  }

  return undefined;
};

/** 将拓扑边映射为 React Flow 边，同对节点多条链接使用唯一边 id */
export const mapTopologyEdgesToWorkflowEdges = (
  topologyEdges: Ontologymetadataservicev1TopologyEdge[],
  lookup: WorkflowNodeLookup,
  options?: { includeCode?: boolean }
): WorkflowTopologyEdge[] => {
  const samePairCounters = new Map<string, number>();

  return topologyEdges
    .map((topologyEdge) => {
      const sourceId = resolveWorkflowNodeId(topologyEdge.sourceId, lookup);
      const targetId = resolveWorkflowNodeId(topologyEdge.targetId, lookup);

      if (!sourceId || !targetId) {
        return null;
      }

      const pairKey = `${topologyEdge.sourceId}-${topologyEdge.targetId}`;
      const samePairIndex = samePairCounters.get(pairKey) ?? 0;
      samePairCounters.set(pairKey, samePairIndex + 1);

      const linkId =
        topologyEdge.id != null && Number.isFinite(Number(topologyEdge.id))
          ? Number(topologyEdge.id)
          : undefined;

      const data: WorkflowTopologyEdge['data'] = {
        id: linkId,
        code: topologyEdge.code?.trim() || undefined,
        name: topologyEdge.name || '',
        syncStatus: topologyEdge.syncStatus
      };

      if (options?.includeCode && topologyEdge.code && !data.code) {
        data.code = topologyEdge.code;
      }

      return {
        id: buildWorkflowEdgeId(topologyEdge, samePairIndex),
        source: sourceId,
        sourceHandle: 'source',
        target: targetId,
        targetHandle: 'target',
        // 使用 workflow 默认边类型，避免 custom-edge 覆盖 markerEnd 导致 undefined
        type: 'default',
        markerEnd: WORKFLOW_EDGE_MARKER_END,
        style: WORKFLOW_EDGE_STYLE,
        data
      };
    })
    .filter((edge): edge is WorkflowTopologyEdge => edge != null);
};
