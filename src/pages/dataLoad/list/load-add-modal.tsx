import { Button, Form, Input, Message, Radio, Select, Tag, TimePicker, TreeSelect } from '@arco-design/web-react'
import React, { useState } from 'react'
import Styles from './index.module.css'
import CycleLoadingForm from '../list/cycle-loading-form-modal';
import conversionArco from '../../../utils/conversionArco'
// 单选框实例
const RadioGroup = Radio.Group;
// 表单实例
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const LoadAddModal = (props: any) => {

    // 整体表单实例
    const [form] = Form.useForm()

    // 绑定连接器下拉框数据
    const [connectionoPtions, setConnectionOptions] = React.useState([
        { key: '1', title: '连接器名称1' },
        { key: '2', title: '连接器名称2' },
        { key: '3', title: '连接器名称3' },
        { key: '4', title: '连接器名称4' },
    ])


    const [value, setValue] = useState<string[]>([]);
    // 载入位置的下拉数据
    const treeData = [
        {
            title: '酒店数据目录',
            value: 'hotel',
            children: [
                { title: '北京市豪华酒店', value: '北京市豪华酒店' },
                { title: '上海市豪华酒店', value: '上海市豪华酒店' },
            ],
        },
        {
            title: '餐厅数据',
            value: 'restaurant',
            children: [
                { title: '广州餐厅', value: '广州餐厅' },
                { title: '深圳餐厅', value: '深圳餐厅' },
            ],
        },
    ]


    // 提交表单时的校验逻辑
    const handleSubmit = () => {
        const fo1 = form.getFieldsValue()
        const [hour, minute] = fo1.time.split(':')
        // 校验成功的逻辑
        form.validate().then(() => {
            // 点击确认隐藏弹框并且重置表单数据
            props.hideModalHan()
            const fo2 = {
                name: fo1.name,
                connector_id: fo1.connector_id,
                source_type: fo1.cycle,
                load_type: fo1.load_type,
                dest_path: fo1.dest_path,
                minute: minute,
                hour: hour,
                data: fo1.cycle == '每日' ? '*' : fo1.cycle == '每月' ? fo1.week : '*',
                month: fo1.cycle == '每月' ? '*' : '',
                week: fo1.cycle == '每周' ? fo1.week : '',
                creator: '张三'
            }
            console.log(fo2);
        }).catch((error) => {
            // 校验失败，错误信息会由 Form 自动处理
            console.error('表单校验失败：', error);
        });
    };

    // 点击取消按钮的逻辑
    const cancelHan = () => {
        // 点击取消隐藏弹框并且重置表单数据
        props.hideModalHan()
    }

    // 载入类型的默认值
    const [loadVal, setLoadVal] = useState('once')
    // 切换载入类型的函数
    const handoffLoadFormHan = (val) => {
        if (val === 'once') {
            form.setFieldsValue({ time: undefined, day: undefined, weekly: undefined, cycle: undefined });
        } else {
            form.setFieldsValue({ cron_expr: undefined }); // 如果有需要，可以重置其他字段
        }
        setLoadVal(val)
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Form style={{ width: '100%' }} autoComplete='off' form={form}>
                <FormItem label='任务名称：'
                    field="name"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请输入任务名称' }]}
                    extra={
                        <div style={{ color: '#666', fontSize: 14 }}>
                            <div>支持中文，英文，数字，下划线</div>
                            <div>名称建议:北京市各区GDP数据_2024</div>
                        </div>
                    }
                    initialValue='s3'
                >
                    <Input placeholder='请输入任务名称' />
                </FormItem>
                <FormItem label='数据源类型：'
                    field="source_type"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                    initialValue='s3'
                >
                    <RadioGroup>
                        <Radio value='s3'>对象存储</Radio>
                        <Radio value='hdfs'>HDFS</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label='绑定连接器：'
                    field="connector_id"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请输入任务名称' }]}
                >
                    <Select placeholder='请选择连接器'>
                        {connectionoPtions.map((option, index) => (
                            <Option key={option.key} value={option.title}>
                                {option.title}
                            </Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem label='载入形式：'
                    initialValue='once'
                    field="load_type"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                >
                    <RadioGroup onChange={(val) => { handoffLoadFormHan(val) }}>
                        <Radio value='once'>单次载入</Radio>
                        <Radio value='cron'>周期载入</Radio>
                    </RadioGroup>
                </FormItem>
                {loadVal == 'cron' ? <CycleLoadingForm form={form} /> : null}
                <FormItem label='载入位置：'
                    field="dest_path"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择载入位置' }]}
                >
                    <TreeSelect
                        style={{ width: '100%' }}
                        treeData={treeData}
                        placeholder="请选择载入位置"
                        allowClear
                        onChange={(val) => console.log(val)}
                        fieldNames={{
                            title: 'title',  // 显示文本使用 title
                            key: 'value',  // 实际值使用 value
                            children: 'children'
                        }}
                    />
                </FormItem>
            </Form>
            <div className={Styles.footerBbtnBox}>
                <Button onClick={cancelHan} style={{ marginRight: '20px' }}>取消</Button>
                <Button onClick={handleSubmit}>确认</Button>
            </div>
        </div>
    )
}
export default LoadAddModal