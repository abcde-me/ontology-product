export const DATABASE_TYPE_ENUM = [
  {
    label: 'MySQL',
    value: 'mysql'
  },
  {
    label: 'PostgreSQL',
    value: 'postgresql'
  }
];
// 连接器类型枚举
export enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs',
  mysql = 'mysql',
  postgresql = 'postgresql'
}

export const TYPE_CONFIG = {
  [ConnectorType.S3]: '对象存储(S3)',
  [ConnectorType.HDFS]: 'HDFS',
  [ConnectorType.mysql]: '数据库-MySQL',
  [ConnectorType.postgresql]: '数据库-PostgresSQL'
};
