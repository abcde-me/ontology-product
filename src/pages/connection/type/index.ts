export enum Connection {
  S3 = 's3',
  HDFS = 'hdfs'
}
export interface ConnectionType {
  id?: string; // 编辑时才有的 ID
  name?: string; // 连接器名称
  type?: Connection; // 连接器类型（只能是 's3' 或 'hdfs'）
  config?: {
    // 连接配置信息
    endpoint?: string;
    access_key?: string;
    secret_key?: string;
    region?: string;
    path?: string;
    host?: string;
    port?: string;
    user?: string;
  };
  creator?: string; // 创建者
}
interface s3Type {
  access_key: String;
  secret_key: String;
  endpoint: String;
  path: String;
}
interface hdfsType {
  host: String;
  port: String;
  user: String;
  path: String;
}

// 连接器详情数据类型
export interface connectorDetailType {
  id: Number;
  name: String;
  type: String;
  config: {
    access_key?: String;
    secret_key?: String;
    endpoint?: String;
    path?: String;
    host?: String;
    port?: String;
    user?: String;
  };
  creator: String;
  created_at: String;
  updated_at: String;
  status: String;
  perms: Array<String> | null;
}
