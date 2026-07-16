import { mockApi, USE_MOCK } from '../mocks';
import {
  createEmptyWorkflowDraft,
  getMockWorkflowDraft,
  saveMockWorkflowDraft
} from '../mocks/workflowDraftApi';
import { normalizeWorkflowDraft } from '../utils/workflowDraft';
import { fetchWorkflowDraft, saveWorkflowDraft } from './workflowApi';
import type {
  CreateDataTaskParams,
  DataTaskDetail,
  DataTaskItem,
  DataTaskListResponse,
  GetDataTaskListParams,
  UpdateDataTaskParams,
  WorkflowDraft
} from '../types';

export const fetchDataTaskList = async (
  params: GetDataTaskListParams
): Promise<DataTaskListResponse> => {
  if (USE_MOCK) {
    return mockApi.getDataTaskList(params);
  }

  throw new Error('数据任务接口暂未接入');
};

export const fetchDataTaskDetail = async (
  id: string
): Promise<DataTaskDetail> => {
  if (USE_MOCK) {
    return mockApi.getDataTaskDetail(id);
  }

  throw new Error('数据任务接口暂未接入');
};

export const createDataTask = async (
  params: CreateDataTaskParams
): Promise<DataTaskDetail> => {
  if (USE_MOCK) {
    return mockApi.createDataTask(params);
  }

  throw new Error('数据任务接口暂未接入');
};

export const updateDataTask = async (
  params: UpdateDataTaskParams
): Promise<DataTaskDetail> => {
  if (USE_MOCK) {
    return mockApi.updateDataTask(params);
  }

  throw new Error('数据任务接口暂未接入');
};

export const deleteDataTask = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.deleteDataTask(id);
  }

  throw new Error('数据任务接口暂未接入');
};

export const copyDataTask = async (id: string): Promise<DataTaskItem> => {
  if (USE_MOCK) {
    return mockApi.copyDataTask(id);
  }

  throw new Error('数据任务接口暂未接入');
};

export const toggleDataTaskStatus = async (
  id: string,
  online: boolean
): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.toggleDataTaskStatus(id, online);
  }

  throw new Error('数据任务接口暂未接入');
};

export const loadWorkflowDraft = async (
  taskId: string,
  processId?: string
): Promise<WorkflowDraft> => {
  if (USE_MOCK) {
    const draft = await getMockWorkflowDraft(taskId);
    return normalizeWorkflowDraft(
      draft ?? createEmptyWorkflowDraft(taskId),
      taskId
    );
  }

  if (!processId) {
    throw new Error('缺少工作流 processId');
  }

  const response = await fetchWorkflowDraft({ processId });
  return normalizeWorkflowDraft(
    (response?.data as WorkflowDraft) ?? createEmptyWorkflowDraft(taskId),
    taskId
  );
};

export const persistWorkflowDraft = async (
  taskId: string,
  draft: WorkflowDraft,
  processId?: string
): Promise<WorkflowDraft> => {
  if (USE_MOCK) {
    return saveMockWorkflowDraft(taskId, draft);
  }

  if (!processId) {
    throw new Error('缺少工作流 processId');
  }

  const response = await saveWorkflowDraft({
    processId,
    dagInfo: draft
  });

  return (response?.data as WorkflowDraft) ?? draft;
};
