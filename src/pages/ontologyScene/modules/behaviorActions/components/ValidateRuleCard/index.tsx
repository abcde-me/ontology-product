import React, { useEffect, useMemo } from 'react';
import styles from './index.module.scss';
import {
  EnumRule,
  LengthRule,
  RuleName,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import { Switch, Tag } from '@arco-design/web-react';

const RuleConfig = {
  [RuleName.EnumRule]: {
    label: '枚举值：',
    getValue(config: EnumRule) {
      return config.options.toString();
    }
  },
  [RuleName.LengthRule]: {
    label: '长度范围：',
    getValue(config: LengthRule) {
      return `${config.minLength} ~ ${config.maxLength}`;
    }
  },
  [RuleName.RangeRule]: {
    label: '数值范围：',
    getValue(config: any) {
      return `${config.minValue} ~ ${config.maxValue}`;
    }
  }
};

/** 校验规则卡片列表组件（只读展示） */
export const ValidateRuleCard = (props: { rule: ValidateRule }) => {
  const { name, type, enabledValidation, rule_name, ruleConfig, failMessage } =
    props.rule;

  const { label, getValue } = RuleConfig[rule_name];

  return (
    <div className={styles['rule-card']}>
      <div
        className={`flex items-center gap-2 font-PingFangSc text-[14px] font-medium leading-[22px] text-black ${styles['rule-card-header']}`}
      >
        <div className={'flex flex-shrink-0 items-center gap-2'}>
          {name}
          <Tag
            className={`ml-3 text-[#184FF2] ${styles['type-tag']}`}
            bordered
            color={'transparent'}
          >
            {type}
          </Tag>
        </div>
        <Switch checked={enabledValidation} disabled />
      </div>
      <div className={styles['rule-card-body']}>
        <div className={styles['field-values']}>
          <div className={styles['field-label']}>{label}</div>
          <div className={styles['field-value']}>{getValue(ruleConfig)}</div>
        </div>
        <div className={styles['field-values']}>
          <div className={styles['field-label']}>报错文案：</div>
          <div className={styles['field-value']}>{failMessage}</div>
        </div>
      </div>
    </div>
  );
};
