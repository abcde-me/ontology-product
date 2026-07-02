import { SyncStatus } from './graphApi';
import type { EmbeddingModelConfig } from '@/config/embeddingDefaults';

export interface ListOntologyObjectTypeReq {
  /**
   * 搜索内容
   */
  filter?: string;
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * 排序规则: asc: 升序, desc: 倒序, 默认倒序
   *
   * Example: desc
   */
  order?: 'asc' | 'desc';
  /**
   * 排序依据
   *
   * Example: name
   */
  orderBy?: string;
  /**
   * mongo 排序规则
   *
   * Example: []{ {order: "desc"}, {id:"asc"} }
   */
  orders?: Record<string, any>[];
  /**
   * 页码
   *
   * Example: 1
   */
  pageNo?: number;
  /**
   * 每页的大小
   *
   * Example: 10
   */
  pageSize?: number;
  /**
   * 同步状态
   */
  syncStatusList?: SyncStatus[];
}

export interface ObjectType {
  /**
   * 对象类型id
   */
  code?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 描述说明
   */
  description?: string;
  /**
   * minio 文件地址
   */
  filePath?: string;
  /**
   * 图标类型
   */
  icon?: string;
  /**
   * ID,唯一标识
   */
  id: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * TIDB中的库名称
   */
  ontologyDbName?: string;
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * TIDB中的 表名称
   */
  ontologyTableName?: string;
  /**
   * 原始数据库名称
   */
  originalDbName?: string;
  /**
   * 原始表名称
   */
  originalTableName?: string;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  sourceType?: number;
  /**
   * 同步状态
   */
  syncStatus: SyncStatus;
  /**
   * 同步时间
   */
  syncTime?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
  /**
   * 是否启用数据源同步
   */
  enableSyncSourceData?: boolean;
  /**
   * 是否开启同步
   */
  syncEnabled?: boolean;
  /**
   * funnel服务同步任务id（下划线命名）
   */
  funnel_task_id?: number;
}

export interface ListOntologyObjectTypeRes {
  result: ObjectType[];
  totalCount: number;
}

export interface CreateOntologyPhysicalProperty {
  /**
   * 字段类型
   */
  columnType: string;
  /**
   * 属性名称
   */
  comment: string;
  /**
   * id,唯一标识
   */
  id?: number;
  /**
   * 是否主键
   */
  isPrimary: 1 | 0;
  /**
   * 表字段
   */
  name: string;
  /**
   * 关联公共属性ID
   */
  publicPropertyID: number;
  /**
   * 是否选中
   */
  isUse: 1 | 0;
  /**
   * 是否存入公共属性库
   */
  isStoreAsPublic: 1 | 0;
  /**
   * 是否向量化
   */
  isVector?: 1 | 0;
  /**
   * 向量源字段
   */
  vectorSourceFieldName?: string;
  /**
   * 数据源表名
   */
  sourceTableName?: string;
}

export type { EmbeddingModelConfig };

export enum SourceType {
  ICEBERG = 1,
  FILE_UPLOAD = 2
}

export interface SourceDataInfo {
  /**
   * 数据源id（连接器id）
   */
  connectorId?: number;
  /**
   * 数据库名称
   */
  databaseName?: string;
  /**
   * 数据源查询模式，“selected”：选择数据表，“sql”：自定义sql
   */
  queryMode: 'selected' | 'sql' | string;
  /**
   * 自定义sql
   */
  sql?: string;
  /**
   * 数据表名称
   */
  tableName?: string;
}

/** ConnectorAnalyseFinkSQLColumns 返回的单列结构 */
export interface ConnectorAnalyseFinkSqlColumnItem {
  columnName: string;
  columnType: string;
  columnTable?: string;
  columnOriginName?: string;
  CoumnOriginName?: string;
  primaryKey?: string[];
  [key: string]: unknown;
}

export interface OntologyPhysicalPropertiesList {
  /**
   * 是否主键，1：是，0：否
   */
  isPrimary?: number;
  /**
   * 是否向量化，1：是，0：否
   */
  isVector: number;
  /**
   * 属性名称（注释）
   */
  propertyComment?: string;
  /**
   * 属性记录ID，创建时传0
   */
  propertyID: number;
  /**
   * 属性业务id
   */
  propertyName: string;
  /**
   * 属性类型，示例：varchar(2000)
   */
  propertyType: string;
  /**
   * 公共属性ID
   */
  publicPropertyID?: number;
  /**
   * 数据源表字段注释
   */
  sourceColumnComment: string;
  /**
   * 数据源表字段类型
   */
  sourceColumnType?: string;
  /**
   * 数据源表字段名
   */
  sourceColumnName: string;
  /**
   * 数据源原始字段名
   */
  sourceCoumnOriginName?: string;
  /**
   * 数据源表名
   */
  sourceTableName?: string;
  /**
   * 数据源主键
   */
  sourcePrimaryKey?: string[];
  /**
   * 向量源字段
   */
  vectorSourceFieldName?: string;
}

export interface SyncStrategy {
  /**
   * 冲突策略，保留数据源-"KEEP_SOURCE";保留目标表-"KEEP_TARGET"
   */
  conflictStrategy: string;
  /**
   * 异常策略，立即停止-"STOP_ON_ERROR";继续消费-"LOG_ERROR_AND_CONTINUE"
   */
  exceptionStrategy: string;
  /**
   * 轮询-断点辅助列（轮询模式下必填）
   */
  jdbcCheckpointField: string;
  /**
   * 轮询-增量时间列（轮询模式下必填）
   */
  jdbcIncrementalTimeField: string;
  /**
   * 轮询-轮询间隔
   */
  jdbcPollingIntervalSeconds?: number;
  /**
   * 轮询-全量sql
   */
  jdbcSyncSqlFull?: string;
  /**
   * 轮询-增量sql
   */
  jdbcSyncSqlIncrement?: string;
  /**
   * API 定时拉取 - 增量时间参数名（写入请求 query/body，值为上次同步时间）
   */
  apiIncrementalTimeParam?: string;
  /**
   * API 定时拉取 - 游标/断点参数名（写入请求 query/body，值为上次断点）
   */
  apiCheckpointParam?: string;
  /**
   * API 定时拉取 - 响应体增量判定字段（从单条记录取值以更新断点）
   */
  apiIncrementalMarkerField?: string;
  /**
   * 同步模式，CDC-"BINLOG_CDC"; 轮询-"JDBC_POLLING";
   * 消息队列-"KAFKA_CDC"（仅实时消费）; API-"API_PUSH"（实时接收）/"API_POLLING"（定时拉取）; CSV-"CSV_IMPORT"
   */
  mode: string;
  /**
   * 并行度
   */
  parallelism: number;
  /**
   * 单次拉取数量
   */
  pollFetchSize: number;
  /**
   * 全量同步批次大小
   */
  fullSyncBatchSize: number;
  /**
   * 同步范围，增量-"INCREMENTAL";全量-"FULL";全量+增量-"FULL_THEN_INCREMENTAL"
   */
  syncScope: string;
}

/** OntologyTestFinkSQL 请求体中的同步策略；含 sourceDataInfo 时与创建/更新同步接口结构对齐 */
export type OntologyTestFinkSQLSyncStrategyPayload = Omit<
  SyncStrategy,
  'fullSyncBatchSize'
> & {
  fullSyncBatchSize?: number;
  sourceDataInfo?: SourceDataInfo;
};

export interface OntologyTestFinkSQLReq {
  projectID: string;
  sourceDataInfo: SourceDataInfo;
  taskType: string;
  syncSourceDataStrategy?: OntologyTestFinkSQLSyncStrategyPayload;
}

export interface SyncSourceDataStrategy extends SyncStrategy {
  sourceDataInfo?: SourceDataInfo;
  /**
   * 后端创建接口校验的同步策略结构
   */
  syncStrategy?: SyncStrategy;
}

export interface OntologyObjectTypeDetailSourceDataInfo
  extends Partial<SourceDataInfo> {
  connectorName?: string;
  connectorType?: string;
  connectorSubtype?: string;
}

export interface OntologyObjectTypeDetailSyncSourceDataStrategy
  extends Partial<Omit<SyncSourceDataStrategy, 'sourceDataInfo'>> {
  sourceDataInfo?: OntologyObjectTypeDetailSourceDataInfo;
}

export interface BindOntologyObjectTypeReq {
  /**
   * 目标本体场景库 ID
   */
  ontologyModelID: number;
  /**
   * 待绑定的已有对象类型 ID
   */
  objectTypeID: number;
}

export interface CreateOntologyObjectTypeReq {
  /**
   * 对象类型id
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 本地CSV导入的文件地址
   */
  filePath?: string;
  /**
   * 创建模式，只建模不导入数据-"false";建模并导入数据-"true"
   */
  enableSyncSourceData?: boolean;
  /**
   * 图标类型
   */
  icon: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 本体模型ID
   */
  ontologyModelID: number;
  /**
   * 复用已有对象类型时传入，绑定到目标场景库
   */
  reuseObjectTypeID?: number;
  /**
   * 物理属性列表
   */
  ontologyPhysicalPropertiesList?:
    | CreateOntologyPhysicalProperty[]
    | OntologyPhysicalPropertiesList[];
  /**
   * 数据库名称
   */
  originalDbName: string;
  /**
   * 数据库中的表名称
   */
  originalTableName: string;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  sourceType?: SourceType;
  /**
   * 建模数据源信息
   */
  sourceDataInfo?: SourceDataInfo;
  /**
   * 同步策略信息
   */
  syncSourceDataStrategy?: SyncSourceDataStrategy;
  /**
   * 向量化字段使用的 Embedding 模型配置（存在 isVector=1 字段时附带）
   */
  embeddingModel?: EmbeddingModelConfig;
}

export interface UpdateOntologyObjectTypeReq
  extends CreateOntologyObjectTypeReq {
  /**
   * 对象类型id
   */
  id: number;
  /**
   * 本地 CSV 是否重新上传：1-是，0-否
   */
  isReUpload?: number;
}

export interface GetOntologyObjectTypeDetailRes
  extends Omit<
    CreateOntologyObjectTypeReq,
    'sourceDataInfo' | 'syncSourceDataStrategy'
  > {
  id: number;
  /**
   * 同步状态
   */
  syncStatus: SyncStatus;
  /**
   * 数据源信息
   */
  sourceDataInfo?: OntologyObjectTypeDetailSourceDataInfo;
  /**
   * 是否启用数据源同步
   */
  enableSyncSourceData?: boolean;
  /**
   * 是否开启实例同步任务（与列表、编辑页可用性一致）
   */
  syncEnabled?: boolean;
  /**
   * 同步策略信息
   */
  syncSourceDataStrategy?: {
    sourceDataInfo?: {
      queryMode?: string;
      connectorId?: number;
      connectorName?: string;
      connectorType?: string;
      connectorSubtype?: string;
      databaseName?: string;
      tableName?: string;
      sql?: string;
    };
    mode?: string;
    conflictStrategy?: string;
    syncScope?: string;
    pollFetchSize?: number;
    fullSyncBatchSize?: number;
    parallelism?: number;
    exceptionStrategy?: string;
    jdbcCheckpointField?: string;
    jdbcIncrementalTimeField?: string;
    jdbcPollingIntervalSeconds?: number;
    jdbcSyncSqlFull?: string;
    jdbcSyncSqlIncrement?: string;
    apiIncrementalTimeParam?: string;
    apiCheckpointParam?: string;
    apiIncrementalMarkerField?: string;
    syncStrategy?: Partial<SyncStrategy>;
  };
}

export interface UploadOntologyCSVFileAndParseRes {
  data: {
    columnList: string[];
    path: string;
  };
}

export interface ListConnectorsReq {
  name?: string;
  page?: number;
  page_size?: number;
  projectID?: string;
  sort?: 'asc' | 'desc' | string;
  sort_by?: 'create_time' | 'update_time' | string;
  status?: string[];
  subtype?: string[];
  type: string;
}

export interface SqlConnectorItem {
  id: number;
  name: string;
  subtype?: string;
  [property: string]: any;
}

export type ListConnectorsRes =
  | SqlConnectorItem[]
  | {
      items: SqlConnectorItem[];
      total?: number;
      page?: number;
      page_size?: number;
      [property: string]: any;
    };

export interface ListSqlConnectorDBAndTablesReq {
  /** 连接器 id */
  id: number;
  /** 项目 id（鉴权） */
  projectID: string;
}

export interface SqlConnectorTableItem {
  name: string;
  [property: string]: any;
}

export interface SqlConnectorDatabaseItem {
  database_name: string;
  tables: SqlConnectorTableItem[];
  [property: string]: any;
}

export type ListSqlConnectorDBAndTablesRes = SqlConnectorDatabaseItem[];

export interface GetSqlConnectorTableSchemaReq {
  database_name: string;
  id: number;
  projectID?: string;
  table_name: string;
}

export interface GetSqlConnectorTableSchemaToTIDBReq {
  /** 数据库名称 */
  database_name: string;
  /** 连接器 id */
  id: number;
  /** 项目 id（鉴权使用） */
  projectID: string;
  /** 数据表名称 */
  table_name: string;
  [property: string]: any;
}

export interface SqlConnectorSchemaField {
  field_comment: string;
  field_id: string;
  field_type: string;
  [property: string]: any;
}

export type GetSqlConnectorTableSchemaRes = SqlConnectorSchemaField[];

export interface SqlConnectorTiDBSchemaColumn {
  /** 字段注释 */
  columnComment: string;
  /** 字段名 */
  columnName: string;
  /** 字段类型 */
  columnType: string;
  /** 字段类型（TIDB） */
  columnTypeTiDB?: string;
  /** 后端历史拼写：colunmTypeTiDB */
  colunmTypeTiDB?: string;
  [property: string]: any;
}

export interface GetSqlConnectorTableSchemaToTIDBRes {
  columns: SqlConnectorTiDBSchemaColumn[] | SqlConnectorTiDBSchemaColumn;
  /** 主键 */
  primaryKey: string[];
  [property: string]: any;
}

export interface MapOntologyObjectTypeColumnsReq {
  objectTypeColumns: string[];
  sourceTableColumns: string[];
}

export interface MapRelation {
  objectTypeColumnName: string;
  sourceTableColumnName: string;
  [property: string]: any;
}

export interface MapOntologyObjectTypeColumnsRes {
  mapRelations: MapRelation[];
  [property: string]: any;
}

export interface MetadataMenuItem {
  id: number;
  databaseName: string;
}

export interface ListMetadataIcebergDatabaseNameRes {
  data: MetadataMenuItem[];
}

export interface ListMetadataIcebergTableReq {
  pageNum?: number;
  pageSize?: number;
  filters?: {
    databaseId: number;
  };
}

export interface IcebergTableItem {
  /**
   * 表ID
   */
  id: number;
  /**
   * 表名
   */
  tableName: string;
  /**
   * 表中文名/描述
   */
  description: string;
  /**
   * 数据库ID
   */
  databaseId: number;
  /**
   * 数据库名称
   */
  databaseName: string;
  /**
   * 分区字段,多个分区字段的话,英文逗号分隔
   */
  partitionKey: string;
  /**
   * 分区数量
   */
  partitionNum: number;
  /**
   * 存储大小
   */
  storageSize: string;
  /**
   * 文件存储位置
   */
  storageLocation: string;
  /**
   * 表类型
   */
  tableType: string;
  /**
   * 文件数
   */
  fileNum: string;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新时间
   */
  updataTime: string;
  /**
   * 最近访问时间
   */
  lastTime: string;
  /**
   * 表创建语句
   */
  createSql: string;
}

export interface ListMetadataIcebergTableRes {
  data: {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页码
     */
    pageNum: number;
    /**
     * 每页大小
     */
    pageSize: number;
    /**
     * 当前页记录数
     */
    size: number;
    /**
     * 起始行号
     */
    startRow: number;
    /**
     * 结束行号
     */
    endRow: number;
    /**
     * 总页数
     */
    pages: number;
    /**
     * 上一页页码
     */
    prePage: number;
    /**
     * 下一页页码
     */
    nextPage: number;
    /**
     * 是否第一页
     */
    isFirstPage: boolean;
    /**
     * 是否最后一页
     */
    isLastPage: boolean;
    /**
     * 是否有上一页
     */
    hasPreviousPage: boolean;
    /**
     * 是否有下一页
     */
    hasNextPage: boolean;
    /**
     * 导航页码数
     */
    navigatePages: number;
    /**
     * 导航页码数组
     */
    navigatepageNums: number[];
    /**
     * 导航第一页
     */
    navigateFirstPage: number;
    /**
     * 导航最后一页
     */
    navigateLastPage: number;
    /**
     * 表列表
     */
    list: IcebergTableItem[];
  };
}

export interface ListMetadataIcebergTiDBTableReq {
  pageNum?: number;
  pageSize?: number;
  filters?: {
    tableId: number;
  };
}

export interface TiDBTableFieldItem {
  /**
   * 字段ID
   */
  id: number;
  /**
   * 表字段
   */
  fieldName: string;
  /**
   * 表中文名/描述
   */
  description: string;
  /**
   * 字段类型
   */
  dataType: string;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新时间
   */
  updataTime: string;
}

export interface ListMetadataIcebergTiDBTableRes {
  data: {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 表字段列表
     */
    list: TiDBTableFieldItem[];
    /**
     * 当前页码
     */
    pageNum: number;
    /**
     * 每页大小
     */
    pageSize: number;
    /**
     * 当前页记录数
     */
    size: number;
    /**
     * 起始行号
     */
    startRow: number;
    /**
     * 结束行号
     */
    endRow: number;
    /**
     * 总页数
     */
    pages: number;
    /**
     * 上一页页码
     */
    prePage: number;
    /**
     * 下一页页码
     */
    nextPage: number;
    /**
     * 是否第一页
     */
    isFirstPage: boolean;
    /**
     * 是否最后一页
     */
    isLastPage: boolean;
    /**
     * 是否有上一页
     */
    hasPreviousPage: boolean;
    /**
     * 是否有下一页
     */
    hasNextPage: boolean;
    /**
     * 导航页码数
     */
    navigatePages: number;
    /**
     * 导航页码数组
     */
    navigatepageNums: number[];
    /**
     * 导航第一页
     */
    navigateFirstPage: number;
    /**
     * 导航最后一页
     */
    navigateLastPage: number;
  };
}
