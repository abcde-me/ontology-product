import React from 'react';
import {
  Modal,
  Form,
  Input,
  Avatar,
  Notification
} from '@arco-design/web-react';
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
            content: '用户信息已更新!'
          });
        });
      }}
      // onCancel={onCancel}
      onCancel={() => {
        formRef.current?.resetFields(); // 取消时重置表单
        onCancel();
      }}
      autoFocus={false}
      focusLock={true}
    >
      <Form ref={formRef} initialValues={initialValues}>
        <Form.Item label="头像" field="avatar" style={{ marginBottom: 16 }}>
          <Avatar size={64} style={{ backgroundColor: '#0061FD' }}>
            {initialValues?.username[0]?.toLocaleUpperCase()}
          </Avatar>
        </Form.Item>
        <Form.Item
          label="姓名："
          field="username"
          rules={[{ required: true, message: '请输入姓名' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          label="手机号码："
          field="phone"
          rules={[
            {
              validator: (value, cb) => {
                if (!value) {
                  // 为空直接通过
                  return cb();
                }
                if (!/^1[3-9]\d{9}$/.test(value)) {
                  return cb('请输入有效的手机号');
                }
                return cb();
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
