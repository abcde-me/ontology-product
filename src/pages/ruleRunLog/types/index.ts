export enum AutoExecLogStatus {
  /** 0=成功 */
  SUCCESS = 0,
  /** 1=失败 */
  FAILED = 1,
  /** 2=部分成功 */
  PARTIAL_SUCCESS = 2,
  /** 3=待执行 */
  PENDING = 3
}

/**
 * AutoExecLogItem
 */
export interface AutoExecLogItem {
  createdAt?: string;
  id?: number;
  logId?: string;
  ruleName?: string;
  ruleId?: number;
  duration?: string;
  /**
   * 0=成功，1=失败，2=部分成功，3=待执行
   */
  status?: AutoExecLogStatus;
}

/**
 * 日志详情
 */
export interface AutoExecLogDetail {
  actionLogId?: number;
  createTime?: string;
  detailLog?: string;
  durationMs?: number;
  errorMessage?: string;
  gateActionLogId?: number;
  gateResult?: number;
  id?: number;
  logId?: string;
  projectId?: string;
  ruleId?: number;
  ruleName?: string;
  ruleSnapshot?: RuleSnapshotRes;
  status?: number;
  triggerTime?: string;
  triggerType?: number;
}

/**
 * RuleSnapshotRes
 */
export interface RuleSnapshotRes {
  actionConfig?: ActionConfigRes;
  changeConfig?: ChangeConfigRes;
  description?: string;
  gateConfig?: GateConfigRes;
  id?: number;
  /**
   * 本体场景 ID
   */
  modelId?: number;
  name?: string;
  projectId?: string;
  scheduleConfig?: ScheduleConfigRes;
  status?: number;
  triggerType?: number;
}

/**
 * ActionConfigRes
 */
export interface ActionConfigRes {
  /**
   * 行为唯一编码
   */
  actionCode?: string;
  /**
   * 行为 ID
   */
  actionId?: number;
  /**
   * 行为参数
   */
  parameters?: Record<string, any>;
}

/**
 * ChangeConfigRes
 */
export interface ChangeConfigRes {
  conditionOperator?: string;
  /**
   * 变更条件类型：any_change / meet_condition
   */
  conditionType?: string;
  conditionValue?: string;
  /**
   * 指定实例 ID 列表（整型）
   */
  instanceIds?: number[];
  /**
   * 实例范围：all / specific
   */
  instanceScope?: string;
  /**
   * 监控属性 ID 列表
   */
  monitorPropertyIds?: number[];
  /**
   * 本体对象类型 ID
   */
  objectTypeId?: number;
}

/**
 * GateConfigRes
 */
export interface GateConfigRes {
  enabled?: boolean;
  /**
   * 布尔函数唯一编码
   */
  functionCode?: string;
  /**
   * 布尔函数 ID
   */
  functionId?: number;
}

/**
 * ScheduleConfigRes
 */
export interface ScheduleConfigRes {
  cronExpr?: string;
  enabled?: boolean;
}

/**
 * GetAutoRuleStatsResponse
 */
export interface AutoRuleStats {
  activeRules?: number;
  draftRules?: number;
  pausedRules?: number;
  todayExecutions?: number;
  todayFailed?: number;
  todaySuccess?: number;
  totalRules?: number;
}

/**
 * 规则快照
 */
export interface AutoExecLogRuleSnapshot {
  ruleSnapshot?: {
    actionConfig?: ActionConfigRes;
    changeConfig?: ChangeConfigRes;
    description?: string;
    gateConfig?: GateConfigRes;
    id?: number;
    /**
     * 本体场景 ID
     */
    modelId?: number;
    name?: string;
    projectId?: string;
    scheduleConfig?: ScheduleConfigRes;
    status?: number;
    triggerType?: number;
  };
}

/**
 * ActionConfigRes
 */
export interface ActionConfigRes {
  /**
   * 行为唯一编码
   */
  actionCode?: string;
  /**
   * 行为 ID
   */
  actionId?: number;
  /**
   * 行为参数
   */
  parameters?: { [key: string]: any };
  [property: string]: any;
}

/**
 * ChangeConfigRes
 */
export interface ChangeConfigRes {
  conditionOperator?: string;
  /**
   * 变更条件类型：any_change / meet_condition
   */
  conditionType?: string;
  conditionValue?: string;
  /**
   * 指定实例 ID 列表（整型）
   */
  instanceIds?: number[];
  /**
   * 实例范围：all / specific
   */
  instanceScope?: string;
  /**
   * 监控属性 ID 列表
   */
  monitorPropertyIds?: number[];
  /**
   * 本体对象类型 ID
   */
  objectTypeId?: number;
  [property: string]: any;
}

/**
 * GateConfigRes
 */
export interface GateConfigRes {
  enabled?: boolean;
  /**
   * 布尔函数唯一编码
   */
  functionCode?: string;
  /**
   * 布尔函数 ID
   */
  functionId?: number;
  [property: string]: any;
}

/**
 * ScheduleConfigRes
 */
export interface ScheduleConfigRes {
  cronExpr?: string;
  enabled?: boolean;
  [property: string]: any;
}

/**
 * 今日统计
 */
export interface AutoExecLogTodayStats {
  avgDurationMs?: number;
  failed?: number;
  partialSuccess?: number;
  success?: number;
  total?: number;
  [property: string]: any;
}
