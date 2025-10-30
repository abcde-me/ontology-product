import React from 'react';
import {
  Table,
  Button,
  Tag,
  InputTag,
  Tooltip,
  Space
} from '@arco-design/web-react';
// 可以根据实际情况，扩展 props 以接受 columns 变动等
export interface DataAssetTableListProps {
  data: any[];
  onEditAsset?: (record: any) => void;
  onEditTags?: (record: any) => void;
  onDelete?: (record: any) => void;
}

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    key: (_, idx) => `${idx}`,
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
    render: (tag_names: string[]) => {
      if (!tag_names || tag_names.length === 0) return '-';
      return (
        <Space size="mini">
          {tag_names && tag_names.length > 0 && tag_names[0] && (
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
          {tag_names && tag_names.length > 1 && (
            <Tooltip
              content={tag_names.map((tag, index) => (
                <Tag
                  key={index}
                  style={{
                    margin: '2px 2px'
                  }}
                >
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
  onEditAsset,
  onEditTags,
  onDelete
}) => {
  return (
    <Table
      columns={
        columns.map((col) =>
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
            : col
        ) as any
      }
      data={data}
      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  );
};

const mockData = [
  {
    name: '数据资产A',
    tags: ['标签1', '标签2', '标签3'],
    source: '系统导入',
    updateTime: '2024-01-01 12:00:00'
  },
  {
    name: '数据资产B',
    tags: [],
    source: '人工录入',
    updateTime: '2024-04-15 09:42:38'
  },
  {
    name: '数据资产C',
    tags: ['标签A'],
    source: '外部同步',
    updateTime: '2024-05-21 16:20:18'
  }
];

// 默认导出 Demo 版（如需实际使用可恢复为：export default DataAssetTableList）
export default () => <DataAssetTableList data={mockData} />;
