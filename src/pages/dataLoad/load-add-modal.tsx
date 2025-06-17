import { Button, Form, Input, Message, Radio, Select, Tag, TimePicker, TreeSelect } from '@arco-design/web-react'
import React, { useState } from 'react'
import Styles from './index.module.css'
import CycleLoadingForm from './cycle-loading-form-modal';
// 单选框实例
const RadioGroup = Radio.Group;
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
        // 校验成功的逻辑
        form.validate().then(() => {
            // 点击确认隐藏弹框并且重置表单数据
            props.hideModalHan()
            console.log(fo1);
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
    const [loadVal, setLoadVal] = useState('')
    // 切换载入类型的函数
    const handoffLoadFormHan = (val) => {
        console.log(val);
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
                >
                    <Input placeholder='请输入任务名称' />
                </FormItem>
                <FormItem label='数据源类型：'
                    field="zairutype"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                    initialValue='s3'
                >
                    <RadioGroup defaultValue='s3'>
                        <Radio value='s3'>对象存储</Radio>
                        <Radio value='hdfs'>HDFS</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label='绑定连接器：'
                    field="conname"
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
                    initialValue='d'
                    field="sourec_type"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                >
                    <RadioGroup defaultValue='d' onChange={(val) => { handoffLoadFormHan(val) }}>
                        <Radio value='d'>单次载入</Radio>
                        <Radio value='z'>周期载入</Radio>
                    </RadioGroup>
                </FormItem>
                {loadVal == 'z' && <CycleLoadingForm form={form} /> }
                <FormItem label='载入位置：'
                    field="path"
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