import UAPI from '@/api';
import { DataSourceType, ConnectionStatus } from '@/pages/dataSource/types';

/**
 * 创建数据源连接器请求参数
 */
export interface CreateConnectorParams {
  name: string; // 数据源名称
  type: 'sql'; // 数据源类型，固定为 "sql"
  subtype: 'mysql' | 'dameng' | 'postgres'; // 子类型
  description?: string; // 描述（可选）
  config: {
    host: string; // 主机地址
    port: string; // 端口
    user: string; // 用户名
    password: string; // 密码
    database?: string; // 数据库名（可选）
  };
}

/**
 * 获取数据源列表请求参数
 */
export interface ListConnectorsParams {
  type: 'sql'; // 数据源类型，固定为 "sql"
  name?: string; // 根据连接器名称搜索，模糊匹配
  subtype?: string | string[]; // 数据源子类型：mysql、dameng、postgresql，支持数组
  page?: number; // 页码，默认 1
  page_size?: number; // 每页数量
  status?: string | string[]; // 连接状态：succeed、failed，支持数组
  sort_by?: 'create_time' | 'update_time'; // 排序字段，默认 create_time
  sort?: 'asc' | 'desc'; // 排序方式，默认 desc
}

/**
 * 更新数据源请求参数
 */
export interface UpdateConnectorParams {
  id: number; // 数据源id
  name: string;
  type: 'sql';
  subtype: 'mysql' | 'dameng' | 'postgres';
  description?: string;
  config: {
    host: string;
    port: string;
    user: string;
    password: string;
    database?: string;
  };
}

/**
 * 测试连接请求参数
 */
export interface TestConnectorParams {
  id?: string; // 已存在的连接器ID（可选）
  config?: {
    // 或者直接传配置信息
    host: string;
    port: string;
    user: string;
    password: string;
    database?: string;
    type: 'sql';
    subtype: 'mysql' | 'dameng' | 'postgres';
  };
}

/**
 * 数据源类型映射（前端 → 后端）
 */
export const DataSourceTypeMap: Record<
  DataSourceType,
  'mysql' | 'dameng' | 'postgres'
> = {
  [DataSourceType.MYSQL]: 'mysql',
  [DataSourceType.DAMENG]: 'dameng',
  [DataSourceType.POSTGRESQL]: 'postgres'
};

/**
 * 数据源类型映射（后端 → 前端）
 */
export const DataSourceTypeReverseMap: Record<string, DataSourceType> = {
  mysql: DataSourceType.MYSQL,
  dameng: DataSourceType.DAMENG,
  postgres: DataSourceType.POSTGRESQL,
  postgresql: DataSourceType.POSTGRESQL
};

/**
 * 连接状态映射（后端 → 前端）
 */
export const ConnectionStatusMap: Record<string, ConnectionStatus> = {
  succeed: ConnectionStatus.SUCCESS,
  failed: ConnectionStatus.FAILED
};

/**
 * 创建数据源连接器
 */
export async function createConnector(params: CreateConnectorParams) {
  const res = await UAPI.RES.CreateConnectorApi({})
    .post(params)
    .inRegion()
    .do();
  return res;
}

/**
 * 获取数据源列表
 */
export async function listConnectors(params: ListConnectorsParams) {
  const res = await UAPI.RES.ListConnectorsApi({}).post(params).inRegion().do();
  return res;
}

/**
 * 获取数据源详情
 */
export async function getConnector(id: number) {
  const res = await UAPI.RES.GetConnectorApi({}).post({ id }).inRegion().do();
  return res;
}

/**
 * 更新数据源
 */
export async function updateConnector(params: UpdateConnectorParams) {
  const res = await UAPI.RES.EditConnectorApi({}).post(params).inRegion().do();
  return res;
}

/**
 * 删除数据源
 */
export async function deleteConnector(id: number) {
  const res = await UAPI.RES.DeleteConnectorApi({})
    .post({ id })
    .inRegion()
    .do();
  return res;
}

/**
 * 测试数据源连接
 */
export async function testConnector(id: number) {
  const res = await UAPI.RES.TestConnectorApi({}).post({ id }).inRegion().do();
  return res;
}
