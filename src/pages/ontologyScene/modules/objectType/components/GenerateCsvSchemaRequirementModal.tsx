import React, { useEffect } from 'react';
import { Form, Input, Modal } from '@arco-design/web-react';
import { DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT } from '../services/generateObjectTypeCsvTemplate';

const { TextArea } = Input;

interface GenerateCsvSchemaRequirementModalProps {
  visible: boolean;
  confirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: (requirements: string) => void | Promise<void>;
}

export default function GenerateCsvSchemaRequirementModal({
  visible,
  confirmLoading,
  onCancel,
  onConfirm
}: GenerateCsvSchemaRequirementModalProps) {
  const [form] = Form.useForm<{ requirements: string }>();

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      requirements: DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT
    });
  }, [form, visible]);

  return (
    <Modal
      title="智能生成模板"
      visible={visible}
      confirmLoading={confirmLoading}
      maskClosable={!confirmLoading}
      onCancel={() => {
        if (confirmLoading) {
          return;
        }
        onCancel();
      }}
      onOk={async () => {
        const values = await form.validate();
        const fromValidate = values?.requirements;
        const fromField = form.getFieldValue('requirements');
        const requirements =
          String(fromField ?? fromValidate ?? '').trim() ||
          DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT;
        await onConfirm(requirements);
      }}
      okText="开始生成"
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="生成要求"
          field="requirements"
          extra="选填，可说明字段范围、命名风格或业务关注点；默认为「无」"
        >
          <TextArea
            placeholder="无"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
            disabled={confirmLoading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
