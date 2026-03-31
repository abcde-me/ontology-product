import UAPI from '@/api';

/**
 * ListAutoExecLogRequest，内嵌 sdk.PagingRequest
 */
export interface GetExecLogListParam {
  endTime?: string;
  order?: Order;
  orderBy?: string;
  orders?: string[];
  pageNo?: number;
  pageSize?: number;
  ruleId?: number;
  startTime?: string;
  /**
   * 0=成功，1=失败，2=部分成功，3=待执行
   */
  status?: number;
  /**
   * 1=定时，2=变更，3=手动
   */
  triggerType?: number;
}

export enum Order {
  Asc = 'asc',
  Desc = 'desc'
}

export async function getExecLogList(params: GetExecLogListParam) {
  const res = await UAPI.RES.GetAutoExecLogListApi({})
    .post(params)
    .inRegion()
    .do();
  return res.data;
}
export async function getExecLogDetail(id: string | number) {
  const res = await UAPI.RES.GetAutoExecLogListApi({})
    .post({ id })
    .inRegion()
    .do();
  return res.data;
}
// 获取快照
export async function GetAutoExecLogRuleSnapshot(id: string | number) {
  const res = await UAPI.RES.GetAutoExecLogRuleSnapshotApi({})
    .post({ id })
    .inRegion()
    .do();
  return res.data;
}
// 获取今日统计
export async function GetAutoExecLogTodayStats(ruleId: string | number) {
  const res = await UAPI.RES.GetAutoExecLogTodayStatsApi({})
    .post({ ruleId })
    .inRegion()
    .do();
  return res.data;
}
// 获取规则统计
export async function GetAutoRuleStats(ruleId: string | number) {
  const res = await UAPI.RES.GetAutoRuleStatsApi({})
    .post({ ruleId })
    .inRegion()
    .do();
  return res.data;
}
