import {
  DataSourceItem,
  DataSourceFormData,
  DataSourceListResponse,
  GetDataSourceListParams,
  DataSourceType,
  ConnectionStatus
} from '../types';
import { mockDataSource } from './mockData';

// Mock 数据存储
const dataStore = [...mockDataSource];
let idCounter = 10;

/**
 * 获取数据源列表
 */
export const getDataSourceList = async (
  params: GetDataSourceListParams
): Promise<DataSourceListResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  const keyword = params.filter?.toLowerCase() || '';
  let filteredData = [...dataStore];

  // 关键词过滤
  if (keyword) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  }

  // 数据源类型过滤
  if (params.dataSourceTypes && params.dataSourceTypes.length > 0) {
    filteredData = filteredData.filter((item) =>
      params.dataSourceTypes!.includes(item.dataSourceType)
    );
  }

  // 连接状态过滤
  if (params.connectionStatuses && params.connectionStatuses.length > 0) {
    filteredData = filteredData.filter((item) =>
      params.connectionStatuses!.includes(item.connectionStatus)
    );
  }

  // 分页
  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredData.slice(start, end);

  return {
    items,
    total: filteredData.length,
    pageNo,
    pageSize
  };
};

/**
 * 获取数据源详情
 */
export const getDataSourceDetail = async (
  id: string
): Promise<DataSourceItem> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  const item = dataStore.find((d) => d.id === id);
  if (!item) {
    throw new Error('数据源不存在');
  }

  return item;
};

/**
 * 删除数据源
 */
export const deleteDataSource = async (id: string): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = dataStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('数据源不存在');
  }

  dataStore.splice(index, 1);
};

/**
 * 新增数据源
 */
export const addDataSource = async (
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

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

  // 构建连接信息
  let protocol = '';
  switch (data.dataSourceType) {
    case DataSourceType.MYSQL:
      protocol = 'mysql';
      break;
    case DataSourceType.DAMENG:
      protocol = 'dm';
      break;
    case DataSourceType.POSTGRESQL:
      protocol = 'postgresql';
      break;
  }

  const connectionInfo = `${protocol}://${data.host}:${data.port}${data.database ? '/' + data.database : ''}`;

  const newItem: DataSourceItem = {
    id: String(idCounter++),
    name: data.name,
    description: data.description || '',
    dataSourceType: data.dataSourceType,
    connectionInfo,
    connectionStatus: ConnectionStatus.SUCCESS,
    createTime: now,
    updateTime: now
  };

  dataStore.push(newItem);

  return newItem;
};

/**
 * 更新数据源
 */
export const updateDataSource = async (
  id: string,
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = dataStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('数据源不存在');
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

  // 构建连接信息
  let protocol = '';
  switch (data.dataSourceType) {
    case DataSourceType.MYSQL:
      protocol = 'mysql';
      break;
    case DataSourceType.DAMENG:
      protocol = 'dm';
      break;
    case DataSourceType.POSTGRESQL:
      protocol = 'postgresql';
      break;
  }

  const connectionInfo = `${protocol}://${data.host}:${data.port}${data.database ? '/' + data.database : ''}`;

  const updatedItem: DataSourceItem = {
    ...dataStore[index],
    name: data.name,
    description: data.description || '',
    dataSourceType: data.dataSourceType,
    connectionInfo,
    updateTime: now
  };

  dataStore[index] = updatedItem;

  return updatedItem;
};

/**
 * 测试数据源连接
 */
export const testConnection = async (
  id?: string,
  data?: DataSourceFormData
): Promise<{ success: boolean; message: string }> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // 随机成功或失败
  const random = Math.random();
  if (random > 0.2) {
    return {
      success: true,
      message: '连接成功'
    };
  } else {
    return {
      success: false,
      message: '连接失败: 连接超时，请检查网络配置'
    };
  }
};
