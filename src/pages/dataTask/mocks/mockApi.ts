import {
  CreateDataTaskParams,
  DataTaskDetail,
  DataTaskItem,
  DataTaskListResponse,
  ExecutionStatus,
  GetDataTaskListParams,
  ScheduleType,
  TaskStatus,
  TaskType,
  UpdateDataTaskParams
} from '../types';
import { mockDataTasks } from './mockData';

const dataStore = [...mockDataTasks];

export const getDataTaskList = async (
  params: GetDataTaskListParams
): Promise<DataTaskListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const keyword = params.filter?.toLowerCase() || '';
  let filteredData = [...dataStore];

  if (keyword) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  }

  if (params.taskTypes?.length) {
    filteredData = filteredData.filter((item) =>
      params.taskTypes!.includes(item.taskType)
    );
  }

  if (params.scheduleTypes?.length) {
    filteredData = filteredData.filter((item) =>
      params.scheduleTypes!.includes(item.scheduleType)
    );
  }

  if (params.statuses?.length) {
    filteredData = filteredData.filter((item) =>
      params.statuses!.includes(item.status)
    );
  }

  if (params.executionStatuses?.length) {
    filteredData = filteredData.filter((item) =>
      params.executionStatuses!.includes(item.latestExecutionStatus)
    );
  }

  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;
  const items = filteredData.slice(start, start + pageSize);

  return {
    items,
    total: filteredData.length,
    pageNo,
    pageSize
  };
};

export const deleteDataTask = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = dataStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('数据任务不存在');
  }

  dataStore.splice(index, 1);
};

export const copyDataTask = async (id: string): Promise<DataTaskItem> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const item = dataStore.find((task) => task.id === id);
  if (!item) {
    throw new Error('数据任务不存在');
  }

  const newItem: DataTaskItem = {
    ...item,
    id: String(Date.now()),
    name: `${item.name}_copy`,
    status: TaskStatus.DEVELOPING,
    updateTime: formatNow()
  };

  dataStore.unshift(newItem);
  return newItem;
};

const formatNow = () =>
  new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-');

export const getDataTaskDetail = async (
  id: string
): Promise<DataTaskDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const item = dataStore.find((task) => task.id === id);
  if (!item) {
    throw new Error('数据任务不存在');
  }

  return { ...item };
};

export const createDataTask = async (
  params: CreateDataTaskParams
): Promise<DataTaskDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newItem: DataTaskDetail = {
    id: String(Date.now()),
    taskType: params.taskType ?? TaskType.WORKFLOW_DAG,
    name: params.name,
    scheduleType: params.scheduleType ?? ScheduleType.IMMEDIATE,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'current_user',
    updaterName: '当前用户',
    updateTime: formatNow(),
    description: params.description,
    processId: `process_${Date.now()}`
  };

  dataStore.unshift(newItem);
  return newItem;
};

export const updateDataTask = async (
  params: UpdateDataTaskParams
): Promise<DataTaskDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const item = dataStore.find((task) => task.id === params.id);
  if (!item) {
    throw new Error('数据任务不存在');
  }

  if (params.name !== undefined) {
    item.name = params.name;
  }
  if (params.scheduleType !== undefined) {
    item.scheduleType = params.scheduleType;
  }
  if (params.description !== undefined) {
    item.description = params.description;
  }
  if (params.cron !== undefined) {
    item.cron = params.cron;
  }

  item.updateTime = formatNow();
  return { ...item };
};

export const toggleDataTaskStatus = async (
  id: string,
  online: boolean
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const item = dataStore.find((task) => task.id === id);
  if (!item) {
    throw new Error('数据任务不存在');
  }

  item.status = online ? TaskStatus.ONLINE : TaskStatus.OFFLINE;
  item.updateTime = formatNow();
};
