import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  Viewport
} from 'reactflow';
import type {
  Resolution,
  TransferMethod
} from '@/pages/workflowConfig/types/app';
import type { ToolDefaultValue } from '@/pages/workflowConfig/workflow/block-selector/types';
import type {
  FileResponse,
  NodeTracing
} from '@/pages/workflowConfig/types/workflow';
import type { Collection, Tool } from '@/pages/workflowConfig/tools/types';
import type {
  DefaultValueForm,
  ErrorHandleTypeEnum
} from '@/pages/workflowConfig/workflow/nodes/_base/components/error-handle/types';
import type { WorkflowRetryConfig } from '@/pages/workflowConfig/workflow/nodes/_base/components/retry/types';

export enum BlockEnum {
  Start = 'start',
  End = 'end',
  Text = 'text',
  Pic = 'pic',
  Audio = 'audio',
  Video = 'video',
  Cleaning = 'cleaning',
  Enhancement = 'enhancement',
  Customize = 'scripting',
  // sql开发
  SQL = 'spark_sql',
  // 数据推送
  Seatunnel = 'seatunnel',
  // 外部前置任务
  Dependent = 'dependent'
}

export enum ControlMode {
  Pointer = 'pointer',
  Hand = 'hand'
}

export enum ErrorHandleMode {
  Terminated = 'terminated',
  ContinueOnError = 'continue-on-error',
  RemoveAbnormalOutput = 'remove-abnormal-output'
}

export type Branch = {
  id: string;
  name: string;
};

export type CommonNodeType<T = {}> = {
  _connectedSourceHandleIds?: string[];
  _connectedTargetHandleIds?: string[];
  _targetBranches?: Branch[];
  _isSingleRun?: boolean;
  _runningStatus?: NodeRunningStatus;
  _runningBranchId?: string;
  _singleRunningStatus?: NodeRunningStatus;
  _isCandidate?: boolean;
  _isBundled?: boolean;
  _children?: string[];
  _isEntering?: boolean;
  _showAddVariablePopup?: boolean;
  _holdAddVariablePopup?: boolean;
  _iterationLength?: number;
  _iterationIndex?: number;
  _inParallelHovering?: boolean;
  _waitingRun?: boolean;
  _retryIndex?: number;
  isInIteration?: boolean;
  iteration_id?: string;
  selected?: boolean;
  flow_type?: string;
  title: string;
  desc: string;
  type: BlockEnum;
  width?: number;
  height?: number;
  _loopLength?: number;
  _loopIndex?: number;
  isInLoop?: boolean;
  loop_id?: string;
  error_strategy?: ErrorHandleTypeEnum;
  retry_config?: WorkflowRetryConfig;
  default_value?: DefaultValueForm[];
  script_content?: string;
} & T &
  Partial<
    Pick<
      ToolDefaultValue,
      'provider_id' | 'provider_type' | 'provider_name' | 'tool_name'
    >
  >;

export type CommonEdgeType = {
  _hovering?: boolean;
  _connectedNodeIsHovering?: boolean;
  _connectedNodeIsSelected?: boolean;
  _isBundled?: boolean;
  _sourceRunningStatus?: NodeRunningStatus;
  _targetRunningStatus?: NodeRunningStatus;
  _waitingRun?: boolean;
  isInIteration?: boolean;
  iteration_id?: string;
  isInLoop?: boolean;
  loop_id?: string;
  sourceType: BlockEnum;
  targetType: BlockEnum;
};

export type Node<T = {}> = ReactFlowNode<CommonNodeType<T>>;
export type SelectedNode = Pick<Node, 'id' | 'data'>;
export type NodeProps<T = unknown> = { id: string; data: CommonNodeType<T> };
export type NodePanelProps<T> = {
  id: string;
  data: CommonNodeType<T>;
};
export type Edge = ReactFlowEdge<CommonEdgeType>;

export type WorkflowDataUpdater = {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
};

export type ValueSelector = string[]; // [nodeId, key | obj key path]

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: any;
  value_type: 'string' | 'number' | 'secret';
};

export type ConversationVariable = {
  id: string;
  name: string;
  value_type: any;
  value: any;
  description: string;
};

export type GlobalVariable = {
  name: string;
  value_type: 'string' | 'number';
  description: string;
};

export type ModelConfig = {
  provider: string;
  name: string;
  mode: string;
  completion_params: Record<string, any>;
};

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant'
}

export enum EditionType {
  basic = 'basic',
  jinja2 = 'jinja2'
}

export type PromptItem = {
  id?: string;
  role?: PromptRole;
  text: string;
  edition_type?: EditionType;
  jinja2_text?: string;
};

export enum MemoryRole {
  user = 'user',
  assistant = 'assistant'
}

export type RolePrefix = {
  user: string;
  assistant: string;
};

export type Memory = {
  role_prefix?: RolePrefix;
  window: {
    enabled: boolean;
    size: number | string | null;
  };
  query_prompt_template: string;
};

export enum VarType {
  integer = 'integer',
  string = 'string',
  number = 'number',
  secret = 'secret',
  boolean = 'boolean',
  object = 'object',
  file = 'file',
  array = 'array',
  arrayString = 'array[string]',
  arrayNumber = 'array[number]',
  arrayObject = 'array[object]',
  arrayFile = 'array[file]',
  time = 'time',
  any = 'any'
}

export type Var = {
  variable: string;
  type: VarType;
  children?: Var[]; // if type is obj, has the children struct
  isParagraph?: boolean;
  isSelect?: boolean;
  options?: string[];
  required?: boolean;
  des?: string;
  isException?: boolean;
};

export type NodeOutPutVar = {
  nodeId: string;
  title: string;
  vars: Var[];
  isStartNode?: boolean;
};

export type Block = {
  classification?: string;
  type: BlockEnum;
  title: string;
  description?: string;
};

export type NodeDefault<T> = {
  defaultValue: Partial<T>;
  getAvailablePrevNodes: (isChatMode: boolean) => BlockEnum[];
  getAvailableNextNodes: (isChatMode: boolean) => BlockEnum[];
  checkValid: (
    payload: T,
    t: any,
    moreDataForCheckValid?: any
  ) => { isValid: boolean; errorMessage?: string };
};

export type OnSelectBlock = (
  type: BlockEnum,
  toolDefaultValue?: ToolDefaultValue
) => void;

export enum WorkflowRunningStatus {
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Stopped = 'stopped'
}

export enum WorkflowVersion {
  Draft = 'draft',
  Latest = 'latest'
}

export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Exception = 'exception',
  Retry = 'retry'
}

export type OnNodeAdd = (
  newNodePayload: {
    nodeType: BlockEnum;
    sourceHandle?: string;
    targetHandle?: string;
    toolDefaultValue?: ToolDefaultValue;
  },
  oldNodesPayload: {
    prevNodeId?: string;
    prevNodeSourceHandle?: string;
    nextNodeId?: string;
    nextNodeTargetHandle?: string;
  }
) => void;

export type CheckValidRes = {
  isValid: boolean;
  errorMessage?: string;
};

export type RunFile = {
  type: string;
  transfer_method: TransferMethod[];
  url?: string;
  upload_file_id?: string;
};

export type WorkflowRunningData = {
  task_id?: string;
  message_id?: string;
  conversation_id?: string;
  result: {
    sequence_number?: number;
    workflow_id?: string;
    inputs?: string;
    process_data?: string;
    outputs?: string;
    status: string;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    created_at?: number;
    created_by?: string;
    finished_at?: number;
    steps?: number;
    showSteps?: boolean;
    total_steps?: number;
    files?: FileResponse[];
    exceptions_count?: number;
  };
  tracing?: NodeTracing[];
};

export type HistoryWorkflowData = {
  id: string;
  sequence_number: number;
  status: string;
  conversation_id?: string;
};

export enum ChangeType {
  changeVarName = 'changeVarName',
  remove = 'remove'
}

export type MoreInfo = {
  type: ChangeType;
  payload?: {
    beforeKey: string;
    afterKey?: string;
  };
};

export type ToolWithProvider = Collection & {
  tools: Tool[];
};

export enum SupportUploadFileTypes {
  image = 'image',
  document = 'document',
  audio = 'audio',
  video = 'video',
  custom = 'custom'
}

export type UploadFileSetting = {
  allowed_file_upload_methods: TransferMethod[];
  allowed_file_types: SupportUploadFileTypes[];
  allowed_file_extensions?: string[];
  max_length: number;
  number_limits?: number;
};

export type VisionSetting = {
  variable_selector: ValueSelector;
  detail: Resolution;
};

export enum WorkflowVersionFilterOptions {
  all = 'all',
  onlyYours = 'onlyYours'
}

export enum VersionHistoryContextMenuOptions {
  restore = 'restore',
  edit = 'edit',
  delete = 'delete'
}

// 节点运行详情数据
export interface NodeProcessData {
  /**
   * 执行类型 英文，英文
   */
  command_type: string;
  /**
   * 执行类型，手工执行，自动调度，手动运行  定时运行
   */
  command_type_name: string;
  /**
   * 运行时长
   */
  duration: string;
  /**
   * 结束时间
   */
  end_time: string;
  /**
   * 最大重试i次数
   */
  max_retry_times: number;
  /**
   * 所属工作流名称
   */
  process_definition_name: string;
  /**
   * 工作流执行ID
   */
  process_instance_id: string;
  /**
   * 工作流名称
   */
  process_instance_name: string;
  /**
   * 重试次数
   */
  retry_times: number;
  /**
   * 运行次数
   */
  run_times: string;
  /**
   * 开始时间
   */
  start_time: string;
  /**
   * 运行状态，状态英文名
   */
  state: string;
  /**
   * 运行状态名称，状态中文名
   */
  state_name: string;
  /**
   * 运行提交时间
   */
  submit_time: string;
  /**
   * 任务节点ID
   */
  task_code: string;
  /**
   * 任务模式 ，离线、实时
   */
  task_execute_type_name: string;
  /**
   * 任务名称，任务名称
   */
  task_name: string;
  /**
   * 任务类型英文名
   */
  task_type: string;
  /**
   * 任务类型中文名
   */
  task_type_name: string;
}
