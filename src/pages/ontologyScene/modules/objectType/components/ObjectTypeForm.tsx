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
import CancelArchiveIcon from '../../../assets/cancel-archive.svg';
import FieldImportUpload from '../../../componens/FieldImportUpload';
import BindPublicAttributeModal, {
  PublicAttribute
} from './BindPublicAttributeModal';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';
import { CreateOntologyPhysicalProperty, SourceType } from '@/types/objectType';
import { uploadOntologyCSVFileAndParse } from '@/api/ontologySceneLibrary/objectType';
import {
  createOntologyPublicProperties,
  deleteOntologyPublicProperties
} from '@/api/ontologySceneLibrary/attributes';
import {
  COLUMN_TYPE_OPTIONS,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import IconSelector from '@/pages/ontologyScene/componens/IconSelector';

const FormItem = Form.Item;
const { TextArea } = Input;

export type DataSourceType = 'local_csv' | 'data_directory_sync';

// 使用接口定义的字段名
export interface AttributeField extends CreateOntologyPhysicalProperty {
  // 为了UI显示，保留一些临时字段
  _tableField?: string; // 用于显示表字段名（对应 name）
  _attributeName?: string; // 用于显示属性名称（对应 comment）
  _storedPublicPropertyId?: number; // 存入公共属性时创建的ID（与publicPropertyID区分，publicPropertyID用于绑定已有公共属性）
}

export interface ObjectTypeFormData {
  code: string;
  name: string;
  description?: string;
  icon: string;
  ontologyModelID: number;
  filePath?: string;
  originalDbName: string;
  originalTableName: string;
  sourceType?: SourceType;
  ontologyPhysicalPropertiesList?: CreateOntologyPhysicalProperty[];
  // 内部使用的字段
  _dataSource?: {
    type: DataSourceType;
    database?: string;
    table?: string;
    file?: any;
  };
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
    const [selectedIcon, setSelectedIcon] = useState<string>(
      initialValues?.icon || OBJECT_TYPE_ICON_OPTIONS[0]?.value || ''
    );
    const [dataSource, setDataSource] = useState<{
      type: DataSourceType;
      database?: string;
      table?: string;
      file?: any;
      filePath?: string;
    }>({
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
    const [storeAsPublicLoading, setStoreAsPublicLoading] = useState<
      Record<number, boolean>
    >({});

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          code: initialValues.code,
          description: initialValues.description,
          icon: initialValues.icon,
          ontologyModelID: initialValues.ontologyModelID,
          filePath: initialValues.filePath,
          originalDbName: initialValues.originalDbName,
          originalTableName: initialValues.originalTableName,
          sourceType: initialValues.sourceType,
          dataSourceType: initialValues._dataSource?.type || 'local_csv',
          database: initialValues._dataSource?.database,
          table: initialValues._dataSource?.table
        });
        if (initialValues.icon) {
          setSelectedIcon(initialValues.icon);
        }
        if (initialValues._dataSource) {
          setDataSource(initialValues._dataSource);
          setSelectedDatabase(initialValues._dataSource.database || '');
          setSelectedTable(initialValues._dataSource.table || '');
          setFileUploaded(!!initialValues._dataSource.file);
        }
        if (initialValues.ontologyPhysicalPropertiesList) {
          const fields = initialValues.ontologyPhysicalPropertiesList.map(
            (prop) => ({
              ...prop,
              _tableField: prop.name,
              _attributeName: prop.comment
            })
          );
          setAttributeFields(fields);
        }
      } else {
        // 初始化默认值，确保第一个选项被选中
        form.setFieldsValue({
          dataSourceType: 'local_csv'
        });
      }
    }, [initialValues, form]);

    // 从文件或数据库获取字段列表
    const loadAttributeFields = async (
      file?: any,
      database?: string,
      table?: string
    ) => {
      setFieldsLoading(true);
      try {
        if (dataSource.type === 'local_csv' && file) {
          // 调用 uploadOntologyCSVFileAndParse 接口
          const response = await uploadOntologyCSVFileAndParse({ file });
          if (response.status === 200 && response.code === '') {
            const columnList = response.data.data.columnList;
            const filePath = response.data.data.path;

            // 保存文件路径
            setDataSource((prev) => ({ ...prev, filePath }));

            // 将 columnList 转换为 AttributeField 格式
            const fields: AttributeField[] = columnList.map(
              (column, index) => ({
                name: column, // 表字段名
                comment: column, // 属性名称，默认与表字段名相同
                columnType: 'STRING', // 默认类型
                isPrimary: index === 0 ? 1 : 0, // 第一个字段默认为主键
                isSelected: 1, // 默认选中
                isStoreAsPublic: 0, // 默认不存入公共属性
                publicPropertyID: 0, // 默认未绑定公共属性
                _tableField: column,
                _attributeName: column
              })
            );

            setAttributeFields(fields);
            setFileUploaded(true);
          } else {
            Message.error(response.message || '上传文件失败');
          }
        } else if (
          dataSource.type === 'data_directory_sync' &&
          database &&
          table
        ) {
          // TODO: 调用数据库表字段获取接口
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // 模拟返回的字段数据
          const mockFields: AttributeField[] = [
            {
              name: 'id',
              comment: 'id',
              columnType: 'STRING',
              isPrimary: 1,
              isSelected: 1,
              isStoreAsPublic: 0,
              publicPropertyID: 0,
              _tableField: 'id',
              _attributeName: 'id'
            }
          ];
          setAttributeFields(mockFields);
          setFileUploaded(true);
        }
      } catch (error) {
        Message.error('加载字段列表失败');
        console.error('加载字段列表失败:', error);
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
      const newFields: AttributeField[] = attributeFields.map((field) => ({
        ...field,
        isSelected: checked ? 1 : 0
      }));
      setAttributeFields(newFields);
    };

    const handlePrimaryKeyChange = (index: number) => {
      const newFields: AttributeField[] = attributeFields.map((field, i) => ({
        ...field,
        isPrimary: i === index ? 1 : 0
      }));
      setAttributeFields(newFields);
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
        publicPropertyID: 0,
        isStoreAsPublic: 0
      });
    };

    const handleBindConfirm = (attribute: PublicAttribute) => {
      if (currentFieldIndex >= 0) {
        handleFieldChange(currentFieldIndex, {
          comment: attribute.name, // 使用公共属性的名称（comment字段）作为属性名称
          publicPropertyID: attribute.id, // 使用公共属性的ID
          isStoreAsPublic: 0, // 绑定后禁用存入公共属性
          _attributeName: attribute.name // 用于UI显示
        });
        setBindModalVisible(false);
        setCurrentFieldIndex(-1);
      }
    };

    // 处理存入公共属性开关变化
    const handleStoreAsPublicChange = async (
      index: number,
      checked: boolean
    ) => {
      const field = attributeFields[index];
      if (!field) return;

      setStoreAsPublicLoading((prev) => ({ ...prev, [index]: true }));

      try {
        if (checked) {
          // 打开开关：创建公共属性
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
            const publicPropertyId = response.data.data.id;
            handleFieldChange(index, {
              isStoreAsPublic: 1,
              _storedPublicPropertyId: publicPropertyId // 存入公共属性时创建的ID
            });
            Message.success('已存入公共属性库');
          } else {
            Message.error(response.message || '存入公共属性库失败');
            setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
          }
        } else {
          // 关闭开关：删除公共属性
          if (
            field._storedPublicPropertyId &&
            field._storedPublicPropertyId > 0
          ) {
            const response = await deleteOntologyPublicProperties({
              id: field._storedPublicPropertyId
            });

            if (response.status === 200 && response.code === '') {
              handleFieldChange(index, {
                isStoreAsPublic: 0,
                _storedPublicPropertyId: undefined // 清除存入公共属性时创建的ID
              });
              Message.success('已从公共属性库移除');
            } else {
              Message.error(response.message || '从公共属性库移除失败');
              setStoreAsPublicLoading((prev) => ({ ...prev, [index]: false }));
            }
          } else {
            // 如果没有 _storedPublicPropertyId，直接更新状态
            handleFieldChange(index, {
              isStoreAsPublic: 0,
              _storedPublicPropertyId: undefined
            });
          }
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
      attributeFields.length > 0 &&
      attributeFields.every((f) => f.isSelected === 1);
    const someSelected = attributeFields.some((f) => f.isSelected === 1);

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
        dataIndex: 'name',
        width: 365,
        render: (value, record, index) => (
          <div className="flex items-center gap-[12px]">
            <Checkbox
              disabled={record.isPrimary === 1}
              checked={record.isSelected === 1}
              onChange={(checked) =>
                handleFieldChange(index, { isSelected: checked ? 1 : 0 })
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
            <Tooltip content="选择作为主键的字段">
              <IconQuestionCircle className="pointer-events-auto cursor-pointer text-[#86909C]" />
            </Tooltip>
          </div>
        ),
        dataIndex: 'isPrimary',
        width: 84,
        render: (_, record, index) => (
          <Radio
            checked={record.isPrimary === 1}
            onChange={() => handlePrimaryKeyChange(index)}
          />
        )
      },
      {
        title: '属性名称',
        dataIndex: 'comment',
        width: 365,
        render: (value, record, index) => (
          <div className="flex items-center gap-[12px]">
            <div className="relative w-full">
              <Input
                value={record._attributeName || value}
                className="w-full"
                onChange={(val) =>
                  handleFieldChange(index, {
                    comment: val,
                    _attributeName: val
                  })
                }
                placeholder="请输入属性名称"
                // disabled={!!record.publicPropertyID}
              />
              {record.publicPropertyID > 0 && (
                <Tooltip content="取消绑定">
                  <CancelArchiveIcon
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 hover:cursor-pointer hover:text-[#184FF2]"
                    onClick={() => handleUnbindPublicAttribute(index)}
                  />
                </Tooltip>
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
        dataIndex: 'isStoreAsPublic',
        width: 140,
        render: (value, record, index) => {
          return (
            <Switch
              checked={record.isStoreAsPublic === 1}
              loading={storeAsPublicLoading[index]}
              onChange={(checked) => handleStoreAsPublicChange(index, checked)}
            />
          );
        }
      },
      {
        title: '字段类型',
        dataIndex: 'columnType',
        width: 200,
        render: (value, record, index) => (
          <Select
            value={value}
            placeholder="请选择字段类型"
            onChange={(val) => handleFieldChange(index, { columnType: val })}
            style={{ width: '100%' }}
          >
            {COLUMN_TYPE_OPTIONS.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        )
      }
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
      const newDataSource = {
        type,
        database: type === 'data_directory_sync' ? selectedDatabase : undefined,
        table: type === 'data_directory_sync' ? selectedTable : undefined,
        file: type === 'local_csv' ? dataSource.file : undefined,
        filePath: type === 'local_csv' ? dataSource.filePath : undefined
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

    const handleDataSourceFileChange = async (fileData: any) => {
      const file =
        Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;
      // 切换文件时清空数据库和表
      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      form.setFieldsValue({
        database: undefined,
        table: undefined
      });
      const newDataSource = {
        ...dataSource,
        type: 'local_csv' as DataSourceType,
        file,
        database: undefined,
        table: undefined,
        filePath: undefined // 上传新文件时清空路径
      };
      setDataSource(newDataSource);
      // 切换文件时先清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);

      if (file) {
        // 新文件上传后重新加载字段
        await loadAttributeFields(file);
      }
    };

    const handleIconChange = (iconValue: string) => {
      setSelectedIcon(iconValue);
      form.setFieldValue('icon', iconValue);
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

        // 过滤出选中的字段，并转换为接口格式（移除临时字段）
        const selectedFields = attributeFields
          .filter((field) => field.isSelected === 1)
          .map(
            ({
              _tableField,
              _attributeName,
              _storedPublicPropertyId,
              ...field
            }) => field
          );

        const formData: ObjectTypeFormData = {
          code: values.code,
          name: values.name,
          description: values.description,
          icon:
            selectedIcon ||
            values.icon ||
            OBJECT_TYPE_ICON_OPTIONS[0]?.value ||
            '',
          ontologyModelID:
            values.ontologyModelID || initialValues?.ontologyModelID || 0,
          filePath: dataSource.filePath,
          originalDbName:
            dataSource.type === 'data_directory_sync'
              ? dataSource.database || ''
              : 'upload_db',
          originalTableName:
            dataSource.type === 'data_directory_sync'
              ? dataSource.table || ''
              : 'upload_table',
          sourceType:
            dataSource.type === 'local_csv'
              ? SourceType.FILE_UPLOAD
              : SourceType.ICEBERG,
          ontologyPhysicalPropertiesList: selectedFields,
          _dataSource: dataSource
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
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            labelAlign="left"
            className={styles['object-type-form']}
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
                placeholder="请输入对象类型名称。用于在界面上展示，如：传感器"
                maxLength={50}
                showWordLimit
              />
            </FormItem>

            <FormItem
              label="对象类型id："
              field="code"
              rules={[{ required: true, message: '请输入id' }]}
            >
              <Input placeholder="请输入id。用于 API 调用，全局唯一" />
            </FormItem>

            <FormItem label="描述说明：" field="description">
              <TextArea
                placeholder="请输入描述说明，详述该实体的业务边界与逻辑范围"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </FormItem>

            <FormItem label="图标：" field="icon">
              <IconSelector
                value={selectedIcon}
                onChange={handleIconChange}
                options={OBJECT_TYPE_ICON_OPTIONS}
                defaultIcon={OBJECT_TYPE_ICON_OPTIONS[0]?.value}
              />
            </FormItem>

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
                <Upload
                  drag
                  accept=".csv"
                  fileList={
                    dataSource.file
                      ? [
                          {
                            uid: '1',
                            name: dataSource.file.name || 'uploaded_file.csv',
                            status: 'done'
                          }
                        ]
                      : []
                  }
                  beforeUpload={(file) => {
                    // 检查文件类型
                    if (!/\.(csv)$/i.test(file.name)) {
                      Message.error('只能上传CSV格式文件');
                      return false;
                    }
                    // 检查文件大小 (500MB)
                    const maxSizeBytes = 500 * 1024 * 1024;
                    if (file.size > maxSizeBytes) {
                      Message.error('单文件大小不能超过500MB');
                      return false;
                    }
                    // 阻止默认上传，手动处理
                    handleDataSourceFileChange(file);
                    return false;
                  }}
                  onRemove={() => {
                    setDataSource((prev) => ({
                      ...prev,
                      file: undefined,
                      filePath: undefined
                    }));
                    setAttributeFields([]);
                    setFileUploaded(false);
                  }}
                  tip="仅支持上传UTF-8编码格式的文件,文件大小不超过500MB"
                >
                  <div className="flex h-[210px] w-full flex-col items-center justify-center rounded-[2px] border border-dashed border-[#CBD5E1]">
                    <IconUpload
                      className="mb-[24px] size-[24px]"
                      style={{ color: 'var(--text-color-text-1)' }}
                    />
                    <span className="text-[14px] text-[var(--color-text-1)]">
                      点击或拖拽文件到此处上传
                    </span>
                    <span className="text-[12px] text-[var(--color-text-4)]">
                      仅支持上传UTF-8编码格式的文件,文件大小不超过500MB
                    </span>
                  </div>
                </Upload>
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
              className={styles['attribute-fields-form-item']}
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
                <div className="py-[16px] text-left text-[14px] text-[var(--color-text-5)]">
                  请先上传文件
                </div>
              ) : (
                <Table
                  columns={attributeColumns}
                  data={attributeFields}
                  rowKey={(record) =>
                    record.name || record.id || `field-${record.name}`
                  }
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
      </div>
    );
  }
);

ObjectTypeForm.displayName = 'ObjectTypeForm';

export default ObjectTypeForm;
