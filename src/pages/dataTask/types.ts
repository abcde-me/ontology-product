// 任务类型
export enum TaskType {
  TABLE_SYNC = 'table_sync',
  WORKFLOW_DAG = 'workflow_dag'
}

// 调度方式
export enum ScheduleType {
  PERIODIC = 'periodic',
  ONCE = 'once',
  IMMEDIATE = 'immediate'
}

// 任务状态
export enum TaskStatus {
  DEVELOPING = 'developing',
  PUBLISHING = 'publishing',
  ONLINE = 'online',
  OFFLINE = 'offline'
}

// 最新执行状态
export enum ExecutionStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/** DAG 节点类型 */
export enum DataTaskNodeType {
  START = 'start',
  DATA_SOURCE = 'data-source',
  INFERENCE_AGENT = 'inference-agent',
  FILE_PARSE = 'file-parse',
  VIDEO_FRAME = 'video-frame',
  OCR = 'ocr',
  AUDIO_TEXT = 'audio-text',
  SQL = 'sql',
  JSON_PARSE = 'json-parse',
  LOGIC = 'logic',
  LOOP = 'loop',
  SCRIPT = 'script',
  DESENSITIZE = 'desensitize',
  ONTOLOGY = 'ontology'
}

/** 节点输出字段（供下游引用） */
export interface DataTaskNodeOutputField {
  variable: string;
  type: string;
  des?: string;
}

/** 节点输入字段（引用上游输出） */
export interface DataTaskNodeInputField {
  variable: string;
  value_selector: string[];
  label?: string;
}

/** 数据任务数据源节点配置 */
export interface DataSourceNodeConfig {
  sourceName?: string;
  sourceType: DataTaskSourceType;
  documentFilePath?: string;
  documentFileName?: string;
  sourceDataInfo?: {
    connectorId?: number;
    connectorName?: string;
    connectorSubtype?: string;
    databaseName?: string;
    tableName?: string;
    projectID?: string;
    queryMode: 'selected' | 'sql';
    sql?: string;
  };
  messageQueueConnectorId?: number;
  messageQueueConnectorName?: string;
  messageQueueTopic?: string;
  apiConnectorId?: number;
  apiConnectorName?: string;
}

export type DataTaskSourceType =
  import('./constants/dataSourceTypes').DataTaskSourceType;

export { DATA_TASK_SOURCE_TYPE } from './constants/dataSourceTypes';

/** 本体对象类型节点配置 */
export interface ObjectTypeNodeConfig {
  ontologyModelID?: number;
  ontologyModelName?: string;
  objectTypeId?: number;
  objectTypeName?: string;
  objectTypeCode?: string;
  /** 冲突策略：保留数据源 / 保留目标表 */
  conflictStrategy?: 'KEEP_SOURCE' | 'KEEP_TARGET';
  /** 并行数 */
  parallelism?: number;
  /** 异常策略：立即停止 / 继续消费 */
  exceptionStrategy?: 'STOP_ON_ERROR' | 'LOG_ERROR_AND_CONTINUE';
  /** 实例同步字段映射 */
  syncMappingFields?: import('@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types').InstanceSyncMappingField[];
}

/** 推理 AGENT 节点配置 */
export interface InferenceAgentNodeConfig {
  ontologyModelID?: number;
  ontologyModelName?: string;
  /** Agent 应用 ID（本体场景绑定的 appID） */
  agentAppId?: string;
  /** Agent 展示名称 */
  agentName?: string;
  /**
   * 触发方式：上游数据更新时触发新的推理
   * on_data_update - 数据更新触发（默认）
   */
  triggerMode?: 'on_data_update';
}

export interface DataTaskItem {
  id: string;
  taskType: TaskType;
  name: string;
  scheduleType: ScheduleType;
  status: TaskStatus;
  latestExecutionStatus: ExecutionStatus;
  updater: string;
  updaterName: string;
  updateTime: string;
  description?: string;
  cron?: string;
  processId?: string;
}

export interface DataTaskDetail extends DataTaskItem {
  description?: string;
  cron?: string;
}

export interface CreateDataTaskParams {
  name: string;
  taskType?: TaskType;
  scheduleType?: ScheduleType;
  description?: string;
}

export interface UpdateDataTaskParams {
  id: string;
  name?: string;
  scheduleType?: ScheduleType;
  description?: string;
  cron?: string;
}

export interface WorkflowDraftGraph {
  nodes: unknown[];
  edges: unknown[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface WorkflowDraft {
  id?: string;
  graph: WorkflowDraftGraph;
  hash?: string;
  updated_at?: number;
  version?: string;
  features?: Record<string, unknown>;
  environment_variables?: unknown[];
  conversation_variables?: unknown[];
}

export interface DataTaskListResponse {
  items: DataTaskItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface GetDataTaskListParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
  taskTypes?: string[];
  scheduleTypes?: string[];
  statuses?: string[];
  executionStatuses?: string[];
}
