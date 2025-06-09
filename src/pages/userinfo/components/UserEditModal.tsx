import React from 'react';
import { Modal, Form, Input, Avatar, Notification } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';

interface UserEditModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  formRef: React.RefObject<FormInstance>;
  initialValues: {
    account: string;
    phone: string;
    username: string;
  };
}

const validatePhone = (value: string): boolean => {
  return /^1[3-9]\d{9}$/.test(value);
};

export const UserEditModal = ({
  visible,
  onOk,
  onCancel,
  formRef,
  initialValues
}: UserEditModalProps) => {
  return (
    <Modal
      title="编辑用户信息"
      visible={visible}
      onOk={() => {
        formRef.current?.validate().then((values) => {
          console.log('用户信息表单数据:', values);
          onOk(values);
          Notification.success({
            title: '操作成功',
            content: '用户信息已更新!',
          });
        });
      }}
      onCancel={onCancel}
      autoFocus={false}
      focusLock={true}
    >
      <Form
        ref={formRef}
        initialValues={initialValues}
      >
        <Form.Item
          label="头像"
          field="avatar"
          style={{ marginBottom: 16 }}
        >
          <Avatar size={64} style={{ backgroundColor: '#0061FD' }}>
            {
                  initialValues?.username[0]?.toLocaleUpperCase()
                }
          </Avatar>
        </Form.Item>
        <Form.Item
          label="姓名"
          field="account"
          rules={[{ required: true, message: '请输入姓名' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          label="手机号码"
          field="phone"
          rules={[
            { 
              validator: (value, cb) => {
                if (!validatePhone(value)) {
                  cb('请输入有效的手机号');
                } else {
                  cb();
                }
              }
            }
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
