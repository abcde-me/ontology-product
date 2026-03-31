import React from 'react';
import styles from './index.module.scss';
import TriggerChangeIcon from '@/assets/trigger-change.svg';
import TriggerAutoIcon from '@/assets/trigger-auto.svg';
import TriggerCheckedIcon from '@/assets/link-check.svg';
import classNames from 'classnames';

const TRIGGER_TYPE = [
  {
    title: '定时触发',
    desc: '按计划时间主动执行',
    icon: <TriggerAutoIcon width={40} height={40} />,
    className: styles['trigger-auto'],
    type: 1
  },
  {
    title: '变更触发',
    type: 2,
    desc: '响应数据变化被动触发',
    className: styles['trigger-change'],
    icon: <TriggerChangeIcon width={40} height={40} />
  }
];
export const TriggerType = (props: {
  value?: number;
  onChange?: (value: number) => void;
}) => {
  const { value, onChange } = props;
  return (
    <div className={styles['trigger-type-container']}>
      {TRIGGER_TYPE.map((item, index) => {
        const { title, desc, icon, type, className } = item;
        return (
          <div
            className={classNames(
              styles['trigger-type-card'],
              value === type && styles['trigger-type-card-active']
            )}
            key={type}
            onClick={() => onChange?.(type)}
          >
            <div className={`${styles['trigger-checked']}`}>
              <TriggerCheckedIcon />
            </div>
            <div className={classNames(styles['trigger-type-icon'], className)}>
              {icon}
            </div>

            <div className={styles['trigger-type-content']}>
              <div className={styles['trigger-type-title']}>{title}</div>
              <div className={styles['trigger-type-desc']}>{desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
