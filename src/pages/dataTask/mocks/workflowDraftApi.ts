import type { WorkflowDraft } from '../types';
import {
  createEmptyWorkflowDraft,
  normalizeWorkflowDraft
} from '../utils/workflowDraft';
import {
  getWorkflowDraftFromStore,
  setWorkflowDraft
} from '../editor/services/draftApi';
import { MOCK_WORKFLOW_DRAFTS } from './mockWorkflowDrafts';

const draftStore = new Map<string, WorkflowDraft>();

Object.entries(MOCK_WORKFLOW_DRAFTS).forEach(([taskId, draft]) => {
  draftStore.set(taskId, normalizeWorkflowDraft(draft, taskId));
});

export const getMockWorkflowDraft = async (
  taskId: string
): Promise<WorkflowDraft | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const draft =
    draftStore.get(taskId) ??
    getWorkflowDraftFromStore(taskId) ??
    MOCK_WORKFLOW_DRAFTS[taskId] ??
    null;
  return draft ? normalizeWorkflowDraft(draft, taskId) : null;
};

export const saveMockWorkflowDraft = async (
  taskId: string,
  draft: WorkflowDraft
): Promise<WorkflowDraft> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const normalized = normalizeWorkflowDraft(draft, taskId);
  draftStore.set(taskId, normalized);
  setWorkflowDraft(normalized, taskId);
  return normalized;
};

export { createEmptyWorkflowDraft };
