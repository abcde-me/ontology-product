import type { WorkflowDraft } from '../../types';
import {
  createEmptyWorkflowDraft,
  normalizeWorkflowDraft
} from '../../utils/workflowDraft';

const computeHashSync = (jsonObject: unknown) => {
  const jsonString = JSON.stringify(jsonObject);
  let hash = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const draftByTaskId = new Map<string, WorkflowDraft>();
let activeTaskId: string | null = null;

const notFoundResponse = () =>
  Promise.resolve({
    code: 'ResourceNotFound',
    data: null,
    message: ''
  });

export const setActiveDataTaskId = (taskId: string | null) => {
  activeTaskId = taskId?.trim() ? taskId : null;
};

export const getActiveDataTaskId = () => activeTaskId;

export const setWorkflowDraft = (
  draft: WorkflowDraft | null,
  taskId?: string
) => {
  const resolvedTaskId = taskId ?? activeTaskId;
  if (!resolvedTaskId) {
    return;
  }

  if (draft == null) {
    draftByTaskId.delete(resolvedTaskId);
    return;
  }

  draftByTaskId.set(
    resolvedTaskId,
    normalizeWorkflowDraft(draft, resolvedTaskId)
  );
};

export const getWorkflowDraftFromStore = (taskId: string) =>
  draftByTaskId.get(taskId) ?? null;

export const copyWorkflowDraft = (fromTaskId: string, toTaskId: string) => {
  const draft = draftByTaskId.get(fromTaskId);
  if (!draft) {
    return;
  }

  draftByTaskId.set(toTaskId, normalizeWorkflowDraft(draft, toTaskId));
};

const getWorkflow = () => {
  if (!activeTaskId) {
    return notFoundResponse();
  }

  const draft = draftByTaskId.get(activeTaskId);
  if (!draft) {
    return notFoundResponse();
  }

  return Promise.resolve({
    data: normalizeWorkflowDraft(draft, activeTaskId)
  });
};

const persistDraft = (args: Record<string, unknown>) => {
  const resolvedTaskId = activeTaskId;
  const draft = normalizeWorkflowDraft(
    {
      ...(args as WorkflowDraft),
      updated_at: Math.ceil(Date.now() / 1000)
    },
    resolvedTaskId ?? undefined
  ) as WorkflowDraft & { hash?: string };

  draft.hash = computeHashSync(draft);

  if (resolvedTaskId) {
    draftByTaskId.set(resolvedTaskId, draft);
  }

  return Promise.resolve({ data: draft });
};

const createWorkflow = (args: Record<string, unknown>) => persistDraft(args);
const updateWorkflow = (args: Record<string, unknown>) => persistDraft(args);

export { getWorkflow, createWorkflow, updateWorkflow };
