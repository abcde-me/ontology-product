import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Tooltip,
  Spin,
  Cascader,
  Tag,
  Popover
} from '@arco-design/web-react';
import {
  IconQuestionCircle,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import FieldImportUpload from '../../../componens/FieldImportUpload';
import { ObjectTypeSelect } from '../../../componens';
import classNames from 'classnames';
import LinkCheckIcon from '../../../assets/link-check.svg';
import OneWayArrowIcon from '../../../assets/one-way-arrow.svg';
import TwoWayArrowIcon from '../../../assets/double-headed-arrow.svg';
import styles from './LinkForm.module.scss';
import { LinkType } from '../../../types/link';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { PrefixAimdp } from '@/api/endpoints';
import {
  listMetadataIcebergDatabaseName,
  listMetadataIcebergTable,
  listMetadataIcebergTiDBTable
} from '@/api/ontologySceneLibrary/objectType';
import { MetadataMenuItem, IcebergTableItem } from '@/types/objectType';
import { EllipsisPopover } from '@ceai-front/arco-material';
import Link1To1Icon from '../../../assets/link-11.svg';
import Link1ToNIcon from '../../../assets/link-1n.svg';
import LinkNNIcon from '../../../assets/link-nn.svg';
import { openNewPage } from '@/utils/env';

const FormItem = Form.Item;

export interface AttributeField {
  tableField: string;
  isUse: number; // 1代表选中，0代表未选中
  attributeName: string;
  fieldType: string;
  isPrimary?: boolean; // 是否为主键
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
    filePath?: string;
    database?: string;
    table?: string;
  };
  sourceAttribute?: string; // N:N关联中间表的源属性
  targetAttribute?: string; // N:N关联中间表的目标属性
  attributeFields: AttributeField[];
  isReUpload?: boolean;
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
      filePath?: string;
      database?: string;
      table?: string;
    }>({
      type: 'local_csv'
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
    const [initialFileList, setInitialFileList] = useState<any[]>([]);
    const [targetPrimaryAttribute, setTargetPrimaryAttribute] = useState<{
      name: string;
      id: number;
    } | null>(null);
    const [sourcePrimaryAttribute, setSourcePrimaryAttribute] = useState<{
      name: string;
      id: number;
    } | null>(null);
    const [targetPrimaryAttributeLoading, setTargetPrimaryAttributeLoading] =
      useState(false);

    const { id: OSId } = useParams<{ id: string }>();
    const ontologyModelID = OSId ? Number(OSId) : undefined;

    // 监听表单字段变化
    const sourceObjectType = Form.useWatch('sourceObjectType', form);
    const targetObjectType = Form.useWatch('targetObjectType', form);

    // 获取属性选项（从attributeFields中获取表字段作为选项）
    const getAttributeOptions = () => {
      // 使用 attributeFields 中的 tableField 作为选项
      return attributeFields.map((field) => ({
        label: field.tableField,
        value: field.tableField
      }));
    };

    // 获取源对象类型的主键属性（用于1:1和1:N类型）
    useEffect(() => {
      if (!sourceObjectType || !ontologyModelID) {
        setSourcePrimaryAttribute(null);
        return;
      }

      // N:N 类型不需要获取源对象类型的属性列表（使用 attributeFields）
      // if (linkType === LinkType.MANY_TO_MANY) {
      //   setSourcePrimaryAttribute(null);
      //   return;
      // }

      const fetchSourcePrimaryAttribute = async () => {
        try {
          const response = await listOntologyPhysicalProperties({
            objectTypeIdList: [sourceObjectType],
            ontologyModelID,
            isPrimary: 1,
            pageNo: 1,
            pageSize: 1 // 只需要第一个主键属性
          });
          if (
            response.status === 200 &&
            response.data?.result &&
            response.data.result.length > 0
          ) {
            const firstPrimary = response.data.result[0];
            const primaryAttribute = {
              name: firstPrimary.name || '',
              id: firstPrimary.id || 0
            };
            setSourcePrimaryAttribute(primaryAttribute);
          } else {
            setSourcePrimaryAttribute(null);
          }
        } catch (error) {
          console.error('获取源对象类型主键属性失败:', error);
          setSourcePrimaryAttribute(null);
        }
      };

      fetchSourcePrimaryAttribute();
    }, [sourceObjectType, ontologyModelID, linkType]);

    // 获取目标对象类型的主键属性（用于1:1和1:N类型）
    useEffect(() => {
      if (!targetObjectType || !ontologyModelID) {
        setTargetPrimaryAttribute(null);
        return;
      }

      const fetchTargetPrimaryAttribute = async () => {
        setTargetPrimaryAttributeLoading(true);
        try {
          const response = await listOntologyPhysicalProperties({
            objectTypeIdList: [targetObjectType],
            ontologyModelID,
            isPrimary: 1,
            pageNo: 1,
            pageSize: 1 // 只需要第一个主键属性
          });
          if (
            response.status === 200 &&
            response.data?.result &&
            response.data.result.length > 0
          ) {
            const firstPrimary = response.data.result[0];
            const primaryAttribute = {
              name: firstPrimary.name || firstPrimary.tableField || '',
              id: firstPrimary.id || 0
            };
            setTargetPrimaryAttribute(primaryAttribute);
            // 只有在没有当前值时才自动设置表单字段值
            const currentValue = form.getFieldValue('targetObjectAttribute');
            if (!currentValue) {
              form.setFieldValue(
                'targetObjectAttribute',
                String(primaryAttribute.id)
              );
            }
          } else {
            setTargetPrimaryAttribute(null);
          }
        } catch (error) {
          console.error('获取目标对象类型主键属性失败:', error);
          setTargetPrimaryAttribute(null);
        } finally {
          setTargetPrimaryAttributeLoading(false);
        }
      };

      fetchTargetPrimaryAttribute();
    }, [targetObjectType, ontologyModelID, linkType, form]);

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
          setFileUploaded(
            !!(
              initialValues.intermediateTable.file ||
              initialValues.intermediateTable.filePath ||
              (initialValues.intermediateTable.database &&
                initialValues.intermediateTable.table)
            )
          );
          // 如果是数据湖同步且有数据库和表，设置级联选择器的值
          if (
            initialValues.intermediateTable.type === 'data_lake_sync' &&
            initialValues.intermediateTable.database &&
            initialValues.intermediateTable.table
          ) {
            setSelectedDatabase(initialValues.intermediateTable.database);
            setSelectedTable(initialValues.intermediateTable.table);
            // 注意：这里需要等数据库列表加载后才能设置 cascaderValue
            // 所以先设置 selectedDatabase 和 selectedTable，在 loadDatabaseList 后再设置 cascaderValue
          }
          // 如果有中间表文件路径，解析文件名并设置初始文件列表
          if (initialValues.intermediateTable.filePath) {
            const fileName =
              initialValues.intermediateTable.filePath.split('/').pop() || '';
            if (fileName && fileName.trim()) {
              setInitialFileList([{ name: fileName }]);
            }
          }
        }
        if (initialValues.attributeFields) {
          // 如果是本地CSV，确保字段类型正确：主键varchar(500)，非主键varchar(2000)
          const processedFields =
            initialValues.intermediateTable?.type === 'local_csv'
              ? initialValues.attributeFields.map((field) => ({
                  ...field,
                  fieldType: field.isPrimary ? 'varchar(500)' : 'varchar(2000)'
                }))
              : initialValues.attributeFields;
          setAttributeFields(processedFields);
        }
      } else {
        form.setFieldsValue({
          linkType: '1:1'
        });
      }
    }, [initialValues, form]);

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
        isUse: checked ? 1 : 0
      }));
      setAttributeFields(newFields);
      form.setFieldValue('attributeFields', newFields);
    };

    const handlePrimaryKeyChange = (index: number) => {
      const newFields: AttributeField[] = attributeFields.map((field, i) => {
        const isPrimary = i === index;
        // 如果是本地CSV上传，根据是否为主键设置字段类型
        let fieldType = field.fieldType;
        if (intermediateTable.type === 'local_csv') {
          fieldType = isPrimary ? 'varchar(500)' : 'varchar(2000)';
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

    // 属性字段映射表格列定义
    const attributeColumns: TableColumnProps<AttributeField>[] = [
      {
        title: (
          <div className="flex items-center gap-[12px]">
            <Checkbox
              className="pointer-events-auto mr-[12px]"
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={(checked) => handleSelectAll(!!checked)}
            />
          </div>
        ),
        dataIndex: 'isUse',
        width: 60,
        render: (value, record, index) => (
          <Checkbox
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
        width: 375,
        render: (value) => <span>{value}</span>
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
            checked={record.isPrimary === true}
            onChange={() => handlePrimaryKeyChange(index)}
          />
        )
      },
      {
        title: '属性名称',
        dataIndex: 'attributeName',
        width: 435,
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
        width: 200,
        render: (value, record) => {
          // 如果是本地CSV上传，根据是否为主键显示字段类型
          if (intermediateTable.type === 'local_csv') {
            return (
              <span>{record.isPrimary ? 'varchar(500)' : 'varchar(2000)'}</span>
            );
          }
          return <span>{value}</span>;
        }
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
      setIsReUpload(false);
    };

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

    const handleCascaderChange = async (value: string[] | undefined) => {
      // 处理 undefined 或空值的情况
      const newValue = value && Array.isArray(value) ? value : [];
      setCascaderValue(newValue);

      // 同步更新 intermediateTable 状态和表单字段值
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

        // 更新 intermediateTable 状态
        setIntermediateTable((prev) => ({
          ...prev,
          database: databaseName,
          table: tableName
        }));
        setSelectedDatabase(databaseName);
        setSelectedTable(tableName);

        // 更新表单字段值，用于validator验证
        form.setFieldValue('databaseTable', `${databaseName}/${tableName}`);
      } else {
        // 清空选择时，也清空 intermediateTable
        setIntermediateTable((prev) => ({
          ...prev,
          database: undefined,
          table: undefined
        }));
        setSelectedDatabase(undefined);
        setSelectedTable(undefined);

        // 清空表单字段值
        form.setFieldValue('databaseTable', undefined);
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
              const fields: AttributeField[] = fieldList.map(
                (field, index) => ({
                  tableField: field.fieldName, // 表字段名
                  isUse: 1, // 默认全部选中
                  attributeName: field.fieldName, // 属性名称，默认与表字段名相同
                  fieldType: field.dataType || 'STRING', // 字段类型
                  isPrimary: index === 0 // 第一个字段默认为主键
                })
              );

              setAttributeFields(fields);
              form.setFieldValue('attributeFields', fields);
              setFileUploaded(true);
              // 清空关联中间表的选择（因为字段列表已改变）
              form.setFieldValue('sourceAttribute', undefined);
              form.setFieldValue('targetAttribute', undefined);
            } else {
              Message.error(response.message || '加载字段列表失败');
              setAttributeFields([]);
              form.setFieldValue('attributeFields', []);
              setFileUploaded(false);
              // 清空关联中间表的选择
              form.setFieldValue('sourceAttribute', undefined);
              form.setFieldValue('targetAttribute', undefined);
            }
          } catch (error) {
            console.error('加载字段列表失败:', error);
            Message.error('加载字段列表失败');
            setAttributeFields([]);
            form.setFieldValue('attributeFields', []);
            setFileUploaded(false);
            // 清空关联中间表的选择
            form.setFieldValue('sourceAttribute', undefined);
            form.setFieldValue('targetAttribute', undefined);
          } finally {
            setFieldsLoading(false);
          }
        } else {
          // 如果 tableId 无效，清空字段列表
          setAttributeFields([]);
          form.setFieldValue('attributeFields', []);
          setFileUploaded(false);
          // 清空关联中间表的选择
          form.setFieldValue('sourceAttribute', undefined);
          form.setFieldValue('targetAttribute', undefined);
        }
      } else {
        // 如果没有选择表，清空字段列表
        setAttributeFields([]);
        form.setFieldValue('attributeFields', []);
        setFileUploaded(false);
        // 清空关联中间表的选择
        form.setFieldValue('sourceAttribute', undefined);
        form.setFieldValue('targetAttribute', undefined);
      }
    };

    const handleIntermediateTableTypeChange = (
      type: 'local_csv' | 'data_lake_sync'
    ) => {
      // 切换到本地CSV导入时，清空数据库和表
      if (type === 'local_csv') {
        setSelectedDatabase(undefined);
        setSelectedTable(undefined);
        setCascaderValue([]);
        form.setFieldsValue({
          databaseTable: undefined
        });
      }
      // 切换数据源类型时，清空上传的本地文件和数据库/表
      const newIntermediateTable = {
        type,
        database: undefined,
        table: undefined,
        file: undefined, // 切换类型时清空文件
        filePath: undefined // 切换类型时清空文件路径
      };
      setIntermediateTable(newIntermediateTable);
      // 切换数据源类型时清空属性字段映射
      setAttributeFields([]);
      form.setFieldValue('attributeFields', []);
      setFileUploaded(false);
      setIsReUpload(false);
      // 清空关联中间表的选择
      form.setFieldValue('sourceAttribute', undefined);
      form.setFieldValue('targetAttribute', undefined);

      // 如果切换到数据湖同步，加载数据库列表
      if (type === 'data_lake_sync') {
        setInitialFileList([]);
        loadDatabaseList();
      }
    };

    // 当数据源类型为 data_lake_sync 时，加载数据库列表
    useEffect(() => {
      if (
        intermediateTable.type === 'data_lake_sync' &&
        cascaderOptions.length === 0
      ) {
        loadDatabaseList();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intermediateTable.type]);

    const handleIntermediateTableFileChange = (fileData: any) => {
      // FieldImportUpload 已经上传并解析了文件，fileData 是服务器返回的数据结构
      // 包含 { columnList: string[], path: string }
      if (!fileData || (Array.isArray(fileData) && fileData.length === 0)) {
        // 文件被移除
        setIntermediateTable({
          ...intermediateTable,
          file: undefined,
          filePath: undefined
        });
        setAttributeFields([]);
        form.setFieldValue('attributeFields', []);
        setFileUploaded(false);
        setIsReUpload(false);
        // 清空关联中间表的选择
        form.setFieldValue('sourceAttribute', undefined);
        form.setFieldValue('targetAttribute', undefined);
        return;
      }

      // 处理返回的数据结构
      const responseData =
        Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;

      // 检查是否是服务器返回的数据结构（包含 columnList 和 path）
      if (responseData && responseData.columnList && responseData.path) {
        const { columnList, path } = responseData;

        // 保存文件路径
        const newIntermediateTable = {
          ...intermediateTable,
          type: 'local_csv' as const,
          file: undefined, // 不需要保存文件对象，只需要路径
          filePath: path
        };
        setIntermediateTable(newIntermediateTable);

        // 将 columnList 转换为 AttributeField 格式
        const fields: AttributeField[] = columnList.map((column, index) => ({
          tableField: column, // 表字段名
          isUse: 1, // 默认全部选中
          attributeName: column, // 属性名称，默认与表字段名相同
          fieldType: index === 0 ? 'varchar(500)' : 'varchar(2000)', // 本地CSV：主键varchar(500)，非主键varchar(2000)
          isPrimary: index === 0 // 第一个字段默认为主键
        }));

        setAttributeFields(fields);
        form.setFieldValue('attributeFields', fields);
        setFileUploaded(true);
        // 清空关联中间表的选择（因为字段列表已改变）
        form.setFieldValue('sourceAttribute', undefined);
        form.setFieldValue('targetAttribute', undefined);
      }
    };

    const handleSubmit = async () => {
      try {
        // 先验证表单
        await form.validate();

        // 获取所有字段值
        const values = form.getFieldsValue();

        // 使用多种方式获取 sourceObjectType 和 targetObjectType
        // 1. 优先使用 Form.useWatch 的值（实时监听）
        // 2. 其次使用 form.getFieldValue() 单独获取
        // 3. 最后从 form.getFieldsValue() 中获取
        const currentSourceObjectType =
          sourceObjectType ||
          form.getFieldValue('sourceObjectType') ||
          values.sourceObjectType;
        const currentTargetObjectType =
          targetObjectType ||
          form.getFieldValue('targetObjectType') ||
          values.targetObjectType;

        // 验证链接对
        if (!currentSourceObjectType || !currentTargetObjectType) {
          Message.warning('请选择源对象类型和目标对象类型');
          return;
        }

        if (linkType === 'N:N') {
          // 中间表校验（N:N）
          if (intermediateTable.type === 'local_csv') {
            // 本地 CSV：既要有文件（或已存在的文件路径），也要有字段映射
            if (
              !intermediateTable.filePath &&
              !fileUploaded &&
              attributeFields.length === 0
            ) {
              Message.warning('请上传中间表文件');
              return;
            }
          } else if (intermediateTable.type === 'data_lake_sync') {
            // 数据湖同步：必须选择数据库和表
            if (!intermediateTable.database || !intermediateTable.table) {
              Message.warning('请选择数据库和表');
              return;
            }
          }

          // 关联属性校验
          if (!values.sourceAttribute || !values.targetAttribute) {
            Message.warning('请选择关联中间表的属性');
            return;
          }

          // 字段映射校验：无论来源类型，都需要有字段映射
          if (attributeFields.length === 0) {
            Message.warning('请先上传中间表');
            return;
          }
        } else {
          // if (!values.targetObjectAttribute) {
          //   Message.warning('请选择目标对象类型属性');
          //   return;
          // }
        }

        // 处理字段类型：如果是本地CSV，确保主键为varchar(500)，非主键为varchar(2000)
        const processedAttributeFields =
          linkType === 'N:N' && intermediateTable.type === 'local_csv'
            ? attributeFields.map((field) => ({
                ...field,
                fieldType: field.isPrimary ? 'varchar(500)' : 'varchar(2000)'
              }))
            : linkType === 'N:N'
              ? attributeFields
              : [];

        const formData: LinkFormData = {
          name: values.name || '',
          id: values.id || '',
          sourceObjectType: currentSourceObjectType,
          targetObjectType: currentTargetObjectType,
          linkType,
          targetObjectAttribute: values.targetObjectAttribute,
          sourceAttribute: values.sourceAttribute,
          targetAttribute: values.targetAttribute,
          intermediateTable: linkType === 'N:N' ? intermediateTable : undefined,
          attributeFields: processedAttributeFields,
          isReUpload:
            linkType === 'N:N' && intermediateTable.type === 'local_csv'
              ? isReUpload
              : false
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
            className={styles['link-form']}
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
                      <div className="h-[40px] w-[40px]">
                        {type === LinkType.ONE_TO_ONE && <Link1To1Icon />}
                        {type === LinkType.ONE_TO_MANY && <Link1ToNIcon />}
                        {type === LinkType.MANY_TO_MANY && <LinkNNIcon />}
                      </div>
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
              label="链接id："
              field="id"
              rules={[
                { required: true, message: '请输入唯一标识' },
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
                className="max-w-[640px]"
                showWordLimit
                placeholder="请输入唯一标识"
                disabled={!!initialValues?.id}
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
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <div className="flex items-start">
                <div className="flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                  <ObjectTypeSelect
                    ontologyModelID={ontologyModelID}
                    label="源对象类型："
                    value={sourceObjectType}
                    onChange={(val) => {
                      form.setFieldValue('sourceObjectType', val);
                      if (!val) {
                        setSourcePrimaryAttribute(null);
                      }
                    }}
                    placeholder="请选择对象类型"
                    allowClear
                  />
                  {sourcePrimaryAttribute && (
                    <div className="mt-[4px] flex items-center text-[14px] leading-[20px] text-[var(--color-text-1)]">
                      {sourcePrimaryAttribute.name}
                      <Tag
                        color="#FBF2FF"
                        className="ml-[4px] text-[#9254DE]"
                        size="small"
                      >
                        主键
                      </Tag>
                    </div>
                  )}
                </div>

                {linkType === 'N:N' ? (
                  <>
                    <div className="flex flex-col">
                      <TwoWayArrowIcon />
                    </div>
                    <div className="flex-1 flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <ObjectTypeSelect
                        ontologyModelID={ontologyModelID}
                        label="目标对象类型："
                        value={targetObjectType}
                        onChange={(val) => {
                          form.setFieldValue('targetObjectType', val);
                        }}
                        placeholder="请选择对象类型"
                        allowClear
                      />
                      {targetPrimaryAttribute && (
                        <div className="mt-[4px] flex items-center text-[14px] leading-[20px] text-[var(--color-text-1)]">
                          {targetPrimaryAttribute.name}
                          <Tag
                            color="#FBF2FF"
                            className="ml-[4px] text-[#9254DE]"
                            size="small"
                          >
                            主键
                          </Tag>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <OneWayArrowIcon />
                    </div>
                    <div className="flex-1 flex-1 rounded-[4px] bg-[#FAFBFF] p-[12px]">
                      <div className="mb-[8px] flex items-center gap-[4px] text-[14px] text-[var(--color-text-2)]">
                        <span>
                          目标对象类型和属性
                          <Tooltip content="选择目标对象类型后，会自动关联目标对象类型的主键属性">
                            <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                          </Tooltip>
                          ：
                        </span>
                      </div>
                      <Input.Group
                        compact
                        className={`${styles['table-select-group']} w-full`}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <ObjectTypeSelect
                            ontologyModelID={ontologyModelID}
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
                        <Input
                          className={styles['table-select-wrapper']}
                          placeholder={
                            targetObjectType
                              ? targetPrimaryAttributeLoading
                                ? '加载中...'
                                : '暂无主键属性'
                              : '请先选择对象类型'
                          }
                          value={targetPrimaryAttribute?.name || ''}
                          disabled
                          style={{ width: '50%' }}
                        />
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
                          !intermediateTable.filePath
                        ) {
                          callback('请上传中间表文件');
                        } else if (
                          intermediateTable.type === 'data_lake_sync' &&
                          (!intermediateTable.database ||
                            !intermediateTable.table)
                        ) {
                          callback('请选择数据库和表');
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
                          from="link_type"
                          accept=".csv"
                          fileType="csv"
                          maxSize={500}
                          customAction={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
                          fileList={initialFileList}
                          onFileChange={(file) => {
                            // 文件被移除时，FieldImportUpload 传递空数组 []
                            if (
                              file === undefined ||
                              (Array.isArray(file) && file.length === 0)
                            ) {
                              // 文件被移除
                              setIntermediateTable((prev) => ({
                                ...prev,
                                file: undefined,
                                filePath: undefined
                              }));
                              form.setFieldValue('intermediateTable', {
                                ...intermediateTable,
                                file: undefined
                              });
                              setAttributeFields([]);
                              form.setFieldValue('attributeFields', []);
                              setFileUploaded(false);
                              setInitialFileList([]);
                              // 清空关联中间表的选择
                              form.setFieldValue('sourceAttribute', undefined);
                              form.setFieldValue('targetAttribute', undefined);
                            } else {
                              // 重新上传CSV文件时，设置isReUpload为true
                              setIsReUpload(!!initialValues?.id);
                              handleIntermediateTableFileChange(file);
                            }
                          }}
                          onUploadingChange={(isUploading) => {
                            // Handle uploading state if needed
                          }}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>

                {intermediateTable.type === 'data_lake_sync' && (
                  <FormItem
                    label="数据库/表："
                    field="databaseTable"
                    rules={[
                      {
                        required: true,
                        validator: (value, callback) => {
                          if (
                            intermediateTable.type === 'data_lake_sync' &&
                            (!cascaderValue || cascaderValue.length === 0)
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
                        dropdownMenuClassName={
                          styles['link-type-cascader-dropdown']
                        }
                        value={
                          cascaderValue.length > 0 ? cascaderValue : undefined
                        }
                        options={cascaderOptions}
                        onChange={(value) => {
                          handleCascaderChange(value as string[] | undefined);
                        }}
                        loadMore={handleCascaderLoadMore}
                        allowClear
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
                                        `/tenant/compute/modaforge/metadataManagement/detail?id=${option.value}&metadataType=ICEBERG`
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
                      />
                    </div>
                  </FormItem>
                )}

                <FormItem
                  label="关联中间表："
                  field="relationAttributes"
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        const sourceAttributeValue =
                          form.getFieldValue('sourceAttribute');
                        const targetAttribute =
                          form.getFieldValue('targetAttribute');
                        if (!sourceAttributeValue || !targetAttribute) {
                          callback('请选择源对象类型属性和目标对象类型属性');
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
                      <FormItem
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
                        noStyle
                      >
                        <Select
                          placeholder="请先上传中间表"
                          disabled={!fileUploaded}
                          allowClear
                        >
                          {getAttributeOptions().map((option) => (
                            <Select.Option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </FormItem>
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
                      <FormItem
                        field="targetAttribute"
                        rules={[
                          {
                            required: true,
                            validator: (value, callback) => {
                              if (!fileUploaded) {
                                callback('请先上传中间表');
                              } else if (!value) {
                                callback('请选择目标对象类型属性');
                              } else {
                                callback();
                              }
                            }
                          }
                        ]}
                        noStyle
                      >
                        <Select
                          placeholder="请先上传中间表"
                          disabled={!fileUploaded}
                          allowClear
                        >
                          {getAttributeOptions().map((option) => (
                            <Select.Option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                </FormItem>

                {/* 属性字段映射 */}
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
                      <span className="mt-4 text-[14px] text-[#86909C]">
                        加载中
                      </span>
                    </div>
                  ) : attributeFields.length === 0 ? (
                    <div className="text-start text-[14px] text-[#86909C]">
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
      </div>
    );
  }
);

LinkForm.displayName = 'LinkForm';

export default LinkForm;
