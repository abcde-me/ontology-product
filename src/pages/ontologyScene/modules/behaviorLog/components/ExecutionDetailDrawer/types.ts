// 执行详情数据类型
export interface ExecutionDetailData {
  id: string;
  name: string;
  code: string;
  description: string;
  run_status: 1 | 2 | 3 | 4; // 1-处理中 2-成功 3-失败 4-已停止
  sources: string;
  duration: string;
  start_time: string;
  end_time: string;
  ontologyObjectTypeName?: string;
  ontologyObjectTypeIcon?: string;
  ontologyObjectTypeId?: string | number;
}

// 入参数据类型
export interface ParamItem {
  name: string;
  type: string;
  value: any;
}

// 出参数据类型
export interface OutputParamItem {
  name: string;
  type: string;
  value?: any;
}

// 运行日志类型
export interface LogItem {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
