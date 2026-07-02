import UAPI from '@/api';
import { DataSourceType, ConnectionStatus } from '@/pages/dataSource/types';
import {
  DATA_SOURCE_TYPE_META,
  resolveDataSourceType
} from '@/pages/dataSource/constants';

export type ConnectorCategory = 'sql' | 'api' | 'kafka';

export type SqlSubtype = 'mysql' | 'dameng' | 'postgres' | 'iceberg';
export type ApiSubtype = 'api';
export type KafkaSubtype = 'kafka';

export type ConnectorSubtype = SqlSubtype | ApiSubtype | KafkaSubtype;

export interface SqlConnectorConfigPayload {
  host: string;
  port: string;
  user: string;
  password: string;
  database?: string;
}

export interface ApiConnectorConfigPayload {
  url: string;
  method: string;
  headers?: string;
  auth_type: string;
  api_key?: string;
  api_key_header?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  request_body?: string;
  timeout?: string;
  data_path?: string;
}

export interface KafkaConnectorConfigPayload {
  brokers: string;
  consumer_group: string;
  topic?: string;
  security_protocol?: string;
  sasl_mechanism?: string;
  username?: string;
  password?: string;
  field_parse_mode?: string;
  message_format?: string;
}

export type ConnectorConfigPayload =
  | SqlConnectorConfigPayload
  | ApiConnectorConfigPayload
  | KafkaConnectorConfigPayload;

/**
 * 创建数据源连接器请求参数
 */
export interface CreateConnectorParams {
  name: string;
  type: ConnectorCategory;
  subtype: ConnectorSubtype;
  description?: string;
  config: ConnectorConfigPayload;
}

/**
 * 获取数据源列表请求参数
 */
export interface ListConnectorsParams {
  type?: ConnectorCategory;
  name?: string;
  subtype?: string | string[];
  page?: number;
  page_size?: number;
  status?: string | string[];
  sort_by?: 'create_time' | 'update_time';
  sort?: 'asc' | 'desc';
}

/**
 * 更新数据源请求参数
 */
export interface UpdateConnectorParams {
  id: number;
  name: string;
  type: ConnectorCategory;
  subtype: ConnectorSubtype;
  description?: string;
  config: ConnectorConfigPayload;
}

/**
 * 测试连接请求参数
 */
export interface TestConnectorParams {
  id?: string;
  config?: ConnectorConfigPayload & {
    type: ConnectorCategory;
    subtype: ConnectorSubtype;
  };
}

/**
 * 数据源类型映射（前端 → 后端 subtype）
 */
export const DataSourceTypeMap: Record<DataSourceType, ConnectorSubtype> = {
  [DataSourceType.MYSQL]: 'mysql',
  [DataSourceType.DAMENG]: 'dameng',
  [DataSourceType.POSTGRES]: 'postgres',
  [DataSourceType.ICEBERG]: 'iceberg',
  [DataSourceType.API]: 'api',
  [DataSourceType.KAFKA]: 'kafka'
};

/**
 * 数据源类型映射（后端 → 前端）
 */
export const DataSourceTypeReverseMap: Record<string, DataSourceType> = {
  mysql: DataSourceType.MYSQL,
  dameng: DataSourceType.DAMENG,
  postgres: DataSourceType.POSTGRES,
  postgresql: DataSourceType.POSTGRES,
  iceberg: DataSourceType.ICEBERG,
  api: DataSourceType.API,
  kafka: DataSourceType.KAFKA
};

export const getConnectorMeta = (dataSourceType: DataSourceType) =>
  DATA_SOURCE_TYPE_META[dataSourceType];

export const resolveConnectorTypeFromItem = (
  type: string,
  subtype: string
): DataSourceType => resolveDataSourceType(type, subtype);

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
