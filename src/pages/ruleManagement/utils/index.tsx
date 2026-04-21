import {
  ActionConfigReq,
  ChangeConfigReq,
  CreateAutoRule,
  ScheduleConfigReq
} from '../types/save';
import {
  AutoRuleDetail,
  AutoRuleFormData,
  ChangeConfigRes,
  ChangeType,
  InstanceScope,
  MonthDayMode,
  OntologyObjectTypeInfo,
  ParameterValue,
  PeriodType
} from '@/pages/ruleManagement/types';
import { cloneDeep, isNil } from 'lodash-es';
import { OntologyActionParam } from '@/pages/ontologyScene/types/behaviorActions';
import { OntologyFunctionParam } from '@/pages/ontologyScene/types/ontologyFunction';
import { CycleValues } from '../components/SchedulerRun/types';
import {
  ICON_OPTIONS,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import React from 'react';
import { ActionConfigRes, GateConfigRes } from '@/pages/ruleRunLog/types';

const formatParams = (config?: ActionConfigRes | GateConfigRes) => {
  config?.parameters.forEach((item) => {
    try {
      if (isNil(item.value)) return;
      item.value = ['string', 'number'].includes(typeof item.value)
        ? item.value.toString()
        : JSON.stringify(item.value);
    } catch (e) {
      console.error(e);
    }
  });
  return config;
};

export function buildAutoTriggerSave(data: AutoRuleDetail): CreateAutoRule {
  const {
    name,
    description,
    triggerType = 1,
    scheduleConfig,
    actionConfig
  } = data;
  const actionCopy = cloneDeep(actionConfig);
  delete actionCopy?.actionInfo;
  return {
    name: name?.trim() || '',
    description: description?.trim(),
    triggerType,
    scheduleConfig: scheduleConfig as ScheduleConfigReq,
    actionConfig: formatParams(actionConfig) as ActionConfigReq
  };
}

export function buildAutoChangeSave(data: AutoRuleDetail): CreateAutoRule {
  const autoRuleDetail = cloneDeep(data);
  const {
    name,
    description,
    triggerType = 2,
    actionConfig,
    changeConfig,
    gateConfig,
    modelId
  } = autoRuleDetail;
  delete changeConfig?.objectTypeInfo;
  delete actionConfig?.actionInfo;
  if (gateConfig?.enabled) {
    delete gateConfig?.functionInfo;
  }
  changeConfig?.propertyConditions?.forEach((item) => {
    const value = item.value;
    try {
      item.value = ['string', 'number'].includes(typeof item.value)
        ? value?.toString()
        : JSON.stringify(value);
    } catch (e) {
      console.error(e);
    }
  });
  if (!!changeConfig?.instanceIds?.length) {
    changeConfig.instanceIds = changeConfig.instanceIds.map((id) => {
      try {
        return JSON.stringify(id);
      } catch (e) {
        console.error(e);
        return id;
      }
    });
  }
  return {
    name: name?.trim() || '',
    description: description?.trim(),
    triggerType,
    changeConfig: changeConfig as ChangeConfigReq,
    actionConfig: formatParams(actionConfig) as ActionConfigReq,
    gateConfig: formatParams(gateConfig) as GateConfigRes,
    modelId
  };
}

export function getParamsFromData(
  params?: (OntologyActionParam | OntologyFunctionParam)[]
) {
  return (params || []).flatMap((item) => {
    const { id, code, name, uiType, inputType, type } = item;
    if (inputType === 'input') {
      return {
        id,
        code,
        name,
        uiType,
        inputType,
        type,
        source: 'fixed_value'
      };
    }
    return [];
  });
}

export function buildSaveAutoRuleData(data: AutoRuleDetail): CreateAutoRule {
  const { triggerType, id } = data;
  const buildAutoRule =
    triggerType === 1 ? buildAutoTriggerSave : buildAutoChangeSave;
  const autoRule = buildAutoRule(data);
  if (!!id) {
    autoRule.id = id;
  }
  return autoRule;
}

// 根据规则详情构建定时触发表单信息
function buildAutoTriggerRuleForm(data: AutoRuleDetail): AutoRuleFormData {
  const { name, description, triggerType, scheduleConfig, actionConfig } = data;
  const formData: Record<string, any> = {
    name,
    description,
    triggerType,
    action: actionConfig?.actionId,
    actionParams: buildFormParams(
      actionConfig?.parameters,
      actionConfig?.actionInfo?.params
    )
  };

  if (scheduleConfig?.periodType === PeriodType.Daily) {
    formData.cycle = CycleValues.PER_DAY;
    formData.time = scheduleConfig.time;
  }

  if (scheduleConfig?.periodType === PeriodType.Weekly) {
    formData.cycle = CycleValues.PER_WEEK;
    formData.date = (scheduleConfig.weekDays || []).map(String);
    formData.time = scheduleConfig.time;
  }

  if (scheduleConfig?.periodType === PeriodType.Monthly) {
    formData.cycle = CycleValues.PER_MONTH;
    formData.date =
      scheduleConfig.monthDayMode === MonthDayMode.Last
        ? 'L'
        : (scheduleConfig.monthDays || []).map(String);
    formData.time = scheduleConfig.time;
  }

  return formData as AutoRuleFormData;
}
// 根据规则详情构建变更触发表单信息
function buildAutoChangeRuleForm(data: AutoRuleDetail): AutoRuleFormData {
  const {
    name,
    description,
    triggerType,
    modelId,
    changeConfig,
    gateConfig,
    actionConfig
  } = data;

  const formData: Record<string, any> = {
    name,
    description,
    triggerType,
    changeType: changeConfig?.changeType || ChangeType.PropertyChange,
    modelId,
    objectTypeId: changeConfig?.objectTypeId,
    insType: changeConfig?.instanceScope || InstanceScope.All,
    instanceIds: changeConfig?.instanceIds,
    propertyConditions: (changeConfig?.propertyConditions || []).map(
      (item) => item.id
    ),
    propertyList: buildObjPropertyInfo(changeConfig!),
    advConfig: !!gateConfig?.enabled,
    function: gateConfig?.functionId,
    functionParams: buildFormParams(
      gateConfig?.parameters,
      gateConfig?.functionInfo?.params
    ),
    action: actionConfig?.actionId,
    actionParams: buildFormParams(
      actionConfig?.parameters,
      actionConfig?.actionInfo?.params
    )
  };

  return formData as AutoRuleFormData;
}
export function buildAutoRuleForm(data: AutoRuleDetail): AutoRuleFormData {
  const autoRuleDetail = cloneDeep(data);
  const { triggerType } = autoRuleDetail;
  if (triggerType === 1) {
    return buildAutoTriggerRuleForm(autoRuleDetail);
  }
  return buildAutoChangeRuleForm(autoRuleDetail);
}

// 根据参数值和参数元数据构建表单参数
export function buildFormParams(
  parameters?: ParameterValue[],
  metaParams?: (OntologyActionParam | OntologyFunctionParam)[]
) {
  const metaMap = new Map((metaParams || []).map((item) => [item.id, item]));

  return (parameters || []).map((item) => {
    const meta = metaMap.get(item.id);
    const base: Record<string, any> = {
      id: item.id,
      code: item.code,
      name: meta?.name,
      type: meta?.type,
      uiType: meta?.uiType,
      inputType: meta?.inputType,
      source: item.source,
      value: item.value
    };
    return base;
  });
}

export function buildObjPropertyInfo(changeConfig: ChangeConfigRes) {
  const { objectTypeInfo, propertyConditions: props } = changeConfig;
  const propMap = new Map(
    objectTypeInfo?.ontologyPhysicalPropertiesList?.map((prop) => [
      prop.id,
      prop
    ])
  );
  return (props || []).map((item) => {
    const prop = propMap.get(item.id as number);
    const value = item.value;
    const baseVal = {
      fieldType: prop?.columnType,
      name: prop?.name,
      value: item.value,
      ...item
    };
    try {
      baseVal.value = JSON.parse(value as string);
    } catch (e) {
      console.error(e);
    }
    return baseVal;
  });
}

// 根据icon字段获取本体
export const getModelIconNode = (icon?: string, className?: string) => {
  const matchedIcon = ICON_OPTIONS.find((option) => option.value === icon);
  const iconSource = matchedIcon?.icon ?? ICON_OPTIONS[0]?.icon;

  if (!iconSource) return null;

  if (typeof iconSource === 'string') {
    return <img src={iconSource} alt="" className={className} />;
  }

  return React.createElement(iconSource, {
    className
  });
};

// 根据 icon 字段获取ObjType图标组件
export const getObjIconComponent = (obj: OntologyObjectTypeInfo) => {
  const { code, icon: iconValue } = obj;
  if (code === '-1') return null;
  const iconOption = iconValue
    ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === iconValue)
    : null;
  return iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0]?.icon;
};

// 处理规则详情中的参数，属性的value字段成正常类型
export function handleRuleDetailParams(data: AutoRuleDetail) {
  [
    data.actionConfig?.parameters,
    data.gateConfig?.parameters,
    data.changeConfig?.propertyConditions
  ].forEach((params) => {
    if (!!params) {
      params.forEach((param) => {
        // true和false是字符串，parse会转成布尔
        try {
          param.value = ['true', 'false'].includes(param.value)
            ? param.value
            : JSON.parse(param.value as string);
        } catch (e) {
          console.error(e);
        }
      });
    }
  });
  if (data.changeConfig?.instanceIds?.length) {
    data.changeConfig.instanceIds = data.changeConfig.instanceIds.map(
      (item) => {
        try {
          return JSON.parse(item as any);
        } catch (e) {
          return item;
        }
      }
    );
  }
}

export const isNumericType = (type?: string) => {
  return !type
    ? false
    : [
        'tinyint',
        'smallint',
        'mediumint',
        'int',
        'integer',
        'bigint',
        'float',
        'real',
        'double',
        'double precision'
      ].includes(type);
};
