import React, { useState, useEffect } from 'react';
import { Button, Space, Descriptions, Modal, Form, Input, Select, Message } from '@arco-design/web-react';
import { exportFile } from '@/api/dataCatalog';
const FormItem = Form.Item;
interface FormProps {
  downloadData?: any;
  onCancel?: () => void;
  visible?: boolean; // 添加visible属性，用于控制弹框显示
}

const FormComponent: React.FC<FormProps> = ({ downloadData, onCancel, visible = false }) => {
  const handleExport = async () => {
    //导出逻辑
    exportFile({});
    try {
      await form.validate();
      Message.success('导出成功');
    } catch (e) {
      Message.error('导出失败，请重试');
    }
  };

  const handleCancel = () => {
    // 重置表单
    form.resetFields();
    // 调用父组件的取消回调
    onCancel && onCancel();
  };
  //导出
  const handExport = () => {
    console.log('导出');
    onCancel && onCancel();
  }
  //显示弹窗的状态由外部传入，不再在内部管理
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  // 当downloadData变化时，设置表单初始值
  useEffect(() => {
    if (downloadData) {
      form.setFieldsValue({
        name: downloadData.content
      });
    }
  }, [downloadData, form]);
  return (
    <Modal
      title='导出设置'
      visible={visible} // 使用外部传入的visible状态
      onOk={handleExport} // 点击确定时调用取消函数关闭弹框
      onCancel={handleCancel} // 点击取消时调用取消函数关闭弹框
      autoFocus={false}
      focusLock={true}
      footer={null} // 不显示默认按钮，使用自定义按钮
      style={{ width: 640 }}
    >
      <Form form={form} autoComplete='off' {...formItemLayout} style={{ width: 584 }}>
        <FormItem
          label='文件名称：'
          field='name'
          required
          extra='文件将以原始格式导出，保持数据完整性'
          rules={[
            {
              required: true,
              message: '请填写'
            },
          ]}
        >
          <Input placeholder='please enter your username' />
        </FormItem>
        {/* <FormItem wrapperCol={{ offset: 5 }}>
      </FormItem> */}
        <Form.Item label='选择连接器：' field='province' rules={[{ required: true, message: '请选择' }]}>
          <Select allowClear placeholder='please select' options={['Beijing', 'Shanghai']}></Select>
        </Form.Item>
        <FormItem
          label='保存路径：'
          field='path'
          required
          extra='指定导出文件的保存路径'
          rules={[
            {
              required: true,
              message: '请填写'
            },
          ]}
        >
          <Input placeholder='please enter your username' />
        </FormItem>
      </Form>
      <div style={{ marginTop: '20px', textAlign: 'right', marginBottom: 20 }}>
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleExport} >
            确定
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default FormComponent;
