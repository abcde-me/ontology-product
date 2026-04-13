import React from 'react';
import styles from './index.module.scss';
import RuleSettingIcon from '@/assets/rule-setting.svg';
import classNames from 'classnames';
import {
  AutoRuleDetail,
  ChangeConfigRes,
  ChangeType,
  InstanceScope,
  PeriodType
} from '@/pages/ruleManagement/types';
import { isEmpty, isNil } from 'lodash-es';
import { getModelIconNode } from '@/pages/ruleManagement/utils';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { PhysicalProperties } from '@/types/graphApi';

interface RuleSettingConfigProps {
  mode: 'card' | 'item';
  className?: string;
  ruleData?: AutoRuleDetail;
  properties?: PhysicalProperties[];
}
const weekLabel = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const buildCronDes = (scheduleConfig: AutoRuleDetail['scheduleConfig']) => {
  if (!scheduleConfig?.periodType) {
    return '请先在左侧配置';
  }

  const timeText = scheduleConfig.time ? ` ${scheduleConfig.time}` : '';

  switch (scheduleConfig.periodType) {
    case PeriodType.Daily:
      return timeText ? `每天 ${timeText}` : '每天';

    case PeriodType.Weekly: {
      const weekDaysText =
        scheduleConfig.weekDays
          ?.sort((a, b) => +a - +b)
          ?.map((item) => weekLabel[item - 1])
          .filter(Boolean)
          .join('、') || '';

      if (weekDaysText && timeText) {
        return `每周 ${weekDaysText} ${timeText}`;
      }
      if (weekDaysText) {
        return `每周的 ${weekDaysText}`;
      }
      return timeText ? `每周 ${timeText}` : '每周';
    }

    case PeriodType.Monthly: {
      let dayText = '';

      if (scheduleConfig.monthDayMode === 'last') {
        dayText = '最后一天';
      } else if (scheduleConfig.monthDays?.length) {
        dayText = `${scheduleConfig.monthDays?.sort((a, b) => +a - +b).join('、')}号`;
      }

      if (dayText && timeText) {
        return `每月${dayText} ${timeText}`;
      }
      if (dayText) {
        return `每月${dayText}`;
      }
      return timeText ? `每月 ${timeText}` : '每月';
    }

    default:
      return '请先在左侧配置';
  }
};

const renderActionConfig = (ruleData?: AutoRuleDetail) => {
  const actionEmpty =
    isNil(ruleData?.actionConfig) || isEmpty(ruleData?.actionConfig.actionInfo);
  return (
    <>
      时，系统执行
      <div
        className={classNames(
          styles['rule-setting-tag'],
          actionEmpty ? 'text-[var(--color-text-6)]' : ''
        )}
      >
        {actionEmpty
          ? '请先在左侧配置'
          : ruleData?.actionConfig?.actionInfo?.name}
      </div>
    </>
  );
};

const renderAutoTriggerConfig = (ruleData?: AutoRuleDetail) => {
  const scheduleEmpty = isNil(ruleData?.scheduleConfig);
  return (
    <>
      当
      <div
        className={classNames(
          styles['rule-setting-tag'],
          scheduleEmpty ? 'text-[var(--color-text-6)]' : ''
        )}
      >
        {scheduleEmpty
          ? '请先在左侧配置'
          : buildCronDes(ruleData?.scheduleConfig)}
      </div>
      {renderActionConfig(ruleData)}
    </>
  );
};

// 根据 icon 字段获取图标组件
const getIconComponent = (iconValue?: string) => {
  const iconOption = iconValue
    ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === iconValue)
    : null;
  return iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0]?.icon;
};

const renderInsConfig = (config: ChangeConfigRes) => {
  if (config.instanceIds?.length) {
    return config.instanceIds.map((id) => {
      return (
        <div key={id} className={classNames(styles['rule-setting-tag'])}>
          {id}
        </div>
      );
    });
  }
  return (
    <div
      className={classNames(
        styles['rule-setting-tag'],
        'text-[var(--color-text-6)]'
      )}
    >
      请先在左侧配置
    </div>
  );
};

const renderPropConfig = (
  config: ChangeConfigRes,
  properties: PhysicalProperties[]
) => {
  const { propertyConditions } = config;
  if (!propertyConditions?.length) {
    return (
      <div
        className={classNames(
          styles['rule-setting-tag'],
          'text-[var(--color-text-6)]'
        )}
      >
        请先在左侧配置
      </div>
    );
  }
  const propNameMap = new Map(properties.map((p) => [p.id, p.name]));
  return (
    <>
      的属性
      {propertyConditions.map((p) => {
        return (
          <div key={p.id} className={classNames(styles['rule-setting-tag'])}>
            {propNameMap.get(p.id as number)}
          </div>
        );
      })}
    </>
  );
};

const renderAutoChangeConfig = (
  ruleData?: AutoRuleDetail,
  properties?: PhysicalProperties[]
) => {
  const changeConfig = ruleData?.changeConfig;
  const gateConfig = ruleData?.gateConfig;
  const modelEmpty = isNil(ruleData?.modelId);
  const objEmpty = isNil(changeConfig?.objectTypeId);
  const funcEmpty = isNil(gateConfig?.functionId);
  const IconComponent = getIconComponent(changeConfig?.objectTypeInfo?.icon);
  return (
    <>
      当
      <div
        className={classNames(
          styles['rule-setting-tag'],
          modelEmpty ? 'text-[var(--color-text-6)]' : ''
        )}
      >
        {modelEmpty ? (
          '请先在左侧配置'
        ) : (
          <div className={'flex items-center gap-1'}>
            {getModelIconNode(ruleData?.modelInfo?.icon, 'w-[14px] h-[14px]')}
            {ruleData?.modelInfo?.name}
          </div>
        )}
      </div>
      的
      <div
        className={classNames(
          styles['rule-setting-tag'],
          objEmpty ? 'text-[var(--color-text-6)]' : ''
        )}
      >
        {objEmpty ? (
          '请先在左侧配置'
        ) : (
          <div className={'flex items-center gap-1'}>
            <IconComponent className="h-[14px] w-[14px]" />
            {changeConfig?.objectTypeInfo?.name}
          </div>
        )}
      </div>
      的{changeConfig?.instanceScope === InstanceScope.All ? '全部' : '部分'}
      实例
      {changeConfig?.instanceScope === InstanceScope.Specific
        ? renderInsConfig(changeConfig)
        : null}
      发生
      {changeConfig?.changeType === ChangeType.PropertyChange
        ? '属性变化'
        : changeConfig?.changeType === ChangeType.InstanceCreate
          ? '实例新增'
          : changeConfig?.changeType === ChangeType.InstanceDelete
            ? '实例删除'
            : '属性变化'}
      {gateConfig?.enabled && (
        <>
          ，且条件函数
          <div
            className={classNames(
              styles['rule-setting-tag'],
              funcEmpty ? 'text-[var(--color-text-6)]' : ''
            )}
          >
            {funcEmpty ? (
              '请先在左侧配置'
            ) : (
              <div>{gateConfig?.functionInfo?.name}</div>
            )}
          </div>
          返回为true
        </>
      )}
      {renderActionConfig(ruleData)}
    </>
  );
};

export const RuleSettingConfig = (props: RuleSettingConfigProps) => {
  const { mode, ruleData, properties } = props;

  const renderConfig = () => {
    if (ruleData?.triggerType === 1) {
      return renderAutoTriggerConfig(ruleData);
    }
    return renderAutoChangeConfig(ruleData, properties);
  };

  return (
    <div
      className={classNames([
        styles['rule-config'],
        styles[`rule-config-${mode}`],
        props.className
      ])}
    >
      <div className={styles['rule-config-text']}>
        <RuleSettingIcon className={'text-[#184FF2]'} />
        <span className={'font-[600]  leading-[22px] '}>配置摘要</span>
      </div>
      <div className={styles['rule-setting-content']}>{renderConfig()}</div>
    </div>
  );
};
