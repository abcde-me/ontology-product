import { mockApi, USE_MOCK } from '../mocks';
import * as connectorApi from '@/api/dataSource/connector';
import {
  DataSourceTypeMap,
  getConnectorMeta
} from '@/api/dataSource/connector';
import type {
  GetDataSourceListParams,
  DataSourceListResponse,
  DataSourceFormData,
  DataSourceItem,
  DataSourceType
} from '../types';
import {
  formDataToConnectorConfig,
  transformBackendItem
} from './connectorTransform';

const CONNECTOR_CATEGORIES: Array<'sql' | 'api' | 'kafka'> = [
  'sql',
  'api',
  'kafka'
];

/**
 * 后端列表返回数据
 */
interface BackendListResponse {
  items: Parameters<typeof transformBackendItem>[0][];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 获取数据源列表
 */
export const fetchDataSourceList = async (
  params: GetDataSourceListParams
): Promise<DataSourceListResponse> => {
  if (USE_MOCK) {
    return mockApi.getDataSourceList(params);
  }

  const baseParams: Omit<connectorApi.ListConnectorsParams, 'type'> = {
    name: params.filter,
    page: params.pageNo,
    page_size: params.pageSize,
    sort_by: 'create_time',
    sort: 'desc'
  };

  if (params.dataSourceTypes && params.dataSourceTypes.length > 0) {
    baseParams.subtype = params.dataSourceTypes.map(
      (type) => DataSourceTypeMap[type as DataSourceType]
    );
  }

  if (params.connectionStatuses && params.connectionStatuses.length > 0) {
    baseParams.status = params.connectionStatuses.map((status) =>
      status === 'success' ? 'succeed' : 'failed'
    );
  }

  const results = await Promise.all(
    CONNECTOR_CATEGORIES.map((type) =>
      connectorApi.listConnectors({ ...baseParams, type })
    )
  );

  for (const result of results) {
    if (result.code) {
      throw new Error(result.message || '获取数据源列表失败');
    }
  }

  const mergedItems = results.flatMap((result) => {
    const backendData = result.data as BackendListResponse;
    return (backendData.items || []).map(transformBackendItem);
  });

  mergedItems.sort(
    (a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );

  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;
  const items = mergedItems.slice(start, start + pageSize);

  return {
    items,
    total: mergedItems.length,
    pageNo,
    pageSize
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

    if (result.code) {
      throw new Error(result.message || '删除失败');
    }

    if (result.data?.deleted !== 1) {
      throw new Error(result.message || '删除失败');
    }
  } catch (error: any) {
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
    const meta = getConnectorMeta(data.dataSourceType);
    const result = await connectorApi.createConnector({
      name: data.name,
      type: meta.connectorType,
      subtype: meta.subtype as connectorApi.ConnectorSubtype,
      description: data.description,
      config: formDataToConnectorConfig(data)
    });

    if (result.code) {
      throw new Error(result.message || '新增数据源失败');
    }
  } catch (error: any) {
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
    const meta = getConnectorMeta(data.dataSourceType);
    const result = await connectorApi.updateConnector({
      id: Number(id),
      name: data.name,
      type: meta.connectorType,
      subtype: meta.subtype as connectorApi.ConnectorSubtype,
      description: data.description,
      config: formDataToConnectorConfig(data)
    });

    if (result.code) {
      throw new Error(result.message || '更新数据源失败');
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || '更新数据源失败';
    throw new Error(message);
  }
};

const parseTestConnectionResult = (result: {
  code?: number;
  message?: string;
  data?: { status?: string };
}): { success: boolean; message: string } => {
  if (result.code) {
    return {
      success: false,
      message: result.message || '连接测试失败'
    };
  }

  const isSuccess = result.data?.status === 'succeed';
  return {
    success: isSuccess,
    message: result.message || (isSuccess ? '连接成功' : '连接失败')
  };
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
    const result = await connectorApi.testConnector({ id });
    return parseTestConnectionResult(result);
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || '连接测试失败';
    return {
      success: false,
      message
    };
  }
};

/**
 * 按表单配置测试数据源连接（新增/编辑时使用）
 */
export const testConnectionByForm = async (
  data: DataSourceFormData
): Promise<{ success: boolean; message: string }> => {
  if (USE_MOCK) {
    return mockApi.testConnectionByForm(data);
  }

  try {
    const meta = getConnectorMeta(data.dataSourceType);
    const result = await connectorApi.testConnector({
      config: {
        ...formDataToConnectorConfig(data),
        type: meta.connectorType,
        subtype: meta.subtype as connectorApi.ConnectorSubtype
      }
    });
    return parseTestConnectionResult(result);
  } catch (error: any) {
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

  const result = await connectorApi.getConnector(Number(id));

  if (result.code) {
    throw new Error(result.message || '获取数据源详情失败');
  }

  return transformBackendItem(result.data);
};
