/**
 * 数据源类型枚举
 */
export enum SourceType {
  DATABASE = 1, // 数据库/表（连接器）
  FILE = 2 // 文件上传
}

/**
 * 查询模式枚举
 */
export enum QueryMode {
  SELECTED = 'selected', // 选择数据表
  SQL = 'sql' // 自定义SQL
}

/**
 * 同步模式枚举
 */
export enum SyncMode {
  BINLOG_CDC = 'BINLOG_CDC', // CDC
  JDBC_POLLING = 'JDBC_POLLING' // 轮询
}

/**
 * 冲突策略枚举
 */
export enum ConflictStrategy {
  KEEP_SOURCE = 'KEEP_SOURCE', // 保留数据源
  KEEP_TARGET = 'KEEP_TARGET' // 保留目标表
}

/**
 * 同步范围枚举
 */
export enum SyncScope {
  INCREMENTAL = 'INCREMENTAL', // 增量
  FULL = 'FULL', // 全量
  FULL_THEN_INCREMENTAL = 'FULL_THEN_INCREMENTAL' // 全量+增量
}

/**
 * 异常策略枚举
 */
export enum ExceptionStrategy {
  STOP_ON_ERROR = 'STOP_ON_ERROR', // 立即停止
  LOG_ERROR_AND_CONTINUE = 'LOG_ERROR_AND_CONTINUE' // 继续消费
}

/**
 * 数据源信息
 */
export interface SourceDataInfo {
  queryMode?: QueryMode | string;
  connectorId?: number;
  connectorName?: string;
  connectorType?: string;
  connectorSubtype?: string;
  databaseName?: string;
  tableName?: string;
  sql?: string;
}

/**
 * 同步策略信息
 */
export interface SyncSourceDataStrategy {
  sourceDataInfo?: SourceDataInfo;
  mode?: SyncMode | string;
  conflictStrategy?: ConflictStrategy | string;
  syncScope?: SyncScope | string;
  pollFetchSize?: number;
  parallelism?: number;
  exceptionStrategy?: ExceptionStrategy | string;
  jdbcCheckpointField?: string;
  jdbcIncrementalTimeField?: string;
  jdbcPollingIntervalSeconds?: number;
  jdbcSyncSqlFull?: string;
  jdbcSyncSqlIncrement?: string;
}

/**
 * 对象类型详情数据（扩展）
 */
export interface ObjectTypeDetailWithSync {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  filePath?: string;
  sourceType?: SourceType;
  enableSyncSourceData?: boolean;
  sourceDataInfo?: SourceDataInfo;
  syncSourceDataStrategy?: SyncSourceDataStrategy;
  syncStatus?: number;
  syncTime?: string;
  syncFailureReason?: string;
  createTime?: string;
  createUser?: string;
  updateTime?: string;
  updateUser?: string;
}
