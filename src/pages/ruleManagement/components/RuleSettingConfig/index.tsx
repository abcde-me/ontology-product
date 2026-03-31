import React from 'react';
import styles from './index.module.scss';
import RuleSettingIcon from '@/assets/rule-setting.svg';
import classNames from 'classnames';

interface RuleSettingConfigProps {
  ruleId?: string;
  mode: 'card' | 'item';
  className?: string;
}

export const RuleSettingConfig = (props: RuleSettingConfigProps) => {
  const { mode } = props;
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
      <div className={styles['rule-setting-content']}></div>
    </div>
  );
};
