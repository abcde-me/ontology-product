import {
  DataTaskItem,
  DataTaskListResponse,
  GetDataTaskListParams,
  TaskStatus
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

  const now = new Date()
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

  const newItem: DataTaskItem = {
    ...item,
    id: String(Date.now()),
    name: `${item.name}_copy`,
    status: TaskStatus.DEVELOPING,
    updateTime: now
  };

  dataStore.unshift(newItem);
  return newItem;
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
  item.updateTime = new Date()
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
};
