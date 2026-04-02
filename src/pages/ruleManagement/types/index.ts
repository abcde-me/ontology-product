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
  parameters?: { [key: string]: any };
  [property: string]: any;
}

/**
 * OntologyActionParamInfo
 */
export interface OntologyActionParamInfo {
  actionId?: number;
  code?: string;
  id?: number;
  name?: string;
  createdAt?: string;
  enabledValidation?: boolean;
  inputType?: string;
  type?: string;
  uiType?: string;
  updatedAt?: string;
  validationRule?: MetadataRuleInfo;
}

/**
 * MetadataRuleInfo
 */
export interface MetadataRuleInfo {
  failMessage?: string;
  ruleConfig?: { [key: string]: any };
  ruleName?: string;
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
   * 变更种类：property_change=属性变化，instance_create=实例新增，instance_delete=实例删除；为空时默认 property_change
   */
  changeType?: ChangeType;
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
  objectTypeInfo?: OntologyObjectTypeInfo;
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
