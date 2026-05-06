import React, { useMemo, useState } from 'react';
import {
  Checkbox,
  Form,
  Input,
  Message,
  Popover,
  Radio,
  Select,
  Spin,
  Switch,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import ArchiveIcon from '../../../../assets/archive.svg';
import CancelArchiveIcon from '../../../../assets/cancel-archive.svg';
import {
  COLUMN_TYPE_OPTIONS,
  DATA_SOURCE_TYPE,
  DataSourceType
} from '@/pages/ontologyScene/common/constants';
import {
  createOntologyPublicProperties,
  deleteOntologyPublicProperties
} from '@/api/ontologySceneLibrary/attributes';
import BindPublicAttributeModal, {
  PublicAttribute
} from '../BindPublicAttributeModal';
import { AttributeField } from '../ObjectTypeFormUtils/types';
import {
  getAttributeRowKey,
  normalizeAttributeFieldId,
  normalizeColumnTypeForPrimary,
  VECTOR_FIELD_SUFFIX
} from '../ObjectTypeFormUtils/attributeFields';

const FormItem = Form.Item;

interface AttributeMappingSectionProps {
  form: any;
  dataSourceType: DataSourceType;
  attributeFields: AttributeField[];
  setAttributeFields: React.Dispatch<React.SetStateAction<AttributeField[]>>;
  fieldsLoading: boolean;
  styles: Record<string, string>;
}

function wrapDisabledFieldPopover(
  node: React.ReactNode,
  disabled: boolean,
  popoverContent: React.ReactNode = '请先勾选字段'
): React.ReactNode {
  if (!disabled) return node;
  return (
    <Popover content={popoverContent} trigger="hover">
      <span className="inline-flex max-w-full flex-1 cursor-not-allowed items-center align-middle">
        {node}
      </span>
    </Popover>
  );
}

export default function AttributeMappingSection({
  form,
  dataSourceType,
  attributeFields,
  setAttributeFields,
  fieldsLoading,
  styles
}: AttributeMappingSectionProps) {
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(-1);
  const [storeAsPublicLoading, setStoreAsPublicLoading] = useState<
    Record<number, boolean>
  >({});

  const handleFieldChange = (
    index: number,
    updates: Partial<AttributeField>
  ) => {
    const newFields = [...attributeFields];
    const prev = newFields[index];
    const merged: AttributeField = normalizeAttributeFieldId({
      ...prev,
      ...updates
    });
    newFields[index] = merged;
    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  const handleSelectAll = (checked: boolean) => {
    const newFields: AttributeField[] = attributeFields.map((field) => ({
      ...field,
      isUse: checked ? 1 : 0,
      ...(!checked
        ? {
            _vectorizationOn: false,
            _vectorComment: undefined
          }
        : {})
    }));
    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  /** 表字段列勾选变化：取消选中时关闭向量化并清空已编辑的向量属性名 */
  const handleAttributeRowUseChange = (index: number, checked: boolean) => {
    if (!checked) {
      handleFieldChange(index, {
        isUse: 0,
        _vectorizationOn: false,
        _vectorComment: undefined
      });
    } else {
      handleFieldChange(index, { isUse: 1 });
    }
  };

  const handleVectorizationChange = (index: number, enabled: boolean) => {
    const newFields = attributeFields.map((field, i) => {
      if (!enabled) {
        if (i !== index) return field;
        return {
          ...field,
          _vectorizationOn: false
          // 保留 _vectorComment，关闭后再打开仍显示上次编辑
        };
      }
      if (i === index) {
        const commentBase = field._attributeName ?? field.comment ?? '';
        const defaultVecComment = `${commentBase}${VECTOR_FIELD_SUFFIX}`;
        const preserved =
          field._vectorComment != null && field._vectorComment !== ''
            ? field._vectorComment
            : defaultVecComment;
        return {
          ...field,
          _vectorizationOn: true,
          _vectorComment: preserved
        };
      }
      return {
        ...field,
        _vectorizationOn: false
        // 互斥仅关闭开关，不丢弃其它行已编辑的向量属性名
      };
    });
    setAttributeFields(newFields);
    form.setFieldValue('attributeFields', newFields);
  };

  const handlePrimaryKeyChange = (index: number) => {
    const newFields: AttributeField[] = attributeFields.map((field, i) => {
      const isNewPrimary = i === index;
      const isLocalCsv = dataSourceType === DATA_SOURCE_TYPE.LOCAL_CSV;

      // 如果是本地CSV导入，类型不需要做特殊处理
      if (isLocalCsv) {
        return {
          ...field,
          isPrimary: isNewPrimary ? 1 : 0
        };
      }

      // 数据目录同步等非本地 CSV 场景：应用与 LinkForm 相同的规范化逻辑
      return {
        ...field,
        isPrimary: isNewPrimary ? 1 : 0,
        columnType: normalizeColumnTypeForPrimary(
          field.columnType || '',
          isNewPrimary
        )
      };
    });
    setAttributeFields(newFields);
  };

  const handleUnbindPublicAttribute = (index: number) => {
    handleFieldChange(index, {
      publicPropertyID: 0,
      isStoreAsPublic: 0
    });
  };

  const handleBindConfirm = (attribute: PublicAttribute) => {
    if (currentFieldIndex >= 0) {
      handleFieldChange(currentFieldIndex, {
        comment: attribute.name,
        publicPropertyID: attribute.id,
        isStoreAsPublic: 0,
        _attributeName: attribute.name
      });
      setBindModalVisible(false);
      setCurrentFieldIndex(-1);
    }
  };

  const handleStoreAsPublicChange = async (index: number, checked: boolean) => {
    const field = attributeFields[index];
    if (!field) return;

    setStoreAsPublicLoading((prev) => ({ ...prev, [index]: true }));

    try {
      if (checked) {
        if (!field.name || !field.comment || !field.columnType) {
          Message.warning('请先填写表字段、属性名称和字段类型');
          setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
          return;
        }

        const response = await createOntologyPublicProperties({
          name: field.name,
          comment: field.comment,
          columnType: field.columnType,
          description: ''
        });

        if (response.status === 200 && response.code === '') {
          const publicPropertyId = response.data;
          handleFieldChange(index, {
            isStoreAsPublic: 1,
            _storedPublicPropertyId: publicPropertyId
          });
          Message.success('已存入公共属性库');
        } else {
          Message.error(response.message || '存入公共属性库失败');
          setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
        }
      } else if (
        field._storedPublicPropertyId &&
        field._storedPublicPropertyId > 0
      ) {
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
          setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
        }
      } else {
        handleFieldChange(index, {
          isStoreAsPublic: 0,
          _storedPublicPropertyId: undefined
        });
      }
    } catch (error) {
      Message.error(checked ? '存入公共属性库失败' : '从公共属性库移除失败');
      console.error('操作失败:', error);
      setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
    } finally {
      setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const allSelected =
    attributeFields.length > 0 && attributeFields.every((f) => f.isUse === 1);
  const someSelected = attributeFields.some((f) => f.isUse === 1);

  const vectorExpandedRowKeys = useMemo(
    () =>
      attributeFields
        .filter((f) => f._vectorizationOn)
        .map((f) => getAttributeRowKey(f)),
    [attributeFields]
  );

  const attributeColumns: TableColumnProps<AttributeField>[] = [
    {
      title: (
        <div className="flex items-center gap-[12px]">
          <Checkbox
            checked={allSelected}
            className="pointer-events-auto mr-[12px]"
            indeterminate={someSelected && !allSelected}
            onChange={(checked) => handleSelectAll(!!checked)}
          />
          <span>表字段</span>
        </div>
      ),
      dataIndex: 'name',
      width: 365,
      render: (value, record, index) => (
        <div className="flex items-center gap-[12px]">
          <Checkbox
            disabled={record.isPrimary === 1 && record.isUse === 1}
            checked={record.isUse === 1}
            onChange={(checked) =>
              handleAttributeRowUseChange(index, !!checked)
            }
          />
          <span>{record._tableField || value}</span>
        </div>
      )
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
      render: (_, record, index) => {
        const rowDisabled = record.isUse !== 1;
        return wrapDisabledFieldPopover(
          <Radio
            disabled={rowDisabled}
            checked={record.isPrimary === 1}
            onChange={() => handlePrimaryKeyChange(index)}
          />,
          rowDisabled
        );
      }
    },
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 365,
      render: (value, record, index) => {
        const rowDisabled = record.isUse !== 1;
        return (
          <div className="flex items-center gap-[12px]">
            {wrapDisabledFieldPopover(
              <div className="relative w-full">
                <Input
                  disabled={rowDisabled}
                  value={record._attributeName || value}
                  className="w-full"
                  onChange={(val) =>
                    handleFieldChange(index, {
                      comment: val,
                      _attributeName: val
                    })
                  }
                  placeholder="请输入属性名称"
                />
                {record.publicPropertyID > 0 && !rowDisabled && (
                  <Popover content="取消绑定">
                    <CancelArchiveIcon
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 hover:cursor-pointer hover:text-[#184FF2]"
                      onClick={() => handleUnbindPublicAttribute(index)}
                    />
                  </Popover>
                )}
              </div>,
              rowDisabled
            )}
            {rowDisabled ? (
              <Popover content="请先勾选字段" trigger="hover">
                <span className="inline-flex cursor-not-allowed">
                  <ArchiveIcon className="text-[var(--color-text-4)] opacity-50" />
                </span>
              </Popover>
            ) : (
              <Popover content="绑定公共属性">
                <ArchiveIcon
                  className="cursor-pointer text-[var(--color-text-2)] hover:cursor-pointer hover:text-[#184FF2]"
                  onClick={() => {
                    setCurrentFieldIndex(index);
                    setBindModalVisible(true);
                  }}
                />
              </Popover>
            )}
          </div>
        );
      }
    },
    {
      title: (
        <div className="flex items-center gap-[8px]">
          <span>存入公共属性</span>
          <Popover content="是否将当前属性存入公共属性库">
            <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
          </Popover>
        </div>
      ),
      dataIndex: 'isStoreAsPublic',
      width: 140,
      render: (value, record, index) => {
        const rowDisabled = record.isUse !== 1;
        return wrapDisabledFieldPopover(
          <Switch
            disabled={rowDisabled}
            checked={record.isStoreAsPublic === 1}
            loading={storeAsPublicLoading[index]}
            size={'small'}
            onChange={(checked) => handleStoreAsPublicChange(index, checked)}
          />,
          rowDisabled
        );
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 200,
      render: (value, record, index) => {
        const rowNotSelected = record.isUse !== 1;
        const isDataDirectorySync =
          dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC;
        const rowDisabled = rowNotSelected || isDataDirectorySync;
        const selectPopoverContent = rowNotSelected
          ? '请先勾选字段'
          : '数据目录同步时字段类型与源表一致，不可修改';
        return (
          <div className="flex flex-1">
            {wrapDisabledFieldPopover(
              <Select
                disabled={rowDisabled}
                options={COLUMN_TYPE_OPTIONS}
                value={value}
                onChange={(val) =>
                  handleFieldChange(index, { columnType: val })
                }
              />,
              rowDisabled,
              selectPopoverContent
            )}
          </div>
        );
      }
    },
    {
      title: (
        <div className={'flex items-center gap-1'}>
          向量化
          <Popover content="启用向量化后，此属性会参与AI问答的相似度计算，用于检索并召回语义相关的对象实例。">
            <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
          </Popover>
        </div>
      ),
      dataIndex: '_vectorizationOn',
      width: 100,
      render: (_, record, index) => {
        const rowDisabled = record.isUse !== 1;
        return wrapDisabledFieldPopover(
          <Switch
            disabled={rowDisabled}
            checked={record._vectorizationOn === true}
            onChange={(checked) => handleVectorizationChange(index, !!checked)}
            size={'small'}
          />,
          rowDisabled,
          '请先勾选字段'
        );
      }
    }
  ];

  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        属性字段映射
      </div>
      <FormItem
        className={styles['attribute-fields-form-item']}
        field="attributeFields"
        rules={[
          {
            required: true,
            validator: (value, callback) => {
              if (!attributeFields || attributeFields.length === 0) {
                callback('请先上传文件或选择数据源');
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
          <div className="py-[16px] text-left text-[14px] text-[var(--color-text-5)]">
            请先上传文件
          </div>
        ) : (
          <Table
            className={styles['attribute-mapping-table']}
            scroll={{ x: true }}
            columns={attributeColumns}
            data={attributeFields}
            rowKey={(record) => getAttributeRowKey(record)}
            border={false}
            pagination={false}
            expandedRowKeys={vectorExpandedRowKeys}
            expandedRowRender={(record, index) => {
              if (!record._vectorizationOn) {
                return null;
              }
              const vecTableField = `${record.name}${VECTOR_FIELD_SUFFIX}`;
              return (
                <div className="bg-[#fff] p-[12px]">
                  <Table
                    className={styles['vector-expand-table']}
                    border={false}
                    pagination={false}
                    data={[
                      {
                        key: `${record.name}-vector`,
                        vecTableField,
                        vectorComment: record._vectorComment ?? '',
                        vectorType: 'vector'
                      }
                    ]}
                    columns={[
                      {
                        title: '表字段',
                        dataIndex: 'vecTableField',
                        render: (value) => (
                          <span className="text-[14px] text-[var(--color-text-2)]">
                            {value}
                          </span>
                        )
                      },
                      {
                        title: '属性名称',
                        dataIndex: 'vectorComment',
                        render: (_value) => (
                          <Input
                            value={record._vectorComment ?? ''}
                            disabled={record.isUse !== 1}
                            placeholder="请输入属性名称"
                            onChange={(val) =>
                              handleFieldChange(index, {
                                _vectorComment: val
                              })
                            }
                          />
                        )
                      },
                      {
                        title: '字段类型',
                        dataIndex: 'vectorType',
                        render: (value) => (
                          <span className="text-[14px] text-[var(--color-text-2)]">
                            {value}
                          </span>
                        )
                      }
                    ]}
                    rowKey="key"
                  />
                </div>
              );
            }}
            expandProps={{
              rowExpandable: (r) => Boolean(r._vectorizationOn),
              icon: () => null,
              width: 0
            }}
          />
        )}
      </FormItem>
      {bindModalVisible && (
        <BindPublicAttributeModal
          visible={bindModalVisible}
          initialSelectedId={
            currentFieldIndex >= 0 &&
            attributeFields[currentFieldIndex]?.publicPropertyID &&
            attributeFields[currentFieldIndex]!.publicPropertyID > 0
              ? attributeFields[currentFieldIndex]!.publicPropertyID
              : undefined
          }
          columnType={attributeFields[currentFieldIndex]?.columnType}
          onCancel={() => {
            setBindModalVisible(false);
            setCurrentFieldIndex(-1);
          }}
          onConfirm={handleBindConfirm}
        />
      )}
    </>
  );
}
