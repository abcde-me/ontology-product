import { Form, Input, TimePicker, Tag, Select } from '@arco-design/web-react';
import Styles from './index.module.css';
import React, { useState } from 'react'
import './index.css'
// 选择器的实例
const Option = Select.Option;

const weeklyOptions = ['周一', '周二', '周三', '周四', '周五', '周六','周日'];

// 周期设置的数据
const cycleData = [
    { key: '1', title: '每天' },
    { key: '2', title: '每周' },
    { key: '3', title: '每月' },
];
interface CycleLoadingFormProps {
    form: any; // 实际项目中应该使用更具体的类型
}

// 快捷键的数据
const quickOptionsData = [
    '每天凌晨0点',
    '每天中午12点',
    '每月一日凌晨0点',
    '每周一上午9点'
]

const CycleLoadingForm: React.FC<CycleLoadingFormProps> = ({ form }) => {
    // 频率选择器选择的数据
    const [frequencyData, setFrequencyData] = useState('')
    return (
        <div className={Styles.cycleLoadingBox}>
            <div style={{ display: 'flex' }}>
                <Form.Item
                    label='周期设置：'
                    labelAlign='right'
                    rules={[{ required: true }]}
                >
                    <div style={{ display: 'flex', alignItems: 'start' }}>
                        <Form.Item
                            field="cycle"
                            style={{ flex: 1, marginBottom: 0 }}
                            rules={[{ required: true,message: '请选择频率' }]}
                        >
                            <Select placeholder="频率" 
                                style={{ width: 100 }}
                                onChange={(val) => setFrequencyData(val)
                                }
                            >
                                <Option value="每日">每日</Option>
                                <Option value="每周">每周</Option>
                                <Option value="每月">每月</Option>
                            </Select>
                        </Form.Item>
                        {frequencyData == '每天' && null}
                        {frequencyData == '每周' &&
                            <Form.Item
                                field="weekly"
                                style={{
                                    flex: '0 0 120px',
                                    margin: '0 8px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                rules={[{ required: true,message: '请选择时间' }]}
                            >
                                <Select
                                    mode='multiple'
                                    options={weeklyOptions}
                                    placeholder='请选择日期'
                                    style={{
                                        width: 300,
                                    }}
                                />
                            </Form.Item>
                        }
                    </div>

                </Form.Item>

            </div>
            <Form.Item
                label='时间设置：'
                field="time"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign='right'
                rules={[{ required: true, message: '请选择时间' }]}
            >
                <TimePicker style={{ width: '100%' }} format='HH:mm' size='large'  />
            </Form.Item>
            <Form.Item
                label='快捷键选项：'
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                labelAlign='right'
            >
                <div className={Styles.quickOptions}>
                    {quickOptionsData.map((item: any, index: number) => {
                        return <div className={Styles.quickOptionsChidren} key={index}>{item}</div>
                    })}
                </div>
            </Form.Item>
        </div>
    );
};

export default CycleLoadingForm;