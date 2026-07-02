import React from 'react';
import { Input, Select } from '@arco-design/web-react';
import type { RangeFieldValue } from '../types';
import styles from '../index.module.scss';

const Option = Select.Option;

interface RangeFilterInputProps {
  value?: RangeFieldValue;
  onChange?: (value: RangeFieldValue) => void;
}

const defaultRangeValue: RangeFieldValue = {
  min: '',
  max: '',
  minInclusive: true,
  maxInclusive: true
};

export const RangeFilterInput: React.FC<RangeFilterInputProps> = ({
  value,
  onChange
}) => {
  const current = { ...defaultRangeValue, ...value };

  const update = (patch: Partial<RangeFieldValue>) => {
    onChange?.({ ...current, ...patch });
  };

  return (
    <div className={styles['range-filter']}>
      <Select
        size="small"
        className={styles['range-bracket-select']}
        value={current.minInclusive === false ? '(' : '['}
        onChange={(val) => update({ minInclusive: val === '[' })}
      >
        <Option value="(">(</Option>
        <Option value="[">[</Option>
      </Select>
      <Input
        allowClear
        placeholder="下限"
        value={current.min}
        onChange={(val) => update({ min: val })}
      />
      <span className={styles['range-separator']}>,</span>
      <Input
        allowClear
        placeholder="上限"
        value={current.max}
        onChange={(val) => update({ max: val })}
      />
      <Select
        size="small"
        className={styles['range-bracket-select']}
        value={current.maxInclusive === false ? ')' : ']'}
        onChange={(val) => update({ maxInclusive: val === ']' })}
      >
        <Option value=")">)</Option>
        <Option value="]">]</Option>
      </Select>
    </div>
  );
};
