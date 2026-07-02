import {
  DataSourceType,
  ConnectionStatus,
  DataSourceItem,
  ApiAuthType,
  ApiHttpMethod
} from '../types';

export const mockDataSource: DataSourceItem[] = [
  {
    id: '1',
    name: '生产环境-MySQL主库',
    description: '生产环境主数据库，存储核心业务数据',
    dataSourceType: DataSourceType.MYSQL,
    connectorType: 'sql',
    connectionInfo: 'mysql://prod-master.example.com:3306/main_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '赵四',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-05-03 10:30:00',
    updateTime: '2026-06-05 14:25:00'
  },
  {
    id: '2',
    name: '测试环境-MySQL',
    description: '测试环境数据库',
    dataSourceType: DataSourceType.MYSQL,
    connectorType: 'sql',
    connectionInfo: 'mysql://test.example.com:3306/test_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '张三',
    creatorOrg: '数据供方机构A02',
    createTime: '2026-05-06 09:15:00',
    updateTime: '2026-06-03 16:40:00'
  },
  {
    id: '3',
    name: '开发环境-达梦数据库',
    description: '',
    dataSourceType: DataSourceType.DAMENG,
    connectorType: 'sql',
    connectionInfo: 'dm://dev.example.com:5236/dev_db',
    connectionStatus: ConnectionStatus.FAILED,
    creator: '李四',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-05-09 11:20:00',
    updateTime: '2026-06-07 10:15:00'
  },
  {
    id: '4',
    name: '数据仓库-MySQL',
    description: '数据仓库，用于数据分析和报表',
    dataSourceType: DataSourceType.MYSQL,
    connectorType: 'sql',
    connectionInfo: 'mysql://warehouse.example.com:3306/dw_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '王五',
    creatorOrg: '数据供方机构A03',
    createTime: '2026-05-12 14:00:00',
    updateTime: '2026-06-06 09:30:00'
  },
  {
    id: '5',
    name: '备份库-达梦数据库',
    description: '备份数据库',
    dataSourceType: DataSourceType.DAMENG,
    connectorType: 'sql',
    connectionInfo: 'dm://backup.example.com:5236/backup_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '赵四',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-05-15 16:45:00',
    updateTime: '2026-06-04 11:20:00'
  },
  {
    id: '6',
    name: '日志分析-MySQL',
    description: '',
    dataSourceType: DataSourceType.MYSQL,
    connectorType: 'sql',
    connectionInfo: 'mysql://log-analysis.example.com:3306/logs_db',
    connectionStatus: ConnectionStatus.FAILED,
    creator: '孙六',
    creatorOrg: '数据供方机构A02',
    createTime: '2026-05-18 13:30:00',
    updateTime: '2026-06-05 15:10:00'
  },
  {
    id: '7',
    name: '用户中心-MySQL',
    description: '用户中心数据库，存储用户信息',
    dataSourceType: DataSourceType.MYSQL,
    connectorType: 'sql',
    connectionInfo: 'mysql://user-center.example.com:3306/user_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '周七',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-05-21 10:00:00',
    updateTime: '2026-06-07 08:45:00'
  },
  {
    id: '8',
    name: '订单系统-达梦数据库',
    description: '订单系统数据库',
    dataSourceType: DataSourceType.DAMENG,
    connectorType: 'sql',
    connectionInfo: 'dm://order-system.example.com:5236/order_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '吴八',
    creatorOrg: '数据供方机构A03',
    createTime: '2026-05-24 09:30:00',
    updateTime: '2026-06-06 14:20:00'
  },
  {
    id: '9',
    name: '分析平台-Postgre',
    description: '数据分析平台数据库',
    dataSourceType: DataSourceType.POSTGRES,
    connectorType: 'sql',
    connectionInfo: 'postgres://analytics.example.com:5432/analytics_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '郑九',
    creatorOrg: '数据供方机构A02',
    createTime: '2026-05-27 15:00:00',
    updateTime: '2026-06-07 12:30:00'
  },
  {
    id: '10',
    name: '指挥系统-Postgre',
    description: '联合作战指挥业务库，存储任务与态势数据',
    dataSourceType: DataSourceType.POSTGRES,
    connectorType: 'sql',
    connectionInfo: 'postgres://command.example.com:5432/command_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '钱十',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-06-02 09:20:00',
    updateTime: '2026-06-08 10:15:00'
  },
  {
    id: '11',
    name: '湖仓平台-Iceberg',
    description: 'Iceberg 湖仓一体数据目录，承载多模态分析表',
    dataSourceType: DataSourceType.ICEBERG,
    connectorType: 'sql',
    connectionInfo:
      'iceberg://catalog.hive.example.com:9083/lakehouse_warehouse',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '孙十一',
    creatorOrg: '数据供方机构A03',
    createTime: '2026-06-07 11:40:00',
    updateTime: '2026-06-09 16:50:00'
  },
  {
    id: '12',
    name: '第三方态势 API',
    description: '从第三方 REST API 拉取实时态势数据',
    dataSourceType: DataSourceType.API,
    connectorType: 'api',
    connectionInfo: 'api://GET https://api.situation.example.com/v1/events',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '陈十二',
    creatorOrg: '数据供方机构A01',
    createTime: '2026-06-08 09:10:00',
    updateTime: '2026-06-09 11:20:00',
    config: {
      url: 'https://api.situation.example.com/v1/events',
      method: ApiHttpMethod.GET,
      auth_type: ApiAuthType.API_KEY,
      api_key_header: 'X-API-Key',
      data_path: '$.data.items',
      timeout: '30'
    }
  },
  {
    id: '13',
    name: '传感器实时流-Kafka',
    description: '传感器上报实时数据流，自动解析 JSON 字段',
    dataSourceType: DataSourceType.KAFKA,
    connectorType: 'kafka',
    connectionInfo:
      'kafka://kafka1.example.com:9092,kafka2.example.com:9092 (sensor-consumer)',
    connectionStatus: ConnectionStatus.SUCCESS,
    creator: '林十三',
    creatorOrg: '数据供方机构A02',
    createTime: '2026-06-09 14:30:00',
    updateTime: '2026-06-10 08:45:00',
    config: {
      brokers: 'kafka1.example.com:9092,kafka2.example.com:9092',
      consumer_group: 'sensor-consumer',
      security_protocol: 'PLAINTEXT',
      topic:
        'sensor.raw.readings,sensor.aggregated.metrics,sensor.alerts,device.telemetry,device.status.events'
    }
  }
];
