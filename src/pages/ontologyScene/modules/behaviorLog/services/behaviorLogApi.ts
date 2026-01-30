import * as api from '@/api/behaviorTest';
import { USE_MOCK, mockApi } from '../mocks';
import { BehaviorLogItem, SearchParams } from '../types';

/**
 * 获取执行记录列表
 */
export const fetchBehaviorLogList = async (
  params: SearchParams
): Promise<{
  list: BehaviorLogItem[];
  total: number;
}> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogList(params);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogList(params);

  // 适配响应格式
  if (response.data?.list) {
    return {
      list: response.data.list,
      total: response.data.total || response.data.list.length
    };
  }
  return {
    list: response.data || [],
    total: 0
  };
};

/**
 * 获取执行记录详情
 */
export const fetchBehaviorLogDetail = async (
  id: string
): Promise<BehaviorLogItem> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogDetail(id);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogDetail({ id });
  return response.data;
};

/**
 * 获取执行记录的入参详情
 */
export const fetchBehaviorLogInputParams = async (
  id: string
): Promise<Record<string, any>> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogInputParams(id);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogInputParams({ id });
  return response.data;
};

/**
 * 获取执行记录的执行详情（SQL/代码）
 */
export const fetchBehaviorLogExecutionDetail = async (
  id: string
): Promise<string> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogExecutionDetail(id);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogExecutionDetail({ id });
  return response.data?.detail || response.data || '';
};

/**
 * 删除执行记录
 */
export const deleteBehaviorLog = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.deleteBehaviorLog(id);
  }

  // 真实 API 调用
  await api.deleteBehaviorLog({ id });
};

/**
 * 批量删除执行记录
 */
export const batchDeleteBehaviorLogs = async (ids: string[]): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.batchDeleteBehaviorLogs(ids);
  }

  // 真实 API 调用
  await api.batchDeleteBehaviorLogs({ ids });
};
