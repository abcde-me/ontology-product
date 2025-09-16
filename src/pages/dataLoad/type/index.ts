interface cycle_text {
  minute: string;
  hour: string;
  data: string | string[];
  month: string;
  week: string | string[];
}
interface run_cycle {
  type: string;
  cycle_text: cycle_text;
}
export interface dataLodaAddForm {
  job_name: string;
  connector_id: string;
  source_type: 'hdfs' | 's3';
  run_cycle: run_cycle;
  dest_path: string;
  creator: string;
}
export enum TaskStatus {
  Running = 'running',
  Stopped = 'stopped',
  succeed = 'succeed'
}

export enum ExecutionStatus {
  Running = 'running',
  Failed = 'failed'
}

export enum SourceType {
  HDFS = 'HDFS',
  S3 = 'S3'
}

export enum LoadType {
  Cron = 'cron',
  Once = 'once'
}
// 连接器类型
interface Connector {
  id: number;
  name: string;
  type: SourceType; // 使用枚举类型
}

// 任务信息类型
export interface TaskInfo {
  sub_type?: string;
  connector_id: number;
  connector_name: string;
  created_at: string;
  createor: string;
  data_path_id: number;
  data_path_name: string;
  last_run_time: string;
  load_type: LoadType;
  name: string;
  source_type: SourceType;
  status: TaskStatus;
  task_id: number;
  cron_expression: string;
  cron_enable: boolean;
  run_config?: {
    type: number;
    cycle_text: {
      minute: string;
      hour: string;
      date: string;
      month: string;
      week: string;
    };
  };
  perms: string[];
}

// 执行历史记录列表类型
export interface ExecutionHistory {
  enable: number;
  end_time: string;
  error_log: string; // 使用枚举类型
  execution_id: string;
  execution_name: string;
  failed_files: number;
  seatunnel_job_id: string;
  start_time: string;
  status: string;
  success_files: number;
  task_id: number;
}
// 载入任务记录列表类型
export interface RecordingType {
  id: number;
  file_name: string;
  status: string;
  file_type: string;
  start_time: string;
  end_time: string;
  error_message: string | null;
  connector_id: number;
  data_path_id: number;
  execution_id: string;
  file_size: number;
  hash_code: string | null;
  task_id: number;
  upload_user_name: string;
}
// 记录详情的类型
// interface accessType {

// }
