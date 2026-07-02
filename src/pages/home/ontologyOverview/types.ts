import type { DataTaskItem } from '@/pages/dataTask/types';

export interface InstanceTrendPoint {
  time: string;
  increment: number;
  cumulative: number;
}

export interface ObjectInstanceStat {
  name: string;
  count: number;
}

export interface OverviewDataTaskItem extends DataTaskItem {
  syncStartTime: string;
  syncEndTime: string;
  totalDuration: string;
}

export interface OverviewStats {
  sceneCount: number;
  objectTypeCount: number;
  propertyCount: number;
  instanceCount: number;
  linkCount: number;
  behaviorCount: number;
  functionCount: number;
  dataTaskCount: number;
}

export interface OntologyOverviewData {
  stats: OverviewStats;
  trend: InstanceTrendPoint[];
  objectStats: ObjectInstanceStat[];
  dataTasks: OverviewDataTaskItem[];
}

export const DEFAULT_OVERVIEW_STATS: OverviewStats = {
  sceneCount: 0,
  objectTypeCount: 0,
  propertyCount: 0,
  instanceCount: 0,
  linkCount: 0,
  behaviorCount: 0,
  functionCount: 0,
  dataTaskCount: 0
};

export const createEmptyOverviewData = (): OntologyOverviewData => ({
  stats: { ...DEFAULT_OVERVIEW_STATS },
  trend: [],
  objectStats: [],
  dataTasks: []
});
