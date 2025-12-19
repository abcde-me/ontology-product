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

export enum CommandType {
  /** 手动运行 */
  START_PROCESS = 'START_PROCESS',
  /** 定时运行 */
  SCHEDULER = 'SCHEDULER'
}

export const CommandTypeNameMap = {
  [CommandType.START_PROCESS]: '手动运行',
  [CommandType.SCHEDULER]: '定时运行'
} as const;

export interface GetWorkflowTaskListParams {
  /**
   * 运行类型，START_PROCESS  手动运行     SCHEDULER 定时运行
   */
  command_type_list: CommandType[];
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
  NO_STRUCT = 'no_struct'
}

export interface WorkflowTaskItem {
  /**
   * 提交时间
   */
  command_start_time: string;
  /**
   * 启动类型，手动运行，定时运行 英文
   */
  command_type: CommandType;
  /**
   * 启动类型，手动运行，定时运行
   */
  command_type_name: (typeof CommandTypeNameMap)[keyof typeof CommandTypeNameMap];
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
  command_type_list?: CommandType[];
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
   * 执行类型，手动运行，定时运行
   */
  command_type: CommandType;
  /**
   * 执行类型，手动运行，定时运行 中文
   */
  command_type_name: (typeof CommandTypeNameMap)[keyof typeof CommandTypeNameMap];
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
  EXEC_STOP = 'EXEC_STOP',
  /** 暂停运行 */
  EXEC_PAUSE = 'EXEC_PAUSE'
}

export interface WorkflowOperationParams {
  /**
   * 操作类型，         REPEAT_RUNNING:             "重新运行",
   * RECOVER_SUSPENDED_PROCESS:  "继续运行",
   * START_FAILURE_TASK_PROCESS: "重试失败任务",
   * EXEC_STOP:                  "结束运行",
   * EXEC_PAUSE:                 "暂停运行",
   */
  executeType: WorkflowOperationType;
  /**
   * 任务节点实例ID
   */
  process_instance_id: string;
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
  command_type_list?: CommandType[];
  /**
   * 运行状态，使用 WorkflowTaskStatus 枚举值
   */
  state_list?: WorkflowTaskStatus[];
}

export interface ListTaskInstanceItem {
  /**
   * 运行类型，手动运行，定时运行
   */
  command_type: CommandType;
  /**
   * 运行类型，手动运行，定时运行 中文
   */
  command_type_name: string;
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
   * 结束时间
   */
  end_time: string;
  /**
   * 运行状态，状态英文名
   */
  state: WorkflowTaskStatus;
  /**
   * 运行状态名称，状态中文名
   */
  state_name: (typeof WorkflowTaskStatusNameMap)[keyof typeof WorkflowTaskStatusNameMap];
  /**
   * 运行提交时间
   */
  submit_time: string;
  /**
   * 任务节点ID
   */
  task_code: string;
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
