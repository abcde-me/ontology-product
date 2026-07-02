import dayjs from 'dayjs';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { getMockLogsByTaskId } from '@/pages/dataTask/executionLog/mocks/mockData';
import { RunStatus } from '@/pages/dataTask/executionLog/types';
import { USE_MOCK } from '@/pages/dataTask/mocks';
import { fetchDataTaskList } from '@/pages/dataTask/services/api';
import { ExecutionStatus } from '@/pages/dataTask/types';
import type { DataTaskItem } from '@/pages/dataTask/types';
import type { DataTaskListResponse } from '@/pages/dataTask/types';
import type { OntologScene } from '@/types/ontologySceneApi';
import type {
  InstanceTrendPoint,
  ObjectInstanceStat,
  OntologyOverviewData,
  OverviewDataTaskItem,
  OverviewStats
} from '../types';

const TREND_HOURS = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00'
];

const INCREMENT_PATTERN = [
  12, 18, 25, 32, 45, 68, 95, 130, 175, 220, 260, 290, 306, 280, 245, 210, 185,
  160, 130, 95, 70, 48, 30, 18
];

const executionStatusToRunStatus = (status: ExecutionStatus): RunStatus => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return RunStatus.RUNNING;
    case ExecutionStatus.SUCCESS:
      return RunStatus.SUCCESS;
    case ExecutionStatus.FAILED:
      return RunStatus.FAILED;
    default:
      return RunStatus.RUNNING;
  }
};

const EMPTY_FIELD = '-';

/** 同步结束时间：同步中为空；成功取任务结束时间；失败取同步失败时间 */
const resolveSyncEndTime = (
  status: ExecutionStatus,
  latest?: { endTime?: string }
): string => {
  if (status === ExecutionStatus.RUNNING) {
    return EMPTY_FIELD;
  }
  return latest?.endTime || EMPTY_FIELD;
};

const formatDurationMs = (ms: number): string => {
  if (ms < 0) {
    return EMPTY_FIELD;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/** 已结束：结束时间-开始时间；进行中：当前时间-开始时间 */
const resolveSyncDuration = (
  syncStartTime: string,
  syncEndTime: string
): string => {
  const start = dayjs(syncStartTime);
  if (!syncStartTime || syncStartTime === EMPTY_FIELD || !start.isValid()) {
    return EMPTY_FIELD;
  }

  const end =
    syncEndTime && syncEndTime !== EMPTY_FIELD ? dayjs(syncEndTime) : dayjs();

  if (!end.isValid()) {
    return EMPTY_FIELD;
  }

  return formatDurationMs(end.diff(start));
};

const buildOverviewDataTaskItem = (
  task: DataTaskItem
): OverviewDataTaskItem => {
  if (!USE_MOCK) {
    const syncStartTime = EMPTY_FIELD;
    const syncEndTime = resolveSyncEndTime(task.latestExecutionStatus);
    return {
      ...task,
      syncStartTime,
      syncEndTime,
      totalDuration: resolveSyncDuration(syncStartTime, syncEndTime)
    };
  }

  const logs = getMockLogsByTaskId(task.id);
  const targetStatus = executionStatusToRunStatus(task.latestExecutionStatus);
  const latest = logs.find((log) => log.status === targetStatus) || logs[0];

  if (!latest) {
    const syncEndTime = resolveSyncEndTime(task.latestExecutionStatus);
    return {
      ...task,
      syncStartTime: EMPTY_FIELD,
      syncEndTime,
      totalDuration: resolveSyncDuration(EMPTY_FIELD, syncEndTime)
    };
  }

  const syncStartTime = latest.startTime;
  const syncEndTime = resolveSyncEndTime(task.latestExecutionStatus, latest);

  return {
    ...task,
    syncStartTime,
    syncEndTime,
    totalDuration: resolveSyncDuration(syncStartTime, syncEndTime)
  };
};

export interface DataTaskOverviewListParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
  executionStatuses?: string[];
}

export interface DataTaskOverviewListResponse {
  items: OverviewDataTaskItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export const fetchDataTaskOverviewList = async (
  params: DataTaskOverviewListParams
): Promise<DataTaskOverviewListResponse> => {
  const taskRes = await fetchDataTaskList(params);
  return {
    items: (taskRes.items || []).map(buildOverviewDataTaskItem),
    total: taskRes.total,
    pageNo: taskRes.pageNo,
    pageSize: taskRes.pageSize
  };
};

const fetchSceneInstanceCount = async (
  scene: OntologScene
): Promise<number> => {
  if (!scene.id) {
    return scene.ontologyObjectTypeCounts || 0;
  }

  try {
    const typeRes = await listOntologyObjectType({
      ontologyModelID: scene.id,
      pageNo: 1,
      pageSize: 50
    });
    const objectTypes = typeRes.data?.result || [];

    if (!objectTypes.length) {
      return 0;
    }

    const counts = await Promise.all(
      objectTypes.map(async (objectType) => {
        if (!objectType.id) {
          return 0;
        }

        try {
          const dataRes = await listOntologyObjectTypeData({
            id: objectType.id,
            page: 1,
            pageSize: 1
          });
          return dataRes.data?.totalCount || 0;
        } catch {
          return 0;
        }
      })
    );

    return counts.reduce((sum, count) => sum + count, 0);
  } catch {
    return scene.ontologyObjectTypeCounts || 0;
  }
};

const fetchObjectInstanceStats = async (
  scenes: OntologScene[]
): Promise<ObjectInstanceStat[]> => {
  if (!scenes.length) {
    return [];
  }

  try {
    const stats = await Promise.all(
      scenes.map(async (scene) => ({
        name: scene.name || '未命名场景',
        count: await fetchSceneInstanceCount(scene)
      }))
    );

    return stats
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  } catch {
    return scenes
      .map((scene) => ({
        name: scene.name || '未命名场景',
        count: scene.ontologyObjectTypeCounts || 0
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }
};

const fetchTotalPropertyCount = async (
  scenes: OntologScene[]
): Promise<number> => {
  if (!scenes.length) {
    return 0;
  }

  try {
    const counts = await Promise.all(
      scenes.map(async (scene) => {
        if (!scene.id) {
          return 0;
        }

        try {
          const res = await listOntologyPhysicalProperties({
            ontologyModelID: scene.id,
            pageNo: 1,
            pageSize: 1
          });
          return res.data?.totalCount || 0;
        } catch {
          return 0;
        }
      })
    );

    return counts.reduce((sum, count) => sum + count, 0);
  } catch {
    return 0;
  }
};

const buildOverviewStats = (
  scenes: OntologScene[],
  sceneTotalCount: number,
  dataTaskTotal: number,
  propertyCount: number,
  instanceCount: number
): OverviewStats => ({
  sceneCount: sceneTotalCount || scenes.length,
  objectTypeCount: scenes.reduce(
    (sum, scene) => sum + (scene.ontologyObjectTypeCounts || 0),
    0
  ),
  propertyCount,
  instanceCount,
  linkCount: scenes.reduce(
    (sum, scene) => sum + (scene.ontologyLinkTypeCounts || 0),
    0
  ),
  behaviorCount: scenes.reduce(
    (sum, scene) => sum + (scene.ontologyActionCounts || 0),
    0
  ),
  functionCount: scenes.reduce(
    (sum, scene) => sum + (scene.ontologyFunctionCounts || 0),
    0
  ),
  dataTaskCount: dataTaskTotal
});

export const buildTrendData = (baseTotal: number): InstanceTrendPoint[] => {
  const scale = Math.max(baseTotal / 7718, 0.1);
  let cumulative = Math.round(baseTotal * 0.55);

  return TREND_HOURS.map((time, index) => {
    const increment = Math.round(INCREMENT_PATTERN[index] * scale);
    cumulative += increment;
    return {
      time,
      increment,
      cumulative
    };
  });
};

export const fetchOntologyOverviewData =
  async (): Promise<OntologyOverviewData> => {
    let scenes: OntologScene[] = [];
    let sceneTotalCount = 0;
    let taskRes: DataTaskListResponse = {
      items: [],
      total: 0,
      pageNo: 1,
      pageSize: 5
    };
    let taskTotal = 0;

    try {
      const sceneRes = await listOntologyModel({
        pageNo: -1,
        pageSize: -1,
        order: 'desc'
      });
      scenes = sceneRes.data?.result || [];
      sceneTotalCount = sceneRes.data?.totalCount || scenes.length;
    } catch (error) {
      console.error('获取本体场景列表失败:', error);
    }

    try {
      const [listRes, totalRes] = await Promise.all([
        fetchDataTaskList({ pageNo: 1, pageSize: 5 }),
        fetchDataTaskList({ pageNo: 1, pageSize: 1 })
      ]);
      taskRes = listRes;
      taskTotal = totalRes.total || 0;
    } catch (error) {
      console.error('获取数据任务列表失败:', error);
    }

    const [propertyCount, objectStats] = await Promise.all([
      fetchTotalPropertyCount(scenes),
      fetchObjectInstanceStats(scenes)
    ]);
    const instanceCount = objectStats.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const stats = buildOverviewStats(
      scenes,
      sceneTotalCount,
      taskTotal,
      propertyCount,
      instanceCount
    );

    const totalInstances = instanceCount;
    const trend = buildTrendData(Math.max(totalInstances * 28, 1200));

    const dataTasks: OverviewDataTaskItem[] = (taskRes.items || []).map(
      buildOverviewDataTaskItem
    );

    return {
      stats,
      trend,
      objectStats,
      dataTasks
    };
  };
