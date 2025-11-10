import React, { useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  Input,
  Message,
  Form,
  Select,
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
  FindDataAssetMappingItemRes,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';

const FormItem = Form.Item;
const Row = Grid.Row;
const Col = Grid.Col;

interface Step2FieldMappingProps {
  mappings: FieldMapping[];
  setMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  autoMapping: boolean;
  setAutoMapping: React.Dispatch<React.SetStateAction<boolean>>;
  metadataFields: MetadataField[];
  dataSources: Record<string, boolean>;
  findDataAssetMappingData: ListDataAssetSourceResItem[];
  onCancel: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

export default function Step2FieldMapping({
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
  const sourceTypeToNameMap = useMemo(() => {
    const map: Record<string, string> = {
      dataset: '数据集',
      datavolume: '源数据目录-卷',
      database: '源数据目录-数据库',
      metadata: '源数据目录-元数据-目录'
    };
    return map;
  }, []);

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
    (fieldType: string | undefined, sourceType: string) => {
      if (
        !fieldType ||
        !findDataAssetMappingData ||
        findDataAssetMappingData.length === 0
      ) {
        return [];
      }

      // 从匹配的字段中提取指定数据来源类型的映射选项
      const options: ListDataAssetSourceResItem['fields'] = [];
      findDataAssetMappingData.forEach((field) => {
        if (
          field.fields &&
          Array.isArray(field.fields) &&
          field.name === sourceType
        ) {
          field.fields.forEach((field) => {
            if (field.type === fieldType) {
              options.push(field);
            }
          });
        }
      });

      return options;
    },
    [findDataAssetMappingData]
  );

  // Table列定义
  const tableColumns = useMemo(() => {
    const cols: any[] = [
      {
        title: '序号',
        dataIndex: 'sequence',
        width: 80,
        align: 'center' as const
      },
      {
        title: '数据资产名称',
        dataIndex: 'assetName',
        width: 200,
        render: (_: any, record: FieldMapping) => (
          <Input
            placeholder="请输入数据资产名称"
            value={record.assetName}
            onChange={(value) =>
              handleUpdateMapping(record.id, { assetName: value })
            }
          />
        )
      }
    ];

    // 根据选中的数据来源动态生成列
    // 直接遍历 dataSources 的键（这些键就是接口返回的类型）
    Object.keys(dataSources).forEach((sourceType) => {
      // 检查该数据来源是否被选中
      if (dataSources[sourceType] === true) {
        const columnTitle = sourceTypeToNameMap[sourceType] || sourceType;
        cols.push({
          title: columnTitle,
          dataIndex: sourceType,
          width: 200,
          render: (_: any, record: FieldMapping, index: number) => {
            // 根据当前行的字段类型获取映射选项
            // 通过 sequence 找到对应的 metadataField
            const metadataField = metadataFields.find(
              (field, idx) => idx === record.sequence - 1
            );
            const fieldType = metadataField?.type;
            const options = getMappingOptions(fieldType, sourceType);

            return (
              <Select
                placeholder="请选择"
                value={record[sourceType]}
                onChange={(value) =>
                  handleUpdateMapping(record.id, { [sourceType]: value })
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
      width: 150,
      align: 'center' as const,
      render: (_: any, record: FieldMapping) => (
        <Space>
          <Button
            type="text"
            onClick={() => handleAddMapping()}
            className="cursor-pointer text-green-500"
          >
            添加行
          </Button>
          {mappings.length > 1 && (
            <Button
              type="text"
              onClick={() => handleDeleteMapping(record.id)}
              className="cursor-pointer text-red-500"
            >
              删除行
            </Button>
          )}
        </Space>
      )
    });

    return cols;
  }, [
    dataSources,
    mappings,
    metadataFields,
    sourceTypeToNameMap,
    getMappingOptions,
    handleUpdateMapping
  ]);

  // 初始化映射
  useEffect(() => {
    if (metadataFields.length > 0 && mappings.length === 0) {
      const initialMappings: FieldMapping[] = metadataFields.map(
        (field, index) => {
          const mapping: FieldMapping = {
            id: `mapping_${Date.now()}_${index}`,
            sequence: index + 1,
            assetName: field.nameZh
          };
          // 动态初始化所有选中的数据来源类型字段
          Object.keys(dataSources).forEach((sourceType) => {
            if (dataSources[sourceType] === true) {
              mapping[sourceType] = '';
            }
          });
          return mapping;
        }
      );
      setMappings(initialMappings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataFields, dataSources]);

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue({ mappings });
  }, [mappings]);

  // 添加映射行
  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping_${Date.now()}`,
      sequence: mappings.length + 1,
      assetName: ''
    };
    // 动态初始化所有选中的数据来源类型字段
    Object.keys(dataSources).forEach((sourceType) => {
      if (dataSources[sourceType] === true) {
        newMapping[sourceType] = '';
      }
    });
    setMappings([...mappings, newMapping]);
  };

  // 删除映射行
  const handleDeleteMapping = (id: string) => {
    setMappings(mappings.filter((mapping) => mapping.id !== id));
  };

  // 验证映射数据
  const validateMappings = useCallback(
    (value: any, callback: any) => {
      if (mappings.length === 0) {
        callback('请至少添加一个映射');
      } else {
        const incompleteMappings = mappings.some(
          (mapping) => !mapping.assetName
        );
        if (incompleteMappings) {
          callback('请填写完整的映射信息');
        } else {
          callback();
        }
      }
    },
    [mappings]
  );

  // 导入字段
  const handleImportFields = () => {
    Message.info('导入字段功能待实现');
  };

  // 自动映射
  const handleAutoMapping = () => {
    Message.info('自动映射功能待实现');
  };

  // 完成
  const handleFinish = async () => {
    try {
      await form.validate();
      onFinish();
    } catch (error) {
      console.error('表单验证失败:', error);
      Message.error('请填写完整的映射信息');
    }
  };

  return (
    <>
      {/* 映射列表 */}
      <Form
        form={form}
        initialValues={{ mappings }}
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
            <Switch checked={autoMapping} onChange={setAutoMapping} />
          </div>
          <Button
            type="text"
            icon={<IconDownload />}
            onClick={handleImportFields}
          >
            导入字段
          </Button>
        </div>

        <FormItem
          label="映射列表："
          required
          field="mappings"
          className="mb-[24px]"
          rules={[{ validator: validateMappings }]}
        >
          <Table
            columns={tableColumns}
            className="mt-[16px] w-full"
            data={mappings}
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
