import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Message,
  Upload,
  Radio,
  Select,
  Table,
  TableColumnProps,
  Checkbox,
  Tooltip,
  Spin
} from '@arco-design/web-react';
import {
  IconUpload,
  IconQuestionCircle,
  IconCheck,
  IconRight
} from '@arco-design/web-react/icon';
import FieldImportUpload from '../../../componens/FieldImportUpload';
import { ObjectTypeSelect } from '../../../componens';
import classNames from 'classnames';
import LinkCheckIcon from '../../../assets/link-check.svg';
import OneWayArrowIcon from '../../../assets/one-way-arrow.svg';
import TwoWayArrowIcon from '../../../assets/double-headed-arrow.svg';
import styles from './LinkForm.module.scss';
import { LinkType } from '../../../types/link';

const FormItem = Form.Item;

export interface AttributeField {
  tableField: string;
  selected: boolean;
  attributeName: string;
  fieldType: string;
}

export interface LinkFormData {
  linkType: LinkType;
  name: string;
  id: string;
  sourceObjectType: number;
  targetObjectType: number;
  targetObjectAttribute?: string; // 仅1:1和1:N需要
  intermediateTable?: {
    type: 'local_csv' | 'data_lake_sync';
    file?: any;
  };
  sourceAttribute?: string; // N:N关联中间表的源属性
  targetAttribute?: string; // N:N关联中间表的目标属性
  attributeFields: AttributeField[];
}

interface LinkFormProps {
  initialValues?: Partial<LinkFormData>;
  onSubmit: (data: LinkFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
}

export interface LinkFormRef {
  submit: () => void;
}

const LinkForm = React.forwardRef<LinkFormRef, LinkFormProps>(
  (
    { initialValues, onSubmit, onCancel, loading = false, showFooter = true },
    ref
  ) => {
    const [form] = Form.useForm();
    const [linkType, setLinkType] = useState<LinkType>(LinkType.ONE_TO_ONE);
    const [intermediateTable, setIntermediateTable] = useState<{
      type: 'local_csv' | 'data_lake_sync';
      file?: any;
    }>({
      type: 'local_csv'
    });
    const [attributeFields, setAttributeFields] = useState<AttributeField[]>(
      []
    );
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);

    // 模拟属性列表（根据选择的对象类型动态变化）
    const getAttributeOptions = (objectTypeId?: number) => {
      if (!objectTypeId) return [];
      return [
        { label: '属性1', value: 'attr1' },
        { label: '属性2', value: 'attr2' },
        { label: '属性3', value: 'attr3' }
      ];
    };

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          id: initialValues.id,
          sourceObjectType: initialValues.sourceObjectType,
          targetObjectType: initialValues.targetObjectType,
          targetObjectAttribute: initialValues.targetObjectAttribute,
          sourceAttribute: initialValues.sourceAttribute,
          targetAttribute: initialValues.targetAttribute,
          attributeFields: initialValues.attributeFields || []
        });
        if (initialValues.linkType) {
          setLinkType(initialValues.linkType);
        }
        if (initialValues.intermediateTable) {
          setIntermediateTable(initialValues.intermediateTable);
          setFileUploaded(!!initialValues.intermediateTable.file);
        }
        if (initialValues.attributeFields) {
          setAttributeFields(initialValues.attributeFields);
        }
      } else {
        form.setFieldsValue({
          linkType: '1:1'
        });
      }
    }, [initialValues, form]);

    // 从文件加载字段列表
    const loadAttributeFields = async (file?: any) => {
      setFieldsLoading(true);
      try {
        // TODO: 调用实际API获取字段列表
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟返回的字段数据
        const mockFields: AttributeField[] = [
          {
            tableField: 'id',
            selected: true,
            attributeName: 'id',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_1',
            selected: true,
            attributeName: 'field_1',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_2',
            selected: true,
            attributeName: 'field_2',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_3',
            selected: true,
            attributeName: 'field_3',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_4',
            selected: true,
            attributeName: 'field_4',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_5',
            selected: true,
            attributeName: 'field_5',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_6',
            selected: true,
            attributeName: 'field_6',
            fieldType: 'STRING'
          },
          {
            tableField: 'field_7',
            selected: true,
            attributeName: 'field_7',
            fieldType: 'STRING'
          }
        ];

        setAttributeFields(mockFields);
        form.setFieldValue('attributeFields', mockFields);
        setFileUploaded(true);
      } catch (error) {
        Message.error('加载字段列表失败');
      } finally {
        setFieldsLoading(false);
      }
    };

    // 属性字段映射相关方法
    const handleFieldChange = (
      index: number,
      updates: Partial<AttributeField>
    ) => {
      const newFields = [...attributeFields];
      newFields[index] = { ...newFields[index], ...updates };
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const handleSelectAll = (checked: boolean) => {
      const newFields = attributeFields.map((field) => ({
        ...field,
        selected: checked
      }));
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const allSelected =
      attributeFields.length > 0 && attributeFields.every((f) => f.selected);
    const someSelected = attributeFields.some((f) => f.selected);

    // 属性字段映射表格列定义
    const attributeColumns: TableColumnProps<AttributeField>[] = [
      {
        title: (
          <div className="flex items-center gap-[12px]">
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
          <div className="flex items-center gap-[12px]">
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
        title: '属性名称',
        dataIndex: 'attributeName',
        width: 365,
        render: (value, record, index) => (
          <Input
            value={value}
            className="w-full"
            onChange={(val) => handleFieldChange(index, { attributeName: val })}
            placeholder="请输入属性名称"
          />
        )
      },
      {
        title: '字段类型',
        dataIndex: 'fieldType',
        width: 120,
        render: (value) => <span>{value}</span>
      }
    ];

    const handleLinkTypeChange = (type: LinkType) => {
      setLinkType(type);
      // 切换链接类型时清空整个表单
      form.resetFields();
      form.setFieldValue('linkType', type);
      // 重置所有相关状态
      setIntermediateTable({ type: 'local_csv' });
      setAttributeFields([]);
      setFileUploaded(false);
    };

    const handleIntermediateTableTypeChange = (
      type: 'local_csv' | 'data_lake_sync'
    ) => {
      setIntermediateTable({
        ...intermediateTable,
        type
      });
    };

    const handleIntermediateTableFileChange = (fileData: any) => {
      // FieldImportUpload 返回的是字段数据数组或文件对象
      // 这里我们需要存储文件信息，然后加载字段
      const file =
        Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;
      const newIntermediateTable = {
        ...intermediateTable,
        file: fileData // 存储返回的数据，可能是字段数组
      };
      setIntermediateTable(newIntermediateTable);
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);

      // 如果返回的是字段数据数组，直接使用；否则调用API加载
      if (Array.isArray(fileData) && fileData.length > 0) {
        // 假设返回的是字段数据，需要转换为 AttributeField 格式
        // 这里先调用 loadAttributeFields 来模拟加载
        loadAttributeFields(fileData);
      } else if (fileData) {
        // 如果是文件对象，调用API加载字段
        loadAttributeFields(fileData);
      }
    };

    const handleSubmit = async () => {
      try {
        const values = await form.validate();

        // 验证链接对
        if (!values.sourceObjectType || !values.targetObjectType) {
          Message.warning('请选择源对象类型和目标对象类型');
          return;
        }

        if (linkType === 'N:N') {
          if (
            !intermediateTable.file &&
            intermediateTable.type === 'local_csv'
          ) {
            Message.warning('请上传中间表文件');
            return;
          }

          if (!values.sourceAttribute || !values.targetAttribute) {
            Message.warning('请选择关联中间表的属性');
            return;
          }

          if (attributeFields.length === 0) {
            Message.warning('请先上传中间表');
            return;
          }
        } else {
          if (!values.targetObjectAttribute) {
            Message.warning('请选择目标对象类型属性');
            return;
          }
        }

        const formData: LinkFormData = {
          ...values,
          linkType,
          intermediateTable: linkType === 'N:N' ? intermediateTable : undefined,
          attributeFields: linkType === 'N:N' ? attributeFields : []
        };

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    // 暴露 submit 方法给外部
    React.useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    const sourceObjectType = Form.useWatch('sourceObjectType', form);
    const targetObjectType = Form.useWatch('targetObjectType', form);
    const targetObjectAttribute = Form.useWatch('targetObjectAttribute', form);

    return (
      <div
        className={classNames(
          'flex flex-col px-[24px] pb-[16px]',
          showFooter ? 'flex-1 pb-24' : ''
        )}
      >
        <div className={showFooter ? 'flex-1' : ''}>
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 18 }}
            labelAlign="left"
          >
            {/* 链接类型 */}
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              链接类型
            </div>
            <FormItem field="linkType" label="">
              <div className="flex gap-[16px]">
                {(
                  [
                    LinkType.ONE_TO_ONE,
                    LinkType.ONE_TO_MANY,
                    LinkType.MANY_TO_MANY
                  ] as LinkType[]
                ).map((type) => (
                  <div
                    key={type}
                    className={classNames(
                      'relative flex-1 cursor-pointer rounded-[4px] border-[1px] p-[16px] transition-all',
                      linkType === type
                        ? 'border-[#165DFF] bg-[#E8F3FF]'
                        : 'border-[#E5E6EB] bg-white hover:border-[#165DFF]'
                    )}
                    onClick={() => handleLinkTypeChange(type)}
                  >
                    {linkType === type && (
                      <LinkCheckIcon className="absolute right-0 top-0" />
                    )}
                    <div className="flex flex-row items-center gap-[8px]">
                      <div className="h-[40px] w-[40px] bg-[#DCDCDC]"></div>
                      <div className="flex flex-col gap-[4px]">
                        <div className="text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
                          {type}
                        </div>
                        <div className="text-[12px] leading-[18px] text-[var(--color-text-4)]">
                          {type === LinkType.ONE_TO_ONE
                            ? '双方实例严格唯一对应'
                            : type === LinkType.ONE_TO_MANY
                              ? '一方实例关联多个另一方实例'
                              : '双方实例可任意关联'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormItem>

            {/* 基本信息 */}
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              基本信息
            </div>

            <FormItem
              label="链接名称："
              field="name"
              rules={[
                { required: true, message: '请输入链接名称' },
                { maxLength: 50, message: '名称不能超过50个字符' }
              ]}
            >
              <Input
                className="max-w-[640px]"
                placeholder="请输入链接名称"
                maxLength={50}
                showWordLimit
              />
            </FormItem>

            <FormItem
              label="id："
              field="id"
              rules={[{ required: true, message: '请输入唯一标识' }]}
            >
              <Input
                className="max-w-[640px]"
                showWordLimit
                placeholder="请输入唯一标识"
              />
            </FormItem>

            <FormItem
              label="链接对："
              field="linkPair"
              rules={[
                {
                  required: true,
                  validator: (value, callback) => {
                    const sourceType = form.getFieldValue('sourceObjectType');
                    const targetType = form.getFieldValue('targetObjectType');
                    if (!sourceType || !targetType) {
                      callback('请选择源对象类型和目标对象类型');
                    } else if (linkType !== 'N:N') {
                      const targetAttr = form.getFieldValue(
                        'targetObjectAttribute'
                      );
                      if (!targetAttr) {
                        callback('请选择目标对象类型属性');
                      } else {
                        callback();
                      }
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <div className="flex items-center">
                <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                  <ObjectTypeSelect
                    label="源对象类型："
                    value={sourceObjectType}
                    onChange={(val) => {
                      form.setFieldValue('sourceObjectType', val);
                    }}
                    placeholder="请选择对象类型"
                    allowClear
                  />
                </div>

                {linkType === 'N:N' ? (
                  <>
                    <div className="flex flex-col items-center">
                      <TwoWayArrowIcon />
                    </div>
                    <div className="flex-1 flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <ObjectTypeSelect
                        label="目标对象类型："
                        value={targetObjectType}
                        onChange={(val) => {
                          form.setFieldValue('targetObjectType', val);
                        }}
                        placeholder="请选择对象类型"
                        allowClear
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <OneWayArrowIcon />
                    </div>
                    <div className="flex-1 flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <div className="mb-[8px] text-[14px] text-[var(--color-text-2)]">
                        目标对象类型和属性：
                      </div>
                      <Input.Group
                        compact
                        className={`${styles['table-select-group']} w-full`}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <ObjectTypeSelect
                            value={targetObjectType}
                            onChange={(val) => {
                              form.setFieldValue('targetObjectType', val);
                              form.setFieldValue(
                                'targetObjectAttribute',
                                undefined
                              );
                            }}
                            placeholder="请选择对象类型"
                            allowClear
                            label=""
                            className="mb-0"
                          />
                        </div>
                        <Select
                          className={styles['table-select-wrapper']}
                          placeholder={
                            targetObjectType ? '请选择属性' : '请先选择对象类型'
                          }
                          value={targetObjectAttribute}
                          onChange={(val) => {
                            form.setFieldValue('targetObjectAttribute', val);
                          }}
                          disabled={!targetObjectType}
                          style={{ width: '50%' }}
                          allowClear
                        >
                          {getAttributeOptions(targetObjectType).map(
                            (option) => (
                              <Select.Option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </Input.Group>
                    </div>
                  </>
                )}
              </div>
            </FormItem>

            {/* 中间表（仅N:N显示） */}
            {linkType === 'N:N' && (
              <>
                <div className="my-[16px] flex items-center gap-[8px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
                  <span>中间表</span>
                  <Tooltip content="中间表用于存储N:N关系的关联数据">
                    <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                  </Tooltip>
                </div>

                <FormItem
                  label="上传中间表："
                  field="intermediateTable"
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        if (
                          intermediateTable.type === 'local_csv' &&
                          !intermediateTable.file
                        ) {
                          callback('请上传中间表文件');
                        } else {
                          callback();
                        }
                      }
                    }
                  ]}
                >
                  <div className="space-y-4">
                    <Radio.Group
                      value={intermediateTable.type}
                      onChange={handleIntermediateTableTypeChange}
                    >
                      <Radio value="local_csv">本地CSV导入</Radio>
                      <Radio value="data_lake_sync">数据湖同步</Radio>
                    </Radio.Group>

                    {intermediateTable.type === 'local_csv' && (
                      <div>
                        <FieldImportUpload
                          accept=".csv"
                          fileType="csv"
                          maxSize={500}
                          onFileChange={handleIntermediateTableFileChange}
                          onUploadingChange={(isUploading) => {
                            // Handle uploading state if needed
                          }}
                        />
                      </div>
                    )}

                    {intermediateTable.type === 'data_lake_sync' && (
                      <div className="text-[14px] text-[var(--color-text-3)]">
                        数据湖同步功能待实现
                      </div>
                    )}
                  </div>
                </FormItem>

                {/* 关联中间表 */}
                <div className="my-[16px] flex items-center gap-[8px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
                  <span>关联中间表</span>
                </div>

                <FormItem
                  label="源对象类型属性："
                  field="sourceAttribute"
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        if (!fileUploaded) {
                          callback('请先上传中间表');
                        } else if (!value) {
                          callback('请选择源对象类型属性');
                        } else {
                          callback();
                        }
                      }
                    }
                  ]}
                >
                  <div className="flex items-center">
                    <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <div className="mb-[8px] flex items-center gap-[4px]">
                        <span className="text-[14px] text-[var(--color-text-2)]">
                          源对象类型属性
                        </span>
                        <Tooltip content="选择源对象类型中用于关联的属性">
                          <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                        </Tooltip>
                      </div>
                      <Select
                        placeholder="请先上传中间表"
                        value={form.getFieldValue('sourceAttribute')}
                        onChange={(val) => {
                          form.setFieldValue('sourceAttribute', val);
                        }}
                        disabled={!fileUploaded}
                        allowClear
                      >
                        {getAttributeOptions(sourceObjectType).map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col items-center">
                      <TwoWayArrowIcon />
                    </div>

                    <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <div className="mb-[8px] flex items-center gap-[4px]">
                        <span className="text-[14px] text-[var(--color-text-2)]">
                          目标对象类型属性
                        </span>
                        <Tooltip content="选择目标对象类型中用于关联的属性">
                          <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                        </Tooltip>
                      </div>
                      <Select
                        placeholder="请先上传中间表"
                        value={form.getFieldValue('targetAttribute')}
                        onChange={(val) => {
                          form.setFieldValue('targetAttribute', val);
                        }}
                        disabled={!fileUploaded}
                        allowClear
                      >
                        {getAttributeOptions(targetObjectType).map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </FormItem>

                {/* 属性字段映射 */}
                <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
                  属性字段映射
                </div>
                <FormItem
                  field="attributeFields"
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
                      <span className="mt-4 text-[14px] text-[#86909C]">
                        加载中
                      </span>
                    </div>
                  ) : attributeFields.length === 0 ? (
                    <div className="py-8 text-center text-[14px] text-[#86909C]">
                      请先上传中间表
                    </div>
                  ) : (
                    <Table
                      columns={attributeColumns}
                      data={attributeFields}
                      rowKey={(record) => record.tableField}
                      border={false}
                      pagination={false}
                    />
                  )}
                </FormItem>
              </>
            )}
          </Form>
        </div>

        {showFooter && (
          <div className="sticky bottom-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button onClick={onCancel} disabled={loading}>
                取消
              </Button>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                确定
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LinkForm.displayName = 'LinkForm';

export default LinkForm;
