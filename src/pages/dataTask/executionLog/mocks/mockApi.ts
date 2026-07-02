import {
  ExecutionLogListResponse,
  GetExecutionLogListParams,
  ExecutionLogDetail,
  ExecutionLogItem
} from '../types';
import { getMockLogsByTaskId, getMockLogDetail } from './mockData';

export const getExecutionLogList = async (
  params: GetExecutionLogListParams
): Promise<ExecutionLogListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredData = getMockLogsByTaskId(params.taskId);

  if (params.statuses?.length) {
    filteredData = filteredData.filter((item) =>
      params.statuses!.includes(item.status)
    );
  }

  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;
  const items = filteredData.slice(start, start + pageSize);

  return {
    items,
    total: filteredData.length,
    pageNo,
    pageSize
  };
};

export const getExecutionLogDetail = async (
  id: string,
  record?: ExecutionLogItem
): Promise<ExecutionLogDetail | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockLogDetail(id, record);
};
