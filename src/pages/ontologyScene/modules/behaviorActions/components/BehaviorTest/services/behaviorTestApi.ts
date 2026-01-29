import * as api from '@/api/behaviorTest';
import { USE_MOCK, mockApi } from '../mocks';
import { BehaviorItem, TestResult, HistoryItem } from '../types';

/**
 * 获取行为列表
 */
export const fetchBehaviorList = async (params: {
  keyword?: string;
  objectType?: string;
}): Promise<BehaviorItem[]> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorList(params);
  }

  // 真实 API 调用
  const response = await api.getBehaviorList(params);

  // 适配响应格式（如果需要）
  if (response.data?.list) {
    return response.data.list;
  }
  if (response.data?.behaviors) {
    return response.data.behaviors;
  }
  return response.data || response;
};

/**
 * 执行行为测试
 */
export const executeBehaviorTest = async (params: {
  nodes: {
    behaviorId: string;
    config: Record<string, any>;
  }[];
}): Promise<TestResult[]> => {
  if (USE_MOCK) {
    return mockApi.executeBehaviorTest(params);
  }

  // 真实 API 调用
  const response = await api.executeBehaviorTest(params);

  // 适配响应格式
  if (response.data?.results) {
    return response.data.results;
  }
  return response.data || response;
};

/**
 * 保存编排方案（可选）
 */
export const saveBehaviorOrchestration = async (params: {
  name: string;
  description?: string;
  nodes: any[];
}): Promise<{ id: string; createdAt: string }> => {
  if (USE_MOCK) {
    // Mock 实现
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: `orch_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }

  // 真实 API 调用
  const response = await api.saveBehaviorOrchestration(params);
  return response.data;
};

/**
 * 获取历史记录
 */
export const getBehaviorHistory = async (): Promise<HistoryItem[]> => {
  if (USE_MOCK) {
    return mockApi.getBehaviorHistory();
  }

  // 真实 API 调用
  const response = await api.getBehaviorHistory({});

  // 适配响应格式
  if (response.data?.list) {
    return response.data.list;
  }
  if (response.data?.history) {
    return response.data.history;
  }
  return response.data || response;
};
