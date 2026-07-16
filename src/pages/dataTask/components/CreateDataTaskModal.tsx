import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Space } from '@arco-design/web-react';
import { OntoModal } from '@/components/OSModal';

export interface CreateDataTaskFormValues {
  name: string;
  description?: string;
}

interface CreateDataTaskModalProps {
  visible: boolean;
  loading?: boolean;
  /** 打开弹窗时预填的任务名称 */
  initialName?: string;
  onCancel: () => void;
  onSubmit: (values: CreateDataTaskFormValues) => Promise<void> | void;
}

export default function CreateDataTaskModal({
  visible,
  loading = false,
  initialName,
  onCancel,
  onSubmit
}: CreateDataTaskModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.resetFields();
    const trimmedName = String(initialName ?? '').trim();
    if (trimmedName) {
      form.setFieldsValue({ name: trimmedName });
    }
  }, [form, initialName, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      setSubmitting(true);
      await onSubmit({
        name: String(values.name || '').trim(),
        description: values.description?.trim() || undefined
      });
    } catch (error: any) {
      if (error?.errors) {
        return;
      }
      Message.error(error?.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OntoModal
      title="新建数据任务"
      visible={visible}
      onCancel={onCancel}
      maskClosable={!busy}
      escToExit={!busy}
      style={{ width: 560 }}
      unmountOnExit
      footer={
        <Space size={12}>
          <Button onClick={onCancel} disabled={busy}>
            取消
          </Button>
          <Button type="primary" loading={busy} onClick={() => void handleOk()}>
            进入画布
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" disabled={busy}>
        <Form.Item
          label="数据任务名称"
          field="name"
          rules={[
            { required: true, message: '请输入数据任务名称' },
            {
              validator: (value, callback) => {
                if (value != null && !String(value).trim()) {
                  callback('请输入数据任务名称');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <Input
            placeholder="请输入数据任务名称"
            maxLength={64}
            showWordLimit
            allowClear
          />
        </Form.Item>

        <Form.Item label="描述" field="description" style={{ marginBottom: 0 }}>
          <Input.TextArea
            placeholder="请输入任务描述（选填）"
            maxLength={200}
            showWordLimit
            autoSize={{ minRows: 3, maxRows: 6 }}
            allowClear
          />
        </Form.Item>
      </Form>
    </OntoModal>
  );
}
