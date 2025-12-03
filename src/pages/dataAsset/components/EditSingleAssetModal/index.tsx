import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Select,
  Input,
  Form,
  DatePicker
} from '@arco-design/web-react';
import EllipsisText from '@/components/ellipsis-popover-com';
import { FindDataAssetMappingItemRes, ColumnField } from '@/types/dataAssetApi';
import { isDateType, isDateTimeType } from '../../utils/const';
import dayjs from 'dayjs';

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
  // useEffect(() => {
  //   if (visible) {
  //     setLoading(true);
  //     findDataAssetMapping()
  //       .then((res) => {
  //         if (res.code === 0 || res.code === undefined) {
  //           setFieldMapping(res.data || []);
  //         }
  //       })
  //       .catch((err) => {
  //         console.error('获取字段映射失败:', err);
  //       })
  //       .finally(() => {
  //         setLoading(false);
  //       });
  //   }
  // }, [visible]);

  // 初始化表单数据
  useEffect(() => {
    if (visible && record) {
      const initialValues: Record<string, any> = {};
      console.log(fields, '------fields------');
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
    const mapping = fields.find((item) => item.nameEn === fieldEnName);
    return mapping?.allowModify ?? true; // 默认可修改
  };

  // 获取字段类型
  const getFieldType = (fieldEnName: string): string => {
    const field = fields.find((f) => f.nameEn === fieldEnName);
    return field?.type || 'string';
  };

  // 获取字段是否为枚举类型
  // const isFieldEnum = (fieldEnName: string): boolean => {
  //   const field = fields.find((f) => f.nameEn === fieldEnName);
  //   return field?.isEnumAble ?? false;
  // };

  // 格式化当前值显示
  const formatCurrentValue = (value: any, fieldType?: string): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    // 如果是时间类型，进行格式化转换
    if (fieldType) {
      if (isDateType(fieldType)) {
        // date 类型格式化为 YYYY-MM-DD
        const date = dayjs(value);
        return date.isValid() ? date.format('YYYY-MM-DD') : String(value);
      } else if (isDateTimeType(fieldType)) {
        // datetime 类型格式化为 YYYY-MM-DD HH:mm:ss
        const date = dayjs(value);
        return date.isValid()
          ? date.format('YYYY-MM-DD HH:mm:ss')
          : String(value);
      }
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const getFieldInput = (fieldType?: string) => {
    if (!fieldType) {
      return <Input placeholder="请输入内容" style={{ width: '100%' }} />;
    }

    if (isDateType(fieldType)) {
      return (
        <DatePicker
          placeholder="请选择日期"
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
        />
      );
    } else if (isDateTimeType(fieldType)) {
      return (
        <DatePicker
          placeholder="请选择时间"
          style={{ width: '100%' }}
          showTime={{ format: 'HH:mm:ss' }}
          format="YYYY-MM-DD HH:mm:ss"
        />
      );
    } else {
      return <Input placeholder="请输入内容" style={{ width: '100%' }} />;
    }
  };

  return (
    <Modal
      title="修改资产"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 800, maxHeight: '800px' }}
      className="edit-single-asset-modal"
    >
      <Form form={form} autoComplete="off">
        <div className="max-h-[664px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E6EB]">
                <th className="px-4 py-3 text-left text-[14px] font-medium text-[#1E293B]">
                  字段名称
                </th>
                <th className="max-w-[200px] px-4 py-3 text-left text-[14px] font-medium text-[#1E293B]">
                  当前值
                </th>
                <th className="px-4 py-3 text-left text-[14px] font-medium text-[#1E293B]">
                  修改为
                </th>
              </tr>
            </thead>
            <tbody>
              {[...fields].map((field) => {
                const isEditable = isFieldEditable(field.nameEn);
                const fieldType = getFieldType(field.nameEn);
                // const isEnum = isFieldEnum(field.nameEn);
                const currentValue = record?.[field.nameEn];

                return (
                  <tr key={field.nameEn} className="border-b border-[#E5E6EB]">
                    <td className="px-4 py-3 text-[14px] text-[#0F172A]">
                      {field.nameZh}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-[14px]  text-[#0F172A]">
                      <EllipsisText
                        preferTypography
                        value={formatCurrentValue(currentValue, fieldType)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {!isEditable ? (
                        <span className="text-[14px] text-[#7F8C9F]">
                          不可修改
                        </span>
                      ) : (
                        <Form.Item
                          field={field.nameEn}
                          style={{ marginBottom: 0 }}
                        >
                          {getFieldInput(fieldType)}
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
        <div className="mb-[20px] mt-[20px] flex justify-end gap-[8px]">
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
