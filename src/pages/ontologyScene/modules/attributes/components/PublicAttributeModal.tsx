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
  { label: 'tinyint(1)', value: 'tinyint(1)' },
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'float', value: 'float' },
  { label: 'double', value: 'double' },
  { label: 'varchar(5000)', value: 'varchar(5000)' },
  { label: 'varchar(500)', value: 'varchar(500)' },
  { label: 'varchar(2000)', value: 'varchar(2000)' },
  { label: 'varchar(255)', value: 'varchar(255)' },
  { label: 'char(36)', value: 'char(36)' },
  { label: 'date', value: 'date' },
  { label: 'time(6)', value: 'time(6)' },
  { label: 'datetime(6)', value: 'datetime(6)' },
  { label: 'timestamp(6)', value: 'timestamp(6)' },
  { label: 'longblob', value: 'longblob' }
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
      // form.resetFields();
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
            {
              validator: (value, callback) => {
                if (!value) {
                  callback();
                  return;
                }
                // 首字符必须为英文字母
                if (!/^[a-zA-Z]/.test(value)) {
                  callback('首字符必须为英文字母');
                  return;
                }
                // 仅允许英文字母与数字（不允许下划线及特殊符号）
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                  callback('仅允许英文字母与数字(不允许下划线及特殊符号)');
                  return;
                }
                callback();
              }
            }
          ]}
          extra={
            <div className="text-[12px] text-[var(--color-text-4)]">
              首字符必须为英文字母;仅允许英文字母与数字(不允许下划线及特殊符号)
            </div>
          }
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
          <Select
            placeholder="请选择字段类型"
            allowClear
            disabled={(initialValues?.ontologyObjectTypeCounts || 0) > 0}
          >
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
            autoSize={{ minRows: 3 }}
          />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default PublicAttributeModal;
