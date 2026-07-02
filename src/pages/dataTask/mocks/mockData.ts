import {
  TaskType,
  ScheduleType,
  TaskStatus,
  ExecutionStatus,
  DataTaskItem
} from '../types';
import { DATA_RESOURCE_CATALOG } from '@/pages/dataResource/data/catalog';

/** 任务名称：数据资源库表信息 + 数据同步 */
export const buildDataSyncTaskName = (catalogIndex: number): string => {
  const table = DATA_RESOURCE_CATALOG[catalogIndex];
  if (!table) {
    return '未知库表数据同步';
  }
  return `${table.databaseType}/${table.tableName}数据同步`;
};

export const mockDataTasks: DataTaskItem[] = [
  {
    id: '1',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(0),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'zhangsan',
    updaterName: '张三',
    updateTime: '2026-06-09 09:15:00'
  },
  {
    id: '2',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(1),
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.PUBLISHING,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'lisi',
    updaterName: '李四',
    updateTime: '2026-06-09 07:20:00'
  },
  {
    id: '3',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(2),
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.OFFLINE,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'wangwu',
    updaterName: '王五',
    updateTime: '2026-06-08 18:10:00'
  },
  {
    id: '4',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(3),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'zhaoliu',
    updaterName: '赵六',
    updateTime: '2026-06-08 14:00:00'
  },
  {
    id: '5',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(4),
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'sunqi',
    updaterName: '孙七',
    updateTime: '2026-06-08 09:30:00'
  },
  {
    id: '6',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(5),
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.PUBLISHING,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'zhouba',
    updaterName: '周八',
    updateTime: '2026-06-07 16:45:00'
  },
  {
    id: '7',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(6),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'wujiu',
    updaterName: '吴九',
    updateTime: '2026-06-07 10:20:00'
  }
];
