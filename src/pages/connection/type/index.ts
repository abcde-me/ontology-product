export interface Connection {
  id?: string; // 编辑时才有的 ID
  name?: string; // 连接器名称
  type?: 's3' | 'hdfs'; // 连接器类型（只能是 's3' 或 'hdfs'）
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
