// 执行记录数据接口（真实 API 返回的字段）
export interface BehaviorLogItem {
  id: number;
  session_id: string;
  action_id: number;
  start_time: string;
  end_time: string;
  run_status: number; // 1: 成功, 2: 运行中, 3: 失败
  operator_time: string;
  run_log: string;
  input_params: string; // JSON 字符串
  execute_code: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// 执行状态映射
export const RUN_STATUS_MAP = {
  1: { text: '成功', color: '#00b42a', bgColor: '#e8ffea' },
  2: { text: '运行中', color: '#165dff', bgColor: '#e8f3ff' },
  3: { text: '失败', color: '#f53f3f', bgColor: '#ffece8' }
} as const;

// 执行状态配置（兼容旧代码）
export const STATUS_CONFIG = {
  success: RUN_STATUS_MAP[1],
  running: RUN_STATUS_MAP[2],
  failed: RUN_STATUS_MAP[3]
} as const;

// 搜索参数接口
export interface SearchParams {
  keyword?: string;
  page?: number;
  page_size?: number;
  type?: 'action' | 'function'; // 类型：行为或函数
}

// API 请求参数
export interface BehaviorLogListParams {
  page_num: number;
  page_size: number;
  query: string;
  type: 'action' | 'function';
}

// API 响应
export interface BehaviorLogListResponse {
  items: BehaviorLogItem[];
  total: number;
  page: number;
  page_size: number;
}
