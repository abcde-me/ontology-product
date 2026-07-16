/** 数据任务数据源节点 - 数据源类型（与实例同步保持一致） */
export const DATA_TASK_SOURCE_TYPE = {
  DOCUMENT: 'csv_upload',
  DATABASE: 'database',
  MESSAGE_QUEUE: 'message_queue',
  API: 'api_interface'
} as const;

export type DataTaskSourceType =
  (typeof DATA_TASK_SOURCE_TYPE)[keyof typeof DATA_TASK_SOURCE_TYPE];

export const DATA_TASK_SOURCE_TYPE_LABEL: Record<DataTaskSourceType, string> = {
  [DATA_TASK_SOURCE_TYPE.DOCUMENT]: '文档',
  [DATA_TASK_SOURCE_TYPE.DATABASE]: '数据库',
  [DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE]: '消息队列',
  [DATA_TASK_SOURCE_TYPE.API]: 'API接口'
};

export const DATA_TASK_SOURCE_TYPE_OPTIONS: Array<{
  value: DataTaskSourceType;
  label: string;
}> = Object.entries(DATA_TASK_SOURCE_TYPE_LABEL).map(([value, label]) => ({
  value: value as DataTaskSourceType,
  label
}));
