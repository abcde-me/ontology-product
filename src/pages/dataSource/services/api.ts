import { mockApi, USE_MOCK } from '../mocks';
import type {
  GetDataSourceListParams,
  DataSourceListResponse,
  DataSourceFormData,
  DataSourceItem
} from '../types';

/**
 * 获取数据源列表
 */
export const fetchDataSourceList = async (
  params: GetDataSourceListParams
): Promise<DataSourceListResponse> => {
  if (USE_MOCK) {
    return mockApi.getDataSourceList(params);
  }

  // 真实 API 调用
  // const response = await request.get<DataSourceListResponse>('/api/datasource/list', { params });
  // return response.data;

  // TODO: 等待后端接口实现后替换
  return mockApi.getDataSourceList(params);
};

/**
 * 删除数据源
 */
export const deleteDataSource = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    return mockApi.deleteDataSource(id);
  }

  // 真实 API 调用
  // await request.delete(`/api/datasource/${id}`);

  // TODO: 等待后端接口实现后替换
  return mockApi.deleteDataSource(id);
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
  // const response = await request.post<DataSourceItem>('/api/datasource', data);
  // return response.data;

  // TODO: 等待后端接口实现后替换
  return mockApi.addDataSource(data);
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
  // const response = await request.put<DataSourceItem>(`/api/datasource/${id}`, data);
  // return response.data;

  // TODO: 等待后端接口实现后替换
  return mockApi.updateDataSource(id, data);
};

/**
 * 测试数据源连接
 */
export const testConnection = async (
  id?: string,
  data?: DataSourceFormData
): Promise<{ success: boolean; message: string }> => {
  if (USE_MOCK) {
    return mockApi.testConnection(id, data);
  }

  // 真实 API 调用
  // const response = await request.post<{ success: boolean; message: string }>(
  //     `/api/datasource/${id}/test`,
  //     data
  // );
  // return response.data;

  // TODO: 等待后端接口实现后替换
  return mockApi.testConnection(id, data);
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
  // const response = await request.get<DataSourceItem>(`/api/datasource/${id}`);
  // return response.data;

  // TODO: 等待后端接口实现后替换
  return mockApi.getDataSourceDetail(id);
};
