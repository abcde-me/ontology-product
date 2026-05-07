import React, { useMemo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { DotStatus } from '@ceai-front/arco-material';
import { ContentWithCopy } from '@/components/ContentWithCopy';
import dayjs from 'dayjs';
import type { DataSourceItem } from '../types';
import { DataSourceType, ConnectionStatus } from '../types';

interface UseColumnsProps {
  onDelete: (id: string) => void;
  onEdit?: (record: DataSourceItem) => void;
  onTestConnection: (id: string) => void;
  onViewDetail?: (record: DataSourceItem) => void;
  dataSourceTypeFilters?: Array<{ text: string; value: string }>;
  connectionStatusFilters?: Array<{ text: string; value: string }>;
  testingIds?: Set<string>;
}

export const useColumns = ({
  onDelete,
  onEdit,
  onTestConnection,
  onViewDetail,
  dataSourceTypeFilters,
  connectionStatusFilters,
  testingIds = new Set()
}: UseColumnsProps) => {
  const columns: ColumnProps<DataSourceItem>[] = useMemo(
    () => [
      {
        title: '数据源名称',
        dataIndex: 'name',
        width: 200,
        render: (text, record) => (
          <ContentWithCopy
            value={text}
            onClick={() => onViewDetail?.(record)}
            textClassName="link-text hover:cursor-pointer hover:font-[500]"
          />
        )
      },
      {
        title: '数据源类型',
        dataIndex: 'dataSourceType',
        width: 150,
        filters: dataSourceTypeFilters || [],
        filterMultiple: true,
        render: (type: DataSourceType) => {
          const typeMap = {
            [DataSourceType.MYSQL]: { text: 'MySQL', color: 'blue' },
            [DataSourceType.DAMENG]: { text: '达梦数据库', color: 'green' },
            [DataSourceType.POSTGRESQL]: { text: 'PostgreSQL', color: 'purple' }
          };
          const config = typeMap[type];
          return <div>{config.text}</div>;
        }
      },
      {
        title: '连接信息',
        dataIndex: 'connectionInfo',
        width: 300,
        render: (text) => <ContentWithCopy value={text} />
      },
      {
        title: '连接状态',
        dataIndex: 'connectionStatus',
        width: 120,
        filters: connectionStatusFilters || [],
        filterMultiple: true,
        render: (status: ConnectionStatus) => {
          const statusMap = {
            [ConnectionStatus.SUCCESS]: { text: '成功', color: '#00b42a' },
            [ConnectionStatus.FAILED]: { text: '失败', color: '#f53f3f' }
          };
          const config = statusMap[status];
          return <DotStatus text={config.text} color={config.color} />;
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 180,
        render: (time: string) => {
          return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
        }
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 250,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              size="small"
              className="p-0"
              loading={testingIds.has(record.id)}
              onClick={() => onTestConnection(record.id)}
            >
              连接测试
            </Button>
            {onEdit && (
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onEdit(record)}
              >
                编辑
              </Button>
            )}
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onDelete(record.id)}
            >
              删除
            </Button>
          </Space>
        )
      }
    ],
    [
      onDelete,
      onEdit,
      onTestConnection,
      onViewDetail,
      dataSourceTypeFilters,
      connectionStatusFilters,
      testingIds
    ]
  );

  return columns;
};
