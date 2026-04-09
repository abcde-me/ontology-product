import {
  BehaviorActionDetail,
  OntologyActionParam
} from '@/pages/ontologyScene/types/behaviorActions';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import { OntologScene } from '@/types/ontologySceneApi';

export interface AutoRuleActionParamFormItem extends OntologyActionParam {
  source?: 'runtime' | 'static';
  value?: string;
}

export interface AutoRuleFormData {
  action?: number | string;
  actionParams?: AutoRuleActionParamFormItem[];
  advConfig?: boolean;
  changeObjectType?: number | string;
  changeOntoScene?: number | string;
  changeType?: number;
  cycle?: string;
  date?: string[] | string;
  description?: string;
  gateChangeFunction?: number | string;
  gateChangeParams?: Record<string, any>;
  name?: string;
  time?: string;
  triggerType?: number;
}

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

export interface AutoRuleSnapShotInfo {
  snapshotTime?: string;
  triggerMode?: string;
}

/**
 * AutoRuleDetail
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
  modelInfo?: OntologyModelInfo;
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
  actionInfo?: BehaviorActionDetail;
  /**
   * 行为参数
   */
  parameters?: ParameterValue[];
}

/**
 * 变更种类：property_change=属性变化，instance_create=实例新增，instance_delete=实例删除；为空时默认 property_change
 */
export enum ChangeType {
  // 实例创建
  InstanceCreate = 'instance_create',
  // 实例删除
  InstanceDelete = 'instance_delete',
  // 属性变化
  PropertyChange = 'property_change'
}

/**
 * ChangeConfigRes
 */
export interface ChangeConfigRes {
  /**
   * 变更种类：property_change / instance_create / instance_delete
   */
  changeType?: string;
  /**
   * 指定实例 ID 列表（整型）
   */
  instanceIds?: number[];
  /**
   * 实例范围：all / specific
   */
  instanceScope?: string;
  /**
   * 本体对象类型 ID
   */
  objectTypeId?: number;
  objectTypeInfo?: OntologyObjectTypeInfo;
  /**
   * 属性条件列表（changeType=property_change 时使用）
   */
  propertyConditions?: PropertyConditionType[];
}

/**
 * PropertyConditionReq
 */
export interface PropertyConditionType {
  /**
   * 属性 ID，对应 ontology_physical_properties.id
   */
  id: number | string;
  /**
   * 条件运算符，type=meet_condition 时生效
   */
  operator?: Operator;
  /**
   * 条件类型：any_change=任意变化，meet_condition=满足条件
   */
  type: ConditionType;
  /**
   * 条件比较值，type=meet_condition 时生效
   */
  value?: string | number;
}

/**
 * OntologyObjectTypeInfo
 */
export interface OntologyObjectTypeInfo {
  code?: string;
  icon?: string;
  id?: number;
  name?: string;
  ontologyPhysicalPropertiesList?: OntologyPhysicalPropertyInfo[];
}

/**
 * OntologyPhysicalPropertyInfo
 */
export interface OntologyPhysicalPropertyInfo {
  columnType?: string;
  comment?: string;
  createTime?: string;
  createUser?: string;
  description?: string;
  id?: number;
  isDeleted?: number;
  isPrimary?: number;
  isUse?: number;
  name?: string;
  objectTypeID?: number;
  ontologyModelID?: number;
  publicPropertyID?: number;
  updateTime?: string;
  updateUser?: string;
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
  /**
   * 布尔函数名称，由服务端基于 functionId 查询 metadata 服务补齐
   */
  functionName?: string;
  functionInfo?: OntologyFunctionDetail;
  parameters?: ParameterValue[];
}

/**
 * ParameterValue
 */
export interface ParameterValue {
  code?: string;
  id?: number;
  source?: string;
  value?: string;
}

/**
 * OntologyModelInfo
 */
export interface OntologyModelInfo extends OntologScene {
  name?: string;
}

/**
 * ScheduleConfigRes
 */
export interface ScheduleConfigRes {
  /**
   * 是否启用
   */
  enabled?: boolean;
  /**
   * 每月日期模式：specific=具体日期，last=每月最后一天（periodType=monthly 时有值）
   */
  monthDayMode?: MonthDayMode;
  /**
   * 每月几号触发（monthDayMode=specific 时有值）
   */
  monthDays?: number[];
  /**
   * 周期类型：daily=每日，weekly=每周，monthly=每月
   */
  periodType?: PeriodType;
  /**
   * 执行时间，格式 HH:mm
   */
  time?: string;
  /**
   * 每周几触发，1=周一 ~ 7=周日（periodType=weekly 时有值）
   */
  weekDays?: number[];
}

/**
 * GetAutoExecLogRuleSnapshotResponse
 */
export interface AutoExecLogRuleSnapshot {
  actionConfig?: ActionConfigRes;
  gateConfig?: GateConfigRes;
  ruleInfo?: Omit<AutoRuleDetail, any>;
  triggerConfig?: Record<string, any>;
  [property: string]: any;
}

/**
 * 每月日期模式：specific=具体日期，last=每月最后一天（periodType=monthly 时有值）
 */
export enum MonthDayMode {
  Last = 'last',
  Specific = 'specific'
}

/**
 * 周期类型：daily=每日，weekly=每周，monthly=每月
 */
export enum PeriodType {
  Daily = 'daily',
  Monthly = 'monthly',
  Weekly = 'weekly'
}

/**
 * 条件运算符，type=meet_condition 时生效
 */
export enum Operator {
  Contains = 'contains',
  Eq = 'eq',
  Gt = 'gt',
  Gte = 'gte',
  Lt = 'lt',
  Lte = 'lte',
  Ne = 'ne',
  NotContains = 'not_contains'
}

/**
 * 变更条件类型：any_change=任意变化，meet_condition=满足条件
 */
export enum ConditionType {
  AnyChange = 'any_change',
  MeetCondition = 'meet_condition'
}

/**
 * 实例范围：all=全部实例，specific=指定实例
 */
export enum InstanceScope {
  All = 'all',
  Specific = 'specific'
}

export const NUM_CONDITION_OPERATOR_OPTIONS = [
  { label: '等于', value: Operator.Eq },
  { label: '不等于', value: Operator.Ne },
  { label: '大于', value: Operator.Gt },
  { label: '大于等于', value: Operator.Gte },
  { label: '小于', value: Operator.Lt },
  { label: '小于等于', value: Operator.Lte }
];
export const STR_CONDITION_OPERATOR_OPTIONS = [
  { label: '包含', value: Operator.Contains },
  { label: '不包含', value: Operator.NotContains }
];
