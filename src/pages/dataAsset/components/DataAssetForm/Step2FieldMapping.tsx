import React, { useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  Input,
  Message,
  Form,
  Select,
  Modal,
  Switch,
  Grid,
  Table,
  Space
} from '@arco-design/web-react';
// import { Download } from '@icon-park/react';
import { FieldMapping, MetadataField } from './DataAssetFormContainer';
import { IconDownload } from '@arco-design/web-react/icon';
import styles from './Step2FieldMapping.module.scss';
import {
  CreateDataAssetAndMappingReq,
  FindDataAssetMappingItemRes,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';
import { autoMapDataAssetFieldAndSource } from '@/api/dataAsset';
import { RESERVED_FIELD_ENS } from '../../utils/const';

const FormItem = Form.Item;
const Row = Grid.Row;
const Col = Grid.Col;

const composeDataSourceKey = (
  type?: string,
  databaseName?: string,
  tableName?: string
) => `${type ?? ''}::${databaseName ?? ''}::${tableName ?? ''}`;

const getDataSourceKey = (item: ListDataAssetSourceResItem) =>
  composeDataSourceKey(item?.type, item?.databaseName, item?.tableName);

interface Step2FieldMappingProps {
  mappings: FieldMapping[];
  currentStep: number;
  setMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  autoMapping: boolean;
  setAutoMapping: React.Dispatch<React.SetStateAction<boolean>>;
  metadataFields: MetadataField[];
  dataSources: Record<string, ListDataAssetSourceResItem>;
  findDataAssetMappingData: ListDataAssetSourceResItem[];
  onCancel: () => void;
  onPrev: () => void;
  onFinish: (fieldsWithMappings: CreateDataAssetAndMappingReq) => void;
}

export default function Step2FieldMapping({
  currentStep,
  mappings,
  setMappings,
  autoMapping,
  setAutoMapping,
  metadataFields,
  dataSources,
  findDataAssetMappingData,
  onCancel,
  onPrev,
  onFinish
}: Step2FieldMappingProps) {
  const [form] = Form.useForm();

  // 获取数据来源类型到名称的映射（仅用于显示）
  // const sourceTypeToNameMap = useMemo(() => {
  //   const map: Record<string, string> = {
  //     dataset: '数据集',
  //     datavolume: '源数据目录-卷',
  //     database: '源数据目录-数据库',
  //     metadata: '源数据目录-元数据-目录'
  //   };
  //   return map;
  // }, []);

  // 生成列配置（动态处理所有数据来源类型）
  // const columns = useMemo(() => {
  //   const cols = ['序号', '数据资产名称'];

  //   // 遍历所有选中的数据来源类型，动态添加列
  //   Object.keys(dataSources).forEach((sourceType) => {
  //     if (dataSources[sourceType] === true) {
  //       const displayName = sourceTypeToNameMap[sourceType] || sourceType;
  //       cols.push(displayName);
  //     }
  //   });

  //   return cols;
  // }, [dataSources, sourceTypeToNameMap]);

  // 更新映射
  const handleUpdateMapping = useCallback(
    (id: string, updates: Partial<FieldMapping>) => {
      setMappings((prevMappings) =>
        prevMappings.map((mapping) => {
          if (mapping.id === id) {
            return { ...mapping, ...updates };
          }
          return mapping;
        })
      );
    },
    []
  );

  // 根据字段类型和数据来源类型获取可用的映射选项
  const getMappingOptions = useCallback(
    (fieldType: string | undefined, sourceKey: string) => {
      if (!fieldType) {
        return [];
      }

      const sourceInfo =
        dataSources[sourceKey] ||
        findDataAssetMappingData.find(
          (item) => getDataSourceKey(item) === sourceKey
        );

      if (!sourceInfo || !Array.isArray(sourceInfo.fields)) {
        return [];
      }

      return sourceInfo.fields.filter((field) => field.type === fieldType);
    },
    [dataSources, findDataAssetMappingData]
  );

  // Table列定义
  const tableColumns = useMemo(() => {
    const cols: any[] = [
      {
        title: '序号',
        dataIndex: 'sequence',
        width: 40,
        align: 'center' as const
      },
      {
        title: '数据资产名称',
        dataIndex: 'nameZh',
        width: 200,
        render: (_: any, record: FieldMapping) => {
          const meta = metadataFields[record.sequence - 1];
          const isReserved =
            !!meta?.nameEn && RESERVED_FIELD_ENS.has(meta.nameEn);
          return (
            <Input
              placeholder="请输入数据资产名称"
              allowClear
              value={record.nameZh}
              disabled={isReserved}
              onChange={(value) =>
                handleUpdateMapping(record.id, { nameZh: value })
              }
            />
          );
        }
      }
    ];

    // 根据选中的数据来源动态生成列
    // 直接遍历 dataSources 的键（这些键就是接口返回的类型）
    Object.keys(dataSources).forEach((sourceKey) => {
      // 检查该数据来源是否被选中（存在即选中）
      const sourceInfo = dataSources[sourceKey];
      if (sourceInfo) {
        const columnTitle = sourceInfo.name || sourceKey;
        cols.push({
          title: columnTitle,
          dataIndex: sourceKey,
          width: 200,
          render: (_: any, record: FieldMapping, index: number) => {
            // 根据当前行的字段类型获取映射选项
            // 通过 sequence 找到对应的 metadataField
            const metadataField = metadataFields.find(
              (field, idx) => field.nameEn === record.id
            );
            const fieldType = metadataField?.type;
            const options = getMappingOptions(fieldType, sourceKey);

            const disableMappingForThisRow =
              metadataField?.nameEn === 'tags' ||
              metadataField?.nameEn === 'data_source';

            return (
              <Select
                placeholder="请选择"
                value={record[sourceKey] as string | undefined}
                disabled={disableMappingForThisRow}
                onChange={(value) =>
                  handleUpdateMapping(record.id, { [sourceKey]: value })
                }
              >
                {options.map((option) => (
                  <Select.Option key={option.name} value={option.name}>
                    {option.name}
                  </Select.Option>
                ))}
              </Select>
            );
          }
        });
      }
    });

    cols.push({
      title: '操作',
      dataIndex: 'operation',
      width: 132,
      align: 'left' as const,
      fixed: 'right' as const,
      render: (_: any, record: FieldMapping) => {
        const meta = metadataFields[record.sequence - 1];
        const isReserved =
          !!meta?.nameEn && RESERVED_FIELD_ENS.has(meta.nameEn);
        return (
          <Space>
            <Button
              type="text"
              onClick={() => handleAddMapping()}
              className="cursor-pointer text-green-500"
            >
              添加行
            </Button>
            {mappings.length > 1 && !isReserved && (
              <Button
                type="text"
                onClick={() => handleDeleteMapping(record.id)}
                className="cursor-pointer text-red-500"
              >
                删除行
              </Button>
            )}
          </Space>
        );
      }
    });

    return cols;
  }, [
    dataSources,
    mappings,
    metadataFields,
    getMappingOptions,
    handleUpdateMapping
  ]);

  const runAutoMap = async () => {
    try {
      if (!autoMapping || currentStep !== 1) return;
      if (!metadataFields || metadataFields.length === 0) return;
      if (!dataSources || Object.keys(dataSources).length === 0) return;

      // 构建请求参数
      const req = {
        fields: metadataFields.map((f) => ({
          nameZh: f.nameZh,
          nameEn: f.nameEn,
          type: f.type,
          default: f.default,
          required: f.required,
          allowModify: f.allowModify,
          displaySort: f.displaySort
        })),
        source: Object.keys(dataSources).map((key) => {
          const fromAll =
            dataSources[key] ||
            findDataAssetMappingData.find((s) => getDataSourceKey(s) === key);
          return {
            type: fromAll?.type || key,
            name: fromAll?.name || key,
            tableName: fromAll?.tableName || '',
            databaseName: fromAll?.databaseName || '',
            fields:
              fromAll?.fields?.map((ff) => ({
                name: ff.name,
                type: ff.type
              })) || []
          };
        })
      };

      const res = await autoMapDataAssetFieldAndSource(req);
      if (res?.status !== 200 || !Array.isArray(res.data)) {
        return;
      }

      // 预先构建 nameEn -> 行索引 的映射，减少后续查找
      const fieldIndexMap = metadataFields.reduce<Record<string, number>>(
        (acc, field, idx) => {
          if (field?.nameEn) {
            acc[field.nameEn] = idx;
          }
          return acc;
        },
        {}
      );

      // 基于 metadataFields 生成基础行
      const nextMappings: FieldMapping[] = metadataFields.map((field, idx) => {
        const existingRow = mappings[idx];
        const row: FieldMapping = {
          id: field.nameEn || existingRow?.id || `mapping_${Date.now()}_${idx}`,
          sequence: idx + 1,
          nameZh: existingRow?.nameZh ?? field.nameZh
        };

        // 初始化所有选中的数据来源类型字段
        Object.keys(dataSources).forEach((sourceKey) => {
          if (dataSources[sourceKey]) {
            row[sourceKey] = '';
          }
        });
        return row;
      });

      // 将自动映射结果填充到行
      res.data.forEach((item) => {
        if (!item?.fieldNameEn) return;
        const rowIdx = fieldIndexMap[item.fieldNameEn];
        if (rowIdx === undefined) return;
        if (!Array.isArray(item.mapping)) return;

        item.mapping.forEach((m) => {
          const targetKey = composeDataSourceKey(
            m?.type,
            m?.databaseName,
            m?.tableName
          );
          if (targetKey && targetKey in dataSources) {
            (nextMappings[rowIdx] as any)[targetKey] = m?.fieldName || '';
          }
        });
      });

      setMappings(nextMappings);
      Message.success('已根据字段与数据来源自动完成映射');
    } catch (e) {
      // 静默失败，避免打扰
      // 仅在明显错误时提示
      Message.error('自动映射失败，请稍后重试');
    }
  };

  // 初始化映射
  useEffect(() => {
    if (metadataFields.length > 0) {
      const initialMappings: FieldMapping[] = metadataFields.map(
        (field, index) => {
          const sourceKeys = {};
          field?.mapping?.forEach((item) => {
            const key = getDataSourceKey(
              item as unknown as ListDataAssetSourceResItem
            );
            sourceKeys[key] = item.fieldName;
          });
          const mapping: FieldMapping = {
            id: field.nameEn,
            sequence: index + 1,
            nameZh: field.nameZh,
            ...sourceKeys
          };
          return mapping;
        }
      );
      setMappings(initialMappings);
    }
  }, [metadataFields]);

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue({ mappings });
  }, [mappings]);

  // 自动映射：当开关开启，或依赖变化时触发
  useEffect(() => {
    runAutoMap();
  }, [
    autoMapping,
    metadataFields,
    dataSources,
    findDataAssetMappingData,
    currentStep
  ]);

  // 添加映射行
  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping_${Date.now()}`,
      sequence: mappings.length + 1,
      nameZh: ''
    };
    // 动态初始化所有选中的数据来源类型字段
    Object.keys(dataSources).forEach((sourceKey) => {
      if (dataSources[sourceKey]) {
        newMapping[sourceKey] = '';
      }
    });
    setMappings([...mappings, newMapping]);
  };

  // 删除映射行
  const handleDeleteMapping = (id: string) => {
    const target = mappings.find((m) => m.id === id);
    if (target) {
      const meta = metadataFields[target.sequence - 1];
      if (meta?.nameEn && RESERVED_FIELD_ENS.has(meta.nameEn)) {
        return;
      }
    }
    setMappings(mappings.filter((mapping) => mapping.id !== id));
  };

  // 验证映射数据
  const validateMappings = useCallback(
    (value: any, callback: any) => {
      if (mappings.length === 0) {
        callback('请至少添加一个映射');
      } else {
        const incompleteMappings = mappings.some((mapping) => !mapping.nameZh);
        if (incompleteMappings) {
          callback('请填写完整的映射信息');
        } else {
          callback();
        }
      }
    },
    [mappings]
  );

  // 自动映射
  const handleAutoMapping = (v: boolean) => {
    if (!v) {
      Modal.confirm({
        title: '确认关闭自动映射？',
        content: '关闭后将不再自动根据来源字段进行映射，是否继续关闭？',
        okText: '继续关闭',
        cancelText: '取消',
        onOk: () => {
          setAutoMapping(false);
        },
        onCancel: () => {
          // 保持开启状态
          setAutoMapping(true);
        }
      });
      return;
    }
    setAutoMapping(true);
    runAutoMap();
  };

  // const mappingsState = Form.useFormState('mappings', form) || {};

  // 完成
  const handleFinish = async () => {
    try {
      await form.validate();
      const rawMappings: FieldMapping[] = form.getFieldValue('mappings') || [];

      // 将原始映射表单数据格式化为后端需要的结构
      const formatted = rawMappings.map((row) => {
        // 通过 sequence 找到对应的元数据字段（nameEn、type、default、required、allowModify）
        const meta = metadataFields[row.sequence - 1];

        // 构建 mapping 数组：遍历被选中的数据来源键（这些键是 dataSources 的键，对应 ListDataAssetSourceResItem.name）
        const mapping = Object.keys(dataSources).reduce<
          {
            type: string;
            tableName: string;
            fieldName: string;
            fieldType: string;
            databaseName: string;
          }[]
        >((acc, sourceKey) => {
          const selectedFieldName = row[sourceKey] as string | undefined;
          if (!selectedFieldName) {
            return acc;
          }

          // 优先从全量来源列表中查找（包含 tableName、fields 等）
          const sourceInfo =
            dataSources[sourceKey] ||
            findDataAssetMappingData.find(
              (s) => getDataSourceKey(s) === sourceKey
            );
          if (!sourceInfo) {
            return acc;
          }

          const fieldInfo =
            sourceInfo.fields?.find((f) => f.name === selectedFieldName) ||
            undefined;

          acc.push({
            type: sourceInfo.type,
            tableName: sourceInfo.tableName,
            databaseName: sourceInfo.databaseName,
            fieldName: selectedFieldName,
            fieldType: fieldInfo?.type || ''
          });
          return acc;
        }, []);

        return {
          nameZh: row.nameZh || meta?.nameZh || '',
          nameEn: meta?.nameEn || '',
          type: meta?.type || '',
          default: meta?.default?.trim() === '' ? null : meta?.default,
          required: !!meta?.required,
          allowModify: !!meta?.allowModify,
          mapping,
          autoMap: false,
          displaySort: meta?.displaySort || 0
        };
      });

      onFinish(formatted as unknown as CreateDataAssetAndMappingReq);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <>
      {/* 映射列表 */}
      <Form
        form={form}
        // initialValues={metadataFields}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="left"
        style={{ width: '100%' }}
        className={styles.formContainer}
      >
        <div className={styles.operationButtonWrapper}>
          <div className="flex items-center gap-[4px]">
            <span className="text-[14px] text-[rgb(var(--primary-6))]">
              自动映射
            </span>
            <Switch
              checked={autoMapping}
              onChange={(v) => handleAutoMapping(v)}
            />
          </div>
        </div>

        <FormItem
          label="映射列表："
          required
          field="mappings"
          // initialValue={metadataFields}
          className="mb-[24px]"
          rules={[{ validator: validateMappings }]}
        >
          <Table
            columns={tableColumns}
            className="mt-[16px] w-full"
            data={mappings}
            rowKey="id"
            pagination={false}
            border={false}
          />
        </FormItem>
      </Form>

      {/* 操作按钮 */}
      <div className={styles.actionBar}>
        <Button onClick={handleFinish} type="primary">
          确定
        </Button>
        <Button onClick={onPrev}>上一步</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </>
  );
}
