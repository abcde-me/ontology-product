export enum WorkflowTaskStatus {
  /** 提交成功 */
  SUBMITTED_SUCCESS = 'SUBMITTED_SUCCESS',
  /** 正在运行 */
  RUNNING_EXECUTION = 'RUNNING_EXECUTION',
  /** 准备暂停 */
  READY_PAUSE = 'READY_PAUSE',
  /** 运行暂停 */
  PAUSE = 'PAUSE',
  /** 准备停止 */
  READY_STOP = 'READY_STOP',
  /** 运行停止 */
  STOP = 'STOP',
  /** 运行失败 */
  FAILURE = 'FAILURE',
  /** 运行成功 */
  SUCCESS = 'SUCCESS',
  /** 需要容错 */
  NEED_FAULT_TOLERANCE = 'NEED_FAULT_TOLERANCE',
  /** KILL */
  KILL = 'KILL',
  /** 延迟执行 */
  DELAY_EXECUTION = 'DELAY_EXECUTION',
  /** 串行等待 */
  SERIAL_WAIT = 'SERIAL_WAIT',
  /** 准备阻塞 */
  READY_BLOCK = 'READY_BLOCK',
  /** 运行阻塞 */
  BLOCK = 'BLOCK',
  /** 等待运行 */
  WAIT_TO_RUN = 'WAIT_TO_RUN'
}

export const WorkflowTaskStatusNameMap = {
  [WorkflowTaskStatus.SUBMITTED_SUCCESS]: '提交成功',
  [WorkflowTaskStatus.RUNNING_EXECUTION]: '正在运行',
  [WorkflowTaskStatus.READY_PAUSE]: '准备暂停',
  [WorkflowTaskStatus.PAUSE]: '运行暂停',
  [WorkflowTaskStatus.READY_STOP]: '准备停止',
  [WorkflowTaskStatus.STOP]: '运行停止',
  [WorkflowTaskStatus.FAILURE]: '运行失败',
  [WorkflowTaskStatus.SUCCESS]: '运行成功',
  [WorkflowTaskStatus.NEED_FAULT_TOLERANCE]: '需要容错',
  [WorkflowTaskStatus.KILL]: 'KILL',
  [WorkflowTaskStatus.DELAY_EXECUTION]: '延迟执行',
  [WorkflowTaskStatus.SERIAL_WAIT]: '串行等待',
  [WorkflowTaskStatus.READY_BLOCK]: '准备阻塞',
  [WorkflowTaskStatus.BLOCK]: '运行阻塞',
  [WorkflowTaskStatus.WAIT_TO_RUN]: '等待运行'
} as const;

export enum TriggerType {
  /** 手动运行 */
  MANUAL = 'manual',
  /** 定时运行 */
  SCHEDULE = 'schedule'
}

export const TriggerTypeNameMap = {
  [TriggerType.MANUAL]: '手动运行',
  [TriggerType.SCHEDULE]: '定时运行'
} as const;

export interface GetWorkflowTaskListParams {
  /**
   * 运行类型，START_PROCESS  手动运行     SCHEDULER 定时运行
   */
  trigger_type_list: TriggerType[];
  /**
   * 工作流实例ID
   */
  id?: number;
  /**
   * 运行id或者名称搜索
   */
  keywords: string;
  /**
   * 排序
   */
  orders: {
    /**
     * 是否升序 true false
     */
    asc: boolean;
    /**
     * 排序字段名
     */
    column: string;
  }[];
  /**
   * 运行状态，使用 WorkflowTaskStatus 枚举值
   */
  state_list: WorkflowTaskStatus[];
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页条数
   */
  page_size: number;
}

export enum WorkflowType {
  /** 结构化工作流 */
  STRUCT = 'struct',
  /** 非结构化工作流 */
  NO_STRUCT = 'noStruct'
}

export interface WorkflowTaskItem {
  /**
   * 提交时间
   */
  command_start_time: string;
  /**
   * 启动类型，手动运行，定时运行 英文
   */
  trigger_type: TriggerType;
  /**
   * 启动类型，手动运行，定时运行
   */
  command_type_name: (typeof TriggerTypeNameMap)[keyof typeof TriggerTypeNameMap];
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
   * 工作流ID，和原来的ds_workflow_id一致
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
   * 执行状态，使用 WorkflowTaskStatus 枚举值
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
  /**
   * 工作流类型
   */
  workflow_type: WorkflowType;
  /**
   * 工作流UUID
   */
  workflow_uuid: string;
  /**
   * 工作流版本
   */
  workflow_version: string;
}

export interface GetWorkflowTaskListResponse {
  /**
   * 总条数
   */
  total: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页条数
   */
  page_size: number;
  /**
   * 列表
   */
  items: WorkflowTaskItem[];
}

export enum TaskExecuteType {
  /** 离线 */
  OFFLINE = '0',
  /** 实时 */
  REALTIME = '1'
}

export const TaskExecuteTypeNameMap = {
  [TaskExecuteType.OFFLINE]: '离线',
  [TaskExecuteType.REALTIME]: '实时'
} as const;

export interface GetTaskNodeListParams {
  /**
   * 运行类型，START_PROCESS  手动运行     SCHEDULER 定时运行
   */
  trigger_type_list?: TriggerType[];
  /**
   * 任务实例ID
   */
  id: number;
  /**
   * id或者节点名称搜索
   */
  keywords?: string;
  /**
   * 排序
   */
  orders?: {
    /**
     * 是否升序 true false
     */
    asc: boolean;
    /**
     * 排序字段名
     */
    column: string;
  }[];
  page: number;
  page_size: number;
  /**
   * 工作流实例ID
   */
  process_instance_id?: number;
  /**
   * 运行状态
   */
  state_list?: WorkflowTaskStatus[];
  /**
   * 任务模式，0 离线、1  实时 传0或者1
   */
  task_execute_type_list?: TaskExecuteType[];
  /**
   * 任务节点类型
   */
  task_type?: string;
}

export interface TaskNodeItem {
  /**
   * 任务节点实例ID
   */
  id: number;
  /**
   * 执行类型，手动运行，定时运行
   */
  trigger_type: TriggerType;
  /**
   * 执行类型，手动运行，定时运行 中文
   */
  trigger_type_name: (typeof TriggerTypeNameMap)[keyof typeof TriggerTypeNameMap];
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
  process_instance_id: number;
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
  task_code: number;
  /**
   * 任务模式
   */
  task_execute_type: TaskExecuteType;
  /**
   * 任务模式 ，离线、实时
   */
  task_execute_type_name: string;
  /**
   * 任务名称，任务名称
   */
  task_name: string;
  /**
   * 任务类型
   */
  task_type: string;
  /**
   * 任务类型中文名
   */
  task_type_name: string;
  /**
   * 工作流UUID
   */
  workflow_uuid: string;
  /**
   * 工作流版本
   */
  workflow_version: string;
  /**
   * 工作流类型
   */
  workflow_type: WorkflowType;
  /**
   * 工作流ID
   */
  process_definition_code: number;
}

export interface GetTaskNodeListResponse {
  /**
   * 总条数
   */
  total: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页条数
   */
  page_size: number;
  /**
   * 列表
   */
  items: TaskNodeItem[];
}

export enum WorkflowOperationType {
  /** 重新运行 */
  REPEAT_RUNNING = 'REPEAT_RUNNING',
  /** 继续运行 */
  RECOVER_SUSPENDED_PROCESS = 'RECOVER_SUSPENDED_PROCESS',
  /** 重试失败任务 */
  START_FAILURE_TASK_PROCESS = 'START_FAILURE_TASK_PROCESS',
  /** 结束运行 */
  STOP = 'STOP',
  /** 暂停运行 */
  PAUSE = 'PAUSE'
}

export interface WorkflowOperationParams {
  /**
   * 操作类型，         REPEAT_RUNNING:             "重新运行",
   * RECOVER_SUSPENDED_PROCESS:  "继续运行",
   * START_FAILURE_TASK_PROCESS: "重试失败任务",
   * EXEC_STOP:                  "结束运行",
   * EXEC_PAUSE:                 "暂停运行",
   */
  execute_type?: WorkflowOperationType;
  /**
   * 任务节点实例ID
   */
  process_instance_id: number;
}

export interface GetWorkflowRunResultListParams {
  /**
   * 工作流实例ID
   */
  id: number;
}

export interface GetWorkflowRunResultListResponse {
  base_info: string;
  result_info: string;
  workflow_name: string;
  workflow_version: string;
}

export interface ListTaskInstanceParams {
  /**
   * 工作流实例ID
   */
  process_instance_id?: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页条数
   */
  page_size: number;
  /**
   * 排序
   */
  orders?: {
    /**
     * 是否升序 true false
     */
    asc: boolean;
    /**
     * 排序字段名
     */
    column: string;
  }[];
  /**
   * 任务节点类型
   */
  task_type_list?: string[];
  /**
   * 任务模式，0 离线、1  实时
   */
  task_execute_type_list?: TaskExecuteType[];
  /**
   * 运行类型，手动运行，定时运行
   */
  trigger_type_list?: TriggerType[];
  /**
   * 运行状态，使用 WorkflowTaskStatus 枚举值
   */
  state_list?: WorkflowTaskStatus[];
}

export enum TaskNodeStatus {
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
  /** KILL */
  KILL = 'KILL',
  /** 需要容错 */
  NEED_FAULT_TOLERANCE = 'NEED_FAULT_TOLERANCE',
  /** 延迟执行 */
  DELAY_EXECUTION = 'DELAY_EXECUTION',
  /** 强制成功 */
  FORCED_SUCCESS = 'FORCED_SUCCESS',
  /** 分配中 */
  DISPATCH = 'DISPATCH',
  /** 加载中，生成运行记录之前的状态 */
  LOADING = 'LOADING'
}

export const TaskNodeStatusNameMap = {
  [TaskNodeStatus.SUBMITTED_SUCCESS]: '提交成功',
  [TaskNodeStatus.RUNNING_EXECUTION]: '正在运行',
  [TaskNodeStatus.PAUSE]: '运行暂停',
  [TaskNodeStatus.STOP]: '运行停止',
  [TaskNodeStatus.FAILURE]: '运行失败',
  [TaskNodeStatus.SUCCESS]: '运行成功',
  [TaskNodeStatus.KILL]: 'KILL',
  [TaskNodeStatus.NEED_FAULT_TOLERANCE]: '需要容错',
  [TaskNodeStatus.DELAY_EXECUTION]: '延迟执行',
  [TaskNodeStatus.FORCED_SUCCESS]: '强制成功',
  [TaskNodeStatus.DISPATCH]: '分配中',
  [TaskNodeStatus.LOADING]: '加载中'
} as const;

export interface ListTaskInstanceItem {
  /**
   * 运行类型，手动运行，定时运行
   */
  trigger_type: TriggerType;
  /**
   * 运行类型，手动运行，定时运行 中文
   */
  trigger_type_name: (typeof TriggerTypeNameMap)[keyof typeof TriggerTypeNameMap];
  /**
   * 运行时长
   */
  duration: string;
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
  process_instance_id: number;
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
   * 结束时间
   */
  end_time: string;
  /**
   * 运行状态，状态英文名
   */
  state: TaskNodeStatus;
  /**
   * 运行状态名称，状态中文名
   */
  state_name: (typeof TaskExecuteTypeNameMap)[keyof typeof TaskExecuteTypeNameMap];
  /**
   * 运行提交时间
   */
  submit_time: string;
  /**
   * 任务节点ID
   */
  task_code: number;
  /**
   * 任务模式，0 离线、1  实时
   */
  task_execute_type: TaskExecuteType;
  /**
   * 任务模式 ，离线、实时
   */
  task_execute_type_name: (typeof TaskExecuteTypeNameMap)[keyof typeof TaskExecuteTypeNameMap];
  /**
   * 任务名称，任务名称
   */
  task_name: string;
  /**
   * 任务类型中文名
   */
  task_type_name: string;
  /**
   * 任务节点类型
   */
  task_type?: string;
}

export interface ListTaskInstanceResponse {
  /**
   * 列表
   */
  items: ListTaskInstanceItem[];
  page: string;
  page_size: string;
  total: string;
}

export interface TaskNodeForceSuccessParams {
  /**
   * 任务节点实例ID
   */
  task_instance_id: number;
}

export interface TaskNodeRetryParams {
  /**
   * 工作流实例ID
   */
  process_instance_id: number;
  /**
   * 节点code
   */
  task_code_list: number[];
}

export interface GetRunLogsParams {
  /**
   * 任务节点实例ID
   */
  task_instance_id: number;
  /**
   * 每页条数
   */
  limit?: number;
  /**
   * 跳过行数
   */
  skip_line_num?: number;
}

export interface GetRunLogsResponse {
  skip_line_num: number;
  message: string;
}

export interface TaskDetailParams {
  /**
   * 工作id
   */
  id: string;
}

/**
 * 模型信息
 */
export interface ModelInfo {
  /**
   * 模型ID
   */
  id: number;
  /**
   * 模型名称
   */
  modle_name: string;
}

/**
 * 工作流画布节点
 */
export interface WorkflowCanvasNode {
  /**
   * 任务名称
   */
  task_name: string;
  /**
   * 任务ID
   */
  task_id: number;
  /**
   * 分段方式
   */
  text_slice_rule: string;
  /**
   * 分段大小
   */
  slice_max_size: string;
  /**
   * 文本处理规则
   */
  text_proc_rules: number[];
  /**
   * OCR模型
   */
  text_orc_modle: ModelInfo;
  /**
   * 图片模型
   */
  pic_modle: ModelInfo;
  /**
   * 文本嵌入模型
   */
  text_emb_modle: ModelInfo;
  /**
   * 上一个任务
   */
  last_task: string;
  /**
   * 下一个任务
   */
  next_task: string;
  /**
   * 上传代码脚本
   */
  upload_code: string;
  /**
   * 说明
   */
  describe: string;
}

/**
 * 基础信息
 */
export interface TaskDetailBaseInfo {
  /**
   * 工作流名称
   */
  job_name: string;
  /**
   * 运行状态
   */
  state: WorkflowTaskStatus;
  /**
   * 创建人
   */
  creater: string;
  /**
   * 创建时间
   */
  cre_time: string;
  /**
   * 最后修改时间
   */
  up_time: string;
  /**
   * 开始时间
   */
  start_time: string;
  /**
   * 结束时间
   */
  end_time: string;
  /**
   * 运行时长
   */
  time_size: string;
  /**
   * 错误信息
   */
  error_msg?: string;
}

/**
 * 任务详情响应
 */
export interface TaskDetailResponse {
  /**
   * 基础信息
   */
  base_info?: TaskDetailBaseInfo;
  /**
   * 工作流画布
   */
  workflow_canvas?: WorkflowCanvasNode[];
  /**
   * 结果信息
   */
  result_info?: Record<string, any>;
  /**
   * 工作流名称
   */
  workflow_name: string;
  /**
   * 工作流版本
   */
  workflow_version: string;
}
