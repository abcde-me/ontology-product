import React, { useState } from 'react';
import { Table } from '@arco-design/web-react';
import type { TableProps, ColumnProps } from '@arco-design/web-react/es/Table';

// 统一表格组件的属性类型定义
type UnifiedTableProps<RecordType> = {
  columns: ColumnProps<RecordType>[];
  data: RecordType[];
  rowKey?: string | ((record: RecordType) => string);
  onSelectionChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: RecordType[]
  ) => void;
  // Target表格特有的行悬浮功能属性
  hoveredRowId?: string | null;
  onRowHover?: (rowId: string | null) => void;
  // 表格类型标识，用于决定是否启用特定功能
  tableType?: 'source' | 'target';
} & Omit<TableProps<RecordType>, 'columns' | 'data' | 'rowKey'>;

/**
 * 统一的表格组件
 * 整合了原SmartTable和TargetTable的功能
 * - 支持任意列和数据结构
 * - 支持行选择功能
 * - 支持行悬浮功能（主要用于Target表格）
 * - 根据tableType自动启用对应功能
 */
function UnifiedTable<RecordType extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id',
  onSelectionChange,
  hoveredRowId,
  onRowHover,
  tableType = 'source',
  ...restProps
}: UnifiedTableProps<RecordType>) {
  // 表格选择状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);

  // 内部行悬浮状态管理（当外部未提供时使用）
  const [internalHoveredRowId, setInternalHoveredRowId] = useState<
    string | null
  >(null);

  // 使用外部传入的 hoveredRowId 或内部状态
  const currentHoveredRowId =
    hoveredRowId !== undefined ? hoveredRowId : internalHoveredRowId;

  // 行选择配置
  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: RecordType[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `UnifiedTable - selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );

      // 调用外部传入的选择变化回调函数
      onSelectionChange?.(selectedRowKeys, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: RecordType[]) => {
      console.log('UnifiedTable - onSelectAll:', selected, selectedRows);
    },
    onSelect: (
      selected: boolean,
      record: RecordType,
      selectedRows: RecordType[]
    ) => {
      console.log('UnifiedTable - onSelect:', selected, record, selectedRows);
    }
  };

  // 处理行悬浮事件（主要用于Target表格）
  const handleRowHover = (rowId: string | null) => {
    if (onRowHover) {
      // 如果外部提供了悬浮处理函数，使用外部的
      onRowHover(rowId);
    } else {
      // 否则使用内部状态管理
      setInternalHoveredRowId(rowId);
    }
  };

  // 计算表格总宽度，确保有足够的宽度来触发横向滚动
  const totalWidth = columns.reduce(
    (sum, col) => sum + (Number(col.width) || 150),
    0
  );

  // 行事件配置（主要用于Target表格的悬浮功能）
  const getRowProps = (record: RecordType) => {
    // 只有Target表格才启用行悬浮功能
    if (tableType === 'target') {
      return {
        onMouseEnter: () => {
          const id =
            typeof rowKey === 'function'
              ? rowKey(record)
              : record[rowKey as keyof RecordType];
          handleRowHover(id as string);
        },
        onMouseLeave: () => {
          handleRowHover(null);
        }
      };
    }

    // Source表格返回空对象
    return {};
  };

  return (
    <Table<RecordType>
      columns={columns}
      scroll={{
        x: Math.max(totalWidth + 100, 1300) // 确保有足够的宽度触发横向滚动
      }}
      rowSelection={rowSelection}
      data={data}
      rowKey={rowKey}
      pagination={false}
      border={true}
      onRow={getRowProps}
      {...restProps}
    />
  );
}

export default UnifiedTable;
