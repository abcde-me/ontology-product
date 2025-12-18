/**
 * 工作流运行状态映射
 */
export const WORKFLOW_RUN_STATUS_MAP: Record<
  string,
  { text: string; color: string; dotColor: string }
> = {
  waiting: { text: '等待运行', color: '#007DFA', dotColor: '#007DFA' },
  running: { text: '正在运行', color: '#007DFA', dotColor: '#007DFA' },
  paused: { text: '运行暂停', color: '#94A3B8', dotColor: '#94A3B8' },
  success: { text: '运行结束', color: '#10B981', dotColor: '#10B981' },
  fail: { text: '运行结束', color: '#10B981', dotColor: '#10B981' },
  kill: { text: '手动结束', color: '#10B981', dotColor: '#10B981' },
  stopped: { text: '运行结束', color: '#10B981', dotColor: '#10B981' }
};

/**
 * 任务节点运行状态映射
 */
export const TASK_NODE_RUN_STATUS_MAP: Record<
  string,
  { text: string; color: string; dotColor: string }
> = {
  waiting: { text: '等待运行', color: '#007DFA', dotColor: '#007DFA' },
  'scheduled-waiting': {
    text: '定时待运行',
    color: '#007DFA',
    dotColor: '#007DFA'
  },
  running: { text: '正在运行', color: '#007DFA', dotColor: '#007DFA' },
  paused: { text: '运行暂停', color: '#007DFA', dotColor: '#007DFA' },
  success: { text: '运行成功', color: '#10B981', dotColor: '#10B981' },
  'force-success': { text: '强制成功', color: '#10B981', dotColor: '#10B981' },
  fail: { text: '运行失败', color: '#EF4444', dotColor: '#EF4444' },
  failed: { text: '运行失败', color: '#EF4444', dotColor: '#EF4444' },
  killed: { text: '运行终止', color: '#EF4444', dotColor: '#EF4444' },
  kill: { text: 'Kill', color: '#EF4444', dotColor: '#EF4444' },
  'risky-run': { text: '风险运行', color: '#EF4444', dotColor: '#EF4444' }
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
  { label: '等待运行', value: 'waiting' },
  { label: '正在运行', value: 'running' },
  { label: '运行暂停', value: 'paused' },
  { label: '运行结束', value: 'success' },
  { label: '手动结束', value: 'kill' }
];

/**
 * 任务节点运行状态选项
 */
export const TASK_NODE_STATUS_OPTIONS = [
  { label: '等待运行', value: 'waiting' },
  { label: '定时待运行', value: 'scheduled-waiting' },
  { label: '正在运行', value: 'running' },
  { label: '运行暂停', value: 'paused' },
  { label: '运行成功', value: 'success' },
  { label: '强制成功', value: 'force-success' },
  { label: '运行失败', value: 'fail' },
  { label: '运行终止', value: 'killed' },
  { label: '风险运行', value: 'risky-run' },
  { label: 'Kill', value: 'kill' }
];
