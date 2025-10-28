import React from 'react';
import { Input, Select } from '@arco-design/web-react';
import { FieldMapping, DataSource } from './DataAssetFormContainer';

interface MappingRowProps {
  mapping: FieldMapping;
  columns: string[];
  dataSources: DataSource;
  onUpdate: (updates: Partial<FieldMapping>) => void;
  onDelete: () => void;
}

export default function MappingRow({
  mapping,
  columns,
  dataSources,
  onUpdate,
  onDelete
}: MappingRowProps) {
  const getColumnIndex = (colName: string) => {
    return columns.indexOf(colName);
  };

  const renderCell = (colName: string, index: number) => {
    if (colName === '序号') {
      return <div className="flex items-center">{mapping.sequence}</div>;
    }

    if (colName === '数据资产名称') {
      return (
        <Input
          placeholder="请输入数据资产名称"
          value={mapping.assetName}
          onChange={(value) => onUpdate({ assetName: value })}
        />
      );
    }

    if (colName === '数据集') {
      return (
        <Select
          placeholder="请选择"
          value={mapping.dataset}
          onChange={(value) => onUpdate({ dataset: value })}
        >
          <Select.Option value="dataset1">这是一个数据集名称</Select.Option>
        </Select>
      );
    }

    if (colName === '源数据目录-卷') {
      return (
        <Select
          placeholder="请选择"
          value={mapping.volume}
          onChange={(value) => onUpdate({ volume: value })}
        >
          <Select.Option value="volume1">这是一个源数据目录-卷</Select.Option>
        </Select>
      );
    }

    if (colName === '源数据目录-数据库') {
      return (
        <Select
          placeholder="请选择"
          value={mapping.database}
          onChange={(value) => onUpdate({ database: value })}
        >
          <Select.Option value="db1">这是一个源数据目录-数据库</Select.Option>
        </Select>
      );
    }

    if (colName === '源数据目录-元数据-目录') {
      return (
        <Select
          placeholder="请选择"
          value={mapping.metadataDir}
          onChange={(value) => onUpdate({ metadataDir: value })}
        >
          <Select.Option value="metadata1">
            这是一个源数据目录-元数据-目录
          </Select.Option>
        </Select>
      );
    }

    return null;
  };

  return (
    <div
      className="grid gap-2 border-b py-2 text-sm"
      style={{
        gridTemplateColumns: `50px 200px ${columns
          .slice(2)
          .map(() => '200px')
          .join(' ')}`
      }}
    >
      {columns.map((col, index) => (
        <div key={col}>{renderCell(col, index)}</div>
      ))}
    </div>
  );
}
