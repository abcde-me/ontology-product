import { Button, Form, Input, Message, Modal, Radio } from "@arco-design/web-react";
import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import './index.css'
import { addconnectionList, updataConnectionList } from "@/api/connectionApi";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const addModal = forwardRef((props: any, ref) => {
    // 创建的表单实例
    const [form] = Form.useForm();

    // 判断是修改还是添加
    const [isFlag, setIsFlag] = useState(null)

    // 弹框的状态
    const [visible, setVisible] = React.useState(false);

    // 判断是以什么方式存储(s3:对象存储;hdfs:HDFS存储)
    const [storageType, setStorageType] = useState('s3')

    // 将方法暴露给父组件
    useImperativeHandle(ref, () => ({
        displayModalView: (id) => {
            console.log(id);
            setIsFlag(id)
            setVisible(true)
            if (id) {
                // 编辑模式 - 设置表单值
                form.setFieldsValue({
                    ...id,
                    ...id.config,
                    type: id.type || 's3'
                });
                setStorageType(id.type || 's3');
            } else {
                // 添加模式 - 重置表单
                form.resetFields();
                form.setFieldsValue({ type: 's3', name: '' });
                setStorageType('s3');
            }
        }
    }))
    // 点击创建的按钮
    const createConnectionHan = () => {
        form.validate().then(values => {
            const { type, name, ...newValues } = values
            const newfrom = {
                name: values.name,
                type: values.type,
                config: {
                    ...newValues
                },
                creator: "test1"
            };
            if (isFlag == null) {
                // 添加逻辑
                addconnectionList(newfrom)
                props.getListHan()
            } else {
                // 编辑逻辑
                updataConnectionList({ connector_id:isFlag.id, newfrom })
                props.getListHan()
            }
            setVisible(false);
            resetHan();
        }).catch(error => {
            console.log('验证失败', error);
        });
    }
    const resetHan = () => {
        form.resetFields();
        form.setFieldsValue({ type: 's3' });
        setStorageType('s3');
        setIsFlag(null);
    }
    return <div>
        <Modal
            style={{ width: '700px' }}
            title={isFlag ? '编辑连接器' : '创建连接器'}
            visible={visible}
            autoFocus={false}
            focusLock={false}
            unmountOnExit={true}
            onCancel={() => {
                // 点击关闭隐藏弹框
                if (isFlag == null) {
                    setVisible(false)
                    resetHan()
                } else {
                    setVisible(false)
                    form.resetFields()
                }

            }}

            footer={
                <div style={{ marginBottom: '20px' }}>
                    <Button onClick={() => {
                        if (isFlag == null) {
                            setVisible(false)
                            resetHan()
                        } else {
                            setVisible(false)
                            form.resetFields()
                        }

                    }}
                        style={{ fontSize: '14px', fontWeight: '400' }}

                    >
                        取消</Button>
                    <Button type="primary" onClick={createConnectionHan}
                        style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '400' }}
                    >
                        {isFlag !== null ? '编辑连接器' : '测试并创建'}
                    </Button>
                </div>
            }
        >
            <div className="modal-overlay">
                {isFlag == null ?
                    <Form style={{ width: 600 }} autoComplete='off'
                        form={form}
                    >
                        <FormItem label='连接器名称：'
                            required
                            field="name"
                            rules={[{ required: true, message: '请输入连接器名称' }]}
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 19 }}
                            labelAlign='right'
                        >
                            <Input placeholder='请输入' />
                        </FormItem>
                        <FormItem label='连接器类型：'
                            field="type"
                            rules={[{ required: true, message: '请选择类型' }]}
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 19 }}
                            labelAlign='right'
                            initialValue='s3'
                        >
                            <RadioGroup defaultValue='s3' onChange={(value) => {
                                setStorageType(value)
                            }}>
                                <Radio value='s3'>对象存储</Radio>
                                <Radio value='hdfs'>HDFS</Radio>
                            </RadioGroup>
                        </FormItem>
                        <span style={{ margin: '13px 0px 13px 0px', fontSize: '17px', fontWeight: '500' }}>连接信息</span>
                        {
                            storageType == 's3' ?
                                <div>
                                    <FormItem label='Endpoint：'
                                        field="endpoint"
                                        rules={[{ required: true, message: '请输入Endpoint' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='AccessKey lD :'
                                        field="access_key"
                                        rules={[{ required: true, message: '请输入AccessKey lD' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='AccessKey Secret :'
                                        field="secret_key"
                                        rules={[{ required: true, message: '请输入AccessKey Secret' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='区域：'
                                        field="region"
                                        rules={[{ required: true, message: '请输入区域' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='文件路径：'
                                        field="path"
                                        rules={[{ required: true, message: '请输入文件路径' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                </div>


                                : <div>
                                    <FormItem label='Host：'
                                        rules={[{ required: true, message: '请输入Host' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='host'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='Port：'
                                        rules={[{ required: true, message: '请输入Port' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='port'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='用户名：'
                                        rules={[{ required: true, message: '请输入用户名' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='user'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='目录路径：'
                                        rules={[{ required: true, message: '请输入目录路径' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field="path"
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                </div>
                        }
                    </Form>
                    :
                    <Form
                        style={{ width: 600 }}
                        autoComplete='off'
                        form={form} // 统一使用一个表单实例
                        initialValues={isFlag ? {
                            ...isFlag,
                            type: isFlag.type || 's3'
                        } : { type: 's3' }}
                    >
                        <FormItem label='连接器名称：'
                            disabled={true}
                            required
                            field="name"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 19 }}
                            labelAlign='right'
                        >
                            <Input placeholder='请输入' />
                        </FormItem>
                        <FormItem label='连接器类型：'
                            field="type"
                            rules={[{ required: true, message: '请选择类型' }]}
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 19 }}
                            labelAlign='right'
                            disabled={true}
                        >
                            <RadioGroup defaultValue={isFlag.type}>
                                <Radio value='s3'>对象存储</Radio>
                                <Radio value='hdfs'>HDFS</Radio>
                            </RadioGroup>
                        </FormItem>
                        <span style={{ margin: '13px 0px 13px 0px', fontSize: '17px', fontWeight: '500' }}>连接信息</span>
                        {
                            isFlag.type == 's3' ?
                                <div>
                                    <FormItem label='Endpoint：'
                                        field="endpoint"
                                        rules={[{ required: true, message: '请输入Endpoint' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='AccessKey lD :'
                                        field="access_key"
                                        rules={[{ required: true, message: '请输入AccessKey lD' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='AccessKey Secret :'
                                        field="secret_key"
                                        rules={[{ required: true, message: '请输入AccessKey Secret' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='区域：'
                                        field="region"
                                        rules={[{ required: true, message: '请输入区域' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='文件路径：'
                                        field="path"
                                        rules={[{ required: true, message: '请输入文件路径' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                </div>


                                : <div>
                                    <FormItem label='Host：'
                                        rules={[{ required: true, message: '请输入Host' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='host'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='Port：'
                                        rules={[{ required: true, message: '请输入Port' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='port'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='用户名：'
                                        rules={[{ required: true, message: '请输入用户名' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                        field='user'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                    <FormItem label='目录路径：'
                                        field="path"
                                        rules={[{ required: true, message: '请输入目录路径' }]}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                        labelAlign='right'
                                    >
                                        <Input placeholder='请输入' />
                                    </FormItem>
                                </div>
                        }
                    </Form>
                }

            </div>

        </Modal>
    </div>
})
export default addModal