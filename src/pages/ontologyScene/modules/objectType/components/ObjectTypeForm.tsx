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
  Switch,
  Tooltip,
  Spin
} from '@arco-design/web-react';
import {
  IconUpload,
  IconQuestionCircle,
  IconDelete,
  IconLink
} from '@arco-design/web-react/icon';
import ArchiveIcon from '../../../assets/archive.svg';
import FieldImportUpload from './FieldImportUpload';
import BindPublicAttributeModal, {
  PublicAttribute
} from './BindPublicAttributeModal';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';

const FormItem = Form.Item;
const { TextArea } = Input;

export type DataSourceType = 'local_csv' | 'data_directory_sync';

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

export interface ObjectTypeFormData {
  name: string;
  id: string;
  description: string;
  icon?: string;
  dataSource: {
    type: DataSourceType;
    database?: string;
    table?: string;
    file?: any;
  };
  attributeFields: AttributeField[];
}

interface ObjectTypeFormProps {
  initialValues?: Partial<ObjectTypeFormData>;
  onSubmit: (data: ObjectTypeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean; // 是否显示底部按钮，如果为false，则由外层控制
}

export interface ObjectTypeFormRef {
  submit: () => void;
}

const ObjectTypeForm = React.forwardRef<ObjectTypeFormRef, ObjectTypeFormProps>(
  (
    { initialValues, onSubmit, onCancel, loading = false, showFooter = true },
    ref
  ) => {
    const [form] = Form.useForm();
    const [iconFile, setIconFile] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<
      ObjectTypeFormData['dataSource']
    >({
      type: 'local_csv'
    });
    const [selectedDatabase, setSelectedDatabase] = useState<
      string | undefined
    >();
    const [selectedTable, setSelectedTable] = useState<string | undefined>();
    const [attributeFields, setAttributeFields] = useState<AttributeField[]>(
      []
    );
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [bindModalVisible, setBindModalVisible] = useState(false);
    const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(-1);

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          id: initialValues.id,
          description: initialValues.description,
          dataSourceType: initialValues.dataSource?.type || 'local_csv',
          database: initialValues.dataSource?.database,
          table: initialValues.dataSource?.table,
          attributeFields: initialValues.attributeFields || []
        });
        if (initialValues.dataSource) {
          setDataSource(initialValues.dataSource);
          setSelectedDatabase(initialValues.dataSource.database || '');
          setSelectedTable(initialValues.dataSource.table || '');
          setFileUploaded(!!initialValues.dataSource.file);
        }
        if (initialValues.attributeFields) {
          setAttributeFields(initialValues.attributeFields);
        }
      } else {
        // 初始化默认值，确保第一个选项被选中
        form.setFieldsValue({
          dataSourceType: 'local_csv'
        });
      }
    }, [initialValues, form]);

    // 模拟从文件或数据库获取字段列表
    const loadAttributeFields = async (
      file?: any,
      database?: string,
      table?: string
    ) => {
      setFieldsLoading(true);
      try {
        // TODO: 调用实际API获取字段列表
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟返回的字段数据
        const mockFields: AttributeField[] = [
          {
            tableField: 'id',
            selected: true,
            isPrimaryKey: true,
            attributeName: 'id',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_1',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_1',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_2',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_2',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_3',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_3',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_4',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_4',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_5',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_5',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_6',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_6',
            storeAsPublic: false,
            fieldType: 'STRING'
          },
          {
            tableField: 'field_7',
            selected: true,
            isPrimaryKey: false,
            attributeName: 'field_7',
            storeAsPublic: false,
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

    const handlePrimaryKeyChange = (index: number) => {
      const newFields = attributeFields.map((field, i) => ({
        ...field,
        isPrimaryKey: i === index
      }));
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const handleDeleteField = (index: number) => {
      const newFields = attributeFields.filter((_, i) => i !== index);
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const handleBindPublicAttribute = (index: number) => {
      setCurrentFieldIndex(index);
      setBindModalVisible(true);
    };

    const handleUnbindPublicAttribute = (index: number) => {
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
              disabled={!!record.isPrimaryKey}
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
          <div className="flex items-center gap-[8px]">
            <span>主键</span>
            <Tooltip content="选择作为主键的字段">
              <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
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
        width: 365,
        render: (value, record, index) => (
          <div className="flex items-center gap-[12px]">
            <div className="relative w-full">
              <Input
                value={value}
                className="w-full"
                onChange={(val) =>
                  handleFieldChange(index, { attributeName: val })
                }
                placeholder="请输入属性名称"
                // disabled={!!record.publicAttributeId}
              />
              {record.publicAttributeId && (
                <Button
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  type="text"
                  onClick={() => handleUnbindPublicAttribute(index)}
                >
                  取消绑定
                </Button>
              )}
            </div>
            <Tooltip content="绑定公共属性">
              <ArchiveIcon
                className="cursor-pointer text-[var(--color-text-2)] hover:cursor-pointer hover:text-[#184FF2]"
                onClick={() => handleBindPublicAttribute(index)}
              />
            </Tooltip>
          </div>
        )
      },
      {
        title: (
          <div className="flex items-center gap-[8px]">
            <span>存入公共属性</span>
            <Tooltip content="是否将当前属性存入公共属性库">
              <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
            </Tooltip>
          </div>
        ),
        dataIndex: 'storeAsPublic',
        width: 160,
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
      }
      // {
      //     title: '操作',
      //     dataIndex: 'action',
      //     width: 80,
      //     render: (_, record, index) => (
      //         <IconDelete
      //             className="cursor-pointer text-[#86909C] hover:text-[#F53F3F]"
      //             onClick={() => handleDeleteField(index)}
      //         />
      //     )
      // }
    ];

    // 模拟数据库列表
    const databaseOptions = [
      { label: '数据库1', value: 'db1' },
      { label: '数据库2', value: 'db2' },
      { label: '数据库3', value: 'db3' }
    ];

    // 模拟表列表（根据选择的数据库动态变化）
    const tableOptions = selectedDatabase
      ? [
          { label: '表1', value: 'table1' },
          { label: '表2', value: 'table2' },
          { label: '表3', value: 'table3' }
        ]
      : [];

    const handleDataSourceTypeChange = (type: DataSourceType) => {
      form.setFieldValue('dataSourceType', type);
      // 切换到本地CSV导入时，清空数据库和表
      if (type === 'local_csv') {
        setSelectedDatabase(undefined);
        setSelectedTable(undefined);
        form.setFieldsValue({
          database: undefined,
          table: undefined
        });
      }
      const newDataSource: ObjectTypeFormData['dataSource'] = {
        type,
        database: type === 'data_directory_sync' ? selectedDatabase : undefined,
        table: type === 'data_directory_sync' ? selectedTable : undefined,
        file: type === 'local_csv' ? dataSource.file : undefined
      };
      setDataSource(newDataSource);
      // 切换数据源类型时清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);
    };

    const handleDatabaseChange = (database: string) => {
      setSelectedDatabase(database);
      setSelectedTable(''); // 清空表选择
      form.setFieldsValue({
        database,
        table: undefined
      });
      const newDataSource = {
        ...dataSource,
        type: dataSource.type,
        database,
        table: undefined
      };
      setDataSource(newDataSource);
      // 切换数据库时清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);
    };

    const handleTableChange = (table: string) => {
      setSelectedTable(table);
      form.setFieldValue('table', table);
      const newDataSource = {
        ...dataSource,
        type: dataSource.type,
        database: selectedDatabase,
        table
      };
      setDataSource(newDataSource);
      if (
        dataSource.type === 'data_directory_sync' &&
        selectedDatabase &&
        table
      ) {
        loadAttributeFields(undefined, selectedDatabase, table);
      }
    };

    const handlePreview = () => {
      // TODO: 实现预览功能
      console.log('Preview:', {
        database: selectedDatabase,
        table: selectedTable
      });
    };

    const handleDataSourceFileChange = (fileData: any) => {
      const file =
        Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;
      // 切换文件时清空数据库和表
      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      form.setFieldsValue({
        database: undefined,
        table: undefined
      });
      const newDataSource: ObjectTypeFormData['dataSource'] = {
        ...dataSource,
        type: 'local_csv' as DataSourceType,
        file,
        database: undefined,
        table: undefined
      };
      setDataSource(newDataSource);
      // 切换文件时先清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);

      if (file) {
        // 新文件上传后重新加载字段
        loadAttributeFields(file);
      }
    };

    const handleIconChange = (fileList: any[]) => {
      setIconFile(fileList);
    };

    const handleSubmit = async () => {
      try {
        const values = await form.validate();

        if (!dataSource.file && dataSource.type === 'local_csv') {
          Message.warning('请上传文件');
          return;
        }

        if (
          dataSource.type === 'data_directory_sync' &&
          (!dataSource.database || !dataSource.table)
        ) {
          Message.warning('请选择数据库和表');
          return;
        }

        if (attributeFields.length === 0) {
          Message.warning('请先上传文件或选择数据源');
          return;
        }

        const formData: ObjectTypeFormData = {
          ...values,
          icon: iconFile[0]?.url || iconFile[0]?.response?.data?.url,
          dataSource,
          attributeFields
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
            {/* 基本信息 */}
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              基本信息
            </div>

            <FormItem
              label="对象类型名称："
              field="name"
              rules={[
                { required: true, message: '请输入对象类型名称' },
                { maxLength: 50, message: '名称不能超过50个字符' }
              ]}
            >
              <Input
                placeholder="请输入本体名称用于在界面上展示,如传感器"
                maxLength={50}
                showWordLimit
              />
            </FormItem>

            <FormItem
              label="id："
              field="id"
              rules={[{ required: true, message: '请输入唯一标识' }]}
            >
              <Input placeholder="请输入唯一标识" />
            </FormItem>

            <FormItem label="描述说明：" field="description">
              <TextArea
                placeholder="请输入描述说明"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </FormItem>

            <FormItem label="图标：" field="icon"></FormItem>

            {/* 数据源 */}
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              数据源
            </div>
            <FormItem
              label="上传文件："
              field="dataSourceType"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Radio.Group
                value={dataSource.type}
                onChange={handleDataSourceTypeChange}
              >
                <Radio value="local_csv">本地CSV导入</Radio>
                <Radio value="data_directory_sync">数据目录同步</Radio>
              </Radio.Group>
            </FormItem>

            {dataSource.type === 'local_csv' ? (
              <FormItem
                className={styles['local-csv-form-item']}
                label=" "
                field="file"
                rules={[
                  {
                    required: true,
                    validator: (value, callback) => {
                      if (!dataSource.file) {
                        callback('请上传文件');
                      } else {
                        callback();
                      }
                    }
                  }
                ]}
              >
                <FieldImportUpload
                  accept=".csv"
                  fileType="csv"
                  maxSize={500}
                  onFileChange={handleDataSourceFileChange}
                  onUploadingChange={(isUploading) => {
                    // Handle uploading state if needed
                  }}
                />
              </FormItem>
            ) : (
              <>
                <FormItem
                  label="数据库/表："
                  field="database"
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        if (
                          dataSource.type === 'data_directory_sync' &&
                          !value
                        ) {
                          callback('请选择数据库');
                        } else {
                          callback();
                        }
                      }
                    }
                  ]}
                >
                  <div className="flex items-center">
                    <Input.Group
                      compact
                      className={styles['table-select-group']}
                    >
                      <Select
                        placeholder="请选择数据库"
                        value={selectedDatabase}
                        onChange={handleDatabaseChange}
                        style={{ width: 302 }}
                        allowClear
                      >
                        {databaseOptions.map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        className={styles['table-select-wrapper']}
                        placeholder={
                          selectedDatabase ? '请选择表' : '请先选择数据库'
                        }
                        value={selectedTable}
                        onChange={handleTableChange}
                        style={{ width: 302 }}
                        allowClear
                      >
                        {tableOptions.map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Input.Group>
                    <Button
                      type="text"
                      onClick={handlePreview}
                      disabled={!selectedDatabase || !selectedTable}
                    >
                      预览
                    </Button>
                  </div>
                </FormItem>
              </>
            )}

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
                  <span className="mt-4 text-[14px] text-[#86909C]">
                    加载中
                  </span>
                </div>
              ) : attributeFields.length === 0 ? (
                <div className="py-8 text-center text-[14px] text-[#86909C]">
                  请先上传文件
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
          </Form>
        </div>

        {showFooter && (
          /* 底部操作按钮 - 使用sticky */
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
        {bindModalVisible && (
          <BindPublicAttributeModal
            visible={bindModalVisible}
            initialSelectedId={
              currentFieldIndex >= 0
                ? attributeFields[currentFieldIndex]?.publicAttributeId
                : undefined
            }
            onCancel={() => {
              setBindModalVisible(false);
              setCurrentFieldIndex(-1);
            }}
            onConfirm={handleBindConfirm}
          />
        )}
      </div>
    );
  }
);

ObjectTypeForm.displayName = 'ObjectTypeForm';

export default ObjectTypeForm;
