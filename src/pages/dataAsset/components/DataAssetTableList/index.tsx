import React from 'react';
import {
  Table,
  Button,
  Tag,
  InputTag,
  Tooltip,
  Space,
  Pagination
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import noDataElement from '@/components/no-data';

// 可以根据实际情况，扩展 props 以接受 columns 变动等
export interface DataAssetTableListProps {
  data: any[];
  columns?: ColumnProps[];
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, newPageSize?: number) => void;
  onEditAsset?: (record: any) => void;
  onEditTags?: (record: any) => void;
  onDelete?: (record: any) => void;
  selectedRowKeys?: string[];
  onSelectChange?: (selectedRowKeys: string[]) => void;
}

const DataAssetTableList: React.FC<DataAssetTableListProps> = ({
  data,
  columns,
  currentPage = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onEditAsset,
  onEditTags,
  onDelete,
  selectedRowKeys = [],
  onSelectChange
}) => {
  // 使用传入的 columns 或默认的 columns
  const tableColumns = columns;

  // 计算起始索引（用于序号显示）
  const startIndex = (currentPage - 1) * pageSize;

  // 处理分页变化
  const handlePageChange = (page: number, newPageSize?: number) => {
    onPageChange?.(page, newPageSize);
  };

  // 处理行选择变化
  const handleRowSelectionChange = (
    rowKeys: (string | number)[],
    selectedRows: any[]
  ) => {
    onSelectChange?.(rowKeys.map((key) => String(key)));
  };

  // 空态
  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        {noDataElement({
          description: '暂无数据资产'
        })}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-[12px] bg-white px-[16px] py-[16px]">
      <Table
        border={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRowKeys as (string | number)[],
          onChange: handleRowSelectionChange
        }}
        columns={
          tableColumns?.map((col) =>
            col.dataIndex === 'actions'
              ? {
                  ...col,
                  render: (val: any, record: any, idx: number) =>
                    col.render
                      ? // @ts-expect-error
                        col.render(val, record, idx, {
                          onEditAsset,
                          onEditTags,
                          onDelete
                        })
                      : null
                }
              : col.dataIndex === 'index'
                ? {
                    ...col,
                    render: (_: any, __: any, idx: number) =>
                      startIndex + idx + 1
                  }
                : col
          ) as any
        }
        data={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id || record.name || String(Math.random())}
      />

      {/* 分页组件 */}
      {total > 0 && (
        <div className="mt-[16px] flex items-center justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeOptions={[10, 20, 50, 100]}
            sizeCanChange
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataAssetTableList;
