import { DataSourceType, ConnectionStatus, DataSourceItem } from '../types';

export const mockDataSource: DataSourceItem[] = [
  {
    id: '1',
    name: '生产环境-MySQL主库',
    description: '生产环境主数据库，存储核心业务数据',
    dataSourceType: DataSourceType.MYSQL,
    connectionInfo: 'mysql://prod-master.example.com:3306/main_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'PROD_MAIN',
    creator: '赵四',
    creatorOrg: '数据供方机构A01',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-03-20 14:25:00'
  },
  {
    id: '2',
    name: '测试环境-MySQL',
    description: '测试环境数据库',
    dataSourceType: DataSourceType.MYSQL,
    connectionInfo: 'mysql://test.example.com:3306/test_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'TEST_01',
    creator: '张三',
    creatorOrg: '数据供方机构A02',
    createTime: '2024-01-20 09:15:00',
    updateTime: '2024-03-18 16:40:00'
  },
  {
    id: '3',
    name: '开发环境-达梦数据库',
    description: '',
    dataSourceType: DataSourceType.DAMENG,
    connectionInfo: 'dm://dev.example.com:5236/dev_db',
    connectionStatus: ConnectionStatus.FAILED,
    creator: '李四',
    creatorOrg: '数据供方机构A01',
    createTime: '2024-02-01 11:20:00',
    updateTime: '2024-03-22 10:15:00'
  },
  {
    id: '4',
    name: '数据仓库-MySQL',
    description: '数据仓库，用于数据分析和报表',
    dataSourceType: DataSourceType.MYSQL,
    connectionInfo: 'mysql://warehouse.example.com:3306/dw_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'DW_MAIN',
    creator: '王五',
    creatorOrg: '数据供方机构A03',
    createTime: '2024-02-10 14:00:00',
    updateTime: '2024-03-21 09:30:00'
  },
  {
    id: '5',
    name: '备份库-达梦数据库',
    description: '备份数据库',
    dataSourceType: DataSourceType.DAMENG,
    connectionInfo: 'dm://backup.example.com:5236/backup_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'BACKUP_01',
    creator: '赵四',
    creatorOrg: '数据供方机构A01',
    createTime: '2024-02-15 16:45:00',
    updateTime: '2024-03-19 11:20:00'
  },
  {
    id: '6',
    name: '日志分析-MySQL',
    description: '',
    dataSourceType: DataSourceType.MYSQL,
    connectionInfo: 'mysql://log-analysis.example.com:3306/logs_db',
    connectionStatus: ConnectionStatus.FAILED,
    creator: '孙六',
    creatorOrg: '数据供方机构A02',
    createTime: '2024-02-20 13:30:00',
    updateTime: '2024-03-20 15:10:00'
  },
  {
    id: '7',
    name: '用户中心-MySQL',
    description: '用户中心数据库，存储用户信息',
    dataSourceType: DataSourceType.MYSQL,
    connectionInfo: 'mysql://user-center.example.com:3306/user_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'USER_CENTER',
    creator: '周七',
    creatorOrg: '数据供方机构A01',
    createTime: '2024-03-01 10:00:00',
    updateTime: '2024-03-22 08:45:00'
  },
  {
    id: '8',
    name: '订单系统-达梦数据库',
    description: '订单系统数据库',
    dataSourceType: DataSourceType.DAMENG,
    connectionInfo: 'dm://order-system.example.com:5236/order_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'ORDER_SYS',
    creator: '吴八',
    creatorOrg: '数据供方机构A03',
    createTime: '2024-03-05 09:30:00',
    updateTime: '2024-03-21 14:20:00'
  },
  {
    id: '9',
    name: '分析平台-PostgreSQL',
    description: '数据分析平台数据库',
    dataSourceType: DataSourceType.POSTGRESQL,
    connectionInfo: 'postgresql://analytics.example.com:5432/analytics_db',
    connectionStatus: ConnectionStatus.SUCCESS,
    databaseIdentifier: 'ANALYTICS',
    creator: '郑九',
    creatorOrg: '数据供方机构A02',
    createTime: '2024-03-10 15:00:00',
    updateTime: '2024-03-22 12:30:00'
  }
];
