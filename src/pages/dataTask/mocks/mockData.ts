import {
  TaskType,
  ScheduleType,
  TaskStatus,
  ExecutionStatus,
  DataTaskItem
} from '../types';
import { DATA_RESOURCE_CATALOG } from '@/pages/dataResource/data/catalog';

/** 任务名称：数据资源库表信息 + 数据同步 */
export const buildDataSyncTaskName = (catalogIndex: number): string => {
  const table = DATA_RESOURCE_CATALOG[catalogIndex];
  if (!table) {
    return '未知库表数据同步';
  }
  return `${table.databaseType}/${table.tableName}数据同步`;
};

export const mockDataTasks: DataTaskItem[] = [
  {
    id: '1',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(0),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'zhangsan',
    updaterName: '张三',
    updateTime: '2026-06-09 09:15:00'
  },
  {
    id: '2',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(1),
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.PUBLISHING,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'lisi',
    updaterName: '李四',
    updateTime: '2026-06-09 07:20:00'
  },
  {
    id: '3',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(2),
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.OFFLINE,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'wangwu',
    updaterName: '王五',
    updateTime: '2026-06-08 18:10:00'
  },
  {
    id: '4',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(3),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'zhaoliu',
    updaterName: '赵六',
    updateTime: '2026-06-08 14:00:00'
  },
  {
    id: '5',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(4),
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'sunqi',
    updaterName: '孙七',
    updateTime: '2026-06-08 09:30:00'
  },
  {
    id: '6',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(5),
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.PUBLISHING,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'zhouba',
    updaterName: '周八',
    updateTime: '2026-06-07 16:45:00'
  },
  {
    id: '7',
    taskType: TaskType.TABLE_SYNC,
    name: buildDataSyncTaskName(6),
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'wujiu',
    updaterName: '吴九',
    updateTime: '2026-06-07 10:20:00'
  },
  {
    id: 'wf-1',
    taskType: TaskType.WORKFLOW_DAG,
    name: '文档解析入库工作流',
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'zhangsan',
    updaterName: '张三',
    updateTime: '2026-06-10 11:30:00',
    description: '文件解析后写入本体对象实例',
    processId: 'process_wf_001'
  },
  {
    id: 'wf-2',
    taskType: TaskType.WORKFLOW_DAG,
    name: '多源数据融合工作流',
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'lisi',
    updaterName: '李四',
    updateTime: '2026-06-11 09:45:00',
    description: '整合 SQL 与 JSON 解析结果',
    processId: 'process_wf_002'
  },
  {
    id: 'wf-3',
    taskType: TaskType.WORKFLOW_DAG,
    name: '音视频转文本工作流',
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.OFFLINE,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'wangwu',
    updaterName: '王五',
    updateTime: '2026-06-09 16:20:00',
    description: '音频文本提取并结构化输出',
    processId: 'process_wf_003'
  },
  {
    id: 'wf-4',
    taskType: TaskType.WORKFLOW_DAG,
    name: '图片OCR识别入库工作流',
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'zhaoliu',
    updaterName: '赵六',
    updateTime: '2026-06-12 08:10:00',
    description: '数据源 → 图片OCR → SQL处理 → 本体对象类型',
    processId: 'process_wf_004',
    cron: '0 0 2 * * ?'
  },
  {
    id: 'wf-5',
    taskType: TaskType.WORKFLOW_DAG,
    name: '推理Agent触发工作流',
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.PUBLISHING,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'sunqi',
    updaterName: '孙七',
    updateTime: '2026-06-12 14:35:00',
    description: '上游数据更新时触发推理 Agent 并输出结构化结果',
    processId: 'process_wf_005'
  },
  {
    id: 'wf-6',
    taskType: TaskType.WORKFLOW_DAG,
    name: '数据脱敏同步工作流',
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.DEVELOPING,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'zhouba',
    updaterName: '周八',
    updateTime: '2026-06-11 17:50:00',
    description: 'SQL处理 → 数据脱敏 → 本体对象类型输出',
    processId: 'process_wf_006'
  },
  {
    id: 'wf-7',
    taskType: TaskType.WORKFLOW_DAG,
    name: '多模态数据融合工作流',
    scheduleType: ScheduleType.IMMEDIATE,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.RUNNING,
    updater: 'wujiu',
    updaterName: '吴九',
    updateTime: '2026-06-12 10:05:00',
    description: '并行处理图片OCR与音频文本，合并后写入对象实例',
    processId: 'process_wf_007'
  },
  {
    id: 'wf-8',
    taskType: TaskType.WORKFLOW_DAG,
    name: 'JSON解析循环批处理工作流',
    scheduleType: ScheduleType.ONCE,
    status: TaskStatus.OFFLINE,
    latestExecutionStatus: ExecutionStatus.FAILED,
    updater: 'zhangsan',
    updaterName: '张三',
    updateTime: '2026-06-10 19:40:00',
    description: 'JSON解析 + 循环节点批量处理消息队列数据',
    processId: 'process_wf_008'
  },
  {
    id: 'wf-9',
    taskType: TaskType.WORKFLOW_DAG,
    name: '本体实例增量同步工作流',
    scheduleType: ScheduleType.PERIODIC,
    status: TaskStatus.ONLINE,
    latestExecutionStatus: ExecutionStatus.SUCCESS,
    updater: 'lisi',
    updaterName: '李四',
    updateTime: '2026-06-12 06:25:00',
    description: '定时拉取数据源并同步至本体对象类型，含字段映射配置',
    processId: 'process_wf_009',
    cron: '0 */30 * * * ?'
  }
];
