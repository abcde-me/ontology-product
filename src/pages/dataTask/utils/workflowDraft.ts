import type { WorkflowDraft } from '../types';

const WORKFLOW_CUSTOM_NODE_TYPE = 'custom';

/** 将 graph 节点规范化为与手动创建一致的 React Flow 结构 */
const normalizeGraphNode = (node: unknown) => {
  if (!node || typeof node !== 'object') {
    return node;
  }

  const rawNode = node as Record<string, unknown>;
  const rawType = rawNode.type as string | undefined;
  const data = (rawNode.data as Record<string, unknown> | undefined) ?? {};
  const dataType = (data.type as string | undefined) ?? rawType;

  if (!dataType || dataType === WORKFLOW_CUSTOM_NODE_TYPE) {
    return {
      ...rawNode,
      type: rawType ?? WORKFLOW_CUSTOM_NODE_TYPE,
      data
    };
  }

  return {
    ...rawNode,
    type: WORKFLOW_CUSTOM_NODE_TYPE,
    targetPosition: rawNode.targetPosition ?? 'left',
    sourcePosition: rawNode.sourcePosition ?? 'right',
    data: {
      ...data,
      type: dataType
    }
  };
};

const normalizeGraphEdge = (edge: unknown) => {
  if (!edge || typeof edge !== 'object') {
    return edge;
  }

  const rawEdge = edge as Record<string, unknown>;

  return {
    ...rawEdge,
    type: rawEdge.type ?? 'custom',
    sourceHandle: rawEdge.sourceHandle ?? 'source',
    targetHandle: rawEdge.targetHandle ?? 'target'
  };
};

export const createEmptyWorkflowDraft = (taskId?: string): WorkflowDraft => ({
  id: taskId ?? `draft_${Date.now()}`,
  graph: {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  },
  features: {
    retriever_resource: { enabled: true }
  },
  environment_variables: [],
  conversation_variables: [],
  version: 'draft',
  hash: '',
  updated_at: Math.ceil(Date.now() / 1000)
});

export const normalizeWorkflowDraft = (
  draft: WorkflowDraft | null | undefined,
  taskId?: string
): WorkflowDraft => {
  const empty = createEmptyWorkflowDraft(taskId);

  if (!draft) {
    return empty;
  }

  return {
    ...empty,
    ...draft,
    graph: {
      nodes: (draft.graph?.nodes ?? []).map(normalizeGraphNode),
      edges: (draft.graph?.edges ?? []).map(normalizeGraphEdge),
      viewport: draft.graph?.viewport ?? empty.graph.viewport
    },
    features: draft.features ?? empty.features,
    environment_variables:
      draft.environment_variables ?? empty.environment_variables,
    conversation_variables:
      draft.conversation_variables ?? empty.conversation_variables,
    version: draft.version ?? 'draft',
    updated_at: draft.updated_at ?? empty.updated_at
  };
};
