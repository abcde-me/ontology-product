export const DATABASE_TYPE_ENUM = [
  {
    label: 'MySQL',
    value: 'MySQL'
  },
  {
    label: 'PostgreSQL',
    value: 'PostgreSQL'
  },
  {
    label: 'Elasticsearch',
    value: 'Elasticsearch'
  },
  {
    label: 'Doris',
    value: 'Doris'
  }
];
// 连接器类型枚举
export enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs',
  MySQL = 'MySQL',
  PostgreSQL = 'PostgreSQL',
  Elasticsearch = 'Elasticsearch',
  Doris = 'Doris',
  Kafka = 'Kafka',
  MQ = 'mq'
}

export const TYPE_CONFIG = {
  [ConnectorType.S3]: '对象存储(S3)',
  [ConnectorType.HDFS]: 'HDFS',
  [ConnectorType.MySQL]: '数据库-MySQL',
  [ConnectorType.PostgreSQL]: '数据库-PostgresSQL',
  [ConnectorType.Elasticsearch]: '数据库-Elasticsearch',
  [ConnectorType.Doris]: '数据库-Doris',
  [ConnectorType.Kafka]: '消息队列-Kafka',
  [ConnectorType.MQ]: '消息队列'
};
