import UAPI from '@/api';

/**
 * 获取行为列表
 */
export function getBehaviorList(params: {
  keyword?: string;
  objectType?: string;
}) {
  return UAPI.RES.behaviorList({}).get(params).inRegion().do();
}

/**
 * 执行行为测试
 */
export function executeBehaviorTest(params: {
  nodes: {
    behaviorId: string;
    config: Record<string, any>;
  }[];
}) {
  return UAPI.RES.behaviorTest({}).post(params).inRegion().do();
}

/**
 * 保存编排方案（可选）
 */
export function saveBehaviorOrchestration(params: {
  name: string;
  description?: string;
  nodes: any[];
}) {
  return UAPI.RES.behaviorOrchestration({}).post(params).inRegion().do();
}

/**
 * 获取历史记录（可选）
 */
export function getBehaviorHistory(params: {
  page?: number;
  pageSize?: number;
}) {
  return UAPI.RES.behaviorHistory({}).get(params).inRegion().do();
}
