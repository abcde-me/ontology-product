import {
  Form,
  Input,
  TimePicker,
  Tag,
  Select,
  Alert,
  Divider
} from '@arco-design/web-react';
import type { SelectHandle } from '@arco-design/web-react/es/Select/interface';
import Styles from './index.module.css';
import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import {
  WEEKLY_OPTIONS,
  MONTHLY_OPTIONS,
  CYCLE_OPTIONS,
  RELATIVE_TIME_OPTIONS,
  TIME_TAB
} from './constants';
import { CycleText, CycleValues, TimeType } from './types';
// 选择器的实例
const Option = Select.Option;

// 快捷键的数据
const quickOptionsData = [
  '每天凌晨0点',
  '每天中午12点',
  '每月一日凌晨0点',
  '每周一上午9点'
];

interface CycleLoadingFormProps {
  options: CycleText;
  onOptionsChange: (options: CycleText) => void;
}

const initFrequencyData = (options: CycleText) => {
  if (options.month === '*') {
    return CycleValues.PER_MONTH;
  } else if (options.week === '*') {
    return CycleValues.PER_WEEK;
  } else if (options.date === '*') {
    return CycleValues.PER_DAY;
  } else {
    return CycleValues.UNKNOWN;
  }
};

const getInitialValues = (frequencyData: CycleValues, options: CycleText) => {
  if (frequencyData === CycleValues.PER_MONTH) {
    return {
      cycle: frequencyData,
      date: options.date?.split(',') ?? [],
      time: `${options.hour}:${options.minute}`
    };
  } else if (frequencyData === CycleValues.PER_WEEK) {
    return {
      cycle: frequencyData,
      date: options.date?.split(',') ?? [],
      time: `${options.hour}:${options.minute}`
    };
  } else if (frequencyData === CycleValues.PER_DAY) {
    return {
      cycle: frequencyData,
      time: `${options.hour}:${options.minute}`
    };
  } else {
    return {
      cycle: undefined,
      time: ''
    };
  }
};

const formatOptions = (frequencyData: CycleValues, formVals) => {
  const [hour = '', minute = ''] = formVals.time.split(':');
  if (frequencyData === CycleValues.PER_MONTH) {
    return {
      minute,
      hour,
      date: Array.isArray(formVals.date)
        ? formVals.date.join(',')
        : formVals.date,
      month: '*',
      week: ''
    };
  } else if (frequencyData === CycleValues.PER_WEEK) {
    return {
      minute,
      hour,
      date: formVals.date?.join(',') ?? '',
      month: '',
      week: '*'
    };
  } else if (frequencyData === CycleValues.PER_DAY) {
    return {
      minute,
      hour,
      date: '*',
      month: '',
      week: ''
    };
  } else {
    return {
      minute,
      hour,
      date: '',
      month: '',
      week: ''
    };
  }
};

const CycleLoadingForm: React.FC<CycleLoadingFormProps> = ({
  options,
  onOptionsChange
}) => {
  const [form] = Form.useForm();
  const datePickerRef = useRef<SelectHandle>(null);
  // 频率选择器选择的数据
  const [frequencyData, setFrequencyData] = useState(
    initFrequencyData(options)
  );
  const initialValues = getInitialValues(frequencyData, options);

  // 点击快捷选项的回调
  const shortcutHan = (value) => {
    if (value == '每天凌晨0点') {
      setFrequencyData(CycleValues.PER_DAY);
      form.setFieldsValue({ cycle: CycleValues.PER_DAY, time: '00:00' });
    } else if (value == '每天中午12点') {
      setFrequencyData(CycleValues.PER_DAY);
      form.setFieldsValue({ cycle: CycleValues.PER_DAY, time: '12:00' });
    } else if (value == '每月一日凌晨0点') {
      setFrequencyData(CycleValues.PER_MONTH);
      form.setFieldsValue({
        cycle: CycleValues.PER_MONTH,
        date: ['1'],
        time: '00:00'
      });
    } else if (value == '每周一上午9点') {
      setFrequencyData(CycleValues.PER_WEEK);
      form.setFieldsValue({
        cycle: CycleValues.PER_WEEK,
        date: ['1'],
        time: '09:00'
      });
    }
  };
  const [timeFlag, setTimeFlag] = useState(TimeType.SEPCIFICTIME);
  const handleValuesChange = (_, allValues) => {
    const optionsFormat = formatOptions(frequencyData, allValues);
    console.log('当前所有字段值:', allValues, frequencyData);
    console.log('格式后的字段值:', optionsFormat);
    onOptionsChange(optionsFormat);
  };
  const handleClickTimeTab = (tab) => {
    datePickerRef.current?.focus();
    setTimeFlag(tab);
    const currentFieldsValue = form.getFieldsValue();
    form.setFieldsValue({ ...currentFieldsValue, date: undefined });
  };

  useEffect(() => {
    handleValuesChange(null, form.getFieldsValue());
  }, [frequencyData]);

  return (
    <Form
      form={form}
      initialValues={initialValues}
      onChange={handleValuesChange}
    >
      <div className={Styles.cycleLoadingBox}>
        <div style={{ display: 'flex' }}>
          <Form.Item
            label="周期设置："
            labelAlign="right"
            rules={[{ required: true }]}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'start'
              }}
            >
              <Form.Item
                field="cycle"
                style={{ flex: 1, marginBottom: 0 }}
                rules={[{ required: true, message: '请选择频率' }]}
                validateTrigger={['onBlur', 'onChange']}
              >
                <Select
                  placeholder="频率"
                  style={{ width: 80 }}
                  onChange={(val) => setFrequencyData(val)}
                >
                  {CYCLE_OPTIONS.map((item) => {
                    return (
                      <Option value={item.value} key={item.value}>
                        {item.lable}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              {frequencyData == CycleValues.PER_WEEK && (
                <Form.Item
                  field="date"
                  style={{
                    margin: '0 0 0 12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  rules={[{ required: true, message: '请选择时间' }]}
                  validateTrigger={['onBlur', 'onChange']}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择日期"
                    style={{
                      minWidth: 300
                    }}
                  >
                    {WEEKLY_OPTIONS.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.lable}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {frequencyData == CycleValues.PER_MONTH && (
                <Form.Item
                  field="date"
                  key={frequencyData}
                  style={{
                    margin: '0 0 0 12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  rules={[{ required: true, message: '请选择时间' }]}
                  validateTrigger={['onBlur', 'onChange']}
                >
                  <Select
                    mode={
                      timeFlag === TimeType.RELATICELYTIME
                        ? undefined
                        : 'multiple'
                    }
                    key={timeFlag}
                    style={{ minWidth: 300 }}
                    placeholder="请选择日期"
                    ref={datePickerRef}
                    triggerProps={{
                      trigger: 'focus'
                    }}
                    dropdownRender={(menu) => (
                      <div>
                        <Divider style={{ margin: 0 }} />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '3px',
                            background: 'rgb(224, 229, 238)',
                            margin: '5px 0px',
                            height: '35px'
                          }}
                        >
                          {TIME_TAB.map((item) => {
                            return (
                              <div
                                key={item.value}
                                style={{
                                  width: '50%',
                                  height: '100%',
                                  background:
                                    item.value == timeFlag
                                      ? 'white'
                                      : undefined,
                                  color:
                                    item.value == timeFlag
                                      ? 'rgb(0, 125, 250)'
                                      : undefined,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '3px'
                                }}
                                onClick={() => handleClickTimeTab(item.value)}
                              >
                                {item.lable}
                              </div>
                            );
                          })}
                        </div>
                        {menu}
                      </div>
                    )}
                    dropdownMenuStyle={{ maxHeight: 200 }}
                  >
                    {timeFlag == TimeType.SEPCIFICTIME &&
                      MONTHLY_OPTIONS.map((option) => (
                        <Option key={option.lable} value={option.value}>
                          {option.lable}
                        </Option>
                      ))}
                    {timeFlag == TimeType.RELATICELYTIME &&
                      RELATIVE_TIME_OPTIONS.map((option) => (
                        <Option key={option.lable} value={option.value}>
                          {option.lable}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              )}
            </div>
          </Form.Item>
        </div>
        <Form.Item
          label="时间设置："
          key={frequencyData}
          field="time"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择时间' }]}
          validateTrigger={['onBlur', 'onChange']}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" size="large" />
        </Form.Item>
        <Form.Item
          label="快捷键选项："
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
        >
          <div className={Styles.quickOptions}>
            {quickOptionsData.map((item: any, index: number) => {
              return (
                <div
                  className={Styles.quickOptionsChidren}
                  key={index}
                  onClick={() => {
                    shortcutHan(item);
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </Form.Item>
      </div>
    </Form>
  );
};

export default CycleLoadingForm;
