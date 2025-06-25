import { Form, TimePicker, Tag, Select, Alert } from '@arco-design/web-react';
import Styles from './index.module.css';
import React, { useState } from 'react';
import './index.css';
import {
  WEEKLY_OPTIONS,
  MONTHLY_OPTIONS,
  QUICK_OPTIONS_DATA
} from './constants';
// 选择器的实例
const Option = Select.Option;

const EditLoadingForm: React.FC = () => {
  // 频率选择器选择的数据
  const [frequencyData, setFrequencyData] = useState('');
  const [form] = Form.useForm();

  // 提示信息的状态
  const [promptState, setPromptState] = useState(-1);
  // 周期设置为月时 后面选择框改变的方法
  const monthlyHan = (val) => {
    const monthIndex = val.findIndex((item) => item == '31');
    setPromptState(monthIndex);
  };
  // 点击快捷选项的回调
  const shortcutHan = (value) => {
    if (value == '每天凌晨0点') {
      setFrequencyData('每天');
      form.setFieldsValue({ cycle: '每日', time: '00:00' });
    } else if (value == '每天中午12点') {
      setFrequencyData('每天');
      form.setFieldsValue({ cycle: '每日', time: '12:00' });
    } else if (value == '每月一日凌晨0点') {
      setFrequencyData('每月');
      form.setFieldsValue({ cycle: '每月', day: ['1号'], time: '00:00' });
    } else if (value == '每周一上午9点') {
      setFrequencyData('每周');
      form.setFieldsValue({ cycle: '每周', weekly: ['周一'], time: '09:00' });
    }
  };

  return (
    <Form style={{ width: '100%' }} autoComplete="off" form={form}>
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
                  <Option value="每日">每日</Option>
                  <Option value="每周">每周</Option>
                  <Option value="每月">每月</Option>
                </Select>
              </Form.Item>
              {frequencyData == '每天' && null}
              {frequencyData == '每周' && (
                <Form.Item
                  field="weekly"
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
                    options={WEEKLY_OPTIONS}
                    placeholder="请选择日期"
                    style={{
                      width: 300
                    }}
                  />
                </Form.Item>
              )}
              {frequencyData == '每月' && (
                <Form.Item
                  field="day"
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
                    options={MONTHLY_OPTIONS}
                    placeholder="请选择日期"
                    style={{
                      width: 300
                    }}
                    onChange={(val) => {
                      monthlyHan(val.map((item) => item.slice(0, -1)));
                    }}
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>
        </div>
        {promptState == -1 ? null : (
          <Alert
            style={{
              margin: '0px 0px 10px 30px',
              width: '94%',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
            showIcon={false}
            type="info"
            content="若月份不包含31日，系统会在当月最后一天执行"
          />
        )}
        <Form.Item
          label="时间设置："
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
            {QUICK_OPTIONS_DATA.map((item: any, index: number) => {
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

export default EditLoadingForm;
