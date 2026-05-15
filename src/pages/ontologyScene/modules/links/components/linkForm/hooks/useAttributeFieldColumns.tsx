import React from 'react';
import {
  Checkbox,
  Input,
  Popover,
  Radio,
  Select,
  TableColumnProps
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { COLUMN_TYPE_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import { AttributeField, IntermediateTable } from '../types';
import {
  normalizeFieldTypeForPrimary,
  wrapDisabledFieldPopover
} from '../utils/linkFormUtils';

interface UseAttributeFieldColumnsParams {
  form: any;
  attributeFields: AttributeField[];
  setAttributeFields: React.Dispatch<React.SetStateAction<AttributeField[]>>;
  intermediateTable: IntermediateTable;
  readOnly?: boolean;
}

export function useAttributeFieldColumns({
  form,
  attributeFields,
  setAttributeFields,
  intermediateTable,
  readOnly = false
}: UseAttributeFieldColumnsParams) {
  const handleFieldChange = (
    index: number,
    updates: Partial<AttributeField>
  ) => {
    if (readOnly) return;
    const newFields = [...attributeFields];
    newFields[index] = { ...newFields[index], ...updates };
    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  const handleSelectAll = (checked: boolean) => {
    if (readOnly) return;
    const newFields = attributeFields.map((field) => ({
      ...field,
      isUse: checked ? 1 : 0
    }));
    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  const handlePrimaryKeyChange = (index: number) => {
    if (readOnly) return;
    const newFields: AttributeField[] = attributeFields.map((field, i) => {
      const isPrimary = i === index;
      let fieldType = field.fieldType;

      if (intermediateTable.type === 'data_lake_sync') {
        fieldType = normalizeFieldTypeForPrimary(fieldType, isPrimary);
      }

      return {
        ...field,
        isPrimary,
        fieldType
      };
    });

    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  const allSelected =
    attributeFields.length > 0 && attributeFields.every((f) => f.isUse === 1);
  const someSelected = attributeFields.some((f) => f.isUse === 1);

  const attributeColumns: TableColumnProps<AttributeField>[] = [
    {
      title: (
        <div className="flex items-center gap-[12px]">
          <Checkbox
            className="pointer-events-auto mr-[12px]"
            disabled={readOnly}
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(checked) => handleSelectAll(!!checked)}
          />
        </div>
      ),
      dataIndex: 'isUse',
      width: 60,
      render: (_, record, index) => (
        <Checkbox
          disabled={
            readOnly || (record.isPrimary === true && record.isUse === 1)
          }
          checked={record.isUse === 1}
          onChange={(checked) =>
            handleFieldChange(index, { isUse: checked ? 1 : 0 })
          }
        />
      )
    },
    {
      title: '表字段',
      dataIndex: 'tableField',
      width: 320,
      render: (value) => <EllipsisPopover value={value || '-'} />
    },
    {
      title: (
        <div className="flex items-center gap-[8px]">
          <span>主键</span>
          <Popover content="选择作为主键的字段">
            <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
          </Popover>
        </div>
      ),
      dataIndex: 'isPrimary',
      width: 84,
      render: (_, record, index) => (
        <Radio
          disabled={readOnly}
          checked={record.isPrimary === true}
          onChange={() => handlePrimaryKeyChange(index)}
        />
      )
    },
    {
      title: '属性名称',
      dataIndex: 'attributeName',
      width: 365,
      render: (value, _record, index) => (
        <Input
          value={value}
          className="w-full"
          readOnly={readOnly}
          onChange={(val) => handleFieldChange(index, { attributeName: val })}
          placeholder="请输入属性名称"
        />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 200,
      render: (value, record, index) => {
        const rowNotSelected = record.isUse !== 1;
        const isDataLakeSync = intermediateTable.type === 'data_lake_sync';
        const rowDisabled = readOnly || rowNotSelected || isDataLakeSync;
        const selectPopoverContent = rowNotSelected
          ? '请先勾选字段'
          : '数据湖同步时字段类型与源表一致，不可修改';
        return (
          <div className="flex flex-1">
            {wrapDisabledFieldPopover(
              <Select
                disabled={rowDisabled}
                value={value}
                onChange={(val) =>
                  handleFieldChange(index, { fieldType: String(val) })
                }
              >
                {COLUMN_TYPE_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>,
              rowDisabled,
              selectPopoverContent
            )}
          </div>
        );
      }
    }
  ];

  return attributeColumns;
}
