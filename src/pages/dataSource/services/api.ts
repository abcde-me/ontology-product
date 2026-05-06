import { mockApi, USE_MOCK } from '../mocks';
import * as connectorApi from '@/api/dataSource/connector';
import {
  DataSourceTypeMap,
  DataSourceTypeReverseMap,
  ConnectionStatusMap
} from '@/api/dataSource/connector';
import type {
  GetDataSourceListParams,
  DataSourceListResponse,
  DataSourceFormData,
  DataSourceItem,
  DataSourceType
} from '../types';

/**
 * 后端返回的数据源项
 */
interface BackendDataSourceItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  subtype: string;
  config: {
    host: string;
    port: string;
    user: string;
    password: string;
    database?: string;
  };
  creator?: string;
  creator_org?: string;
  create_time: string;
  update_time: string;
  status: string;
}

/**
 * 后端列表返回数据
 */
interface BackendListResponse {
  data: {
    items: BackendDataSourceItem[];
    total: number;
    page: number;
    page_size: number;
  };
}

/**
 * 后端详情返回数据
 */
interface BackendDetailResponse {
  data: BackendDataSourceItem;
}

/**
 * 后端操作返回数据
 */
interface BackendOperationResponse {
  status: string;
  message?: string;
}

/**
 * 后端删除返回数据
 */
interface BackendDeleteResponse {
  data: {
    deleted: number; // 删除失败-0；删除成功-1
  };
}

/**
 * 转换后端数据源项为前端格式
 */
const transformBackendItem = (item: BackendDataSourceItem): DataSourceItem => ({
  id: String(item.id),
  name: item.name,
  description: item.description || '',
  dataSourceType: DataSourceTypeReverseMap[item.subtype] || item.subtype,
  connectionInfo: `${item.subtype}://${item.config.host}:${item.config.port}${item.config.database ? '/' + item.config.database : ''}`,
  connectionStatus: ConnectionStatusMap[item.status] || item.status,
  creator: item.creator,
  creatorOrg: item.creator_org,
  createTime: item.create_time,
  updateTime: item.update_time
});

/**
 * 获取数据源列表
 */
export const fetchDataSourceList = async (
  params: GetDataSourceListParams
): Promise<DataSourceListResponse> => {
  if (USE_MOCK) {
    return mockApi.getDataSourceList(params);
  }

  // 构建真实 API 请求参数
  const apiParams: connectorApi.ListConnectorsParams = {
    type: 'sql',
    name: params.filter,
    page: String(params.pageNo),
    page_size: String(params.pageSize),
    sort_by: 'create_time',
    sort: 'desc'
  };

  // 处理数据源类型筛选（多选）
  if (params.dataSourceTypes && params.dataSourceTypes.length > 0) {
    // 如果有多个类型，只取第一个（后端不支持多选）
    const frontendType = params.dataSourceTypes[0] as DataSourceType;
    apiParams.subtype = DataSourceTypeMap[frontendType];
  }

  // 处理连接状态筛选（多选）
  if (params.connectionStatuses && params.connectionStatuses.length > 0) {
    // 如果有多个状态，只取第一个（后端不支持多选）
    const frontendStatus = params.connectionStatuses[0];
    apiParams.status = frontendStatus === 'success' ? 'succeed' : 'failed';
  }

  const result = await connectorApi.listConnectors(apiParams);
  const backendData = result as BackendListResponse;

  return {
    items: (backendData.data?.items || []).map(transformBackendItem),
    total: backendData.data?.total || 0,
    pageNo: backendData.data?.page || params.pageNo,
    pageSize: backendData.data?.page_size || params.pageSize
  };
};

/**
 * 删除数据源
 */
export const deleteDataSource = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.deleteDataSource(id);
  }

  // 真实 API 调用
  const result = await connectorApi.deleteConnector(Number(id));
  const backendData = result as BackendDeleteResponse;

  // 根据 deleted 字段判断是否成功：0-失败，1-成功
  if (backendData.data?.deleted !== 1) {
    throw new Error('删除失败');
  }
};

/**
 * 新增数据源
 */
export const addDataSource = async (
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  if (USE_MOCK) {
    return mockApi.addDataSource(data);
  }

  // 真实 API 调用
  const subtype = DataSourceTypeMap[data.dataSourceType];
  const result = await connectorApi.createConnector({
    name: data.name,
    type: 'sql',
    subtype,
    description: data.description,
    config: {
      host: data.host,
      port: String(data.port),
      user: data.username,
      password: data.password,
      database: data.database
    }
  });

  const backendData = result as BackendDataSourceItem;
  return transformBackendItem(backendData);
};

/**
 * 更新数据源
 */
export const updateDataSource = async (
  id: string,
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  if (USE_MOCK) {
    return mockApi.updateDataSource(id, data);
  }

  // 真实 API 调用
  const subtype = DataSourceTypeMap[data.dataSourceType];
  const result = await connectorApi.updateConnector({
    id: Number(id),
    name: data.name,
    type: 'sql',
    subtype,
    description: data.description,
    config: {
      host: data.host,
      port: String(data.port),
      user: data.username,
      password: data.password,
      database: data.database
    }
  });

  const backendData = result as BackendDataSourceItem;
  return transformBackendItem(backendData);
};

/**
 * 测试数据源连接
 */
export const testConnection = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  if (USE_MOCK) {
    return mockApi.testConnection(id);
  }

  // 真实 API 调用
  const result = await connectorApi.testConnector(Number(id));
  const backendData = result as BackendOperationResponse;
  const isSuccess = backendData.status === 'succeed';

  return {
    success: isSuccess,
    message: isSuccess ? '连接成功' : '连接失败'
  };
};

/**
 * 获取数据源详情
 */
export const getDataSourceDetail = async (
  id: string
): Promise<DataSourceItem> => {
  if (USE_MOCK) {
    return mockApi.getDataSourceDetail(id);
  }

  // 真实 API 调用
  const result = await connectorApi.getConnector(Number(id));
  const backendData = result as BackendDetailResponse;
  const item = backendData.data || (result as BackendDataSourceItem);

  return transformBackendItem(item);
};
