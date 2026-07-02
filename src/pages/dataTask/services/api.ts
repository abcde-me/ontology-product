import { mockApi, USE_MOCK } from '../mocks';
import type {
  DataTaskItem,
  DataTaskListResponse,
  GetDataTaskListParams
} from '../types';

export const fetchDataTaskList = async (
  params: GetDataTaskListParams
): Promise<DataTaskListResponse> => {
  if (USE_MOCK) {
    return mockApi.getDataTaskList(params);
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
