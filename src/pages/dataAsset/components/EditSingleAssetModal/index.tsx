import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, Input, Form } from '@arco-design/web-react';
import { findDataAssetMapping } from '@/api/dataAsset';
import { FindDataAssetMappingItemRes, ColumnField } from '@/types/dataAssetApi';

interface EditSingleAssetModalProps {
  visible: boolean;
  record: any; // 当前编辑的记录
  fields: ColumnField[]; // 字段列表
  onCancel: () => void;
  onConfirm: (data: Record<string, any>) => void;
}

const EditSingleAssetModal: React.FC<EditSingleAssetModalProps> = ({
  visible,
  record,
  fields,
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [fieldMapping, setFieldMapping] = useState<
    FindDataAssetMappingItemRes[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 获取字段的可修改性信息
  useEffect(() => {
    if (visible) {
      setLoading(true);
      findDataAssetMapping()
        .then((res) => {
          if (res.code === 0 || res.code === undefined) {
            setFieldMapping(res.data || []);
          }
        })
        .catch((err) => {
          console.error('获取字段映射失败:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);

  // 初始化表单数据
  useEffect(() => {
    if (visible && record) {
      const initialValues: Record<string, any> = {};
      fields.forEach((field) => {
        initialValues[field.nameEn] = record[field.nameEn];
      });
      form.setFieldsValue(initialValues);
    }
  }, [visible, record, fields, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validate();
      onConfirm(values);
    } catch (error) {
      // 验证失败，不做任何操作
    }
  };

  // 判断字段是否可修改
  const isFieldEditable = (fieldEnName: string): boolean => {
    const mapping = fieldMapping.find((item) => item.nameEn === fieldEnName);
    return mapping?.allowModify ?? true; // 默认可修改
  };

  // 获取字段类型
  const getFieldType = (fieldEnName: string): string => {
    const field = fields.find((f) => f.nameEn === fieldEnName);
    return field?.type || 'string';
  };

  // 获取字段是否为枚举类型
  const isFieldEnum = (fieldEnName: string): boolean => {
    const field = fields.find((f) => f.nameEn === fieldEnName);
    return field?.isEnumAble ?? false;
  };

  // 格式化当前值显示
  const formatCurrentValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  return (
    <Modal
      title="修改资产"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 800 }}
      className="edit-single-asset-modal"
    >
      <Form form={form} autoComplete="off">
        <div className="mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E6EB]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#1D2129]">
                  字段名称
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#1D2129]">
                  当前值
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#1D2129]">
                  修改为
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => {
                const isEditable = isFieldEditable(field.nameEn);
                const fieldType = getFieldType(field.nameEn);
                const isEnum = isFieldEnum(field.nameEn);
                const currentValue = record?.[field.nameEn];

                return (
                  <tr key={field.nameEn} className="border-b border-[#E5E6EB]">
                    <td className="px-4 py-3 text-sm text-[#1D2129]">
                      {field.nameZh}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1D2129]">
                      {formatCurrentValue(currentValue)}
                    </td>
                    <td className="px-4 py-3">
                      {!isEditable ? (
                        <span className="text-sm text-[#86909C]">不可修改</span>
                      ) : isEnum || fieldType === 'select' ? (
                        <Form.Item
                          field={field.nameEn}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="请选择"
                            style={{ width: '100%' }}
                            allowClear
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          field={field.nameEn}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="请输入内容"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

export default EditSingleAssetModal;
