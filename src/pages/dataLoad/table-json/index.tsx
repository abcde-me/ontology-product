import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Checkbox
} from '@arco-design/web-react';
import { divide, isBoolean } from 'lodash-es';
import styles from './index.module.scss';
import { get } from 'sortablejs';
// 定义表格数据类型
interface TableRow {
  id: number; // 序号
  type: string; // 存储类型
  is_primary_key: boolean; // 主建
  source_field: string; // 源字段
  target_field: string; // 目标字段
  source_field_type: string; // 源字段类型
  target_field_type: string; // 目标字段类型
}

interface EditableTableProps {
  previewDataColumns: {
    data: {
      columns: TableRow[];
    };
  };
  getTableData?: (data: TableRow[]) => void;
  loading: boolean;
}

const EditableTable = ({
  previewDataColumns,
  loading,
  getTableData
}: EditableTableProps) => {
  // 初始化表格数据
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const uniqueTypes2 = Array.from(
    new Set(
      previewDataColumns?.data?.columns
        ?.map((item) => item.type)
        .filter(Boolean)
    )
  );
  const categoryOptions = uniqueTypes2?.map((item) => {
    return {
      label: item,
      value: item
    };
  });
  useEffect(() => {
    const newArr: TableRow[] = previewDataColumns?.data?.columns?.map(
      (item: any, i) => {
        return {
          ...item,
          id: i + 1,
          source_field: item.name,
          source_field_type: item.type,
          target_field: item.name,
          target_field_type: item.type,
          is_primary_key: item.is_primary_key
        };
      }
    );
    setTableData(newArr);
    console.log(newArr, 'newArr 123', previewDataColumns);
  }, [previewDataColumns]);

  // 添加新行
  const handleAddRow = (record: TableRow) => {
    setTableData([
      ...tableData,
      {
        id: tableData?.length + 1,
        type: record?.type || '',
        is_primary_key: false,
        source_field: '',
        target_field: '',
        source_field_type: record?.type || '',
        target_field_type: record?.type || ''
      }
    ]);
  };

  // 删除指定行
  const handleDeleteRow = (id: number) => {
    // 至少保留一行
    if (tableData.length <= 1) {
      alert('至少需要保留一行数据');
      return;
    }
    setTableData(tableData.filter((item) => item.id !== id));
  };

  // 更新输入框值
  const handleInputChange = (
    record,
    id: number,
    field: keyof TableRow,
    value: string | boolean
  ) => {
    setTableData((prevTableData) => {
      const newData = prevTableData.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      );
      // 在这里可以实时看到最新的值
      return newData;
    });
  };

  // 添加useEffect来监控tableData的变化
  useEffect(() => {
    if (getTableData) {
      getTableData(tableData);
    }
  }, [tableData]);

  // 定义表格列配置
  const columns = [
    {
      title: <div className={styles.title}>序号</div>,
      dataIndex: 'id',
      width: 60
    },
    {
      title: 'JSON字段名',
      dataIndex: 'source_field',
      width: 130,
      rules: [{ required: true, message: '请输入' }],
      render: (value: string, record: TableRow) => (
        <Input
          defaultValue={value}
          placeholder="请输入"
          onChange={(val) =>
            handleInputChange(record, record.id, 'source_field', val)
          }
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '存储字段',
      dataIndex: 'target_field',
      width: 130,
      rules: [{ required: true, message: '请输入' }],
      render: (value: string, record: TableRow) => (
        <Input
          defaultValue={value}
          placeholder="请输入"
          onChange={(val) =>
            handleInputChange(record, record.id, 'target_field', val)
          }
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '存储类型',
      dataIndex: 'type',
      width: 130,
      render: (value: string, record: TableRow) => (
        <Select
          defaultValue={value}
          placeholder="请选择分类"
          options={categoryOptions}
          onChange={(val) => handleInputChange(record, record.id, 'type', val)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: <div className={styles.title}>主建</div>,
      dataIndex: 'is_primary_key',
      width: 60,
      render: (value: string, record: TableRow) => (
        <Checkbox
          onChange={(checked) =>
            handleInputChange(record, record.id, 'is_primary_key', checked)
          }
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 132,
      render: (_: any, record: TableRow) => (
        <div className={styles.operationBtn}>
          <span
            className={styles.operateText}
            onClick={() => {
              handleAddRow(record);
            }}
          >
            添加行
          </span>
          <span
            className={styles.operateText}
            onClick={() => handleDeleteRow(record.id)}
          >
            删除行
          </span>
        </div>
      )
    }
  ];

  return (
    <Table
      loading={loading}
      className={styles.table}
      columns={columns}
      data={tableData}
      border
      rowKey="key"
      pagination={false}
      style={{
        width: 640,
        marginLeft: '130px'
      }}
    />
  );
};

export default EditableTable;
