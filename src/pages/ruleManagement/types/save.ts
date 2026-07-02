import {
  ChangeType,
  ExecutionMode,
  InstanceScope,
  MonthDayMode,
  ParameterValue,
  PeriodType,
  PropertyConditionType
} from '@/pages/ruleManagement/types/index';
import { Operator } from 'semver';

/**
 * CreateAutoRuleRequest
 */
export interface CreateAutoRule {
  id?: string | number;
  actionConfig?: ActionConfigReq;
  changeConfig?: ChangeConfigReq;
  description?: string;
  gateConfig?: GateConfigReq;
  /**
   * 本体场景 ID，对应 ontology_model.id，先选场景再选对象类型
   */
  modelId?: number;
  name: string;
  scheduleConfig?: ScheduleConfigReq;
  /**
   * 1=定时触发，2=变更触发
   */
  triggerType: number;
}

/**
 * ActionConfigReq
 */
export interface ActionConfigReq {
  /**
   * 行为唯一编码，对应 ontology_action.code
   */
  actionCode: string;
  /**
   * 行为 ID，对应 ontology_action.id
   */
  actionId: number;
  /**
   * 执行模式：auto=自动执行，manual_confirm=人工确认
   */
  executionMode?: ExecutionMode;
  /**
   * 行为参数 key-value 映射
   */
  parameters?: ParameterValue[];
}

/**
 * ChangeConfigReq
 */
export interface ChangeConfigReq {
  /**
   * 变更种类：property_change=属性变化，instance_create=实例新增，instance_delete=实例删除；为空时默认 property_change
   */
  changeType?: ChangeType;
  /**
   * 指定实例 ID 列表（整型），instanceScope=specific 时必填
   */
  instanceIds?: number[];
  /**
   * 实例范围：all=全部实例，specific=指定实例
   */
  instanceScope: InstanceScope;
  /**
   * 本体对象类型 ID，对应 ontology_object_type.id
   */
  objectTypeId: number;
  /**
   * 属性条件列表；changeType=property_change 时至少配置 1 项，多个条件按全部命中处理
   */
  propertyConditions?: PropertyConditionType[];
}

/**
 * GateConfigReq
 */
export interface GateConfigReq {
  /**
   * 是否启用条件门控
   */
  enabled?: boolean;
  /**
   * 布尔函数唯一编码，对应 ontology_function.code，enabled=true 时必填
   */
  functionCode?: string;
  /**
   * 布尔函数 ID，对应 ontology_function.id，enabled=true 时必填；响应中的 functionName 由服务端基于该 ID 查询补齐
   */
  functionId?: number;
  parameters?: ParameterValue[];
}

/**
 * ScheduleConfigReq
 */
export interface ScheduleConfigReq {
  /**
   * 是否启用
   */
  enabled?: boolean;
  /**
   * 每月日期模式：specific=具体日期，last=每月最后一天（periodType=monthly 时必填）
   */
  monthDayMode?: MonthDayMode;
  /**
   * 每月几号触发，1~31（monthDayMode=specific 时必填）
   */
  monthDays?: number[];
  /**
   * 周期类型：daily=每日，weekly=每周，monthly=每月
   */
  periodType: PeriodType;
  /**
   * 执行时间，格式 HH:mm
   */
  time: string;
  /**
   * 每周几触发，1=周一 ~ 7=周日（periodType=weekly 时必填）
   */
  weekDays?: number[];
}
