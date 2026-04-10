import React from 'react';
import { InputNumber } from '@arco-design/web-react';
import styles from './index.module.scss';

export type NumberRangeValue = Record<string, number>;
export const NumberRange = (
  props: CustomFormItemCompProps<NumberRangeValue> & {
    minText?: string;
    maxText?: string;
    minField?: string;
    maxField?: string;
  }
) => {
  const {
    value,
    onChange,
    disabled,
    minText,
    maxText,
    minField = 'min',
    maxField = 'max'
  } = props;
  const changeValue = (n: number, type: string) => {
    onChange?.({
      ...value,
      [type]: n
    });
  };

  return (
    <div className={'flex items-center gap-2 text-[#0F131F]'}>
      <div className={`min-w-[160px] ${styles['number-input']}`}>
        <InputNumber
          hideControl
          prefix={minText || '最小值'}
          value={value?.[minField]}
          onChange={(n) => {
            changeValue(n, minField);
          }}
          placeholder={'请输入'}
          max={value?.[maxField]}
          disabled={disabled}
        />
      </div>
      -
      <div className={`min-w-[160px] ${styles['number-input']}`}>
        <InputNumber
          hideControl
          placeholder={'请输入'}
          prefix={maxText || '最大值'}
          min={value?.[minField]}
          disabled={disabled}
          onChange={(n) => {
            changeValue(n, maxField);
          }}
          value={value?.[maxField]}
        />
      </div>
    </div>
  );
};
