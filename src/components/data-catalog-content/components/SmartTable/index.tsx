import React from 'react';
import { Table } from '@arco-design/web-react';
import type { TableProps, ColumnProps } from '@arco-design/web-react/es/Table';

type SmartTableProps<RecordType> = {
  columns: ColumnProps<RecordType>[];
  data: RecordType[];
  rowKey?: string | ((record: RecordType) => string);
} & Omit<TableProps<RecordType>, 'columns' | 'data' | 'rowKey'>;

/**
 * 通用表格组件（支持任意列和数据结构）
 */
function SmartTable<RecordType extends object>({
  columns,
  data,
  rowKey = 'key',
  ...restProps
}: SmartTableProps<RecordType>) {
  return (
    <Table<RecordType>
      columns={columns}
      data={data}
      rowKey={rowKey}
      pagination={false}
      {...restProps}
    />
  );
}

export default SmartTable;
