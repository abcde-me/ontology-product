import {
  getExecLogList,
  getExecLogDetail,
  GetAutoLogStats,
  Order
} from '@/api/businessAutomation/runLog';
import {
  AutoExecLogDetail,
  AutoExecLogItem,
  AutoExecLogTodayStats
} from '../types';

export interface RuleRunLogListParams {
  filter?: string;
  timeRange?: string;
  pageNo?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  statusList?: number[];
  orderBy?: string;
  order?: Order;
}

export const fetchRuleRunLogList = async (
  params: RuleRunLogListParams
): Promise<{ items: AutoExecLogItem[]; total: number }> => {
  const response = await getExecLogList(params as any);

  if (response?.items && typeof response?.total === 'number') {
    return {
      items: response.items as AutoExecLogItem[],
      total: response.total
    };
  }

  const items = response?.result || response?.items || [];
  const total = response?.totalCount ?? response?.total ?? response?.count ?? 0;

  return {
    items: items as AutoExecLogItem[],
    total
  };
};

export const fetchRuleRunLogTodayStats =
  async (): Promise<AutoExecLogTodayStats> => {
    const response = await GetAutoLogStats(0);
    return (response || {}) as AutoExecLogTodayStats;
  };

export const fetchRuleRunLogDetail = async (
  id: number | string
): Promise<AutoExecLogDetail | null> => {
  const response = await getExecLogDetail(id);
  if (!response) return null;

  return (response.data || response) as AutoExecLogDetail;
};
