export interface SearchWorkflowParams {
  /**
   * 工作流ID
   */
  code?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 执行类型
   */
  execution_type?: string;
  /**
   * 工作流名称
   */
  name?: string;
  orders?: Order[];
  /**
   * 优先级
   */
  priority?: string;
  /**
   * ONLINE或者OFFLINE，上线或者下线
   */
  release_state?: string;
  page?: number;
  page_size?: number;
}

export interface Order {
  /**
   * 是否升序 true false
   */
  asc: boolean;
  /**
   * 排序字段名
   */
  column: string;
}

export interface WorkFlowItem {
  /**
   * 工作流画布ID
   */
  code: string;
  /**
   * 创建人
   */
  creaetUser: string;
  createTime: string;
  /**
   * 工作流描述
   */
  description: string;
  /**
   * 运行策略，并行运行、串行运行
   */
  execution_type_name: string;
  /**
   * 工作流名称
   */
  name: string;
  /**
   * 上下线状态
   */
  release_state: string;
  schedule: Schedule;
  /**
   * 运行类型，手工执行，自动调度
   */
  schedule_type_name: string;
  updateTime: string;
  /**
   * 更新人
   */
  updateUser: string;
  /**
   * 工作流类型
   * struct 结构化
   * no_struct 非结构化
   */
  workflow_type: string;
  /**
   * 工作流id
   */
  workflow_uuid: string;
}

export interface Schedule {
  /**
   * 运行时间，每周一1点运行
   */
  crontab: string;
  /**
   * 失败策略英文  CONTINUE、END
   */
  failure_strategy: string;
  /**
   * 失败策略 继续、结束
   */
  failure_strategy_name: string;
  /**
   * 优先级
   */
  process_instance_priority: string;
}

export const FLOW_RUN_STATUS = {
  ONLINE: '已上线',
  OFFLINE: '未上线'
};
export const STATUS_FILTER = Object.entries(FLOW_RUN_STATUS).map(
  ([key, value]) => ({ text: value, value: key })
);

// 运行策略
export const EXECUTION_TYPE_OPTIONS = [
  { label: '并行运行', value: 'PARALLEL' },
  { label: '并行等待', value: 'SERIAL_WAIT' },
  { label: '串行抛弃', value: 'SERIAL_DISCARD' },
  { label: '串行优先', value: 'SERIAL_PRIORITY' }
];
// 失败策略
export const FAILURE_STRATEGY_OPTIONS = [
  { label: '继续运行', value: 'CONTINUE' },
  { label: '结束运行', value: 'END' }
];
// 优先级
export const PRIORITY_OPTIONS = [
  { label: '最高', value: 'HIGHEST', color: 'red' },
  { label: '高级', value: 'HIGH', color: 'orangered' },
  { label: '中等', value: 'MEDIUM', color: 'orange' },
  { label: '较低', value: 'LOW', color: 'green' },
  { label: '最低', value: 'LOWEST', color: 'gray' }
];
// 运行类型
export const SCHEDULE_RELEASE_STATE_OPTIONS = [
  { label: '手动运行', value: 'OFFLINE' },
  { label: '定时运行', value: 'ONLINE' }
];

export const FORM_RADIO_SCHEMA = [
  {
    label: '运行策略：',
    field: 'execution_type',
    options: EXECUTION_TYPE_OPTIONS,
    message: '请选择运行策略'
  },
  {
    label: '运行优先级：',
    field: 'process_instance_priority',
    options: PRIORITY_OPTIONS,
    message: '请选择优先级'
  },
  {
    label: '失败策略：',
    field: 'failure_strategy',
    options: FAILURE_STRATEGY_OPTIONS,
    message: '请选择失败策略'
  }
];
export const FLOW_TYPE_INFO = [
  {
    title: '结构化',
    subTitle: '任务调度',
    type: 'struct'
  },
  {
    title: '非结构化',
    subTitle: '数据治理',
    type: 'no_struct'
  }
];

export const DEFAULT_FLOW_INFO = {
  params: [{ key: undefined, value: undefined }],
  process_instance_priority: 'MEDIUM',
  failure_strategy: 'CONTINUE',
  execution_type: 'PARALLEL'
};
