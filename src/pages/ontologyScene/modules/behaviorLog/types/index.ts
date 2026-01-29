// 执行记录数据接口
export interface BehaviorLogItem {
  id: string;
  type: string; // 行为类型
  name: string; // 行为名称
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  duration: number; // 耗时（毫秒）
  status: 'success' | 'running' | 'failed'; // 执行状态
  objectType?: string; // 对象类型
  operator?: string; // 操作人
  errorMessage?: string; // 错误信息（失败时）
}

// 执行状态配置
export const STATUS_CONFIG = {
  success: {
    text: '成功',
    color: '#00b42a',
    bgColor: '#e8ffea'
  },
  running: {
    text: '进行中',
    color: '#165dff',
    bgColor: '#e8f3ff'
  },
  failed: {
    text: '失败',
    color: '#f53f3f',
    bgColor: '#ffece8'
  }
} as const;

// 搜索参数接口
export interface SearchParams {
  keyword?: string;
  page?: number;
  page_size?: number;
}
