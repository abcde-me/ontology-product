import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Message,
  Radio,
  Select,
  Table,
  TableColumnProps,
  Checkbox,
  Switch,
  Spin,
  Cascader,
  Popover
} from '@arco-design/web-react';
import {
  IconQuestionCircle,
  IconDelete,
  IconLink,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import ArchiveIcon from '../../../assets/archive.svg';
import CancelArchiveIcon from '../../../assets/cancel-archive.svg';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import BindPublicAttributeModal, {
  PublicAttribute
} from './BindPublicAttributeModal';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';
import {
  CreateOntologyPhysicalProperty,
  SourceType,
  MetadataMenuItem,
  IcebergTableItem
} from '@/types/objectType';
import {
  uploadOntologyCSVFileAndParse,
  listMetadataIcebergDatabaseName,
  listMetadataIcebergTable,
  listMetadataIcebergTiDBTable
} from '@/api/ontologySceneLibrary/objectType';
import {
  createOntologyPublicProperties,
  deleteOntologyPublicProperties
} from '@/api/ontologySceneLibrary/attributes';
import {
  OBJECT_TYPE_ICON_OPTIONS,
  DATA_SOURCE_TYPE,
  DataSourceType,
  COLUMN_TYPE_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import ObjectTypeIconSelector from './ObjectTypeIconSelector';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import { PrefixAimdp } from '@/api/endpoints';
import { openNewPage } from '@/utils/env';

interface FileData {
  columnList: string[];
  commentList: string[];
  typeList: string[];
  path: string;
}

const FormItem = Form.Item;

// Arco Cascader：`searchNodeByLabel` 会对路径上每一层节点调用 filterOption，
// 故可同时按库名（第一层）或表名/ID（第二层）筛选。
function databaseTableCascaderFilterOption(
  input: string,
  option: { label?: unknown; value?: unknown }
): boolean {
  const q = String(input ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;

  const labelStr =
    option?.label != null && option.label !== ''
      ? String(option.label).toLowerCase()
      : '';
  const valueStr =
    option?.value != null && option.value !== ''
      ? String(option.value).toLowerCase()
      : '';

  return labelStr.includes(q) || valueStr.includes(q);
}

const { TextArea } = Input;

/** 向量列表字段 / 属性名称后缀（与后端约定一致） */
const VECTOR_FIELD_SUFFIX = '_vector';

function getAttributeRowKey(record: AttributeField): string {
  return String(record.name || record.id || `field-${record.name}`);
}

/** 将接口返回的扁平列表合并为表单行：isVector=1 的项挂到 vectorSourceFieldName 对应基字段上 */
function mergeOntologyPhysicalPropertiesForForm(
  list: CreateOntologyPhysicalProperty[]
): AttributeField[] {
  if (!list?.length) return [];
  const vectorRows = list.filter((p) => p.isVector === 1);
  const baseRows = list.filter((p) => p.isVector !== 1);
  const vectorBySource = new Map(
    vectorRows.map((v) => [String(v.vectorSourceFieldName ?? ''), v])
  );
  return baseRows.map((prop) => {
    const vec = vectorBySource.get(String(prop.name ?? ''));
    return {
      ...prop,
      isVector: 0,
      vectorSourceFieldName: undefined,
      _tableField: prop.name,
      _attributeName: prop.comment,
      _vectorizationOn: Boolean(vec && prop.name),
      _vectorComment: vec?.comment,
      _vectorPropertyId: vec?.id
    };
  });
}

/** 表单行拍平为接口列表：向量化配置拆成 isVector=1 的独立项 */
function flattenOntologyPhysicalPropertiesForSubmit(
  fields: AttributeField[]
): CreateOntologyPhysicalProperty[] {
  const result: CreateOntologyPhysicalProperty[] = [];
  for (const f of fields) {
    const {
      _tableField,
      _attributeName,
      _storedPublicPropertyId,
      _vectorizationOn,
      _vectorComment,
      _vectorPropertyId,
      ...rest
    } = f;
    const base: CreateOntologyPhysicalProperty = {
      ...rest,
      isVector: 0,
      vectorSourceFieldName: undefined
    };
    result.push(base);

    if (_vectorizationOn && f.isUse === 1) {
      const vecName = `${f.name}${VECTOR_FIELD_SUFFIX}`;
      const vecComment =
        _vectorComment ?? `${f.comment ?? ''}${VECTOR_FIELD_SUFFIX}`;
      const vec: CreateOntologyPhysicalProperty = {
        name: vecName,
        comment: vecComment,
        columnType: 'VECTOR',
        isPrimary: 0,
        isUse: 1,
        isStoreAsPublic: 0,
        publicPropertyID: 0,
        isVector: 1,
        vectorSourceFieldName: f.name
      };
      if (_vectorPropertyId !== undefined && _vectorPropertyId !== '') {
        vec.id = String(_vectorPropertyId);
      }
      result.push(vec);
    }
  }
  return result;
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

// 使用接口定义的字段名
export interface AttributeField extends CreateOntologyPhysicalProperty {
  // 为了UI显示，保留一些临时字段
  _tableField?: string; // 用于显示表字段名（对应 name）
  _attributeName?: string; // 用于显示属性名称（对应 comment）
  _storedPublicPropertyId?: number; // 存入公共属性时创建的ID（与publicPropertyID区分，publicPropertyID用于绑定已有公共属性）
  /** 是否开启向量化（仅 UI，提交时展开为 isVector=1 的记录） */
  _vectorizationOn?: boolean;
  /** 向量属性的属性名称（comment），默认基字段 comment + _vector */
  _vectorComment?: string;
  /** 编辑态下后端返回的向量属性 id */
  _vectorPropertyId?: string | number;
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
  isReUpload?: boolean;
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
  isEdit?: boolean; // 是否是编辑模式
}

export interface ObjectTypeFormRef {
  submit: () => void;
}

const ObjectTypeForm = React.forwardRef<ObjectTypeFormRef, ObjectTypeFormProps>(
  (
    {
      initialValues,
      onSubmit,
      onCancel,
      loading = false,
      showFooter = true,
      isEdit = false
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [selectedIcon, setSelectedIcon] = useState<string>(
      initialValues?.icon || ''
    );
    const [dataSource, setDataSource] = useState<{
      type: DataSourceType;
      database?: string;
      table?: string;
      file?: any;
      filePath?: string;
    }>({
      type: DATA_SOURCE_TYPE.LOCAL_CSV
    });
    const [selectedDatabase, setSelectedDatabase] = useState<
      string | undefined
    >();
    const [selectedTable, setSelectedTable] = useState<string | undefined>();
    // 级联选择器相关状态
    const [cascaderOptions, setCascaderOptions] = useState<
      Array<{
        label: string;
        value: string;
        children?: Array<{ label: string; value: string }>;
        isLeaf?: boolean;
      }>
    >([]);
    const [cascaderValue, setCascaderValue] = useState<string[]>([]);
    const [databaseList, setDatabaseList] = useState<MetadataMenuItem[]>([]);
    const [tableListMap, setTableListMap] = useState<
      Record<number, IcebergTableItem[]>
    >({});
    const [loadingTables, setLoadingTables] = useState<Record<number, boolean>>(
      {}
    );
    const [attributeFields, setAttributeFields] = useState<AttributeField[]>(
      []
    );
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [isReUpload, setIsReUpload] = useState(false);
    const [bindModalVisible, setBindModalVisible] = useState(false);
    const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(-1);
    const [storeAsPublicLoading, setStoreAsPublicLoading] = useState<
      Record<number, boolean>
    >({});
    const [initialFileList, setInitialFileList] = useState<any[]>([]);

    // 加载数据库列表
    const loadDatabaseList = async () => {
      try {
        const response = await listMetadataIcebergDatabaseName({
          instanceId: 1 // 固定值
        });
        if (response.status === 200 && response.code === '') {
          const databases = response.data.data || [];
          setDatabaseList(databases);
          // 转换为级联选择器格式
          const options = databases.map((db) => ({
            label: db.databaseName,
            value: String(db.id),
            isLeaf: false
            // children: []
          }));
          setCascaderOptions(options);
        } else {
          Message.error(response.message || '加载数据库列表失败');
        }
      } catch (error) {
        console.error('加载数据库列表失败:', error);
        Message.error('加载数据库列表失败');
      }
    };

    useEffect(() => {
      if (initialValues) {
        const formData = form.getFieldsValue();

        if (isEdit) {
          form.setFieldsValue({
            ...formData,
            ...initialValues,
            dataSourceType:
              initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV,
            database: initialValues._dataSource?.database,
            table: initialValues._dataSource?.table
          });
        } else {
          form.setFieldsValue({
            ...formData,
            ...initialValues,
            dataSourceType:
              formData.dataSourceType || DATA_SOURCE_TYPE.LOCAL_CSV
          });
        }

        if (initialValues.icon) {
          setSelectedIcon(initialValues.icon);
        }
        if (initialValues._dataSource) {
          setDataSource(initialValues._dataSource);
          setSelectedDatabase(initialValues._dataSource.database || '');
          setSelectedTable(initialValues._dataSource.table || '');
          setFileUploaded(!!initialValues._dataSource.file);

          // 如果有初始值，设置级联选择器的值
          if (
            initialValues._dataSource.database &&
            initialValues._dataSource.table
          ) {
            // 需要找到对应的数据库ID和表ID
            // 这里先设置，等数据库列表加载后再更新
            setCascaderValue([
              initialValues._dataSource.database,
              initialValues._dataSource.table
            ]);
          }
        }
        if (initialValues.ontologyPhysicalPropertiesList) {
          setAttributeFields(
            mergeOntologyPhysicalPropertiesForForm(
              initialValues.ontologyPhysicalPropertiesList
            )
          );
        }
        // 解析 filePath 并设置初始文件列表
        if (initialValues.filePath && initialValues.filePath.trim()) {
          const fileName = initialValues.filePath.split('/').pop() || '';
          if (fileName && fileName.trim()) {
            setInitialFileList([
              {
                uid: `initial-object-file-${initialValues.code ?? fileName}`,
                name: fileName
              }
            ]);
          }
          // 如果数据源类型是 LOCAL_CSV，需要设置 dataSource.filePath
          const dataSourceType =
            initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV;
          if (dataSourceType === DATA_SOURCE_TYPE.LOCAL_CSV) {
            setDataSource((prev) => ({
              ...prev,
              type: DATA_SOURCE_TYPE.LOCAL_CSV,
              filePath: initialValues.filePath
            }));
            setFileUploaded(true);
          }
        }
      } else {
        // 初始化默认值，确保第一个选项被选中
        form.setFieldsValue({
          dataSourceType: DATA_SOURCE_TYPE.LOCAL_CSV
        });
      }
    }, [initialValues, form]);

    /**
     * 字段类型规范化：
     * - 当为主键且类型为 varchar(5000) / char(36) / varchar(500) 时，统一设为 varchar(500)
     * - 当非主键且类型为上述几种之一时，统一设为 varchar(5000)
     * 此逻辑与 LinkForm 中保持一致，是因为服务端主键只能写入 varchar(500)，后续会统一在服务端优化
     */
    const normalizeColumnTypeForPrimary = (
      columnType: string,
      isPrimary?: boolean
    ) => {
      const lowerType = columnType.toString().toLowerCase();
      if (
        lowerType === 'varchar(5000)' ||
        lowerType === 'char(36)' ||
        lowerType === 'varchar(500)'
      ) {
        return isPrimary ? 'varchar(500)' : 'varchar(5000)';
      }
      return columnType;
    };

    // 当数据源类型为 data_directory_sync 时，加载数据库列表
    useEffect(() => {
      if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        loadDatabaseList();
      }
    }, [dataSource.type]);

    // 属性字段映射相关方法
    const handleFieldChange = (
      index: number,
      updates: Partial<AttributeField>
    ) => {
      const newFields = [...attributeFields];
      const prev = newFields[index];
      const merged: AttributeField = { ...prev, ...updates };
      newFields[index] = merged;
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const handleSelectAll = (checked: boolean) => {
      const newFields: AttributeField[] = attributeFields.map((field) => ({
        ...field,
        isUse: checked ? 1 : 0
      }));
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
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
        const isOldPrimary = field.isPrimary === 1;
        const isLocalCsv = dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV;

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
            const publicPropertyId = response.data;
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
      attributeFields.length > 0 && attributeFields.every((f) => f.isUse === 1);
    const someSelected = attributeFields.some((f) => f.isUse === 1);

    const vectorExpandedRowKeys = useMemo(
      () =>
        attributeFields
          .filter((f) => f._vectorizationOn)
          .map((f) => getAttributeRowKey(f)),
      [attributeFields]
    );

    // 属性字段映射表格列定义
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
              disabled={record.isPrimary === 1}
              checked={record.isUse === 1}
              onChange={(checked) =>
                handleFieldChange(index, { isUse: checked ? 1 : 0 })
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
                    onClick={() => handleBindPublicAttribute(index)}
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
          const rowDisabled = record.isUse !== 1;
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
                rowDisabled
              )}
            </div>
          );
        }
      },
      {
        title: '向量化',
        dataIndex: '_vectorizationOn',
        width: 100,
        render: (_, record, index) => {
          const rowDisabled = record.isUse !== 1;
          const disabled = rowDisabled;
          return wrapDisabledFieldPopover(
            <Switch
              disabled={disabled}
              checked={record._vectorizationOn === true}
              onChange={(checked) =>
                handleVectorizationChange(index, !!checked)
              }
            />,
            disabled,
            '请先勾选字段'
          );
        }
      }
    ];

    const handleCascaderChange = async (value: string[] | undefined) => {
      // 处理 undefined 或空值的情况
      const newValue = value && Array.isArray(value) ? value : [];
      setCascaderValue(newValue);
      form.setFieldValue('database', newValue[0] || undefined);
      form.setFieldValue('table', newValue[1] || undefined);

      // 同步更新 dataSource 状态和表单字段值
      if (newValue.length === 2 && newValue[1]) {
        // 从 cascaderOptions 中获取数据库名
        const databaseId = Number(newValue[0]);
        const tableId = Number(newValue[1]);
        const databaseOption = cascaderOptions.find(
          (opt) => opt.value === String(databaseId)
        );
        const databaseName = databaseOption?.label || newValue[0];

        // 从 tableListMap 中获取表名
        const tables = tableListMap[databaseId] || [];
        const tableItem = tables.find((t) => t.id === tableId);
        const tableName = tableItem?.tableName || newValue[1];

        // 更新 dataSource 状态
        setDataSource((prev) => ({
          ...prev,
          database: databaseName,
          table: tableName
        }));
        setSelectedDatabase(databaseName);
        setSelectedTable(tableName);

        // 更新表单字段值，用于validator验证
        form.setFieldValue('databaseTable', `${databaseName}/${tableName}`);
      } else {
        // 只选择了第一层（数据库）时：保留已选数据库
        if (newValue.length >= 1 && newValue[0]) {
          const databaseOption = cascaderOptions.find(
            (opt) => opt.value === String(newValue[0])
          );
          const databaseName = databaseOption?.label || newValue[0];

          setDataSource((prev) => ({
            ...prev,
            database: databaseName,
            table: undefined
          }));
          setSelectedDatabase(databaseName);
          setSelectedTable(undefined);

          form.setFieldValue('database', databaseName);
          form.setFieldValue('table', undefined);
          form.setFieldValue('databaseTable', undefined);
        } else {
          // 清空选择时，也清空 dataSource
          setDataSource((prev) => ({
            ...prev,
            database: undefined,
            table: undefined
          }));
          setSelectedDatabase(undefined);
          setSelectedTable(undefined);

          // 清空表单字段值
          form.setFieldValue('databaseTable', undefined);
        }
      }

      // 当 table 值变化且有值时，调用接口获取字段列表
      if (newValue.length === 2 && newValue[1]) {
        const tableId = Number(newValue[1]);
        if (!isNaN(tableId) && tableId > 0) {
          setFieldsLoading(true);
          try {
            const response = await listMetadataIcebergTiDBTable({
              pageNum: 1,
              pageSize: 1000, // 加载所有字段
              filters: {
                tableId
              }
            });

            if (response.status === 200 && response.code === '') {
              const fieldList = response.data.data?.list || [];

              // 将返回的字段列表转换为 AttributeField 格式
              const fields: AttributeField[] = fieldList.map((field, index) => {
                const isPrimary = index === 0;
                const baseType = field.dataType;
                return {
                  name: field.fieldName, // 表字段名
                  comment: field.description || field.fieldName, // 属性名称，使用描述或字段名
                  columnType: normalizeColumnTypeForPrimary(
                    baseType,
                    isPrimary
                  ), // 应用主键字段类型规范
                  isPrimary: isPrimary ? 1 : 0, // 第一个字段默认为主键
                  isUse: 1, // 默认选中
                  isStoreAsPublic: 0, // 默认不存入公共属性
                  publicPropertyID: 0, // 默认未绑定公共属性
                  _tableField: field.fieldName,
                  _attributeName: field.description || field.fieldName
                };
              });

              setAttributeFields(fields);
              form.setFieldValue('attributeFields', fields);
              setFileUploaded(true);
            } else {
              Message.error(response.message || '加载字段列表失败');
              setAttributeFields([]);
              form.setFieldValue('attributeFields', []);
              setFileUploaded(false);
            }
          } catch (error) {
            console.error('加载字段列表失败:', error);
            Message.error('加载字段列表失败');
            setAttributeFields([]);
            form.setFieldValue('attributeFields', []);
            setFileUploaded(false);
          } finally {
            setFieldsLoading(false);
          }
        } else {
          // 如果 tableId 无效，清空字段列表
          setAttributeFields([]);
          form.setFieldValue('attributeFields', []);
          setFileUploaded(false);
        }
      } else {
        // 如果没有选择表，清空字段列表
        setAttributeFields([]);
        form.setFieldValue('attributeFields', []);
        setFileUploaded(false);
      }
    };

    // 级联选择器的 loadMore 函数，用于动态加载表列表
    const handleCascaderLoadMore = async (
      pathValue: string[],
      level: number
    ): Promise<any[]> => {
      if (level === 1 && pathValue.length > 0) {
        const databaseId = Number(pathValue[0]);
        if (!isNaN(databaseId) && !tableListMap[databaseId]) {
          try {
            setLoadingTables((prev) => ({ ...prev, [databaseId]: true }));
            const response = await listMetadataIcebergTable({
              pageNum: 1,
              pageSize: 1000, // 加载所有表
              filters: {
                databaseId
              }
            });

            if (response.status === 200 && response.code === '') {
              const tables = response.data.data?.list || [];
              setTableListMap((prev) => ({ ...prev, [databaseId]: tables }));

              // 更新级联选择器的选项
              setCascaderOptions((prevOptions) =>
                prevOptions.map((option) => {
                  if (option.value === String(databaseId)) {
                    return {
                      ...option,
                      children: tables.map((table) => ({
                        label: table.tableName,
                        value: String(table.id),
                        isLeaf: true
                      }))
                    };
                  }
                  return option;
                })
              );

              // 如果当前已选择了这个数据库和表，需要同步更新 dataSource
              if (
                cascaderValue.length === 2 &&
                Number(cascaderValue[0]) === databaseId
              ) {
                const tableId = Number(cascaderValue[1]);
                const tableItem = tables.find((t) => t.id === tableId);
                if (tableItem) {
                  const databaseOption = cascaderOptions.find(
                    (opt) => opt.value === String(databaseId)
                  );
                  const databaseName =
                    databaseOption?.label || cascaderValue[0];
                  setDataSource((prev) => ({
                    ...prev,
                    database: databaseName,
                    table: tableItem.tableName
                  }));
                  setSelectedDatabase(databaseName);
                  setSelectedTable(tableItem.tableName);
                }
              }

              // 返回更新后的选项
              return tables.map((table) => ({
                label: table.tableName,
                value: String(table.id)
              }));
            } else {
              Message.error(response.message || '加载表列表失败');
              return [];
            }
          } catch (error) {
            console.error('加载表列表失败:', error);
            Message.error('加载表列表失败');
            return [];
          } finally {
            setLoadingTables((prev) => ({ ...prev, [databaseId]: false }));
          }
        } else if (tableListMap[databaseId]) {
          return tableListMap[databaseId].map((table) => ({
            label: table.tableName,
            value: String(table.id),
            isLeaf: true
          }));
        }
      }
      return [];
    };

    const handleDataSourceTypeChange = (type: DataSourceType) => {
      form.setFieldValue('dataSourceType', type);
      // 切换到本地CSV导入时，清空数据库和表
      if (type === DATA_SOURCE_TYPE.LOCAL_CSV) {
        setSelectedDatabase(undefined);
        setSelectedTable(undefined);
        setCascaderValue([]);
        form.setFieldsValue({
          database: undefined,
          table: undefined,
          databaseTable: undefined
        });
      } else {
        // 切换到数据目录同步时，也清空 databaseTable 字段（需要重新选择）
        form.setFieldValue('databaseTable', undefined);
      }
      // 切换数据源类型时，清空上传的本地文件
      const newDataSource = {
        type,
        database:
          type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
            ? selectedDatabase
            : undefined,
        table:
          type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
            ? selectedTable
            : undefined,
        file: undefined, // 切换类型时清空文件
        filePath: undefined // 切换类型时清空文件路径
      };
      setDataSource(newDataSource);
      // 同步清空表单的文件字段
      form.setFieldValue('file', undefined);
      // 切换数据源类型时清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);
      setIsReUpload(false);
      // 切换数据源类型时清空初始文件列表
      if (type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        setInitialFileList([]);
      }
    };

    const handleDataSourceFileChange = (fileData: FileData) => {
      // FieldImportUpload 已经上传并解析了文件，fileData 是服务器返回的数据结构
      // 包含 { columnList: string[], path: string }
      if (!fileData || (Array.isArray(fileData) && fileData.length === 0)) {
        return;
      }

      // 处理返回的数据结构
      const responseData =
        Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;

      // 检查是否是服务器返回的数据结构（包含 columnList 和 path）
      if (responseData && responseData.columnList && responseData.path) {
        const {
          columnList,
          path,
          commentList = [],
          typeList = []
        } = responseData;

        // 切换文件时清空数据库和表
        setSelectedDatabase(undefined);
        setSelectedTable(undefined);
        form.setFieldsValue({
          database: undefined,
          table: undefined
        });

        // 保存文件路径
        const newDataSource = {
          ...dataSource,
          type: DATA_SOURCE_TYPE.LOCAL_CSV as DataSourceType,
          file: undefined, // 不需要保存文件对象，只需要路径
          database: undefined,
          table: undefined,
          filePath: path
        };
        setDataSource(newDataSource);

        // 将 columnList 转换为 AttributeField 格式
        const fields: AttributeField[] = columnList.map((column, index) => ({
          name: column, // 表字段名
          comment: commentList[index] || column, // 属性名称，默认与表字段名相同
          columnType: typeList[index] || COLUMN_TYPE_OPTIONS[0].value,
          isPrimary: index === 0 ? 1 : 0, // 第一个字段默认为主键
          isUse: 1, // 默认选中
          isStoreAsPublic: 0, // 默认不存入公共属性
          publicPropertyID: 0, // 默认未绑定公共属性
          _tableField: column,
          _attributeName: commentList[index] || column
        }));

        setAttributeFields(fields);
        form.setFieldValue('attributeFields', fields);
        setFileUploaded(true);
      }
    };

    const handleIconChange = (iconValue: string) => {
      setSelectedIcon(iconValue);
      form.setFieldValue('icon', iconValue);
    };

    const handleSubmit = async () => {
      try {
        const values = await form.validate();

        if (
          !dataSource.filePath &&
          dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
        ) {
          Message.warning('请上传文件');
          return;
        }

        if (
          dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
          (!dataSource.database || !dataSource.table)
        ) {
          Message.warning('请选择数据库和表');
          return;
        }

        if (attributeFields.length === 0) {
          Message.warning('请先上传文件或选择数据源');
          return;
        }

        const selectedFields =
          flattenOntologyPhysicalPropertiesForSubmit(attributeFields);

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
            dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
              ? dataSource.database || ''
              : '',
          originalTableName:
            dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
              ? dataSource.table || ''
              : '',
          sourceType:
            dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
              ? SourceType.FILE_UPLOAD
              : SourceType.ICEBERG,
          ontologyPhysicalPropertiesList: selectedFields,
          isReUpload:
            dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? isReUpload : false,
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
              label="对象类型名称"
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
                allowClear
              />
            </FormItem>

            <FormItem
              label="对象类型id"
              field="code"
              rules={[
                { required: true, message: '请输入id' },
                {
                  validator: (value, callback) => {
                    if (!value) {
                      callback();
                      return;
                    }
                    // 首字符必须为英文字母
                    if (!/^[a-zA-Z]/.test(value)) {
                      callback('首字符必须为英文字母');
                      return;
                    }
                    // 仅允许英文字母与数字（不允许下划线及特殊符号）
                    if (!/^[a-zA-Z0-9]+$/.test(value)) {
                      callback('仅允许英文字母与数字(不允许下划线及特殊符号)');
                      return;
                    }
                    callback();
                  }
                }
              ]}
              extra={
                <div className="text-[12px] text-[var(--color-text-4)]">
                  首字符必须为英文字母;仅允许英文字母与数字(不允许下划线及特殊符号)
                </div>
              }
            >
              <Input
                placeholder="请输入id。用于 API 调用，全局唯一"
                allowClear
                disabled={!!initialValues?.code}
              />
            </FormItem>

            <FormItem label="描述说明" field="description">
              <TextArea
                placeholder="请输入描述说明，详述该实体的业务边界与逻辑范围"
                autoSize={{ minRows: 3 }}
                maxLength={500}
                showWordLimit
              />
            </FormItem>

            <FormItem label="图标" field="icon">
              <ObjectTypeIconSelector
                initialValue={selectedIcon}
                onChange={handleIconChange}
                options={OBJECT_TYPE_ICON_OPTIONS}
              />
            </FormItem>

            {/* 数据源 */}
            <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
              数据源
            </div>
            <FormItem
              label="上传文件"
              field="dataSourceType"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Radio.Group
                value={dataSource.type}
                onChange={handleDataSourceTypeChange}
              >
                <Radio value={DATA_SOURCE_TYPE.LOCAL_CSV}>本地CSV导入</Radio>
                <Radio value={DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC}>
                  数据目录同步
                </Radio>
              </Radio.Group>
            </FormItem>

            {dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? (
              <FormItem
                className={styles['local-csv-form-item']}
                label=" "
                field="file"
                rules={[
                  {
                    required: true,
                    validator: (value, callback) => {
                      if (!dataSource.filePath) {
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
                  maxSize={100}
                  customAction={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
                  fileList={initialFileList}
                  onFileChange={(file) => {
                    // 文件被移除时，FieldImportUpload 传递空数组 []
                    if (
                      file === undefined ||
                      (Array.isArray(file) && file.length === 0)
                    ) {
                      // 文件被移除
                      setDataSource((prev) => ({
                        ...prev,
                        file: undefined,
                        filePath: undefined
                      }));
                      form.setFieldValue('file', undefined); // 同步到表单字段
                      setAttributeFields([]);
                      form.setFieldValue('attributeFields', []);
                      setFileUploaded(false);
                      setInitialFileList([]); // 清空初始文件列表
                    } else {
                      // 重新上传CSV文件时，设置isReUpload为true
                      setIsReUpload(!!initialValues?.code);
                      handleDataSourceFileChange(file);
                    }
                  }}
                  onUploadingChange={(isUploading) => {
                    // Handle uploading state if needed
                  }}
                />
              </FormItem>
            ) : (
              <>
                <FormItem
                  label="数据库/表"
                  field="databaseTable"
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        if (
                          dataSource.type ===
                            DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
                          (!cascaderValue || cascaderValue.length !== 2)
                        ) {
                          callback('请选择数据库/表');
                        } else {
                          callback();
                        }
                      }
                    }
                  ]}
                >
                  <div className="flex items-center">
                    <Cascader
                      placeholder="请选择数据库/表"
                      value={
                        cascaderValue.length > 0 ? cascaderValue : undefined
                      }
                      filterOption={databaseTableCascaderFilterOption}
                      changeOnSelect
                      options={cascaderOptions}
                      onChange={(value) => {
                        handleCascaderChange(value as string[] | undefined);
                      }}
                      loadMore={handleCascaderLoadMore}
                      allowClear
                      dropdownMenuClassName={
                        styles['object-type-cascader-dropdown']
                      }
                      renderFormat={(valueShow) => {
                        if (valueShow.length === 0) return '';
                        if (valueShow.length === 1) {
                          return valueShow[0];
                        }
                        // 显示格式：数据库名/表名
                        return `${valueShow[0]}/${valueShow[1]}`;
                      }}
                      renderOption={(option) => {
                        // 判断是否是第二层（数据表）
                        const isTableLevel = option.isLeaf === true;

                        if (isTableLevel) {
                          // 第二层：数据表，添加信息图标
                          return (
                            <div
                              className={classNames(
                                styles['table-option-with-icon'],
                                'flex w-full items-center justify-between'
                              )}
                            >
                              <EllipsisPopover
                                preferTypography
                                value={option.label}
                                className="min-w-0 flex-1"
                              />
                              <Popover
                                content="详情"
                                position="top"
                                trigger="hover"
                              >
                                <IconInfoCircle
                                  className="flex-shrink-0 cursor-pointer text-[16px] text-[#86909C] transition-colors hover:text-[#165DFF]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 打开新页面，使用表的 ID（option.value）
                                    openNewPage(
                                      `/onto/tenant/compute/onto/metadataManagement/detail?id=${option.value}&metadataType=ICEBERG`
                                    );
                                  }}
                                />
                              </Popover>
                            </div>
                          );
                        }

                        // 第一层：数据库，保持原样
                        return (
                          <EllipsisPopover
                            preferTypography
                            value={option.label}
                          />
                        );
                      }}
                      showSearch
                      dropdownMenuColumnStyle={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      virtualListProps={{
                        threshold: 100,
                        isStaticItemHeight: true
                      }}
                    />
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
                              vectorType: 'VECTOR'
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
          </Form>
        </div>

        {showFooter && (
          <div className="fixed bottom-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
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
