// 数据源类型枚举
export enum DataSourceType {
  MYSQL = 'mysql',
  DAMENG = 'dameng',
  POSTGRESQL = 'postgresql'
}

// 连接状态枚举
export enum ConnectionStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

// 表格行数据
export interface DataSourceItem {
  id: string;
  name: string;
  description?: string;
  dataSourceType: DataSourceType;
  connectionInfo: string;
  connectionStatus: ConnectionStatus;
  creator?: string;
  creatorOrg?: string;
  createTime: string;
  updateTime: string;
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
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
}
