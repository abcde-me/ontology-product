import React, { useMemo } from 'react';
import {
  Form,
  Radio,
  Select,
  Switch,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import {
  InstanceSyncMappingField,
  SourceTableField
} from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

interface InstanceSyncMappingTableProps {
  form: any;
  mappingFields: InstanceSyncMappingField[];
  setMappingFields: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  sourceFields: SourceTableField[];
  loading: boolean;
  styles: Record<string, string>;
}

export default function InstanceSyncMappingTable({
  form,
  mappingFields,
  setMappingFields,
  sourceFields,
  loading,
  styles
}: InstanceSyncMappingTableProps) {
  const syncFields = (nextFields: InstanceSyncMappingField[]) => {
    setMappingFields(nextFields);
    form.setFieldValue('syncMappingFields', nextFields);
  };

  const handleFieldChange = (
    index: number,
    updates: Partial<InstanceSyncMappingField>
  ) => {
    const nextFields = mappingFields.map((field, currentIndex) =>
      currentIndex === index ? { ...field, ...updates } : field
    );
    syncFields(nextFields);
  };

  const sourceFieldOptions = useMemo(
    () =>
      sourceFields.map((field) => ({
        label: field.fieldComment
          ? `${field.fieldId} (${field.fieldComment})`
          : field.fieldId,
        value: field.fieldId
      })),
    [sourceFields]
  );

  const columns = useMemo<TableColumnProps<InstanceSyncMappingField>[]>(
    () => [
      {
        title: '表字段',
        dataIndex: 'sourceColumnName',
        width: 220,
        render: (value, _, index) => (
          <Select
            value={value}
            placeholder="请选择表字段"
            options={sourceFieldOptions}
            onChange={(sourceColumnName) => {
              const sourceField = sourceFields.find(
                (field) => field.fieldId === sourceColumnName
              );
              handleFieldChange(index, {
                sourceColumnName,
                sourceColumnComment: sourceField?.fieldComment,
                sourceColumnType: sourceField?.fieldType
              });
            }}
            allowClear
          />
        )
      },
      {
        title: '字段注释',
        dataIndex: 'sourceColumnComment',
        width: 180
      },
      {
        title: '字段类型',
        dataIndex: 'sourceColumnType',
        width: 140
      },
      {
        title: '属性id',
        dataIndex: 'propertyID',
        width: 180
      },
      {
        title: '属性名称',
        dataIndex: 'propertyComment',
        width: 220
      },
      {
        title: '属性类型',
        dataIndex: 'propertyType',
        width: 140
      },
      {
        title: '主键',
        dataIndex: 'isPrimary',
        width: 80,
        render: (_, record) => (
          <Radio checked={record.isPrimary === 1} disabled />
        )
      },
      {
        title: '向量化',
        dataIndex: 'isVector',
        width: 100,
        render: (_, record, index) => (
          <Switch
            size="small"
            checked={record.isVector === 1}
            onChange={(checked) =>
              handleFieldChange(index, { isVector: checked ? 1 : 0 })
            }
          />
        )
      }
    ],
    [sourceFieldOptions, sourceFields, mappingFields]
  );

  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        实例同步映射
      </div>
      <FormItem
        className={styles['attribute-fields-form-item']}
        field="syncMappingFields"
        rules={[
          {
            required: true,
            validator: (_value, callback) => {
              const hasMappedField = mappingFields.some(
                (field) => field.sourceColumnName
              );
              const primaryMapped = mappingFields.some(
                (field) => field.isPrimary === 1 && field.sourceColumnName
              );
              if (!hasMappedField) {
                callback('实例同步映射至少需要一个有效映射');
                return;
              }
              if (!primaryMapped) {
                callback('对象类型主键需要映射到源表字段');
                return;
              }
              callback();
            }
          }
        ]}
      >
        <Table
          className={styles['attribute-mapping-table']}
          loading={loading}
          scroll={{ x: true }}
          columns={columns}
          data={mappingFields}
          rowKey={(record) => record.key || record.propertyID}
          border={false}
          pagination={false}
        />
      </FormItem>
    </>
  );
}
