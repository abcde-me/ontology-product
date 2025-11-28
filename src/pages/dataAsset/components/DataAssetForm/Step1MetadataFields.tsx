import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Input,
  Message,
  Form,
  Table,
  Select,
  DatePicker
} from '@arco-design/web-react';
import { MetadataField } from './DataAssetFormContainer';
import ImportFieldsModal from './ImportFieldsModal';
import styles from './Step1MetadataFields.module.scss';
import { IconDownload } from '@arco-design/web-react/icon';
import {
  DataAssetField,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';
import { listDataAssetFieldTypes } from '@/api/dataAsset';
import { ImportType } from '../../types';
import noDataElement from '@/components/no-data';
import {
  RESERVED_FIELD_ENS,
  SYSTEM_FIELDS,
  isDateType,
  isDateTimeType,
  DATA_SOURCE_FIELD_EN_NAME
} from '../../utils/const';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import dayjs from 'dayjs';

const FormItem = Form.Item;

const getDataSourceKey = (item: ListDataAssetSourceResItem) =>
  `${item.type ?? ''}::${item.databaseName ?? ''}::${item.tableName ?? ''}`;

interface Step1MetadataFieldsProps {
  isEditMode: boolean;
  metadataFields: MetadataField[];
  setMetadataFields: React.Dispatch<React.SetStateAction<MetadataField[]>>;
  dataSources: Record<string, ListDataAssetSourceResItem>;
  setDataSources: React.Dispatch<
    React.SetStateAction<Record<string, ListDataAssetSourceResItem>>
  >;
  findDataAssetMappingData: ListDataAssetSourceResItem[];
  onCancel: () => void;
  onNext: () => void;
}

export default function Step1MetadataFields({
  metadataFields,
  isEditMode,
  setMetadataFields,
  dataSources,
  setDataSources,
  findDataAssetMappingData,
  onCancel,
  onNext
}: Step1MetadataFieldsProps) {
  const Row = Grid.Row;
  const Col = Grid.Col;
  const [showImportModal, setShowImportModal] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<string[]>([]);
  const [fieldTypesLoading, setFieldTypesLoading] = useState(false);
  const [form] = Form.useForm();

  // 判断是否为新添加的字段（通过id前缀判断）
  const isNewlyAddedField = useCallback((field: MetadataField): boolean => {
    return (
      field.id?.startsWith('field_') || field.id?.startsWith('field_import_')
    );
  }, []);

  // 判断字段是否可编辑
  const isFieldEditable = useCallback(
    (field: MetadataField): boolean => {
      // 系统字段和保留字段不可编辑
      if (field.system === true || RESERVED_FIELD_ENS.has(field.nameEn)) {
        return false;
      }
      // 编辑态下，只有新添加的字段可以编辑
      if (isEditMode) {
        return isNewlyAddedField(field);
      }
      // 非编辑态下，所有非系统/保留字段都可以编辑
      return true;
    },
    [isEditMode, isNewlyAddedField]
  );

  // 进入页面时查询支持的字段类型
  useEffect(() => {
    let isMounted = true;
    const fetchFieldTypes = async () => {
      try {
        setFieldTypesLoading(true);
        const res = await listDataAssetFieldTypes();

        if (res?.status !== 200 || !Array.isArray(res?.data)) {
          Message.error(res?.message ?? '获取字段类型失败');
          return;
        }

        setFieldTypes(res.data);
      } catch (e) {
        Message.error('获取字段类型失败');
      } finally {
        if (isMounted) setFieldTypesLoading(false);
      }
    };

    fetchFieldTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Table列定义（字段名对齐 DataAssetField）
  const columns = [
    {
      title: '序号',
      dataIndex: 'sequence',
      fixed: 'left' as const,
      width: 60,
      align: 'center' as const
    },
    {
      title: '字段中文名称',
      dataIndex: 'nameZh',
      width: 200,
      render: (_: any, record: any) => (
        <Input
          placeholder="请输入中文名称"
          allowClear
          value={record.nameZh}
          disabled={!isFieldEditable(record)}
          onChange={(value) => handleUpdateField(record.id, { nameZh: value })}
        />
      )
    },
    {
      title: '字段英文名称',
      dataIndex: 'nameEn',
      width: 200,
      render: (_: any, record: any) => (
        <Input
          placeholder="请输入英文名称"
          value={record.nameEn}
          allowClear
          disabled={!isFieldEditable(record)}
          onChange={(value) => handleUpdateField(record.id, { nameEn: value })}
        />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      width: 160,
      render: (_: any, record: any) => (
        <Select
          placeholder="请选择"
          loading={fieldTypesLoading}
          value={record.type}
          disabled={!isFieldEditable(record)}
          onChange={(value) => handleUpdateField(record.id, { type: value })}
        >
          {fieldTypes.map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: '空值默认填充',
      dataIndex: 'default',
      width: 272,
      render: (_: any, record: any) => {
        const isDisabled = !isFieldEditable(record);
        const fieldType = record.type;

        // 如果是日期时间类型
        if (isDateTimeType(fieldType)) {
          return (
            <DatePicker
              value={record.default ? dayjs(record.default) : undefined}
              allowClear
              disabled={isDisabled}
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择时间"
              style={{ width: '100%' }}
              onChange={(value: any) => {
                const dateStr = value
                  ? typeof value.format === 'function'
                    ? value.format('YYYY-MM-DD HH:mm:ss')
                    : String(value)
                  : '';
                handleUpdateField(record.id, { default: dateStr });
              }}
            />
          );
        }

        // 如果是日期类型
        if (isDateType(fieldType)) {
          return (
            <DatePicker
              value={record.default ? dayjs(record.default) : undefined}
              allowClear
              disabled={isDisabled}
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              style={{ width: '100%' }}
              onChange={(value: any) => {
                const dateStr = value
                  ? typeof value.format === 'function'
                    ? value.format('YYYY-MM-DD')
                    : String(value)
                  : '';
                handleUpdateField(record.id, { default: dateStr });
              }}
            />
          );
        }

        // 其他类型使用普通输入框
        return (
          <Input
            value={record.default}
            allowClear
            disabled={isDisabled}
            onChange={(value) =>
              handleUpdateField(record.id, { default: value })
            }
          />
        );
      }
    },
    // {
    //   title: '必填',
    //   dataIndex: 'required',
    //   width: 80,
    //   align: 'center' as const,
    //   render: (_: any, record: any) => (
    //     <Checkbox
    //       checked={record.required}
    //       disabled={
    //         record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
    //       }
    //       onChange={(checked) =>
    //         handleUpdateField(record.id, { required: checked })
    //       }
    //     />
    //   )
    // },
    {
      title: '可修改',
      dataIndex: 'allowModify',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.allowModify}
          disabled={record.nameEn === DATA_SOURCE_FIELD_EN_NAME}
          onChange={(checked) =>
            handleUpdateField(record.id, { allowModify: checked })
          }
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      fixed: 'right' as const,
      align: 'left' as const,
      render: (_: any, record: MetadataField) => (
        <div className="flex items-center">
          <Button type="text" onClick={() => handleAddField()}>
            添加行
          </Button>
          {metadataFields.length > 1 &&
            !(
              record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
            ) && (
              <Button type="text" onClick={() => handleDeleteField(record.id)}>
                删除行
              </Button>
            )}
        </div>
      )
    }
  ];

  // 添加字段行
  const handleAddField = () => {
    const newField: MetadataField = {
      id: `field_${Date.now()}`,
      nameZh: '',
      nameEn: '',
      type: undefined,
      default: '',
      required: true,
      allowModify: true
    };
    const updatedFields = [...metadataFields, newField];
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
  };

  // 删除字段行
  const handleDeleteField = (id: string) => {
    const target = metadataFields.find((f) => f.id === id);
    if (
      target &&
      (target.system === true || RESERVED_FIELD_ENS.has(target.nameEn))
    ) {
      return;
    }
    const updatedFields = metadataFields.filter((field) => field.id !== id);
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
  };

  // 更新字段
  const handleUpdateField = (id: string, updates: Partial<MetadataField>) => {
    const updatedFields = metadataFields.map((field) => {
      if (field.id === id) {
        return { ...field, ...updates };
      }
      return field;
    });
    setMetadataFields(updatedFields);
    form.setFieldValue('metadataFields', updatedFields);
  };

  // 导入字段
  const handleImportFields = () => {
    setShowImportModal(true);
  };

  // 处理导入确认
  const handleImportConfirm = (
    importType: ImportType,
    dataAssetFields: DataAssetField[]
  ) => {
    // 将外部数据转换为内部使用结构
    // 过滤掉系统保留字段（通过模板导入不追加这些字段）
    const filtered = (dataAssetFields || []).filter(
      (f) => !RESERVED_FIELD_ENS.has((f.nameEn || '').trim())
    );
    const mapped: MetadataField[] = filtered.map((f, idx) => ({
      id: `field_import_${Date.now()}_${idx}`,
      nameZh: f.nameZh ?? '',
      nameEn: f.nameEn ?? '',
      type: f.type ?? '',
      default: f.default ?? '',
      required: !!f.required,
      allowModify: !!f.allowModify
    }));

    if (importType === ImportType.overwrite) {
      const withSystem = [...SYSTEM_FIELDS, ...mapped];
      setMetadataFields(withSystem);
      form.setFieldValue('metadataFields', withSystem);
    } else {
      const combined = [...metadataFields, ...mapped];
      setMetadataFields(combined);
      form.setFieldValue('metadataFields', combined);
    }

    Message.success('字段导入成功');
  };

  // 数据源变更
  const handleDataSourceChange = (key: string, checked: boolean) => {
    const updatedDataSources: Record<string, ListDataAssetSourceResItem> = {
      ...dataSources
    };
    if (checked) {
      const item =
        dataSources[key] ||
        findDataAssetMappingData.find((i) => getDataSourceKey(i) === key);
      if (item) {
        updatedDataSources[key] = item;
      }
    } else {
      delete updatedDataSources[key];
    }
    setDataSources(updatedDataSources);
    form.setFieldValue('dataSources', updatedDataSources);
  };

  // 全选/取消全选数据源
  const handleSelectAllDataSources = (checked: boolean) => {
    const updatedDataSources: Record<string, ListDataAssetSourceResItem> = {};
    if (checked) {
      findDataAssetMappingData.forEach((item) => {
        const key = getDataSourceKey(item);
        if (key) {
          updatedDataSources[key] = dataSources[key] ?? item;
        }
      });
    }
    setDataSources(updatedDataSources);
    form.setFieldValue('dataSources', updatedDataSources);
  };

  // 验证nameEn字段是否符合规则
  const validateNameEn = (nameEn: string): string | null => {
    if (!nameEn) {
      return null; // 空值由其他验证处理
    }

    // 规则1: 由字母、数字和下划线(_)组成（同时满足规则3: 不能有空格）
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(nameEn)) {
      return '字段英文名称只能由字母、数字和下划线(_)组成，且不能有空格';
    }

    // 规则2: 必须以字母开头
    if (!/^[a-zA-Z]/.test(nameEn)) {
      return '字段英文名称必须以字母开头';
    }

    return null;
  };

  // 验证字段列表的自定义验证器
  const validateMetadataFields = useCallback(
    (value: any, callback: any) => {
      if (metadataFields.length === 0) {
        callback('请至少添加一个字段');
      } else {
        // 验证所有字段是否填写完整
        const incompleteFields = metadataFields.some(
          (field) => !field.nameZh || !field.nameEn || !field.type
        );
        if (incompleteFields) {
          callback('请填写完整的字段信息');
          return;
        }

        // 验证nameEn字段格式
        for (const field of metadataFields) {
          const nameEnError = validateNameEn(field.nameEn);
          if (nameEnError) {
            callback(nameEnError);
            return;
          }
        }

        // 验证nameEn是否重复
        const nameEnMap = new Map<string, number>();
        for (const field of metadataFields) {
          if (field.nameEn) {
            const count = nameEnMap.get(field.nameEn) || 0;
            nameEnMap.set(field.nameEn, count + 1);
          }
        }
        const duplicateNames: string[] = [];
        nameEnMap.forEach((count, nameEn) => {
          if (count > 1) {
            duplicateNames.push(nameEn);
          }
        });
        if (duplicateNames.length > 0) {
          callback(`字段英文名称不能重复：${duplicateNames.join('、')}`);
          return;
        }

        callback();
      }
    },
    [metadataFields]
  );

  // 验证数据来源的自定义验证器
  const validateDataSource = useCallback(
    (value: any, callback: any) => {
      const hasAnySource = Object.keys(dataSources).length > 0;
      if (!hasAnySource) {
        callback('请至少选择一个数据来源');
      } else {
        callback();
      }
    },
    [dataSources]
  );

  // 下一步前验证
  const handleNextStep = async () => {
    // 同步metadataFields和dataSources到form
    form.setFieldValue('metadataFields', metadataFields);
    form.setFieldValue('dataSources', dataSources);

    try {
      await form.validate();
      onNext();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <>
      {/* 导入字段模态框 */}
      <ImportFieldsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onConfirm={handleImportConfirm}
      />

      <Form
        form={form}
        initialValues={{
          metadataFields,
          dataSources
        }}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="left"
        style={{ width: '100%' }}
        className={styles.formContainer}
      >
        {/* 数据资产字段列表 */}
        <div className={styles.importFieldsButton}>
          <Button
            type="text"
            icon={<IconDownload />}
            onClick={handleImportFields}
          >
            导入字段
          </Button>
        </div>
        <FormItem
          label="数据资产字段列表："
          required
          field="metadataFields"
          className="mb-[24px]"
          rules={[{ validator: validateMetadataFields }]}
        >
          <div className="mt-[16px] w-full">
            <Table
              scroll={{ x: 'max-content' }}
              noDataElement={noDataElement({ description: '暂无数据' })}
              columns={columns}
              className="w-full"
              data={metadataFields.map((f, idx) => ({
                ...f,
                sequence: idx + 1
              }))}
              rowKey="id"
              pagination={false}
              border={false}
            />
          </div>
        </FormItem>

        {/* 数据来源 */}
        <FormItem
          label="数据来源："
          required
          field="dataSources"
          className="mb-[24px]"
          rules={[{ validator: validateDataSource }]}
        >
          <Row gutter={24}>
            {findDataAssetMappingData?.length > 0 &&
              (() => {
                // 从 findDataAssetMappingData 中提取所有唯一的 nameEn 字段作为数据源键
                const keyArray = findDataAssetMappingData
                  .map((field) => getDataSourceKey(field))
                  .filter((key): key is string => !!key);
                const allChecked =
                  keyArray.length > 0 &&
                  keyArray.every((key) => !!dataSources[key]);
                const someChecked = keyArray.some((key) => !!dataSources[key]);

                return (
                  <Col key="all" span={4} className={styles.dataSourceCol}>
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked && !allChecked}
                      onChange={(checked) =>
                        handleSelectAllDataSources(checked)
                      }
                    >
                      全选
                    </Checkbox>
                  </Col>
                );
              })()}
            {findDataAssetMappingData.map((field) => {
              const key = getDataSourceKey(field);
              if (!key) {
                return null;
              }
              return (
                <Col key={key} span={4} className={styles.dataSourceCol}>
                  <Checkbox
                    className="w-full"
                    checked={!!dataSources[key]}
                    onChange={(checked) => handleDataSourceChange(key, checked)}
                  >
                    <div className="inline-block" style={{ width: 164 }}>
                      <EllipsisPopoverCom
                        value={field.name || '--'}
                        wrapperClassName="inline-block w-full"
                        className="text-[14px]"
                      />
                    </div>
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </FormItem>
      </Form>

      {/* 操作按钮 */}
      <div className={styles.actionBar}>
        <Button type="primary" onClick={handleNextStep}>
          下一步
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </>
  );
}
