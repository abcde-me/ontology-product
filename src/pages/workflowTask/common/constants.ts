import {
  WorkflowTaskStatus,
  WorkflowTaskStatusNameMap,
  TaskNodeStatus,
  TaskNodeStatusNameMap
} from '@/types/workflowTaskApi';

/**
 * 工作流运行状态映射
 */
export const WORKFLOW_RUN_STATUS_MAP: Record<
  string,
  { text: string; color: string; dotColor: string }
> = {
  [WorkflowTaskStatus.SUBMITTED_SUCCESS]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SUBMITTED_SUCCESS],
    color: '#10B981',
    dotColor: '#10B981'
  },
  [WorkflowTaskStatus.RUNNING_EXECUTION]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.RUNNING_EXECUTION],
    color: '#007DFA',
    dotColor: '#007DFA'
  },
  [WorkflowTaskStatus.READY_PAUSE]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_PAUSE],
    color: '#94A3B8',
    dotColor: '#94A3B8'
  },
  [WorkflowTaskStatus.PAUSE]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.PAUSE],
    color: '#94A3B8',
    dotColor: '#94A3B8'
  },
  [WorkflowTaskStatus.READY_STOP]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_STOP],
    color: '#F59E0B',
    dotColor: '#F59E0B'
  },
  [WorkflowTaskStatus.STOP]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.STOP],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [WorkflowTaskStatus.FAILURE]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.FAILURE],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [WorkflowTaskStatus.SUCCESS]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SUCCESS],
    color: '#10B981',
    dotColor: '#10B981'
  },
  [WorkflowTaskStatus.NEED_FAULT_TOLERANCE]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.NEED_FAULT_TOLERANCE],
    color: '#F59E0B',
    dotColor: '#F59E0B'
  },
  [WorkflowTaskStatus.KILL]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.KILL],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [WorkflowTaskStatus.DELAY_EXECUTION]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.DELAY_EXECUTION],
    color: '#94A3B8',
    dotColor: '#94A3B8'
  },
  [WorkflowTaskStatus.SERIAL_WAIT]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SERIAL_WAIT],
    color: '#007DFA',
    dotColor: '#007DFA'
  },
  [WorkflowTaskStatus.READY_BLOCK]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_BLOCK],
    color: '#F59E0B',
    dotColor: '#F59E0B'
  },
  [WorkflowTaskStatus.BLOCK]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.BLOCK],
    color: '#F59E0B',
    dotColor: '#F59E0B'
  },
  [WorkflowTaskStatus.WAIT_TO_RUN]: {
    text: WorkflowTaskStatusNameMap[WorkflowTaskStatus.WAIT_TO_RUN],
    color: '#007DFA',
    dotColor: '#007DFA'
  }
};

/**
 * 任务节点运行状态映射
 */
export const TASK_NODE_RUN_STATUS_MAP: Record<
  string,
  { text: string; color: string; dotColor: string }
> = {
  [TaskNodeStatus.SUBMITTED_SUCCESS]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.SUBMITTED_SUCCESS],
    color: '#10B981',
    dotColor: '#10B981'
  },
  [TaskNodeStatus.RUNNING_EXECUTION]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.RUNNING_EXECUTION],
    color: '#007DFA',
    dotColor: '#007DFA'
  },
  [TaskNodeStatus.LOADING]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.RUNNING_EXECUTION],
    color: '#007DFA',
    dotColor: '#007DFA'
  },
  [TaskNodeStatus.PAUSE]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.PAUSE],
    color: '#94A3B8',
    dotColor: '#94A3B8'
  },
  [TaskNodeStatus.STOP]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.STOP],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [TaskNodeStatus.FAILURE]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.FAILURE],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [TaskNodeStatus.SUCCESS]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.SUCCESS],
    color: '#10B981',
    dotColor: '#10B981'
  },
  [TaskNodeStatus.KILL]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.KILL],
    color: '#EF4444',
    dotColor: '#EF4444'
  },
  [TaskNodeStatus.NEED_FAULT_TOLERANCE]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.NEED_FAULT_TOLERANCE],
    color: '#F59E0B',
    dotColor: '#F59E0B'
  },
  [TaskNodeStatus.DELAY_EXECUTION]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.DELAY_EXECUTION],
    color: '#94A3B8',
    dotColor: '#94A3B8'
  },
  [TaskNodeStatus.FORCED_SUCCESS]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.FORCED_SUCCESS],
    color: '#10B981',
    dotColor: '#10B981'
  },
  [TaskNodeStatus.DISPATCH]: {
    text: TaskNodeStatusNameMap[TaskNodeStatus.DISPATCH],
    color: '#007DFA',
    dotColor: '#007DFA'
  }
};

/**
 * 运行类型选项
 */
export const RUN_TYPE_OPTIONS = [
  { label: '定时运行', value: 'SCHEDULER' },
  { label: '手动运行', value: 'START_PROCESS' },
  { label: '手动测试', value: 'MANUAL_TEST' },
  { label: '手动重试', value: 'MANUAL_RETRY' }
];

/**
 * 工作流运行状态选项
 */
export const WORKFLOW_STATUS_OPTIONS = [
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SUBMITTED_SUCCESS],
    value: WorkflowTaskStatus.SUBMITTED_SUCCESS
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.RUNNING_EXECUTION],
    value: WorkflowTaskStatus.RUNNING_EXECUTION
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_PAUSE],
    value: WorkflowTaskStatus.READY_PAUSE
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.PAUSE],
    value: WorkflowTaskStatus.PAUSE
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_STOP],
    value: WorkflowTaskStatus.READY_STOP
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.STOP],
    value: WorkflowTaskStatus.STOP
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.FAILURE],
    value: WorkflowTaskStatus.FAILURE
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SUCCESS],
    value: WorkflowTaskStatus.SUCCESS
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.NEED_FAULT_TOLERANCE],
    value: WorkflowTaskStatus.NEED_FAULT_TOLERANCE
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.KILL],
    value: WorkflowTaskStatus.KILL
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.DELAY_EXECUTION],
    value: WorkflowTaskStatus.DELAY_EXECUTION
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.SERIAL_WAIT],
    value: WorkflowTaskStatus.SERIAL_WAIT
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.READY_BLOCK],
    value: WorkflowTaskStatus.READY_BLOCK
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.BLOCK],
    value: WorkflowTaskStatus.BLOCK
  },
  {
    label: WorkflowTaskStatusNameMap[WorkflowTaskStatus.WAIT_TO_RUN],
    value: WorkflowTaskStatus.WAIT_TO_RUN
  }
];

/**
 * 任务节点运行状态选项
 */
export const TASK_NODE_STATUS_OPTIONS = [
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.SUBMITTED_SUCCESS],
    value: TaskNodeStatus.SUBMITTED_SUCCESS
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.RUNNING_EXECUTION],
    value: TaskNodeStatus.RUNNING_EXECUTION
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.PAUSE],
    value: TaskNodeStatus.PAUSE
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.STOP],
    value: TaskNodeStatus.STOP
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.FAILURE],
    value: TaskNodeStatus.FAILURE
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.SUCCESS],
    value: TaskNodeStatus.SUCCESS
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.KILL],
    value: TaskNodeStatus.KILL
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.NEED_FAULT_TOLERANCE],
    value: TaskNodeStatus.NEED_FAULT_TOLERANCE
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.DELAY_EXECUTION],
    value: TaskNodeStatus.DELAY_EXECUTION
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.FORCED_SUCCESS],
    value: TaskNodeStatus.FORCED_SUCCESS
  },
  {
    label: TaskNodeStatusNameMap[TaskNodeStatus.DISPATCH],
    value: TaskNodeStatus.DISPATCH
  }
];
