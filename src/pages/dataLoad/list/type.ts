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
