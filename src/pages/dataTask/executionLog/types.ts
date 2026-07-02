export enum RunStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export interface ExecutionLogItem {
  id: string;
  runId: string;
  status: RunStatus;
  startTime: string;
  endTime?: string;
  duration?: string;
  retryCount: number;
  maxRetryCount: number;
}

export interface ExecutionLogDetail extends ExecutionLogItem {
  detailLog?: string;
  errorMessage?: string;
}

export interface ExecutionLogListResponse {
  items: ExecutionLogItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface GetExecutionLogListParams {
  taskId: string;
  pageNo: number;
  pageSize: number;
  statuses?: string[];
}
