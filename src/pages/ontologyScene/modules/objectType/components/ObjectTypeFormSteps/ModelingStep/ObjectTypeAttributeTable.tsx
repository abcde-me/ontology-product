import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Popover,
  Radio,
  Select,
  Switch,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import { IconDelete, IconQuestionCircle } from '@arco-design/web-react/icon';
import {
  createOntologyPublicProperties,
  deleteOntologyPublicProperties,
  listTiDBTypes
} from '@/api/ontologySceneLibrary/attributes';
import {
  createObjectTypeAttributeKey,
  getObjectTypeAttributeRowKey,
  normalizeColumnTypeForPrimary
} from '../../ObjectTypeFormUtils/attributeFields';
import { ObjectTypeAttributeField } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

const LENGTH_REQUIRED_TYPES = [
  'char',
  'varchar',
  'binary',
  'varbinary'
] as const;
type LengthRequiredType = (typeof LENGTH_REQUIRED_TYPES)[number];
const LENGTH_MAX_MAP: Record<LengthRequiredType, number> = {
  char: 255,
  varchar: 16383,
  binary: 255,
  varbinary: 65535
};

function isLengthRequiredType(type: string): type is LengthRequiredType {
  return (LENGTH_REQUIRED_TYPES as readonly string[]).includes(
    (type || '').toLowerCase()
  );
}

function parsePropertyType(propertyType: string | undefined): {
  base: string;
  length?: number;
} {
  if (!propertyType) {
    return { base: '' };
  }
  const match = /^\s*([A-Za-z_][\w]*)\s*(?:\(\s*(\d+)\s*\))?\s*$/.exec(
    propertyType
  );
  if (!match) {
    return { base: propertyType };
  }
  const [, base, lengthStr] = match;
  return {
    base,
    length: lengthStr ? Number(lengthStr) : undefined
  };
}

function combinePropertyType(base: string, length?: number) {
  if (!base) return '';
  if (isLengthRequiredType(base)) {
    return length ? `${base}(${length})` : base;
  }
  return base;
}

function isPropertyTypeComplete(propertyType: string | undefined) {
  if (!propertyType) return false;
  const { base, length } = parsePropertyType(propertyType);
  if (!base) return false;
  if (isLengthRequiredType(base)) {
    if (!length) return false;
    const max = LENGTH_MAX_MAP[base.toLowerCase() as LengthRequiredType];
    return length >= 1 && length <= max;
  }
  return true;
}

interface ObjectTypeAttributeTableProps {
  form: any;
  attributeFields: ObjectTypeAttributeField[];
  setAttributeFields: React.Dispatch<
    React.SetStateAction<ObjectTypeAttributeField[]>
  >;
  fieldsLoading: boolean;
  styles: Record<string, string>;
  readOnly?: boolean;
}

function createEmptyAttribute(): ObjectTypeAttributeField {
  return {
    key: createObjectTypeAttributeKey('manual-field'),
    propertyID: '',
    propertyComment: '',
    propertyType: '',
    isPrimary: 0,
    isStoreAsPublic: 0,
    isInstanceName: 0,
    publicPropertyID: 0,
    isVector: 0,
    sourceColumnName: '',
    sourceColumnComment: ''
  };
}

export default function ObjectTypeAttributeTable({
  form,
  attributeFields,
  setAttributeFields,
  fieldsLoading,
  styles,
  readOnly = false
}: ObjectTypeAttributeTableProps) {
  const [storeAsPublicLoading, setStoreAsPublicLoading] = useState<
    Record<string, boolean>
  >({});
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    let canceled = false;
    listTiDBTypes()
      .then((response) => {
        if (canceled) return;
        if (
          response.status === 200 &&
          (response.code === '' || !response.code) &&
          Array.isArray(response.data?.types) &&
          response.data.types.length > 0
        ) {
          setPropertyTypeOptions(
            response.data.types.map((type) => ({ label: type, value: type }))
          );
        } else {
          setPropertyTypeOptions([]);
          if (!canceled) {
            Message.warning(
              response.message || '获取属性类型列表失败，请稍后重试'
            );
          }
        }
      })
      .catch((error) => {
        console.error('获取属性类型列表失败:', error);
        if (!canceled) {
          setPropertyTypeOptions([]);
          Message.error('获取属性类型列表失败，请稍后重试');
        }
      });
    return () => {
      canceled = true;
    };
  }, []);

  const syncFields = (nextFields: ObjectTypeAttributeField[]) => {
    setAttributeFields(nextFields);
    form.setFieldValue('objectTypeAttributes', nextFields);
  };

  const handleFieldChange = (
    index: number,
    updates: Partial<ObjectTypeAttributeField>
  ) => {
    const nextFields = attributeFields.map((field, currentIndex) =>
      currentIndex === index ? { ...field, ...updates } : field
    );
    syncFields(nextFields);
  };

  const handlePrimaryChange = (index: number) => {
    const nextFields: ObjectTypeAttributeField[] = attributeFields.map(
      (field, currentIndex) => {
        const isPrimary = currentIndex === index;
        const nextIsPrimary: 1 | 0 = isPrimary ? 1 : 0;
        return {
          ...field,
          isPrimary: nextIsPrimary,
          ...(isPrimary ? { isInstanceName: 1 as const } : {}),
          propertyType: normalizeColumnTypeForPrimary(
            field.propertyType,
            isPrimary
          )
        };
      }
    );
    syncFields(nextFields);
  };

  const handleAddRow = () => {
    const nextFields = [...attributeFields, createEmptyAttribute()];
    if (nextFields.length === 1) {
      nextFields[0].isPrimary = 1;
      nextFields[0].isInstanceName = 1;
    }
    syncFields(nextFields);
  };

  const handleDeleteRow = (index: number) => {
    const current = attributeFields[index];
    if (!current) return;
    let nextFields = attributeFields.filter(
      (_, currentIndex) => currentIndex !== index
    );
    if (current.isPrimary === 1 && nextFields.length > 0) {
      nextFields = nextFields.map((field, currentIndex) => ({
        ...field,
        isPrimary: currentIndex === 0 ? 1 : 0,
        ...(currentIndex === 0 ? { isInstanceName: 1 as const } : {})
      }));
    }
    syncFields(nextFields);
  };

  const handleStoreAsPublicChange = async (index: number, checked: boolean) => {
    if (readOnly) return;
    const field = attributeFields[index];
    if (!field) return;
    const rowKey = getObjectTypeAttributeRowKey(field);
    setStoreAsPublicLoading((prev) => ({ ...prev, [rowKey]: true }));

    try {
      if (checked) {
        if (
          !field.propertyID ||
          !field.propertyComment ||
          !field.propertyType
        ) {
          Message.warning('请先填写属性id、属性名称和属性类型');
          return;
        }
        const response = await createOntologyPublicProperties({
          name: field.propertyID,
          comment: field.propertyComment,
          columnType: field.propertyType,
          description: ''
        });
        if (response.status === 200 && response.code === '') {
          handleFieldChange(index, {
            isStoreAsPublic: 1,
            _storedPublicPropertyId: response.data
          });
          Message.success('已存入公共属性库');
        } else {
          Message.error(response.message || '存入公共属性库失败');
        }
      } else if (field._storedPublicPropertyId) {
        const response = await deleteOntologyPublicProperties({
          id: field._storedPublicPropertyId
        });
        if (response.status === 200 && response.code === '') {
          handleFieldChange(index, {
            isStoreAsPublic: 0,
            _storedPublicPropertyId: undefined
          });
          Message.success('已从公共属性库移除');
        } else {
          Message.error(response.message || '从公共属性库移除失败');
        }
      } else {
        handleFieldChange(index, { isStoreAsPublic: 0 });
      }
    } catch (error) {
      console.error('操作公共属性失败:', error);
      Message.error(checked ? '存入公共属性库失败' : '从公共属性库移除失败');
    } finally {
      setStoreAsPublicLoading((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  const columns = useMemo<TableColumnProps<ObjectTypeAttributeField>[]>(
    () => [
      {
        title: (
          <span className="inline-flex items-center gap-[4px]">
            主键
            <Popover content="选择作为对象类型主键的属性">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        ),
        dataIndex: 'isPrimary',
        width: 90,
        render: (_, __, index) => (
          <Radio
            checked={attributeFields[index]?.isPrimary === 1}
            disabled={readOnly}
            onChange={() => handlePrimaryChange(index)}
          />
        )
      },
      {
        title: '属性id',
        dataIndex: 'propertyID',
        width: 260,
        render: (value, _, index) => (
          <Input
            value={value}
            placeholder="请输入属性id"
            disabled={readOnly}
            onChange={(propertyID) =>
              handleFieldChange(index, {
                propertyID,
                sourceColumnName:
                  attributeFields[index]?.sourceColumnName || propertyID
              })
            }
          />
        )
      },
      {
        title: '属性名称',
        dataIndex: 'propertyComment',
        width: 300,
        render: (value, _, index) => (
          <Input
            value={value}
            placeholder="请输入属性名称"
            disabled={readOnly}
            onChange={(propertyComment) =>
              handleFieldChange(index, {
                propertyComment,
                sourceColumnComment:
                  attributeFields[index]?.sourceColumnComment || propertyComment
              })
            }
          />
        )
      },
      {
        title: (
          <span className="inline-flex items-center gap-[4px]">
            存入公共属性
            <Popover content="是否将当前属性存入公共属性库">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        ),
        dataIndex: 'isStoreAsPublic',
        width: 140,
        render: (_, record, index) => {
          const rowKey = getObjectTypeAttributeRowKey(record);
          return (
            <Switch
              size="small"
              checked={record.isStoreAsPublic === 1}
              loading={storeAsPublicLoading[rowKey]}
              disabled={readOnly}
              onChange={(checked) =>
                handleStoreAsPublicChange(index, Boolean(checked))
              }
            />
          );
        }
      },
      {
        title: '属性类型',
        dataIndex: 'propertyType',
        width: 320,
        render: (value, _, index) => {
          const { base, length } = parsePropertyType(value);
          const lowerBase = (base || '').toLowerCase();
          const needLength = isLengthRequiredType(lowerBase);
          const maxLength = needLength ? LENGTH_MAX_MAP[lowerBase] : undefined;
          return (
            <div className="flex items-center gap-[8px]">
              <Select
                className="flex-1"
                value={base || undefined}
                placeholder="请选择属性类型"
                options={propertyTypeOptions}
                showSearch
                disabled={readOnly}
                onChange={(nextBase: string) => {
                  let nextLength: number | undefined;
                  if (isLengthRequiredType(nextBase)) {
                    const max =
                      LENGTH_MAX_MAP[
                        nextBase.toLowerCase() as LengthRequiredType
                      ];
                    nextLength =
                      length && length >= 1 && length <= max
                        ? length
                        : undefined;
                  }
                  handleFieldChange(index, {
                    propertyType: combinePropertyType(nextBase, nextLength)
                  });
                }}
              />
              {needLength && (
                <InputNumber
                  style={{ width: 110 }}
                  value={length}
                  min={1}
                  max={maxLength}
                  step={1}
                  precision={0}
                  disabled={readOnly}
                  placeholder={`1-${maxLength}`}
                  onChange={(nextLength) => {
                    let numeric: number | undefined;
                    if (
                      typeof nextLength === 'number' &&
                      !Number.isNaN(nextLength)
                    ) {
                      numeric = Math.min(
                        maxLength!,
                        Math.max(1, Math.floor(nextLength))
                      );
                    }
                    handleFieldChange(index, {
                      propertyType: combinePropertyType(base, numeric)
                    });
                  }}
                />
              )}
            </div>
          );
        }
      },
      {
        title: (
          <span className="inline-flex items-center gap-[4px]">
            实例名称
            <Tooltip
              content="实例/知识图谱中展示的名称，支持多个字段拼接显示"
              position="top"
            >
              <span className="inline-flex items-center">
                <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
              </span>
            </Tooltip>
          </span>
        ),
        dataIndex: 'isInstanceName',
        width: 120,
        render: (_, record, index) => (
          <Switch
            size="small"
            checked={record.isInstanceName === 1}
            disabled={readOnly}
            onChange={(checked) =>
              handleFieldChange(index, {
                isInstanceName: checked ? 1 : 0
              })
            }
          />
        )
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 80,
        render: (_, __, index) => (
          <Button
            type="text"
            icon={<IconDelete />}
            disabled={readOnly}
            onClick={() => handleDeleteRow(index)}
          />
        )
      }
    ],
    [attributeFields, storeAsPublicLoading, propertyTypeOptions, readOnly]
  );

  return (
    <>
      <div className="my-[16px] flex items-center justify-between text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        <span>对象类型属性</span>
        {!readOnly && (
          <Button type="text" onClick={handleAddRow}>
            + 添加行
          </Button>
        )}
      </div>
      <FormItem
        className={styles['attribute-fields-form-item']}
        field="objectTypeAttributes"
        rules={[
          {
            required: true,
            validator: (_value, callback) => {
              if (!attributeFields.length) {
                callback('请先添加对象类型属性');
                return;
              }
              if (!attributeFields.some((field) => field.isPrimary === 1)) {
                callback('至少需要一个主键属性');
                return;
              }
              const incompleteLength = attributeFields.some((field) => {
                const { base } = parsePropertyType(field.propertyType);
                return (
                  isLengthRequiredType(base) &&
                  !isPropertyTypeComplete(field.propertyType)
                );
              });
              if (incompleteLength) {
                callback(
                  '请为 char/varchar/binary/varbinary 类型填写有效的长度'
                );
                return;
              }
              callback();
            }
          }
        ]}
      >
        <Table
          className={styles['attribute-mapping-table']}
          loading={fieldsLoading}
          scroll={{ x: true }}
          columns={columns}
          data={attributeFields}
          rowKey={(record) => getObjectTypeAttributeRowKey(record)}
          border={false}
          pagination={false}
        />
      </FormItem>
    </>
  );
}
