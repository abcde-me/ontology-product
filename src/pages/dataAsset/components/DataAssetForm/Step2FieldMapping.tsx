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
import {
  FieldMapping,
  MetadataField,
  DataSource
} from './DataAssetFormContainer';
import { IconDownload } from '@arco-design/web-react/icon';
import styles from './Step2FieldMapping.module.scss';

const FormItem = Form.Item;
const Row = Grid.Row;
const Col = Grid.Col;

interface Step2FieldMappingProps {
  mappings: FieldMapping[];
  setMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  autoMapping: boolean;
  setAutoMapping: React.Dispatch<React.SetStateAction<boolean>>;
  metadataFields: MetadataField[];
  dataSources: DataSource;
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
  onCancel,
  onPrev,
  onFinish
}: Step2FieldMappingProps) {
  const [form] = Form.useForm();

  // 生成列配置
  const columns = useMemo(() => {
    const cols = ['序号', '数据资产名称'];

    if (dataSources.dataset) cols.push('数据集');
    if (dataSources.volume) cols.push('源数据目录-卷');
    if (dataSources.database) cols.push('源数据目录-数据库');
    if (dataSources.metadataDir) cols.push('源数据目录-元数据-目录');

    return cols;
  }, [dataSources]);

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

    if (dataSources.dataset) {
      cols.push({
        title: '数据集',
        dataIndex: 'dataset',
        width: 200,
        render: (_: any, record: FieldMapping) => (
          <Select
            placeholder="请选择"
            value={record.dataset}
            onChange={(value) =>
              handleUpdateMapping(record.id, { dataset: value })
            }
          >
            <Select.Option value="dataset1">这是一个数据集名称</Select.Option>
          </Select>
        )
      });
    }

    if (dataSources.volume) {
      cols.push({
        title: '源数据目录-卷',
        dataIndex: 'volume',
        width: 200,
        render: (_: any, record: FieldMapping) => (
          <Select
            placeholder="请选择"
            value={record.volume}
            onChange={(value) =>
              handleUpdateMapping(record.id, { volume: value })
            }
          >
            <Select.Option value="volume1">这是一个源数据目录-卷</Select.Option>
          </Select>
        )
      });
    }

    if (dataSources.database) {
      cols.push({
        title: '源数据目录-数据库',
        dataIndex: 'database',
        width: 200,
        render: (_: any, record: FieldMapping) => (
          <Select
            placeholder="请选择"
            value={record.database}
            onChange={(value) =>
              handleUpdateMapping(record.id, { database: value })
            }
          >
            <Select.Option value="db1">这是一个源数据目录-数据库</Select.Option>
          </Select>
        )
      });
    }

    if (dataSources.metadataDir) {
      cols.push({
        title: '源数据目录-元数据-目录',
        dataIndex: 'metadataDir',
        width: 200,
        render: (_: any, record: FieldMapping) => (
          <Select
            placeholder="请选择"
            value={record.metadataDir}
            onChange={(value) =>
              handleUpdateMapping(record.id, { metadataDir: value })
            }
          >
            <Select.Option value="metadata1">
              这是一个源数据目录-元数据-目录
            </Select.Option>
          </Select>
        )
      });
    }

    cols.push({
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: FieldMapping) => (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => handleAddMapping()}
            className="cursor-pointer text-green-500"
          >
            添加行
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => handleDeleteMapping(record.id)}
            className="cursor-pointer text-red-500"
          >
            删除行
          </Button>
        </Space>
      )
    });

    return cols;
  }, [dataSources]);

  // 初始化映射
  useEffect(() => {
    if (metadataFields.length > 0 && mappings.length === 0) {
      const initialMappings: FieldMapping[] = metadataFields.map(
        (field, index) => ({
          id: `mapping_${Date.now()}_${index}`,
          sequence: index + 1,
          assetName: field.chineseName,
          dataset: '',
          volume: '',
          database: '',
          metadataDir: ''
        })
      );
      setMappings(initialMappings);
    }
  }, [metadataFields]);

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue({ mappings });
  }, [mappings]);

  // 添加映射行
  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping_${Date.now()}`,
      sequence: mappings.length + 1,
      assetName: '',
      dataset: '',
      volume: '',
      database: '',
      metadataDir: ''
    };
    setMappings([...mappings, newMapping]);
  };

  // 删除映射行
  const handleDeleteMapping = (id: string) => {
    setMappings(mappings.filter((mapping) => mapping.id !== id));
  };

  // 更新映射
  const handleUpdateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(
      mappings.map((mapping) => {
        if (mapping.id === id) {
          return { ...mapping, ...updates };
        }
        return mapping;
      })
    );
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
      <div className="flex gap-4">
        <Button onClick={handleFinish} type="primary">
          确定
        </Button>
        <Button onClick={onPrev}>上一步</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </>
  );
}
