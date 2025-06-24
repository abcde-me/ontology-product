import React, { useState } from 'react';
import { Table } from '@arco-design/web-react';
import type { TableProps, ColumnProps } from '@arco-design/web-react/es/Table';

type SmartTableProps<RecordType> = {
  columns: ColumnProps<RecordType>[];
  data: RecordType[];
  rowKey?: string | ((record: RecordType) => string);
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: RecordType[]) => void;
  hoveredRowId?: any;
  onRowHover?: (rowId: any) => void;
} & Omit<TableProps<RecordType>, 'columns' | 'data' | 'rowKey'>;

/**
 * 通用表格组件（支持任意列和数据结构）
 */
function TargetTable<RecordType extends object>({
  columns,
  data,
  rowKey = 'id',
  onSelectionChange,
  hoveredRowId,
  onRowHover,
  ...restProps
}: SmartTableProps<RecordType>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);
  const [internalHoveredRowId, setInternalHoveredRowId] = useState<any>(null);

  // 使用外部传入的 hoveredRowId 或内部状态
  const currentHoveredRowId = hoveredRowId !== undefined ? hoveredRowId : internalHoveredRowId;

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

  // 处理行悬浮事件
  const handleRowHover = (rowId: any) => {
    if (onRowHover) {
      onRowHover(rowId);
    } else {
      setInternalHoveredRowId(rowId);
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
        x: 1300
      }}
      rowSelection={rowSelection}
      data={data}
      rowKey={rowKey}
      pagination={false}
      border={true}
      onRow={(record) => ({
        onMouseEnter: () => {
          const id = typeof rowKey === 'function' ? rowKey(record) : record[rowKey as keyof RecordType];
          handleRowHover(id);
        },
        onMouseLeave: () => {
          handleRowHover(null);
        },
      })}
      {...restProps}
    />
  );
}

export default TargetTable;
