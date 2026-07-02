export type LinkIdentity = number | string;

const toPositiveFiniteId = (value: unknown): number | null => {
  const numericId = Number(value);
  return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
};

const parseLinkCodeFromReactFlowEdgeId = (
  reactFlowEdgeId?: string
): string | null => {
  if (!reactFlowEdgeId?.startsWith('link-code-')) {
    return null;
  }

  const code = reactFlowEdgeId.slice('link-code-'.length).trim();
  return code || null;
};

const parseLinkIdFromReactFlowEdgeId = (
  reactFlowEdgeId?: string
): number | null => {
  if (!reactFlowEdgeId) {
    return null;
  }

  const prefixedMatch = reactFlowEdgeId.match(/^link-(\d+)(?:-|$)/);
  if (prefixedMatch) {
    return toPositiveFiniteId(prefixedMatch[1]);
  }

  return toPositiveFiniteId(reactFlowEdgeId);
};

/** 从拓扑边 data 或 ReactFlow 边 id 解析链接标识（数字 id 或 code） */
export const resolveLinkIdentityFromEdge = (
  data: { id?: unknown; linkTypeId?: unknown; code?: unknown } | undefined,
  reactFlowEdgeId?: string
): LinkIdentity | null => {
  const numericId =
    toPositiveFiniteId(data?.id) ?? toPositiveFiniteId(data?.linkTypeId);
  if (numericId != null) {
    return numericId;
  }

  const code = String(data?.code ?? '').trim();
  if (code) {
    return code;
  }

  const codeFromEdgeId = parseLinkCodeFromReactFlowEdgeId(reactFlowEdgeId);
  if (codeFromEdgeId) {
    return codeFromEdgeId;
  }

  return parseLinkIdFromReactFlowEdgeId(reactFlowEdgeId);
};

/** 从拓扑边 data 或 ReactFlow 边 id 解析链接数字 id（无数字 id 时返回 null） */
export const resolveLinkTypeIdFromEdge = (
  data: { id?: unknown; linkTypeId?: unknown; code?: unknown } | undefined,
  reactFlowEdgeId?: string
): number | null => {
  const identity = resolveLinkIdentityFromEdge(data, reactFlowEdgeId);
  return typeof identity === 'number' ? identity : null;
};

export const isSameLinkIdentity = (
  left: LinkIdentity | null | undefined,
  right: LinkIdentity | null | undefined
) => {
  if (left == null || right == null) {
    return false;
  }

  return String(left) === String(right);
};
