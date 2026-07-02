import { fetchDataTaskOverviewList } from '@/pages/home/ontologyOverview/services/api';
import type { OverviewDataTaskItem } from '@/pages/home/ontologyOverview/types';
import { ExecutionStatus } from '@/pages/dataTask/types';

export interface DataTaskOverviewStats {
  total: number;
  success: number;
  running: number;
  failed: number;
  avgFinishedDuration: string;
}

export const DEFAULT_DATA_TASK_OVERVIEW_STATS: DataTaskOverviewStats = {
  total: 0,
  success: 0,
  running: 0,
  failed: 0,
  avgFinishedDuration: '-'
};

const EMPTY_DURATION = '-';

const parseDurationToMs = (duration: string): number | null => {
  if (!duration || duration === EMPTY_DURATION) {
    return null;
  }

  const parts = duration.split(':');
  if (parts.length !== 3) {
    return null;
  }

  const [hours, minutes, seconds] = parts.map((part) => Number(part));
  if ([hours, minutes, seconds].some((value) => Number.isNaN(value))) {
    return null;
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const computeAvgFinishedDuration = (items: OverviewDataTaskItem[]): string => {
  const durations = items
    .filter(
      (item) =>
        item.latestExecutionStatus === ExecutionStatus.SUCCESS ||
        item.latestExecutionStatus === ExecutionStatus.FAILED
    )
    .map((item) => parseDurationToMs(item.totalDuration))
    .filter((ms): ms is number => ms !== null);

  if (!durations.length) {
    return EMPTY_DURATION;
  }

  const avgMs = durations.reduce((sum, ms) => sum + ms, 0) / durations.length;
  return formatDurationMs(avgMs);
};

export const fetchDataTaskOverviewStats =
  async (): Promise<DataTaskOverviewStats> => {
    const result = await fetchDataTaskOverviewList({
      pageNo: 1,
      pageSize: 9999
    });
    const items = result.items || [];

    return {
      total: result.total || items.length,
      success: items.filter(
        (item) => item.latestExecutionStatus === ExecutionStatus.SUCCESS
      ).length,
      running: items.filter(
        (item) => item.latestExecutionStatus === ExecutionStatus.RUNNING
      ).length,
      failed: items.filter(
        (item) => item.latestExecutionStatus === ExecutionStatus.FAILED
      ).length,
      avgFinishedDuration: computeAvgFinishedDuration(items)
    };
  };
