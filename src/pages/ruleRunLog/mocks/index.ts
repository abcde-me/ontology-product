import dayjs from 'dayjs';
import { EXEC_LOGS } from '@/api/businessAutomation/mock';
import { EXEC_LOG_DETAILS } from '@/api/businessAutomation/mock';
import { AutoExecLogDetail, AutoExecLogTodayStats } from '../types';

export const USE_MOCK = false;

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockListParams {
  filter?: string;
  pageNo?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  status?: number;
}

const parseTime = (value?: string) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const mockApi = {
  getRuleRunLogList: async (params: MockListParams) => {
    await delay();
    const {
      filter,
      pageNo = 1,
      pageSize = 10,
      startTime,
      endTime,
      status
    } = params;

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    let list = [...EXEC_LOGS];

    if (filter) {
      const keyword = filter.toLowerCase();
      list = list.filter(
        (item) =>
          (item.logId || '').toLowerCase().includes(keyword) ||
          (item.ruleName || '').toLowerCase().includes(keyword)
      );
    }

    if (typeof status === 'number') {
      list = list.filter((item) => item.status === status);
    }

    if (start || end) {
      list = list.filter((item) => {
        const timeValue = item.createdAt;
        if (!timeValue) return false;
        const time = dayjs(timeValue);
        if (!time.isValid()) return false;
        if (start && time.isBefore(start)) return false;
        if (end && time.isAfter(end)) return false;
        return true;
      });
    }

    const total = list.length;
    const startIndex = (pageNo - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return { items, total };
  },

  getRuleRunLogTodayStats: async (): Promise<AutoExecLogTodayStats> => {
    await delay();
    const todayStart = dayjs().startOf('day');
    const todayEnd = dayjs().endOf('day');
    const todayLogs = EXEC_LOGS.filter((item) => {
      const timeValue = item.createdAt;
      if (!timeValue) return false;
      const time = dayjs(timeValue);
      if (!time.isValid()) return false;
      return !time.isBefore(todayStart) && !time.isAfter(todayEnd);
    });

    const stats: AutoExecLogTodayStats = {
      total: todayLogs.length,
      success: todayLogs.filter((item) => item.status === 0).length,
      failed: todayLogs.filter((item) => item.status === 1).length,
      partialSuccess: todayLogs.filter((item) => item.status === 2).length
    };

    return stats;
  },

  getRuleRunLogDetail: async (
    id: number | string
  ): Promise<AutoExecLogDetail | null> => {
    await delay();
    const detail = EXEC_LOG_DETAILS.find((item) => item.id === Number(id));
    return detail || null;
  }
};
