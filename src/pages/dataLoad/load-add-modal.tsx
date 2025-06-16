import { Form, Input, Radio, Select } from '@arco-design/web-react'
import React from 'react'
// 单选框实例
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const LoadAddModal = () => {
    // 下拉框数据
    const [options, setOptions] = React.useState([
        { key: '1', title: '连接器名称1' },
        { key: '2', title: '连接器名称2' },
        { key: '3', title: '连接器名称3' },
        { key: '4', title: '连接器名称4' },
    ])
    return (
        <div>
            <Form style={{ width: 500 }} autoComplete='off'>
                <FormItem label='任务名称：'
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请输入任务名称' }]}
                >
                    <Input placeholder='' />
                </FormItem>
                <FormItem label='数据源类型：'
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                >
                    <RadioGroup defaultValue='s3'>
                        <Radio value='s3'>对象存储</Radio>
                        <Radio value='hdfs'>HDFS</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label='绑定连接器：'
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请输入任务名称' }]}
                >
                    <Select
                        style={{ width: 154 }}
                    >
                        {options.map((option, index) => (
                            <Option key={option.key} value={option.title}>
                                {option.title}
                            </Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem label='载入类型：'
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    labelAlign='right'
                    rules={[{ required: true, message: '请选择数据源类型' }]}
                >
                    <RadioGroup defaultValue='d'>
                        <Radio value='d'>单次载入</Radio>
                        <Radio value='z'>周期载入</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </div>
    )
}
export default LoadAddModal