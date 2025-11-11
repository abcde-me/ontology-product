import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Input,
  Message,
  Form,
  Upload,
  Table,
  Select,
  Space
} from '@arco-design/web-react';
// import { Add, Upload } from '@arco-design/web-react/icon';
import { MetadataField } from './DataAssetFormContainer';
import ImportFieldsModal from './ImportFieldsModal';
import styles from './Step1MetadataFields.module.scss';
import { IconDownload, IconUpload } from '@arco-design/web-react/icon';
import {
  DataAssetField,
  FindDataAssetMappingItemRes,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';
import { listDataAssetFieldTypes } from '@/api/dataAsset';
import { ImportType } from '../../types';

const FormItem = Form.Item;

// 系统保留字段（不允许编辑、删除、导入）
const RESERVED_FIELD_ENS = new Set([
  'data_asset_name',
  'tags',
  'data_update_time',
  'data_source'
]);

interface Step1MetadataFieldsProps {
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

  // 从 findDataAssetMappingData 直接计算可用的数据来源（使用 nameEn 作为键）
  const availableDataSources = useMemo(() => {
    if (!findDataAssetMappingData || findDataAssetMappingData.length === 0) {
      return {};
    }
    const result: Record<string, ListDataAssetSourceResItem> = {};
    findDataAssetMappingData.forEach((item) => {
      if (item.name) {
        result[item.name] = item;
      }
    });
    return result;
  }, [findDataAssetMappingData]);

  // 数据来源类型的中文显示名称映射（仅用于显示）
  // const dataSourceDisplayNames: Record<string, string> = {
  //   dataset: '数据集',
  //   datavolume: '源数据目录-卷',
  //   database: '源数据目录-数据库',
  //   metadata: '源数据目录-元数据-目录'
  // };

  // 初始化 dataSources，确保所有可用的数据来源都有初始值
  useEffect(() => {
    if (Object.keys(availableDataSources).length > 0) {
      const updatedDataSources: Record<string, ListDataAssetSourceResItem> = {
        ...dataSources
      };
      let hasUpdate = false;

      // 为新的可用数据来源设置初始值（如果还没有的话）
      Object.keys(availableDataSources).forEach((key) => {
        if (updatedDataSources[key] === undefined) {
          updatedDataSources[key] = availableDataSources[key];
          hasUpdate = true;
        }
      });

      // 移除不再可用的数据来源
      Object.keys(updatedDataSources).forEach((key) => {
        if (!(key in availableDataSources)) {
          delete updatedDataSources[key];
          hasUpdate = true;
        }
      });

      if (hasUpdate) {
        setDataSources(updatedDataSources);
        form.setFieldValue('dataSources', updatedDataSources);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDataSources]);

  // Table列定义（字段名对齐 DataAssetField）
  const columns = [
    {
      title: '序号',
      dataIndex: 'sequence',
      width: 80,
      align: 'center' as const
    },
    {
      title: '字段中文名称',
      dataIndex: 'nameZh',
      width: 200,
      render: (_: any, record: any) => (
        <Input
          placeholder="请输入中文名称"
          value={record.nameZh}
          disabled={
            record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
          }
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
          disabled={
            record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
          }
          onChange={(value) => handleUpdateField(record.id, { nameEn: value })}
        />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      width: 150,
      render: (_: any, record: any) => (
        <Select
          placeholder="请选择"
          loading={fieldTypesLoading}
          value={record.type}
          disabled={
            record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
          }
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
      width: 200,
      render: (_: any, record: any) => (
        <Input
          value={record.default}
          disabled={
            record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
          }
          onChange={(value) => handleUpdateField(record.id, { default: value })}
        />
      )
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
          disabled={
            record.system === true || RESERVED_FIELD_ENS.has(record.nameEn)
          }
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
      align: 'center' as const,
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
    console.log('导入字段', showImportModal);
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
      setMetadataFields(mapped);
      form.setFieldValue('metadataFields', mapped);
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
        availableDataSources[key] ||
        findDataAssetMappingData.find((i) => i.name === key);
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
    const updatedDataSources: Record<string, ListDataAssetSourceResItem> = {
      ...dataSources
    };
    if (checked) {
      findDataAssetMappingData.forEach((item) => {
        if (item.name) {
          updatedDataSources[item.name] = item;
        }
      });
    } else {
      // 清空所有
      Object.keys(updatedDataSources).forEach(
        (k) => delete updatedDataSources[k]
      );
    }
    setDataSources(updatedDataSources);
    form.setFieldValue('dataSources', updatedDataSources);
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
        } else {
          callback();
        }
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
              columns={columns}
              className="w-full"
              data={metadataFields.map((f, idx) => ({
                ...f,
                sequence: idx + 1
              }))}
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
            {findDataAssetMappingData.length > 0 &&
              (() => {
                // 从 findDataAssetMappingData 中提取所有唯一的 nameEn 字段作为数据源键
                const nameArray = findDataAssetMappingData
                  .map((field) => field.name)
                  .filter((name): name is string => !!name);
                const allChecked =
                  nameArray.length > 0 &&
                  nameArray.every((name) => !!dataSources[name]);
                const someChecked = nameArray.some(
                  (nameEn) => !!dataSources[nameEn]
                );

                return (
                  <Col span={4}>
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
            {findDataAssetMappingData.map((field) => (
              <Col key={field.name} span={4}>
                <Checkbox
                  checked={!!dataSources[field.name]}
                  onChange={(checked) =>
                    handleDataSourceChange(field.name, checked)
                  }
                >
                  {field.name}
                </Checkbox>
              </Col>
            ))}
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
