import { mockApi, USE_MOCK } from '../mocks';
import type {
  ExecutionLogListResponse,
  GetExecutionLogListParams,
  ExecutionLogDetail,
  ExecutionLogItem
} from '../types';

export const fetchExecutionLogList = async (
  params: GetExecutionLogListParams
): Promise<ExecutionLogListResponse> => {
  if (USE_MOCK) {
    return mockApi.getExecutionLogList(params);
  }

  throw new Error('执行记录接口暂未接入');
};

export const fetchExecutionLogDetail = async (
  id: string,
  record?: ExecutionLogItem
): Promise<ExecutionLogDetail | null> => {
  if (USE_MOCK) {
    return mockApi.getExecutionLogDetail(id, record);
  }

  throw new Error('执行记录详情接口暂未接入');
};
