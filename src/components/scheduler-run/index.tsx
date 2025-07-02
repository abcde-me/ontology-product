import {
  Form,
  Input,
  TimePicker,
  Tag,
  Select,
  Alert,
  Divider
} from '@arco-design/web-react';
import Styles from './index.module.css';
import React, { useEffect, useState } from 'react';
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

export const TIMEARR = {
  [TimeType.SEPCIFICTIME]: {
    text: '具体日期'
  },
  [TimeType.RELATICELYTIME]: {
    text: '相对时间'
  }
};

interface CycleLoadingFormProps {
  options: CycleText;
  onOptionsChange: (options: CycleText) => void;
}

const initFrequencyData = (options: CycleText) => {
  if (options.month === '*') {
    return CycleValues.PER_MONTH;
  } else if (options.week === '*') {
    return CycleValues.PER_WEEK;
  } else {
    return CycleValues.PER_DAY;
  }
};

const getInitialValues = (frequencyData: CycleValues, options: CycleText) => {
  if (frequencyData === CycleValues.PER_MONTH) {
    return {
      cycle: frequencyData,
      date: options.date.split(','),
      time: `${options.hour}:${options.minute}`
    };
  } else if (frequencyData === CycleValues.PER_WEEK) {
    return {
      cycle: frequencyData,
      week: options.week.split(','),
      time: `${options.hour}:${options.minute}`
    };
  } else {
    return {
      cycle: frequencyData,
      time: `${options.hour}:${options.minute}`
    };
  }
};

const formatOptions = (frequencyData: CycleValues, formVals) => {
  const [hour, minute] = formVals.time.split(':');
  if (frequencyData === CycleValues.PER_MONTH) {
    return {
      minute,
      hour,
      date: formVals.date.join(','),
      month: '*',
      week: ''
    };
  } else if (frequencyData === CycleValues.PER_WEEK) {
    return {
      minute,
      hour,
      date: formVals.date.join(','),
      month: '',
      week: '*'
    };
  } else {
    return {
      minute,
      hour,
      date: '*',
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
  // 频率选择器选择的数据
  const [frequencyData, setFrequencyData] = useState(
    initFrequencyData(options)
  );
  const initialValues = getInitialValues(frequencyData, options);

  // 提示信息的状态
  // const [promptState, setPromptState] = useState(false);
  // 周期设置为月时 后面选择框改变的方法
  // const monthlyHan = (val) => {
  //   const monthIndex = val.some((item) => item == '每月最后一天');
  //   // setPromptState(monthIndex);
  // };
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
        week: ['1'],
        time: '09:00'
      });
    }
  };
  const [timeFlag, setTimeFlag] = useState('具体日期');
  const handleValuesChange = (changedValues, allValues) => {
    const optionsFormat = formatOptions(frequencyData, allValues);
    console.log('变化的字段:', changedValues);
    console.log('当前所有字段值:', allValues);
    console.log('格式后的字段值:', optionsFormat);
    onOptionsChange(optionsFormat);
  };

  return (
    // TODO: ts错误
    // @ts-expect-error
    <Form initialValues={initialValues} onValuesChange={handleValuesChange}>
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
                alignItems: 'start',
                justifyContent: 'space-between'
              }}
            >
              <Form.Item
                field="cycle"
                style={{ flex: 1, marginBottom: 0 }}
                rules={[{ required: true, message: '请选择频率' }]}
              >
                <Select
                  placeholder="频率"
                  style={{ width: 100 }}
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
                  field="week"
                  style={{
                    flex: '0 0 120px',
                    margin: '0 8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  rules={[{ required: true, message: '请选择时间' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择日期"
                    style={{
                      width: 300
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
                    flex: '0 0 120px',
                    margin: '0 8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  rules={[{ required: true, message: '请选择时间' }]}
                >
                  <Select
                    mode="multiple"
                    style={{ width: 300 }}
                    placeholder="请选择日期"
                    onChange={(val) => {
                      // monthlyHan(val);
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
                                key={item}
                                style={{
                                  width: '50%',
                                  height: '100%',
                                  background:
                                    item == timeFlag ? 'white' : undefined,
                                  color:
                                    item == timeFlag
                                      ? 'rgb(0, 125, 250)'
                                      : undefined,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '3px'
                                }}
                                onClick={() => {
                                  setTimeFlag(item);
                                  console.log(item);
                                }}
                              >
                                {item}
                              </div>
                            );
                          })}
                        </div>
                        {menu}
                      </div>
                    )}
                    dropdownMenuStyle={{ maxHeight: 200 }}
                  >
                    {timeFlag == TIMEARR[TimeType.SEPCIFICTIME].text &&
                      MONTHLY_OPTIONS.map((option) => (
                        <Option key={option.lable} value={option.value}>
                          {option.lable}
                        </Option>
                      ))}
                    {timeFlag == TIMEARR[TimeType.RELATICELYTIME].text &&
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
