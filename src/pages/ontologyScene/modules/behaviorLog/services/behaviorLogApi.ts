import * as api from '@/api/behaviorTest';
import { USE_MOCK, mockApi } from '../mocks';
import {
  BehaviorLogItem,
  BehaviorLogListParams,
  BehaviorLogListResponse
} from '../types';

/**
 * 获取执行记录列表
 */
export const fetchBehaviorLogList = async (
  params: BehaviorLogListParams
): Promise<BehaviorLogListResponse> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogList(params);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogList(params);

  // 适配响应格式
  return response.data;
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
): Promise<any[]> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogInputParams(id);
  }

  // 真实 API 调用
  const response = await api.getBehaviorLogInputParams({ id });
  return response.data;
};

/**
 * 获取执行记录的出参详情
 */
export const fetchBehaviorLogOutputParams = async (
  id: string
): Promise<any[]> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogOutputParams(id);
  }

  // 真实 API 调用（如果接口还未实现，暂时使用 mock）
  // TODO: 等待后端接口实现后替换
  // const response = await api.getBehaviorLogOutputParams({ id });
  // return response.data;
  return mockApi.getBehaviorLogOutputParams(id);
};

/**
 * 获取执行记录的运行日志
 */
export const fetchBehaviorLogRunLogs = async (id: string): Promise<string> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorLogRunLogs(id);
  }

  // 真实 API 调用（如果接口还未实现，暂时使用 mock）
  // TODO: 等待后端接口实现后替换
  return mockApi.getBehaviorLogRunLogs(id);
};

/**
 * 获取执行记录的函数代码
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
