// 数据源类型枚举
export enum DataSourceType {
  MYSQL = 'mysql',
  DAMENG = 'dameng',
  POSTGRES = 'postgres',
  ICEBERG = 'iceberg',
  API = 'api',
  KAFKA = 'kafka'
}

// 连接状态枚举
export enum ConnectionStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

// API 鉴权方式
export enum ApiAuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  BEARER = 'bearer',
  BASIC = 'basic',
  OAUTH2 = 'oauth2'
}

// OAuth2 授权类型
export enum OAuth2GrantType {
  CLIENT_CREDENTIALS = 'client_credentials',
  PASSWORD = 'password'
}

// API 请求方法
export enum ApiHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// Kafka 字段解析模式
export enum KafkaFieldParseMode {
  PARSE = 'parse',
  RAW = 'raw'
}

// Iceberg 仓库存储类型
export enum IcebergWarehouseType {
  MINIO = 'MINIO',
  HDFS = 'HDFS'
}

// SQL 连接器配置
export interface SqlConnectorConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database?: string;
}

// API 连接器配置
export interface ApiConnectorConfig {
  url: string;
  method: ApiHttpMethod | string;
  headers?: string;
  auth_type: ApiAuthType | string;
  api_key?: string;
  api_key_header?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  oauth2_token_url?: string;
  oauth2_client_id?: string;
  oauth2_client_secret?: string;
  oauth2_scope?: string;
  oauth2_grant_type?: OAuth2GrantType | string;
  request_body?: string;
  timeout?: string;
  data_path?: string;
}

// Iceberg 连接器配置（Hive Catalog + iceberg-flink-runtime 原生读取）
export interface IcebergConnectorConfig {
  metastoreUri: string;
  warehouseType: IcebergWarehouseType | string;
  warehouseUri: string;
  s3Region?: string;
  s3Endpoint?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  hdfsNameNode?: string;
}

// Kafka 连接器配置（Topic、字段解析等在接入时配置）
export interface KafkaConnectorConfig {
  brokers: string;
  consumer_group: string;
  topic?: string;
  security_protocol?: string;
  sasl_mechanism?: string;
  username?: string;
  password?: string;
  field_parse_mode?: KafkaFieldParseMode | string;
  message_format?: string;
}

export type ConnectorConfig =
  | SqlConnectorConfig
  | IcebergConnectorConfig
  | ApiConnectorConfig
  | KafkaConnectorConfig;

// 表格行数据
export interface DataSourceItem {
  id: string;
  name: string;
  description?: string;
  dataSourceType: DataSourceType;
  connectorType: 'sql' | 'api' | 'kafka';
  connectionInfo: string;
  connectionStatus: ConnectionStatus;
  creator?: string;
  creatorOrg?: string;
  createTime: string;
  updateTime: string;
  config?: ConnectorConfig;
}

// API 响应
export interface DataSourceListResponse {
  items: DataSourceItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

// API 请求参数
export interface GetDataSourceListParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
  dataSourceTypes?: string[];
  connectionStatuses?: string[];
}

// 数据源表单数据
export interface DataSourceFormData {
  name: string;
  description?: string;
  dataSourceType: DataSourceType;
  // SQL 字段
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  // API 字段
  apiUrl?: string;
  apiMethod?: ApiHttpMethod;
  apiHeaders?: string;
  apiAuthType?: ApiAuthType;
  apiKey?: string;
  apiKeyHeader?: string;
  bearerToken?: string;
  oauth2TokenUrl?: string;
  oauth2ClientId?: string;
  oauth2ClientSecret?: string;
  oauth2Scope?: string;
  oauth2GrantType?: OAuth2GrantType;
  requestBody?: string;
  dataPath?: string;
  timeout?: number;
  // Iceberg 字段
  metastoreUri?: string;
  warehouseType?: IcebergWarehouseType;
  warehouseUri?: string;
  s3Region?: string;
  s3Endpoint?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  hdfsNameNode?: string;
  // Kafka 字段
  brokers?: string;
  topic?: string;
  consumerGroup?: string;
  securityProtocol?: string;
  saslMechanism?: string;
  fieldParseMode?: KafkaFieldParseMode;
  messageFormat?: string;
}
