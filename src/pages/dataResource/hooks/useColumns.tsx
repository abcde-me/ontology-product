import React, { useMemo } from 'react';
import { Button, Space, Tag } from '@arco-design/web-react';
import type { TableColumnProps } from '@arco-design/web-react';
import { DotStatus, GlobalTooltip } from '@ceai-front/arco-material';
import {
  DataQueryPermission,
  DATA_QUERY_PERMISSION_LABEL,
  type DataResourceListItem
} from '../types';
import { QUERY_PERMISSION_FILTERS } from '../utils/resolveQueryPermission';
import { SOURCE_SYSTEM_FILTERS } from '../utils/resolveSourceSystem';
import styles from '../index.module.scss';

const DATABASE_TYPE_FILTERS = [
  { text: 'PostgreSQL', value: 'PostgreSQL' },
  { text: 'MySQL', value: 'MySQL' }
];

const queryPermissionStatusMap = {
  [DataQueryPermission.AUTHORIZED]: { color: '#00b42a' },
  [DataQueryPermission.UNAUTHORIZED]: { color: '#86909c' }
};

interface UseColumnsProps {
  onViewDetail: (record: DataResourceListItem) => void;
  onApplyQueryPermission: (record: DataResourceListItem) => void;
}

export const useColumns = ({
  onViewDetail,
  onApplyQueryPermission
}: UseColumnsProps) => {
  const columns: TableColumnProps<DataResourceListItem>[] = useMemo(
    () => [
      {
        title: '数据库类型',
        dataIndex: 'databaseType',
        width: 160,
        fixed: 'left',
        filters: DATABASE_TYPE_FILTERS,
        filterMultiple: false,
        render: (value) => (
          <Tag color="arcoblue" className={styles['database-type-tag']}>
            {value || '-'}
          </Tag>
        )
      },
      {
        title: '表名',
        dataIndex: 'tableName',
        width: 280,
        ellipsis: true,
        render: (value, record) => (
          <div
            className={styles['link-cell']}
            onClick={() => onViewDetail(record)}
          >
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className={`link-text ${styles['table-name']}`}
            />
          </div>
        )
      },
      {
        title: '表注释',
        dataIndex: 'tableComment',
        width: 280,
        ellipsis: true,
        render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
      },
      {
        title: '来源系统',
        dataIndex: 'sourceSystem',
        width: 200,
        filters: [...SOURCE_SYSTEM_FILTERS],
        filterMultiple: false,
        render: (value) => (
          <Tag color="purple" bordered className={styles['source-system-tag']}>
            {value || '-'}
          </Tag>
        )
      },
      {
        title: '数据查询权限',
        dataIndex: 'queryPermission',
        width: 140,
        filters: [...QUERY_PERMISSION_FILTERS],
        filterMultiple: false,
        render: (permission: DataQueryPermission) => {
          const config = queryPermissionStatusMap[permission];
          return (
            <DotStatus
              text={DATA_QUERY_PERMISSION_LABEL[permission]}
              color={config?.color ?? '#86909c'}
            />
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              className={styles['table-action']}
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            {record.queryPermission === DataQueryPermission.UNAUTHORIZED && (
              <Button
                type="text"
                className={styles['table-action']}
                onClick={() => onApplyQueryPermission(record)}
              >
                申请数据权限
              </Button>
            )}
          </Space>
        )
      }
    ],
    [onViewDetail, onApplyQueryPermission]
  );

  return columns;
};
