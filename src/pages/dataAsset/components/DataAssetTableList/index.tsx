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

const defaultColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    key: 'index',
    render: (_: any, __: any, idx: number) => idx + 1
  },
  {
    title: '数据资产名称',
    dataIndex: 'name',
    width: 200,
    key: 'name',
    ellipsis: true
  },
  {
    title: '资产标签',
    dataIndex: 'tags',
    key: 'tags',
    render: (tag_names: string[]) => {
      if (!tag_names || tag_names.length === 0) return '-';
      return (
        <Space size="mini">
          {tag_names[0] && (
            <Tag>
              {tag_names[0].length > 2 ? (
                <Tooltip content={tag_names[0]}>
                  {tag_names[0].substring(0, 5)}...
                </Tooltip>
              ) : (
                tag_names[0] || '-'
              )}
            </Tag>
          )}
          {tag_names.length > 1 && (
            <Tooltip
              content={tag_names.map((tag, index) => (
                <Tag key={`${tag}-${index}`} style={{ margin: '2px 2px' }}>
                  {tag}
                </Tag>
              ))}
            >
              <Tag>+{tag_names.length - 1}</Tag>
            </Tooltip>
          )}
        </Space>
      );
    }
  },
  {
    title: '来源',
    dataIndex: 'source',
    width: 150,
    key: 'source'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    dataIndex: 'actions',
    width: 200,
    key: 'actions',
    render: (
      _: any,
      record: any,
      idx: number,
      { onEditAsset, onEditTags, onDelete }: any
    ) => (
      <Space>
        <Button
          type="text"
          style={{ marginRight: 6 }}
          onClick={() => onEditAsset?.(record)}
        >
          修改资产
        </Button>
        <Button
          type="text"
          style={{ marginRight: 6 }}
          onClick={() => onEditTags?.(record)}
        >
          修改标签
        </Button>
        <Button type="text" onClick={() => onDelete?.(record)}>
          删除
        </Button>
      </Space>
    )
  }
];

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
  const tableColumns = columns || defaultColumns;

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

  return (
    <div className="flex w-full flex-col">
      <Table
        border={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRowKeys as (string | number)[],
          onChange: handleRowSelectionChange
        }}
        columns={
          tableColumns.map((col) =>
            col.dataIndex === 'actions'
              ? {
                  ...col,
                  render: (val: any, record: any, idx: number) =>
                    col.render
                      ? col.render(val, record, idx, {
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
            onPageSizeChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataAssetTableList;
