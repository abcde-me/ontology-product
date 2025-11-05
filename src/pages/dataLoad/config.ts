export enum RunState {
  SUCCEED = 'SUCCESS',
  FAILED = 'FAILURE',
  RUNNING = 'RUNNING_EXECUTION',
  STOPPED = 'STOP'
}

export const RunStateType = {
  [RunState.SUCCEED]: {
    text: '运行成功',
    value: 'SUCCESS',
    color: '#10B981'
  },
  [RunState.FAILED]: {
    text: '运行失败',
    value: 'FAILURE',
    color: '#EF4444'
  },
  [RunState.RUNNING]: {
    text: '运行中',
    value: 'RUNNING_EXECUTION',
    color: '#007DFA'
  },
  [RunState.STOPPED]: {
    text: '运行停止',
    value: 'STOP',
    color: '#94A3B8'
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
export enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs',
  DB = 'db',
  Local = 'local'
}
export const TYPE_CONFIG = {
  [ConnectorType.S3]: {
    text: '对象存储(S3)',
    value: 's3'
  },
  [ConnectorType.HDFS]: {
    text: 'HDFS',
    value: 'hdfs'
  },
  [ConnectorType.DB]: {
    text: '数据库',
    value: 'db'
  },
  [ConnectorType.Local]: {
    text: '本地文件',
    value: 'local'
  }
};
export const DATABASE_TYPE_ENUM = [
  {
    label: 'MySQL',
    value: 'MySQL'
  },
  {
    label: 'PostgreSQL',
    value: 'PostgreSQL'
  }
];
