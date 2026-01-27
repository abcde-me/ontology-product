import React, { useState, useEffect } from 'react';
import {
  Table,
  TableColumnProps,
  Checkbox,
  Radio,
  Input,
  Switch,
  Button,
  Tooltip,
  Spin,
  Message
} from '@arco-design/web-react';
import {
  IconQuestionCircle,
  IconDelete,
  IconLink
} from '@arco-design/web-react/icon';
import BindPublicAttributeModal, {
  PublicAttribute
} from './BindPublicAttributeModal';

export interface AttributeField {
  tableField: string;
  selected: boolean;
  isPrimaryKey: boolean;
  attributeName: string;
  storeAsPublic: boolean;
  fieldType: string;
  publicAttributeId?: string; // 绑定的公共属性ID
  publicAttributeName?: string; // 绑定的公共属性名称
}

interface AttributeFieldMappingProps {
  fields: AttributeField[];
  loading?: boolean;
  onChange: (fields: AttributeField[]) => void;
}

const AttributeFieldMapping: React.FC<AttributeFieldMappingProps> = ({
  fields,
  loading = false,
  onChange
}) => {
  const [localFields, setLocalFields] = useState<AttributeField[]>(fields);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(-1);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleFieldChange = (
    index: number,
    updates: Partial<AttributeField>
  ) => {
    const newFields = [...localFields];
    newFields[index] = { ...newFields[index], ...updates };
    setLocalFields(newFields);
    onChange(newFields);
  };

  const handleSelectAll = (checked: boolean) => {
    const newFields = localFields.map((field) => ({
      ...field,
      selected: checked
    }));
    setLocalFields(newFields);
    onChange(newFields);
  };

  const handlePrimaryKeyChange = (index: number) => {
    const newFields = localFields.map((field, i) => ({
      ...field,
      isPrimaryKey: i === index
    }));
    setLocalFields(newFields);
    onChange(newFields);
  };

  const handleDeleteField = (index: number) => {
    const newFields = localFields.filter((_, i) => i !== index);
    setLocalFields(newFields);
    onChange(newFields);
  };

  const handleBindPublicAttribute = (index: number) => {
    setCurrentFieldIndex(index);
    setBindModalVisible(true);
  };

  const handleUnbindPublicAttribute = (index: number) => {
    const field = localFields[index];
    handleFieldChange(index, {
      publicAttributeId: undefined,
      publicAttributeName: undefined,
      storeAsPublic: false
    });
  };

  const handleBindConfirm = (attribute: PublicAttribute) => {
    if (currentFieldIndex >= 0) {
      handleFieldChange(currentFieldIndex, {
        attributeName: attribute.name,
        publicAttributeId: attribute.id,
        publicAttributeName: attribute.name,
        storeAsPublic: false // 绑定后禁用存入公共属性
      });
      setBindModalVisible(false);
      setCurrentFieldIndex(-1);
    }
  };

  const allSelected =
    localFields.length > 0 && localFields.every((f) => f.selected);
  const someSelected = localFields.some((f) => f.selected);

  const columns: TableColumnProps<AttributeField>[] = [
    {
      title: (
        <div className="flex items-center gap-1">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(checked) => handleSelectAll(!!checked)}
          />
          <span>表字段</span>
        </div>
      ),
      dataIndex: 'tableField',
      width: 150,
      render: (value, record, index) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={record.selected}
            onChange={(checked) =>
              handleFieldChange(index, { selected: checked })
            }
          />
          <span>{value}</span>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>主键</span>
          <Tooltip content="选择作为主键的字段">
            <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'isPrimaryKey',
      width: 100,
      render: (_, record, index) => (
        <Radio
          checked={record.isPrimaryKey}
          onChange={() => handlePrimaryKeyChange(index)}
        />
      )
    },
    {
      title: '属性名称',
      dataIndex: 'attributeName',
      width: 200,
      render: (value, record, index) => (
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(val) => handleFieldChange(index, { attributeName: val })}
            placeholder="请输入属性名称"
            disabled={!!record.publicAttributeId}
          />
          {record.publicAttributeId ? (
            <Button
              type="text"
              size="mini"
              className="p-0 text-[#007DFA]"
              onClick={() => handleUnbindPublicAttribute(index)}
            >
              取消绑定
            </Button>
          ) : (
            <Tooltip content="绑定公共属性">
              <IconLink
                className="cursor-pointer text-[#007DFA] hover:text-[#0052D9]"
                onClick={() => handleBindPublicAttribute(index)}
              />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>存入公共属性</span>
          <Tooltip content="是否将当前属性存入公共属性库">
            <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'storeAsPublic',
      width: 150,
      render: (value, record, index) => (
        <Switch
          checked={value}
          onChange={(checked) =>
            handleFieldChange(index, { storeAsPublic: checked })
          }
          disabled={!!record.publicAttributeId}
        />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 120,
      render: (value) => <span>{value}</span>
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      render: (_, record, index) => (
        <IconDelete
          className="cursor-pointer text-[#86909C] hover:text-[#F53F3F]"
          onClick={() => handleDeleteField(index)}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spin />
        <span className="mt-4 text-[14px] text-[#86909C]">加载中</span>
      </div>
    );
  }

  if (localFields.length === 0) {
    return (
      <div className="py-8 text-center text-[14px] text-[#86909C]">
        请先上传文件
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        data={localFields}
        rowKey={(record) => record.tableField}
        border={false}
        pagination={false}
      />
      <BindPublicAttributeModal
        visible={bindModalVisible}
        onCancel={() => {
          setBindModalVisible(false);
          setCurrentFieldIndex(-1);
        }}
        onConfirm={handleBindConfirm}
      />
    </>
  );
};

export default AttributeFieldMapping;
