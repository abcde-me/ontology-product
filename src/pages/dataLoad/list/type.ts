export enum RunState {
  SUCCEED = 'succeed',
  FAILED = 'failed',
  RUNNING = 'running',
  STOPPED = 'stopped'
}
export const RunStateType = {
  [RunState.SUCCEED]: {
    text: '运行成功',
    value: 'succeed'
  },
  [RunState.FAILED]: {
    text: '运行失败',
    value: 'failed'
  },
  [RunState.RUNNING]: {
    text: '运行中',
    value: 'running'
  },
  [RunState.STOPPED]: {
    text: '运行停止',
    value: 'stopped'
  }
};
export enum Load {
  ONCE = 'once',
  CRON = 'cron'
}
export const LoadType = {
  [Load.ONCE]: {
    text: '单次载入',
    value: 'once'
  },
  [Load.CRON]: {
    text: '周期载入',
    value: 'cron'
  }
};
export interface ITableData {
  task_id: number;
  connector_name: string;
  connector_id: number;
  name: string;
  source_type: string;
  status: string;
  cron_expression: string;
  data_path_id: number;
  data_path_name: string;
  createor: string;
  created_at: string;
  last_run_time: string;
}
