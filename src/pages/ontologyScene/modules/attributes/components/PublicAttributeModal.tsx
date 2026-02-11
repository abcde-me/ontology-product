import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Message
} from '@arco-design/web-react';
import { PublicProperty } from '@/types/attributes';

const FormItem = Form.Item;
const { TextArea } = Input;

// 字段类型选项
const FIELD_TYPE_OPTIONS = [
  { label: 'STRING', value: 'STRING' },
  { label: 'INTEGER', value: 'INTEGER' },
  { label: 'FLOAT', value: 'FLOAT' },
  { label: 'DOUBLE', value: 'DOUBLE' },
  { label: 'BOOLEAN', value: 'BOOLEAN' },
  { label: 'DATE', value: 'DATE' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' }
];

export interface PublicAttributeFormData {
  name: string;
  comment: string;
  columnType: string;
  description?: string;
}

interface PublicAttributeModalProps {
  visible: boolean;
  mode: 'create' | 'edit'; // 创建或编辑模式
  initialValues?: Partial<PublicProperty>; // 编辑时的初始值
  onCancel: () => void;
  onSubmit: (data: PublicAttributeFormData) => Promise<void> | void;
  loading?: boolean;
}

const PublicAttributeModal: React.FC<PublicAttributeModalProps> = ({
  visible,
  mode,
  initialValues,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        // 编辑模式：填充初始值
        form.setFieldsValue({
          name: initialValues.name || '',
          comment: initialValues.comment || '',
          columnType: initialValues.columnType || '',
          description: initialValues.description || ''
        });
      } else {
        // 创建模式：清空表单
        form.resetFields();
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const title = mode === 'create' ? '创建公共属性' : '编辑公共属性';

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel} disabled={loading}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </div>
      }
      style={{ width: 600 }}
      unmountOnExit
    >
      <Form form={form} autoComplete="off" labelAlign="left">
        <FormItem
          label="公共属性名称："
          field="comment"
          rules={[
            { required: true, message: '请输入公共属性名称' },
            { maxLength: 50, message: '名称不能超过50个字符' }
          ]}
        >
          <Input
            placeholder="请输入公共属性名称"
            maxLength={50}
            showWordLimit
          />
        </FormItem>

        <FormItem
          label="公共属性id："
          field="name"
          rules={[
            { required: true, message: '请输入唯一标识' },
            { maxLength: 50, message: 'id不能超过50个字符' }
          ]}
        >
          <Input
            placeholder="请输入唯一标识"
            maxLength={50}
            showWordLimit
            disabled={mode === 'edit'} // 编辑模式下禁用id字段
          />
        </FormItem>

        <FormItem
          label="支持字段类型："
          field="columnType"
          rules={[{ required: true, message: '请选择字段类型' }]}
        >
          <Select placeholder="请选择字段类型" allowClear>
            {FIELD_TYPE_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormItem>

        <FormItem label="描述说明：" field="description">
          <TextArea
            placeholder="可以描述公共属性的相关业务信息或数据来源规范"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default PublicAttributeModal;
