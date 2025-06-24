import React, { useState } from 'react';
import { Table } from '@arco-design/web-react';
import type { TableProps, ColumnProps } from '@arco-design/web-react/es/Table';

type SmartTableProps<RecordType> = {
  columns: ColumnProps<RecordType>[];
  data: RecordType[];
  selectedArray: []
  rowKey?: string | ((record: RecordType) => string);
  onSelectionChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: RecordType[]
  ) => void;
} & Omit<TableProps<RecordType>, 'columns' | 'data' | 'rowKey'>;

/**
 * 通用表格组件（支持任意列和数据结构）
 */
function SmartTable<RecordType extends object>({
  columns,
  data,
  rowKey = 'id',
  onSelectionChange,
  selectedArray,
  ...restProps
}: SmartTableProps<RecordType>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);
  //定义选中的列表数组
  // const [selectedArray, setSelectedArray] = useState<React.Key[]>([]);
  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: RecordType[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
      onSelectionChange?.(selectedRowKeys, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: any) => {
      console.log('onSelectAll:', selected, selectedRows);
    },
    onSelect: (selected: boolean, record: RecordType, selectedRows: any) => {
      console.log('onSelect:', selected, record, selectedRows);
    }
  };

  // 计算表格总宽度，确保有足够的宽度来触发横向滚动
  const totalWidth = columns.reduce(
    (sum, col) => sum + (Number(col.width) || 150),
    0
  );

  return (
    <Table<RecordType>
      columns={columns}
      scroll={{
        // x: Math.max(totalWidth + 100, 1200), // 确保有足够的宽度触发横向滚动
        x: 1300
        // y: 400,
      }}
      rowSelection={rowSelection}
      data={data}
      rowKey={rowKey}
      pagination={false}
      border={true}
      // selectedArray={selectedArray as []}
      {...restProps}
    />
  );
}

export default SmartTable;
