import React from 'react';
import { Modal, Form, Input, Notification } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';

interface PasswordModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  formRef: React.RefObject<FormInstance>;
}

export const PasswordModal = ({
  visible,
  onOk,
  onCancel,
  formRef
}: PasswordModalProps) => {
  return (
    <>
      <Modal
        title="修改密码"
        visible={visible}
        onOk={() => {
          formRef.current?.validate().then((values) => {
            console.log('密码修改表单数据:', values);
            onOk(values);
          });
        }}
        onCancel={onCancel}
        autoFocus={false}
        focusLock={true}
      >
        <Form ref={formRef}>
          <Form.Item
            label="旧密码:"
            field="old_password"
            rules={[{ required: true, message: '请输入旧密码' }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password placeholder="请输入旧密码" />
          </Form.Item>
          <Form.Item
            label="新密码:"
            field="password"
            rules={[
              { required: true, message: '请输入新密码' },
              {
                validator: (value, cb) => {
                  if (
                    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#]).{8,24}$/.test(
                      value
                    )
                  ) {
                    cb('密码需要包含8-24位字符，混合大小写字母、数字和符号');
                  } else {
                    cb();
                  }
                }
              }
            ]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <div
            style={{
              marginBottom: 16,
              marginLeft: '100px',
              color: '#999',
              fontSize: '12px'
            }}
          >
            密码需要包含8-24位字符，混合大写字母、小写字母、数字和符号（如!@#），且不含个人信息
          </div>
          <Form.Item
            label="重复新密码:"
            field="confirmPassword"
            rules={[
              { required: true, message: '请重复新密码' },
              {
                validator: (value, cb) => {
                  if (
                    formRef.current &&
                    value !== formRef.current.getFieldValue('password')
                  ) {
                    cb('两次输入的密码不一致');
                  } else {
                    cb();
                  }
                }
              }
            ]}
          >
            <Input.Password placeholder="请重复新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
