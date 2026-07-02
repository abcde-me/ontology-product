import React, { useEffect } from 'react';
import { Form, Input, Modal } from '@arco-design/web-react';
import type { CreateApplicationScenarioInput } from '../types';

const { TextArea } = Input;

interface CreateScenarioModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateApplicationScenarioInput) => void;
}

export const CreateScenarioModal: React.FC<CreateScenarioModalProps> = ({
  visible,
  saving,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm<CreateApplicationScenarioInput>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [form, visible]);

  return (
    <Modal
      title="创建应用场景"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => form.submit()}
      unmountOnExit
    >
      <Form form={form} layout="vertical" onSubmit={onSubmit}>
        <Form.Item
          label="场景名称"
          field="name"
          rules={[{ required: true, message: '请输入场景名称' }]}
        >
          <Input placeholder="例如：联合作战态势分析" maxLength={64} />
        </Form.Item>
        <Form.Item label="场景描述" field="description">
          <TextArea
            placeholder="选填，描述场景用途与业务背景"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
