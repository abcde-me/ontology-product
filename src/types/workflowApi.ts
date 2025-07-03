/** 新建工作流 */
export interface CreateWorkflowParams {
  workflow_name: string;
}

/** 新建工作流 */
export interface CreateWorkflowRes {
  ds_workflow_id: number;
  workflow_uuid: string | number;
}

export enum IsOnline {
  offline = 0,
  online = 1
}

/** 获取工作流详情 */
export interface WorkflowDetailRes {
  /** 海豚调度生成的id */
  ds_workflow_id: number;
  /** 服务端工作流唯一标识 */
  workflow_uuid: string | number;
  /** 工作流版本 */
  workflow_version: string;
  /** 工作流名称 */
  workflow_name: string;
  /** 源数据目录 */
  source_path: string;
  /** 目标数据目录 */
  target_path: string;
  /** 运行周期 */
  run_cycle: string;
  /** 创建时间 */
  create_time: number;
  /** 最新修改时间 */
  update_time: string;
  /** 是否上线 0-下线 1-上线 */
  is_online: IsOnline;
  /** 创建人id */
  user_id: string;
  /** 创建人姓名 */
  user_name: string;
  /** 定时运行 */
  cycle_text?: CycleText;
}

export enum WorkflowOperation {
  /** 一次性任务上线 */
  ONLINE = 'ONLINE',
  /** 下线（一次性任务和定时调度全部下线） */
  OFFLINE = 'OFFLINE',
  /** 运行（一次性任务） */
  RUNNING = 'RUNNING',
  /** CRON_RUNNING-定时运行 */
  CRON_RUNNING = 'CRON_RUNNING'
}

export interface CycleText {
  minute: string; // 10代表第10分钟
  hour: string; // 10代表10点
  date: string; // *代表每日，"1,3"代表1号和3号执行，"L"代表最后一天，默认空字符，代表未选择
  month: string; // *代表每月，默认空字符，代表未选择
  week: string; // *代表每周，默认空字符，代表未选择
}

/** 工作流操作 */
export interface WorkflowOperationParams {
  uid: string;
  ds_workflow_id: number;
  op: WorkflowOperation;
  cycle_text?: CycleText;
}

/** 工作流操作 */
export interface WorkflowOperationRes {
  ds_workflow_id: number;
  workflow_uuid: number;
  workflow_version: number;
  job_id: number;
}
