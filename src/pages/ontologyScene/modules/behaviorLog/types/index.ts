// 执行记录数据接口（真实 API 返回的字段）
export interface BehaviorLogItem {
  id: string; // 函数/行为的执行id
  name: string; // 行为/函数名称
  code: string; // 行为/函数id
  description: string; // 描述说明
  sources: string; // 来源
  run_status: 1 | 2 | 3 | 4; // 执行状态：1-处理中 2-成功 3-失败 4-kill
  duration: string; // 执行耗时
  start_time: string; // 开始时间
  end_time: string; // 结束时间
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
  page_size?: number;
  type?: 'action' | 'function'; // 类型：行为或函数
}

// API 请求参数
export interface BehaviorLogListParams {
  page_num: number;
  page_size: number;
  query: string;
  type: 'action' | 'function';
  sources?: string[]; // 来源过滤
  run_status?: number[]; // 执行状态过滤
}

// API 响应
export interface BehaviorLogListResponse {
  items: BehaviorLogItem[];
  total: number;
  page: number;
  page_size: number;
}
