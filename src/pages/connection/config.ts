export const DATABASE_TYPE_ENUM = [
  {
    label: 'MySQL',
    value: 'MySQL'
  },
  {
    label: 'PostgreSQL',
    value: 'PostgreSQL'
  }
];
// 连接器类型枚举
export enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs',
  MySQL = 'MySQL',
  PostgreSQL = 'PostgreSQL'
}

export const TYPE_CONFIG = {
  [ConnectorType.S3]: '对象存储(S3)',
  [ConnectorType.HDFS]: 'HDFS',
  [ConnectorType.MySQL]: '数据库-MySQL',
  [ConnectorType.PostgreSQL]: '数据库-PostgresSQL'
};
