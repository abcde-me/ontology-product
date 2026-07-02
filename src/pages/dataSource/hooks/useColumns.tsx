import React, { useMemo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { ContentWithCopy } from '@/components/ContentWithCopy';
import { PermissionWrapper } from '@/components/PermissionGuard/PermissionWrapper';
import { DATA_SOURCE_PERMISSIONS } from '@/config/permissions';
import dayjs from 'dayjs';
import type { DataSourceItem } from '../types';
import { getDataSourceTypeLabel } from '../constants';
import { DataSourceType } from '../types';

interface UseColumnsProps {
  onDelete: (id: string) => void;
  onEdit?: (record: DataSourceItem) => void;
  onTestConnection: (id: string) => void;
  onViewDetail?: (record: DataSourceItem) => void;
  dataSourceTypeFilters?: Array<{ text: string; value: string }>;
  testingIds?: Set<string>;
}

export const useColumns = ({
  onDelete,
  onEdit,
  onTestConnection,
  onViewDetail,
  dataSourceTypeFilters,
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
        render: (type: DataSourceType) => (
          <div>{getDataSourceTypeLabel(type)}</div>
        )
      },
      {
        title: '连接信息',
        dataIndex: 'connectionInfo',
        width: 300,
        render: (text) => <ContentWithCopy value={text} />
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
              <PermissionWrapper permission={DATA_SOURCE_PERMISSIONS.MODIFY}>
                <Button
                  type="text"
                  size="small"
                  className="p-0"
                  onClick={() => onEdit(record)}
                >
                  编辑
                </Button>
              </PermissionWrapper>
            )}
            <PermissionWrapper permission={DATA_SOURCE_PERMISSIONS.DELETE}>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onDelete(record.id)}
              >
                删除
              </Button>
            </PermissionWrapper>
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
      testingIds
    ]
  );

  return columns;
};
