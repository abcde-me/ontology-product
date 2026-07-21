import React from 'react';
import { IMPLICIT_RELATION_TASK_TYPE_OPTIONS } from '../constants';
import type { ImplicitRelationTaskType } from '../types';
import styles from './TaskTypeRadioGroup.module.scss';

interface TaskTypeRadioGroupProps {
  value?: ImplicitRelationTaskType;
  onChange?: (value: ImplicitRelationTaskType) => void;
}

export default function TaskTypeRadioGroup({
  value,
  onChange
}: TaskTypeRadioGroupProps) {
  return (
    <div
      className={styles.taskTypeGrid}
      role="radiogroup"
      aria-label="任务类型"
    >
      {IMPLICIT_RELATION_TASK_TYPE_OPTIONS.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.taskTypeCard} ${
              active ? styles.taskTypeCardActive : ''
            }`}
            onClick={() => onChange?.(option.value)}
          >
            <span className={styles.taskTypeLabel}>{option.label}</span>
            <span className={styles.taskTypeIndicator} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
