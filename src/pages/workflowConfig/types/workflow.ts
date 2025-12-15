import type { Viewport } from 'reactflow';
import type {
  BlockEnum,
  ConversationVariable,
  Edge,
  EnvironmentVariable,
  Node
} from '@/pages/workflowConfig/workflow/types';
import type { TransferMethod } from '@/pages/workflowConfig/types/app';
import type { ErrorHandleTypeEnum } from '@/pages/workflowConfig/workflow/nodes/_base/components/error-handle/types';

export type AgentLogItem = {
  node_execution_id: string;
  id: string;
  node_id: string;
  parent_id?: string;
  label: string;
  data: object; // debug data
  error?: string;
  status: string;
  metadata?: {
    elapsed_time?: number;
    provider?: string;
    icon?: string;
  };
};

export type AgentLogItemWithChildren = AgentLogItem & {
  hasCircle?: boolean;
  children: AgentLogItemWithChildren[];
};

export type NodeTracing = {
  id: string;
  index: number;
  predecessor_node_id: string;
  node_id: string;
  iteration_id?: string;
  loop_id?: string;
  node_type: BlockEnum;
  title: string;
  inputs: any;
  process_data: any;
  outputs?: any;
  status: string;
  parallel_run_id?: string;
  error?: string;
  elapsed_time: number;
  execution_metadata?: {
    total_tokens: number;
    total_price: number;
    currency: string;
    iteration_id?: string;
    iteration_index?: number;
    loop_id?: string;
    loop_index?: number;
    parallel_id?: string;
    parallel_start_node_id?: string;
    parent_parallel_id?: string;
    parent_parallel_start_node_id?: string;
    parallel_mode_run_id?: string;
    iteration_duration_map?: IterationDurationMap;
    loop_duration_map?: LoopDurationMap;
    error_strategy?: ErrorHandleTypeEnum;
    agent_log?: AgentLogItem[];
    tool_info?: {
      agent_strategy?: string;
      icon?: string;
    };
  };
  metadata: {
    iterator_length: number;
    iterator_index: number;
    loop_length: number;
    loop_index: number;
  };
  created_at: number;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  iterDurationMap?: IterationDurationMap;
  loopDurationMap?: LoopDurationMap;
  finished_at: number;
  extras?: any;
  expand?: boolean; // for UI
  details?: NodeTracing[][]; // iteration or loop detail
  retryDetail?: NodeTracing[]; // retry detail
  retry_index?: number;
  parallelDetail?: {
    // parallel detail. if is in parallel, this field will be set
    isParallelStartNode?: boolean;
    parallelTitle?: string;
    branchTitle?: string;
    children?: NodeTracing[];
  };
  parallel_id?: string;
  parallel_start_node_id?: string;
  parent_parallel_id?: string;
  parent_parallel_start_node_id?: string;
  agentLog?: AgentLogItemWithChildren[]; // agent log
};

export type FetchWorkflowDraftResponse = {
  id: string;
  graph: {
    nodes: Node[];
    edges: Edge[];
    viewport?: Viewport;
  };
  features?: any;
  created_at: number;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  hash: string;
  updated_at: number;
  updated_by: {
    id: string;
    name: string;
    email: string;
  };
  tool_published: boolean;
  environment_variables?: EnvironmentVariable[];
  conversation_variables?: ConversationVariable[];
  version: string;
  marked_name: string;
  marked_comment: string;
};

export type VersionHistory = FetchWorkflowDraftResponse;

export type FetchWorkflowDraftPageParams = {
  appId: string;
  initialPage: number;
  limit: number;
  userId?: string;
  namedOnly?: boolean;
};

export type FetchWorkflowDraftPageResponse = {
  items: VersionHistory[];
  has_more: boolean;
  page: number;
};

export type NodeTracingListResponse = {
  data: NodeTracing[];
};

export type WorkflowStartedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: {
    id: string;
    workflow_id: string;
    sequence_number: number;
    created_at: number;
  };
};

export type WorkflowFinishedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: any;
    error: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    created_by: {
      id: string;
      name: string;
      email: string;
    };
    finished_at: number;
    files?: FileResponse[];
  };
};

export type NodeStartedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type FileResponse = {
  related_id: string;
  extension: string;
  filename: string;
  size: number;
  mime_type: string;
  transfer_method: TransferMethod;
  type: string;
  url: string;
};

export type NodeFinishedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type IterationStartedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type IterationNextResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type IterationFinishedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type LoopStartedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type LoopNextResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type LoopFinishedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type ParallelBranchStartedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type ParallelBranchFinishedResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: NodeTracing;
};

export type TextChunkResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: {
    text: string;
  };
};

export type TextReplaceResponse = {
  task_id: string;
  workflow_run_id: string;
  event: string;
  data: {
    text: string;
  };
};

export type AgentLogResponse = {
  task_id: string;
  event: string;
  data: AgentLogItemWithChildren;
};

export type WorkflowRunHistory = {
  id: string;
  sequence_number: number;
  version: string;
  conversation_id?: string;
  message_id?: string;
  graph: {
    nodes: Node[];
    edges: Edge[];
    viewport?: Viewport;
  };
  inputs: Record<string, string>;
  status: string;
  outputs: Record<string, any>;
  error?: string;
  elapsed_time: number;
  total_tokens: number;
  total_steps: number;
  created_at: number;
  finished_at: number;
  created_by_account: {
    id: string;
    name: string;
    email: string;
  };
};
export type WorkflowRunHistoryResponse = {
  data: WorkflowRunHistory[];
};

export type ChatRunHistoryResponse = {
  data: WorkflowRunHistory[];
};

export type NodesDefaultConfigsResponse = {
  type: string;
  config: any;
}[];

export type ConversationVariableResponse = {
  data: (ConversationVariable & { updated_at: number; created_at: number })[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
};

export type IterationDurationMap = Record<string, number>;
export type LoopDurationMap = Record<string, number>;

export type WorkflowConfigResponse = {
  parallel_depth_limit: number;
};

export type PublishWorkflowParams = {
  title: string;
  releaseNotes: string;
};

export type UpdateWorkflowParams = {
  workflowId: string;
  title: string;
  releaseNotes: string;
};

export interface WorkflowRunTask {
  /**
   * 提交时间
   */
  command_start_time: string;
  /**
   * 启动类型，手动运行，定时运行 英文
   */
  command_type: string;
  /**
   * 启动类型，手动运行，定时运行
   */
  command_type_name: string;
  /**
   * 执行时长
   */
  duration: string;
  /**
   * 结束时间
   */
  end_time: string;
  /**
   * 工作流运行ID
   */
  id: string;
  /**
   * 提交人，操作人
   */
  operator: string;
  /**
   * 工作流ID
   */
  process_definition_code: string;
  /**
   * 工作流名称，工作流名称
   */
  process_definition_name: string;
  /**
   * 开始时间
   */
  start_time: string;
  /**
   * 执行状态，success、fail、kill
   */
  state: string;
  /**
   * 执行状态名字，成功、失败
   */
  stateName: string;
  /**
   * 重试次数
   */
  try_times: string;
}

/**
 * 任务运行状态枚举
 */
export enum TaskStatus {
  /** 提交成功 */
  SUBMITTED_SUCCESS = 'SUBMITTED_SUCCESS',

  /** 正在运行 */
  RUNNING_EXECUTION = 'RUNNING_EXECUTION',

  /** 运行暂停 */
  PAUSE = 'PAUSE',

  /** 运行停止 */
  STOP = 'STOP',

  /** 运行失败 */
  FAILURE = 'FAILURE',

  /** 运行成功 */
  SUCCESS = 'SUCCESS',

  /** 运行终止 */
  KILL = 'KILL',

  /** 需要容错 */
  NEED_FAULT_TOLERANCE = 'NEED_FAULT_TOLERANCE',

  /** 延迟执行 */
  DELAY_EXECUTION = 'DELAY_EXECUTION',

  /** 强制成功 */
  FORCED_SUCCESS = 'FORCED_SUCCESS',

  /** 分配中 */
  DISPATCH = 'DISPATCH'
}
