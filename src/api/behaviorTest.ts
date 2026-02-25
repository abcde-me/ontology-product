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

// ==================== 执行记录相关接口 ====================

/**
 * 获取执行记录列表
 */
export function getBehaviorLogList(params: {
  page_num: number;
  page_size: number;
  query: string;
  type: 'action' | 'function';
}) {
  return UAPI.RES.PageExecuteTestLog({}).post(params).inRegion().do();
}

/**
 * 获取执行记录详情
 */
export function getBehaviorLogDetail(params: { id: string }) {
  // @ts-ignore - UAPI 资源待后端配置
  return UAPI.RES.behaviorLogDetail({ id: params.id }).get().inRegion().do();
}

/**
 * 获取入参详情
 */
export function getBehaviorLogInputParams(params: { id: string }) {
  // @ts-ignore - UAPI 资源待后端配置
  return UAPI.RES.behaviorLogInputParams({ id: params.id })
    .get()
    .inRegion()
    .do();
}

/**
 * 获取执行详情（SQL/代码）
 */
export function getBehaviorLogExecutionDetail(params: { id: string }) {
  // @ts-ignore - UAPI 资源待后端配置
  return UAPI.RES.behaviorLogExecutionDetail({ id: params.id })
    .get()
    .inRegion()
    .do();
}

/**
 * 删除执行记录
 */
export function deleteBehaviorLog(params: { id: string }) {
  // @ts-ignore - UAPI 资源待后端配置
  return UAPI.RES.behaviorLog({ id: params.id }).delete().inRegion().do();
}

/**
 * 批量删除执行记录
 */
export function batchDeleteBehaviorLogs(params: { ids: string[] }) {
  // @ts-ignore - UAPI 资源待后端配置
  return UAPI.RES.behaviorLogBatchDelete({}).post(params).inRegion().do();
}

// 获取执行记录
