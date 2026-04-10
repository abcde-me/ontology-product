import React from 'react';
import classNames from 'classnames';
import { DatePicker, TimePicker } from '@arco-design/web-react';
import type { DatePickerProps, TimePickerProps } from '@arco-design/web-react';
import dayjs, { Dayjs } from 'dayjs';
import styles from './index.module.scss';

type PickerValue = DatePickerProps['value'];

interface DateTimePickerProps extends CustomFormItemCompProps<PickerValue> {
  datePlaceholder?: string;
  timePlaceholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  disabled,
  datePlaceholder = '选择日期',
  timePlaceholder = '选择时间',
  className,
  style
}) => {
  const parsedValue = value ? dayjs(value as any) : undefined;

  const handleDateChange: DatePickerProps['onChange'] = (date, _dateString) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }
    const datePart = date;
    const timePart = (parsedValue ?? dayjs()).format('HH:mm:ss');
    const next = dayjs(`${datePart} ${timePart}`);
    onChange?.(next as PickerValue);
  };

  const handleTimeChange: TimePickerProps['onChange'] = (time, _timeString) => {
    if (!time) {
      onChange?.(undefined);
      return;
    }
    const timePart = time;
    const datePart = (parsedValue ?? dayjs()).format('YYYY-MM-DD');
    const next = dayjs(`${datePart} ${timePart}`);
    onChange?.(next as PickerValue);
  };

  return (
    <div
      className={classNames(styles.wrapper, className)}
      style={style}
      data-role="datetime-picker"
    >
      <DatePicker
        value={parsedValue}
        onChange={handleDateChange}
        disabled={disabled}
        placeholder={datePlaceholder}
        className={styles.datePicker}
        allowClear
        showTime={false}
      />
      <TimePicker
        value={parsedValue}
        onChange={handleTimeChange}
        disabled={disabled}
        placeholder={timePlaceholder}
        className={styles.timePicker}
        allowClear
      />
    </div>
  );
};
