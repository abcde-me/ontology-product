import React, { useEffect } from 'react';
import {
  Modal,
  Button,
  Radio,
  Select,
  Input,
  Form
} from '@arco-design/web-react';
import { ModifyMethod } from '@/types/dataAssetApi';

interface ModifyAssetModalProps {
  visible: boolean;
  fields: Array<{ nameZh: string; nameEn: string; type: string }>;
  onCancel: () => void;
  onConfirm: (data: {
    modifyMethod: ModifyMethod;
    fieldEnName: string;
    separator: string;
    fieldValue: string;
    fieldType: string;
    fieldZhName: string;
  }) => void;
}

const ModifyAssetModal: React.FC<ModifyAssetModalProps> = ({
  visible,
  fields,
  onCancel,
  onConfirm
}) => {
  const TextArea = Input.TextArea;
  const [form] = Form.useForm();
  const maxLength = 200;

  const fieldValue = Form.useWatch('fieldValue', form);
  const charCount = fieldValue?.length || 0;
  const modifyMethod = Form.useWatch('modifyMethod', form);

  useEffect(() => {
    if (visible) {
      // 重置表单
      form.resetFields();
      form.setFieldsValue({
        modifyMethod: ModifyMethod.APPEND,
        separator: '',
        fieldValue: ''
      });
    }
  }, [visible, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      const isCover = values.modifyMethod === ModifyMethod.COVER;
      // 根据选择的fieldEnName找到对应的字段信息
      const selectedField = fields.find(
        (field) => field.nameEn === values.fieldEnName
      );
      onConfirm({
        modifyMethod: values.modifyMethod,
        fieldEnName: values.fieldEnName,
        separator: isCover ? '' : values.separator || '',
        fieldValue: isCover
          ? (values.fieldValue ?? '')
          : `${values.separator ?? ''}${values.fieldValue ?? ''}`,
        fieldType: selectedField?.type || '',
        fieldZhName: selectedField?.nameZh || ''
      });
    } catch (error) {
      // 验证失败，不做任何操作
    }
  };

  const fieldOptions = fields.map((field) => ({
    label: field.nameZh,
    value: field.nameEn
  }));

  return (
    <Modal
      title="修改资产"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 600 }}
      className="modify-asset-modal"
    >
      <Form form={form} autoComplete="off">
        {/* 修改类型 */}
        <Form.Item
          label="修改类型"
          field="modifyMethod"
          rules={[{ required: true, message: '请选择修改类型' }]}
        >
          <Radio.Group>
            <Radio value={ModifyMethod.APPEND}>追加</Radio>
            <Radio value={ModifyMethod.COVER}>覆盖</Radio>
          </Radio.Group>
        </Form.Item>

        {/* 选择字段 */}
        <Form.Item
          label="选择字段"
          field="fieldEnName"
          rules={[{ required: true, message: '请选择需要编辑的字段' }]}
        >
          <Select
            placeholder="请选择需要编辑的字段"
            style={{ width: '100%' }}
            options={fieldOptions}
          />
        </Form.Item>

        {/* 分隔符 */}
        {modifyMethod !== ModifyMethod.COVER && (
          <Form.Item
            label="分隔符"
            field="separator"
            extra="同一个单元格中多个内容之间的分隔符号"
          >
            <Input placeholder="请输入" style={{ width: '100%' }} />
          </Form.Item>
        )}

        {/* 更改为 */}
        <Form.Item label="更改为" field="fieldValue">
          <TextArea
            placeholder="输入覆盖或者追加的内容,多个字段用分隔符分割"
            style={{ width: '100%', minHeight: 120 }}
            maxLength={maxLength}
            showWordLimit
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

export default ModifyAssetModal;
