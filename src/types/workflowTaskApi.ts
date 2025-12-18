export enum WorkflowTaskStatus {
  /** 成功 */
  success = 'success',
  /** 失败 */
  fail = 'fail',
  /** 终止 */
  kill = 'kill'
}

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
  command_type: CommandType;
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
   * 运行状态，success、fail、kill
   */
  state: WorkflowTaskStatus;
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

export interface GetTaskNodeListParams {
  /**
   * 运行类型，START_PROCESS  手动运行     SCHEDULER 定时运行
   */
  command_type?: CommandType;
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
  state?: string;
  /**
   * 任务模式，0 离线、1  实时 传0或者1
   */
  task_execute_type?: TaskExecuteType;
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
   * 执行类型，手工执行，自动调度，手动运行  定时运行
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
