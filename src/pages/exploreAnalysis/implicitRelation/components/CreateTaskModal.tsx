import React, { useEffect } from 'react';
import { Form, Input, Modal } from '@arco-design/web-react';
import type { CreateImplicitRelationTaskInput } from '../types';

const { TextArea } = Input;

interface CreateTaskModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateImplicitRelationTaskInput) => void;
}

export default function CreateTaskModal({
  visible,
  saving,
  onCancel,
  onSubmit
}: CreateTaskModalProps) {
  const [form] = Form.useForm<CreateImplicitRelationTaskInput>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [form, visible]);

  return (
    <Modal
      title="新建隐性关系"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => form.submit()}
      unmountOnExit
    >
      <Form form={form} layout="vertical" onSubmit={onSubmit}>
        <Form.Item
          label="任务名称"
          field="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="例如：货物运输隐性关系分析" maxLength={64} />
        </Form.Item>
        <Form.Item label="任务描述" field="description">
          <TextArea
            placeholder="选填，描述分析目标与业务背景"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
