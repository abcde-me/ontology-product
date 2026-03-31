/**
 * AutoRuleItem
 */
export interface AutoRuleItem {
  createdAt?: string;
  createdBy?: string;
  description?: string;
  id?: number;
  /**
   * 本体场景 ID
   */
  modelId?: number;
  name?: string;
  projectId?: string;
  status?: number;
  triggerType?: number;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * GetAutoRuleResponse
 */
export interface AutoRuleDetail {
  actionConfig?: ActionConfigRes;
  changeConfig?: ChangeConfigRes;
  createdAt?: string;
  createdBy?: string;
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
  /**
   * 0=草稿，1=已激活，2=已暂停，3=已归档
   */
  status?: number;
  triggerType?: number;
  updatedAt?: string;
  updatedBy?: string;
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
