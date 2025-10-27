import React, { useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Input,
  Message,
  Select,
  Switch
} from '@arco-design/web-react';
// import { Download } from '@icon-park/react';
import {
  FieldMapping,
  MetadataField,
  DataSource
} from './DataAssetFormContainer';
import MappingRow from './MappingRow';

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
  // 生成列配置
  const columns = useMemo(() => {
    const cols = ['序号', '数据资产名称'];

    if (dataSources.dataset) cols.push('数据集');
    if (dataSources.volume) cols.push('源数据目录-卷');
    if (dataSources.database) cols.push('源数据目录-数据库');
    if (dataSources.metadataDir) cols.push('源数据目录-元数据-目录');

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

  // 导入字段
  const handleImportFields = () => {
    // TODO: 实现导入字段逻辑
    Message.info('导入字段功能待实现');
  };

  // 自动映射
  const handleAutoMapping = () => {
    // TODO: 实现自动映射逻辑
    Message.info('自动映射功能待实现');
  };

  // 完成
  const handleFinish = () => {
    if (mappings.length === 0) {
      Message.error('请至少添加一个映射');
      return;
    }

    // 验证所有映射是否填写完整
    const incompleteMappings = mappings.some((mapping) => !mapping.assetName);

    if (incompleteMappings) {
      Message.error('请填写完整的映射信息');
      return;
    }

    onFinish();
  };

  return (
    <>
      {/* 映射列表 */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="required">映射列表</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>自动映射</span>
                <Switch checked={autoMapping} onChange={setAutoMapping} />
              </div>
              <Button
                type="text"
                // icon={<Download />}
                onClick={handleImportFields}
              >
                导入字段
              </Button>
            </div>
          </div>
        }
      >
        {/* 表头 */}
        <div className="overflow-x-auto">
          <div
            className="mb-2 grid gap-2 border-b pb-2 text-sm font-medium"
            style={{
              gridTemplateColumns: `50px 200px ${columns
                .slice(2)
                .map(() => '200px')
                .join(' ')}`
            }}
          >
            {columns.map((col) => (
              <div key={col}>{col}</div>
            ))}
          </div>

          {/* 映射行 */}
          {mappings.length === 0 ? (
            <div className="mt-8 text-center text-gray-400">暂无映射数据</div>
          ) : (
            mappings.map((mapping) => (
              <MappingRow
                key={mapping.id}
                mapping={mapping}
                columns={columns}
                dataSources={dataSources}
                onUpdate={(updates) => handleUpdateMapping(mapping.id, updates)}
                onDelete={() => handleDeleteMapping(mapping.id)}
              />
            ))
          )}
        </div>
      </Card>

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
