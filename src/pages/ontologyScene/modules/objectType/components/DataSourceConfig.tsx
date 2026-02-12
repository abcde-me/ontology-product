import React, { useState } from 'react';
import { Radio, Select, Button } from '@arco-design/web-react';
import FieldImportUpload from '../../../componens/FieldImportUpload';
import {
  DATA_SOURCE_TYPE,
  DataSourceType
} from '@/pages/ontologyScene/common/constants';

interface DataSourceConfigProps {
  value?: {
    type: DataSourceType;
    database?: string;
    table?: string;
    file?: any;
  };
  onChange?: (value: {
    type: DataSourceType;
    database?: string;
    table?: string;
    file?: any;
  }) => void;
  onFileChange?: (file: any) => void;
  onFieldsLoad?: (fields: any[]) => void;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = ({
  value = { type: DATA_SOURCE_TYPE.LOCAL_CSV },
  onChange,
  onFileChange,
  onFieldsLoad
}) => {
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>(
    value.type || DATA_SOURCE_TYPE.LOCAL_CSV
  );
  const [selectedDatabase, setSelectedDatabase] = useState<string>(
    value.database || ''
  );
  const [selectedTable, setSelectedTable] = useState<string>(value.table || '');

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

  const handleTypeChange = (type: DataSourceType) => {
    setDataSourceType(type);
    const newValue = {
      type,
      database:
        type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? selectedDatabase
          : undefined,
      table:
        type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? selectedTable
          : undefined,
      file: type === DATA_SOURCE_TYPE.LOCAL_CSV ? value.file : undefined
    };
    onChange?.(newValue);
  };

  const handleDatabaseChange = (database: string) => {
    setSelectedDatabase(database);
    setSelectedTable(''); // 清空表选择
    const newValue = {
      ...value,
      type: dataSourceType,
      database,
      table: undefined
    };
    onChange?.(newValue);
  };

  const handleTableChange = (table: string) => {
    setSelectedTable(table);
    const newValue = {
      ...value,
      type: dataSourceType,
      database: selectedDatabase,
      table
    };
    onChange?.(newValue);
  };

  const handleFileChange = (file: any) => {
    const newValue = {
      ...value,
      type: dataSourceType,
      file
    };
    onChange?.(newValue);
    onFileChange?.(file);
  };

  const handlePreview = () => {
    // TODO: 实现预览功能
    console.log('Preview:', {
      database: selectedDatabase,
      table: selectedTable
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-[14px] font-medium text-[#1D2129]">
          <span className="text-[#F53F3F]">*</span> 上传文件:
        </span>
        <Radio.Group
          value={dataSourceType}
          onChange={handleTypeChange}
          type="button"
        >
          <Radio value={DATA_SOURCE_TYPE.LOCAL_CSV}>本地CSV导入</Radio>
          <Radio value={DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC}>
            数据目录同步
          </Radio>
        </Radio.Group>
      </div>

      {dataSourceType === DATA_SOURCE_TYPE.LOCAL_CSV ? (
        <div>
          <FieldImportUpload
            accept=".csv"
            fileType="csv"
            maxSize={500}
            onFileChange={(fileData) => {
              // FieldImportUpload returns fileData array from response
              // We need to adapt it to work with our file handling
              // For now, we'll pass the first file or the fileData itself
              const file =
                Array.isArray(fileData) && fileData.length > 0
                  ? fileData[0]
                  : fileData;
              handleFileChange(file);
            }}
            onUploadingChange={(isUploading) => {
              // Handle uploading state if needed
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-medium text-[#1D2129]">
              <span className="text-[#F53F3F]">*</span> 数据库/表:
            </span>
            <Select
              placeholder="请选择数据库"
              value={selectedDatabase}
              onChange={handleDatabaseChange}
              style={{ width: 200 }}
              allowClear
            >
              {databaseOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder={selectedDatabase ? '请选择表' : '请先选择数据库'}
              value={selectedTable}
              onChange={handleTableChange}
              style={{ width: 200 }}
              disabled={!selectedDatabase}
              allowClear
            >
              {tableOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={handlePreview}
              disabled={!selectedDatabase || !selectedTable}
            >
              预览
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceConfig;
