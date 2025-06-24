
interface cycle_text{
    minute:string
    hour:string
    data:string|string[]
    month:string
    week:string |string[]
}
interface run_cycle{
    type:string
    cycle_text:cycle_text
}
export interface dataLodaAddForm{
    job_name:string
    connector_id:string
    source_type:'hdfs'|'s3'
    run_cycle:run_cycle
    dest_path:string    
    creator:string
}
// 使用联合类型代替枚举
type TaskStatus = "running" | "stopped" | "paused";
type ExecutionStatus = "running" | "failed";
type SourceType = "HDFS" | "S3" ;
type LoadType = "cron" | "once" ;
// 连接器类型
interface Connector {
  id: number;
  name: string;
  type: SourceType; // 使用枚举类型
}
 
// 任务信息类型
interface TaskInfo {
  id: number;
  name: string;
  source_type: SourceType; // 使用枚举类型
  connector: Connector;
  load_type: LoadType; // 使用枚举类型
  cron_expression: string;
  dest_path: string;
  status: TaskStatus; // 使用枚举类型
  created_at: string;
  last_run_time: string;
  creator: string;
}
 
// 执行详情类型
interface ExecutionDetails {
  success_files: number;
  failed_files: number;
  error_message: string | null;
}
 
// 执行历史记录类型
interface ExecutionHistory {
  execution_id: number;
  execution_name: string;
  status: ExecutionStatus; // 使用枚举类型
  start_time: string;
  end_time: string;
  details: ExecutionDetails;
}
 
// 数据类型
export interface ApiResponse {
  task_info: TaskInfo;
  execution_history: ExecutionHistory[];
}