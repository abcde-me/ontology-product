import React from 'react';
import { Form, Spin, Table, TableColumnProps } from '@arco-design/web-react';
import { AttributeField } from '../types';

const FormItem = Form.Item;

interface AttributeMappingSectionProps {
  styles: Record<string, string>;
  fieldsLoading: boolean;
  attributeFields: AttributeField[];
  attributeColumns: TableColumnProps<AttributeField>[];
}

export default function AttributeMappingSection({
  styles,
  fieldsLoading,
  attributeFields,
  attributeColumns
}: AttributeMappingSectionProps) {
  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        属性字段映射
      </div>
      <FormItem
        field="attributeFields"
        className={styles['attribute-fields-form-item']}
        rules={[
          {
            required: true,
            validator: (value, callback) => {
              if (!value || value.length === 0) {
                callback('请先上传中间表');
              } else {
                callback();
              }
            }
          }
        ]}
      >
        {fieldsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin />
            <span className="mt-4 text-[14px] text-[#86909C]">加载中</span>
          </div>
        ) : attributeFields.length === 0 ? (
          <div className="text-start text-[14px] text-[#86909C]">
            请先上传中间表
          </div>
        ) : (
          <Table
            scroll={{ x: true }}
            columns={attributeColumns}
            data={attributeFields}
            rowKey={(record) => record.tableField}
            border={false}
            pagination={false}
          />
        )}
      </FormItem>
    </>
  );
}
