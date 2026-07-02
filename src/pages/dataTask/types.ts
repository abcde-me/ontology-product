// 任务类型
export enum TaskType {
  TABLE_SYNC = 'table_sync'
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
