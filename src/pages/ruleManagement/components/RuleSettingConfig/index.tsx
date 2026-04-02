import React from 'react';
import styles from './index.module.scss';
import RuleSettingIcon from '@/assets/rule-setting.svg';
import classNames from 'classnames';
import { AutoRuleDetail, PeriodType } from '@/pages/ruleManagement/types';
import { isEmpty, isNil } from 'lodash-es';

interface RuleSettingConfigProps {
  mode: 'card' | 'item';
  className?: string;
  ruleData?: AutoRuleDetail;
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

export const RuleSettingConfig = (props: RuleSettingConfigProps) => {
  const { mode, ruleData } = props;

  const renderAutoTriggerConfig = () => {
    const scheduleEmpty = isNil(ruleData?.scheduleConfig);
    const actionEmpty =
      isNil(ruleData?.actionConfig) ||
      isEmpty(ruleData?.actionConfig.actionInfo);
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

  const renderConfig = () => {
    if (ruleData?.triggerType === 1) {
      return renderAutoTriggerConfig();
    }
    return (
      <>
        当<div className={styles['rule-setting-tag']}>这是一条神奇的天路</div>
        时间，
        <div className={styles['rule-setting-tag']}>这又是一条神奇的天路啊</div>
        哈哈哈
        <div className={styles['rule-setting-tag']}>这又是一条神奇的天路啊</div>
        嘻嘻
        <div className={styles['rule-setting-tag']}>这又是一条神奇的天路啊</div>
      </>
    );
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
