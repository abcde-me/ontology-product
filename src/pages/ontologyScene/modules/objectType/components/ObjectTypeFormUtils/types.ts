import {
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList,
  SourceType
} from '@/types/objectType';
import {
  DataSourceType,
  InstanceSyncSourceType,
  KafkaArrayHandleMode,
  KafkaMessageParseMode,
  KafkaStructuredParseRule
} from '@/pages/ontologyScene/common/constants';

export interface FileData {
  columnList: string[];
  commentList: string[];
  typeList: string[];
  path: string;
}

// 使用接口定义的字段名
export interface AttributeField extends CreateOntologyPhysicalProperty {
  // 为了UI显示，保留一些临时字段
  _tableField?: string; // 用于显示表字段名（对应 name）
  _attributeName?: string; // 用于显示属性名称（对应 comment）
  _storedPublicPropertyId?: number; // 存入公共属性时创建的ID（与publicPropertyID区分，publicPropertyID用于绑定已有公共属性）
  /** 是否开启向量化（仅 UI，提交时展开为 isVector=1 的记录） */
  _vectorizationOn?: boolean;
  /** 向量属性的属性名称（comment），默认基字段 comment + _vector */
  _vectorComment?: string;
  /** 编辑态下后端返回的向量属性 id */
  _vectorPropertyId?: string | number;
}

export interface SqlSourceDataInfo {
  connectorId?: number;
  connectorName?: string;
  connectorSubtype?: string;
  databaseName?: string;
  tableName?: string;
  projectID?: string;
  queryMode: 'selected' | 'sql';
  sql?: string;
}

export interface SourceTableField {
  fieldId: string;
  fieldComment: string;
  fieldType: string;
}

export interface ObjectTypeAttributeField {
  key: string;
  backendPropertyID?: number;
  propertyID: string;
  propertyComment: string;
  propertyType: string;
  isPrimary: 1 | 0;
  isStoreAsPublic: 1 | 0;
  publicPropertyID?: number;
  isVector?: 1 | 0;
  sourceColumnName: string;
  sourceColumnComment: string;
  sourceColumnType?: string;
  sourceCoumnOriginName?: string;
  /** 提交时写入 ontologyPhysicalPropertiesList.sourceTableName（选表=表名；自定义 SQL=解析 columnTable） */
  sourceTableName?: string;
  _storedPublicPropertyId?: number;
  _vectorizationOn?: boolean;
  _vectorComment?: string;
  _vectorPropertyId?: string | number;
}

export interface InstanceSyncMappingField {
  key: string;
  sourceColumnName?: string;
  sourceColumnComment?: string;
  sourceColumnType?: string;
  sourceCoumnOriginName?: string;
  propertyID: string;
  propertyComment: string;
  propertyType: string;
  isPrimary: 1 | 0;
  isVector: 1 | 0;
  _vectorComment?: string;
  _vectorPropertyId?: string | number;
}

export interface ObjectTypeDataSourceState {
  type: DataSourceType;
  connectorId?: number;
  connectorName?: string;
  connectorSubtype?: string;
  database?: string;
  table?: string;
  /** 数据资源目录表 id（主表） */
  dataResourceId?: string;
  /** 数据资源目录表 id 列表（多选） */
  dataResourceIds?: string[];
  /** 已选数据资源表名列表 */
  tables?: string[];
  file?: any;
  filePath?: string;
  queryMode?: 'selected' | 'sql';
  sql?: string;
}

export interface SyncSourceDataStrategyFormState {
  /** 实例同步数据源类型 */
  instanceSyncSourceType?: InstanceSyncSourceType;
  /** CSV上传：实例数据文件路径 */
  instanceCsvFilePath?: string;
  /** 消息队列：连接器 id */
  messageQueueConnectorId?: number;
  /** 消息队列：Topic */
  messageQueueTopic?: string;
  /** 消息队列：解析模式（不解析 / 解析为结构化字段） */
  messageQueueParseMode?: KafkaMessageParseMode;
  /** 消息队列：结构化解析规则（默认规则 / AI生成 / 路径解析） */
  messageQueueStructuredParseRule?: KafkaStructuredParseRule;
  /** 消息队列：最大展平深度（解析模式下，默认 2） */
  messageQueueMaxFlattenDepth?: number;
  /** 消息队列：数组处理模式 */
  messageQueueArrayHandleMode?: KafkaArrayHandleMode;
  /** 消息队列：AI 规则生成提示词 */
  messageQueueAiRulePrompt?: string;
  /** 消息队列：AI 生成并已入库的解析规则（JSON 字符串） */
  messageQueueAiRuleContent?: string;
  /** 消息队列：AI 规则入库时间（ISO 8601） */
  messageQueueAiRuleSavedAt?: string;
  /** 消息队列：规则测试解析出的源字段（用于实例同步映射） */
  messageQueueParseResultFields?: SourceTableField[];
  /** API接口：连接器 id */
  apiConnectorId?: number;
  /** 文件解析：数据资源文件 id */
  fileResourceId?: string;
  /** 文件解析：提取要求 */
  fileParseRequirement?: string;
  /** 文件解析：已保存的解析结果行 */
  fileParseResultRows?: Record<string, string>[];
  /** 文件解析：与 rows 对应的解析上下文标识 */
  fileParseResultRunKey?: string;
  sourceDataInfo: SqlSourceDataInfo;
  mode: string;
  conflictStrategy: string;
  syncScope: string;
  pollFetchSize: number;
  fullSyncBatchSize?: number;
  parallelism: number;
  exceptionStrategy: string;
  jdbcCheckpointField?: string;
  jdbcIncrementalTimeField?: string;
  jdbcPollingIntervalSeconds?: number;
  jdbcSyncSqlFull?: string;
  jdbcSyncSqlIncrement?: string;
  /** API 定时拉取：增量时间参数名 */
  apiIncrementalTimeParam?: string;
  /** API 定时拉取：游标/断点参数名 */
  apiCheckpointParam?: string;
  /** API 定时拉取：响应体增量判定字段 */
  apiIncrementalMarkerField?: string;
  /** API 定时拉取：每页大小参数名 */
  apiPageSizeParam?: string;
  /** API 定时拉取：页号参数名 */
  apiPageNumParam?: string;
  /** API 定时拉取：总数参数名 */
  apiTotalCountParam?: string;
  /** API 定时拉取：起始页号 */
  apiStartPageNum?: number;
}

export interface ObjectTypeFormData {
  code: string;
  name: string;
  description?: string;
  icon: string;
  ontologyModelID: number;
  filePath?: string;
  originalDbName: string;
  originalTableName: string;
  sourceType?: SourceType;
  ontologyPhysicalPropertiesList?:
    | CreateOntologyPhysicalProperty[]
    | OntologyPhysicalPropertiesList[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  sourceDataInfo?: SqlSourceDataInfo;
  enableSyncSourceData?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  isReUpload?: boolean;
  // 内部使用的字段
  _dataSource?: ObjectTypeDataSourceState;
}
