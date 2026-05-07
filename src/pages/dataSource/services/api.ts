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
  created_time: string; // 后端返回的是 created_time
  updated_time: string; // 后端返回的是 updated_time
  status: string;
}

/**
 * 后端列表返回数据
 */
interface BackendListResponse {
  items: BackendDataSourceItem[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 后端详情返回数据
 */
interface BackendDetailResponse {
  data: BackendDataSourceItem;
}

/**
 * 后端通用返回数据
 */
interface BackendBaseResponse {
  code: string; // 错误码，空字符串表示成功，有值表示失败
  message: string; // 消息
  status: number; // HTTP 状态码
  requestId: string; // 请求ID
}

/**
 * 后端操作返回数据
 */
interface BackendOperationResponse {
  code: string; // 错误码
  message: string; // 消息
  data: any;
  status: string; // 连接状态：succeed、failed
  requestId: string; // 请求ID
}

/**
 * 后端删除返回数据
 */
interface BackendDeleteResponse {
  code: string; // 错误码
  message: string; // 消息
  data: {
    deleted: number; // 删除失败-0；删除成功-1
  } | null;
  status: number; // HTTP 状态码
  requestId: string; // 请求ID
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
  createTime: item.created_time, // 映射 created_time 到 createTime
  updateTime: item.updated_time, // 映射 updated_time 到 updateTime
  config: item.config // 保留 config 信息，用于编辑时获取真实密码
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
    page: params.pageNo,
    page_size: params.pageSize,
    sort_by: 'create_time',
    sort: 'desc'
  };

  // 处理数据源类型筛选（支持多选）
  if (params.dataSourceTypes && params.dataSourceTypes.length > 0) {
    // 将前端类型映射为后端类型
    const backendTypes = params.dataSourceTypes.map(
      (type) => DataSourceTypeMap[type as DataSourceType]
    );
    // 如果只有一个，传字符串；多个则传数组
    apiParams.subtype =
      backendTypes.length === 1 ? backendTypes[0] : backendTypes;
  }

  // 处理连接状态筛选（支持多选）
  if (params.connectionStatuses && params.connectionStatuses.length > 0) {
    // 将前端状态映射为后端状态
    const backendStatuses = params.connectionStatuses.map((status) =>
      status === 'success' ? 'succeed' : 'failed'
    );
    // 如果只有一个，传字符串；多个则传数组
    apiParams.status =
      backendStatuses.length === 1 ? backendStatuses[0] : backendStatuses;
  }

  console.log('📤 请求参数:', apiParams);
  const result = await connectorApi.listConnectors(apiParams);
  console.log('📥 原始响应:', result);

  // 检查是否有错误
  if (result.code) {
    throw new Error(result.message || '获取数据源列表失败');
  }

  const backendData = result.data as BackendListResponse;
  console.log('📊 解析后的数据:', backendData);

  const transformedItems = (backendData.items || []).map(transformBackendItem);
  console.log('✅ 转换后的数据:', transformedItems);

  return {
    items: transformedItems,
    total: backendData.total || 0,
    pageNo: backendData.page || params.pageNo,
    pageSize: backendData.page_size || params.pageSize
  };
};

/**
 * 删除数据源
 */
export const deleteDataSource = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.deleteDataSource(id);
  }

  try {
    const result = await connectorApi.deleteConnector(Number(id));

    // 检查返回的 code 字段，如果有值说明失败
    if (result.code) {
      throw new Error(result.message || '删除失败');
    }

    // 检查 deleted 字段：0-失败，1-成功
    if (result.data?.deleted !== 1) {
      throw new Error(result.message || '删除失败');
    }
  } catch (error: any) {
    // 如果是 axios 错误，提取 message
    const message =
      error?.response?.data?.message || error?.message || '删除失败';
    throw new Error(message);
  }
};

/**
 * 新增数据源
 */
export const addDataSource = async (
  data: DataSourceFormData
): Promise<void> => {
  if (USE_MOCK) {
    await mockApi.addDataSource(data);
    return;
  }

  try {
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

    // 检查返回的 code 字段，如果有值说明失败
    if (result.code) {
      throw new Error(result.message || '新增数据源失败');
    }
  } catch (error: any) {
    // 如果是 axios 错误，提取 message
    const message =
      error?.response?.data?.message || error?.message || '新增数据源失败';
    throw new Error(message);
  }
};

/**
 * 更新数据源
 */
export const updateDataSource = async (
  id: string,
  data: DataSourceFormData
): Promise<void> => {
  if (USE_MOCK) {
    await mockApi.updateDataSource(id, data);
    return;
  }

  try {
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

    // 检查返回的 code 字段，如果有值说明失败
    if (result.code) {
      throw new Error(result.message || '更新数据源失败');
    }
  } catch (error: any) {
    // 如果是 axios 错误，提取 message
    const message =
      error?.response?.data?.message || error?.message || '更新数据源失败';
    throw new Error(message);
  }
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

  try {
    const result = await connectorApi.testConnector(Number(id));

    // 检查返回的 code 字段，如果有值说明失败
    if (result.code) {
      return {
        success: false,
        message: result.message || '连接测试失败'
      };
    }

    // 检查 status 字段
    const isSuccess = result.data?.status === 'succeed';
    return {
      success: isSuccess,
      message: result.message || (isSuccess ? '连接成功' : '连接失败')
    };
  } catch (error: any) {
    // 如果是 axios 错误，提取 message
    const message =
      error?.response?.data?.message || error?.message || '连接测试失败';
    return {
      success: false,
      message
    };
  }
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

  // 检查是否有错误
  if (result.code) {
    throw new Error(result.message || '获取数据源详情失败');
  }

  const item = result.data;
  return transformBackendItem(item);
};
