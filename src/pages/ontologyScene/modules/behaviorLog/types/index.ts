// 执行记录数据接口（真实 API 返回的字段）
export interface BehaviorLogItem {
  id: string | number; // 函数/行为的执行id
  type?: string; // 类型
  name: string; // 行为/函数名称
  code: string; // 行为/函数id
  description?: string; // 描述说明
  session_id?: string; // 会话ID
  pk?: number; // 主键
  script_path?: string; // 脚本路径
  sources?: string; // 来源（复数形式，兼容旧版）
  source?: string; // 来源（单数形式，新版API）
  run_status: 1 | 2 | 3 | 4 | 0; // 执行状态：0-未知 1-处理中 2-成功 3-失败 4-kill
  duration: string | number; // 执行耗时（可能是字符串或数字）
  start_time: string; // 开始时间
  end_time: string; // 结束时间
  operator_time?: string; // 操作时间
  run_log: string; // 运行日志
  input_params?: string; // 入参（JSON字符串）
  return_params?: string; // 出参（JSON字符串）
  execute_code?: string; // 执行代码
  execute_command?: string; // 执行命令
  associated_object_type?: string; // 关联对象类型
  associated_object_type_id?: string | number; // 关联对象类型ID（后端返回字段）
  ontologyObjectTypeName?: string; // 所属对象类型名称
  ontologyObjectTypeIcon?: string; // 所属对象类型图标
  ontologyObjectTypeId?: string | number; // 所属对象类型ID
  objectTypeID?: string | number; // 对象类型ID（兼容字段）
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// 执行状态映射
export const RUN_STATUS_MAP = {
  1: { text: '运行中', color: '#165dff', bgColor: '#e8f3ff' },
  2: { text: '成功', color: '#00b42a', bgColor: '#e8ffea' },
  3: { text: '失败', color: '#f53f3f', bgColor: '#ffece8' },
  4: { text: '已停止', color: '#86909c', bgColor: '#f7f8fa' }
} as const;

// 执行状态配置（兼容旧代码）
export const STATUS_CONFIG = {
  processing: RUN_STATUS_MAP[1],
  success: RUN_STATUS_MAP[2],
  failed: RUN_STATUS_MAP[3],
  killed: RUN_STATUS_MAP[4]
} as const;

// 搜索参数接口
export interface SearchParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  type?: 'action' | 'function'; // 类型：行为或函数
}

// API 请求参数
export interface BehaviorLogListParams {
  pageNo: number;
  pageSize: number;
  filter: string;
  type: 'action' | 'function';
  ontologyModelID?: number; // 本体模型ID
  sources?: string[]; // 来源过滤
  run_status_list?: number[]; // 执行状态过滤列表
  associated_object_type_id_list?: number[]; // 对象类型ID过滤（传给接口的参数名）
  sort_by?: string; // 排序字段
  sort?: 'asc' | 'desc'; // 排序方向
}

// API 响应
export interface BehaviorLogListResponse {
  items: BehaviorLogItem[];
  total: number;
  pageNo: number; // 后端返回的是 pageNo
  pageSize: number;
}
