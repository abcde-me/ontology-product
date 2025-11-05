import React, { useEffect } from 'react';
import { Modal, Button, Select, Form } from '@arco-design/web-react';

interface ModifyTagsModalProps {
  visible: boolean;
  tagOptions: Array<{ label: string; value: any }>;
  initialTags?: string[];
  onCancel: () => void;
  onConfirm: (tags: string[]) => void;
}

const ModifyTagsModal: React.FC<ModifyTagsModalProps> = ({
  visible,
  tagOptions,
  initialTags = [],
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        tags: initialTags
      });
    }
  }, [visible, initialTags, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      onConfirm(values.tags || []);
    } catch (error) {
      // 验证失败，不做任何操作
    }
  };

  return (
    <Modal
      title="编辑标签"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 400 }}
      className="modify-tags-modal"
    >
      <Form form={form} autoComplete="off">
        {/* 选择标签 */}
        <Form.Item
          label="选择标签"
          field="tags"
          rules={[{ required: true, message: '请选择标签' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择标签"
            style={{ width: '100%' }}
            options={tagOptions}
            allowCreate
          />
        </Form.Item>

        {/* 按钮 */}
        <div className="mb-[20px] flex justify-end gap-[8px]">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModifyTagsModal;
