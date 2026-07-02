import React, { useMemo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { DotStatus } from '@ceai-front/arco-material';
import { ExecutionStatus } from '@/pages/dataTask/types';
import type { OverviewDataTaskItem } from '@/pages/home/ontologyOverview/types';

const syncStatusMap = {
  [ExecutionStatus.RUNNING]: { text: '同步中', color: '#165dff' },
  [ExecutionStatus.SUCCESS]: { text: '同步成功', color: '#00b42a' },
  [ExecutionStatus.FAILED]: { text: '同步失败', color: '#f53f3f' }
};

interface UseColumnsProps {
  onViewLog: (record: OverviewDataTaskItem) => void;
  onTerminate: (record: OverviewDataTaskItem) => void;
  onRetry: (record: OverviewDataTaskItem) => void;
  syncStatusFilters?: Array<{ text: string; value: string }>;
}

export const useColumns = ({
  onViewLog,
  onTerminate,
  onRetry,
  syncStatusFilters
}: UseColumnsProps) => {
  const columns: ColumnProps<OverviewDataTaskItem>[] = useMemo(
    () => [
      {
        title: '任务名称',
        dataIndex: 'name',
        width: 320,
        ellipsis: true
      },
      {
        title: '同步状态',
        dataIndex: 'latestExecutionStatus',
        width: 120,
        filters: syncStatusFilters || [],
        filterMultiple: true,
        render: (status: ExecutionStatus) => {
          const config = syncStatusMap[status];
          return <DotStatus text={config.text} color={config.color} />;
        }
      },
      {
        title: '同步开始时间',
        dataIndex: 'syncStartTime',
        width: 180,
        render: (time: string) => time || '-'
      },
      {
        title: '同步结束时间',
        dataIndex: 'syncEndTime',
        width: 180,
        render: (time: string) => time || '-'
      },
      {
        title: '时长',
        dataIndex: 'totalDuration',
        width: 140,
        render: (duration: string) => duration || '-'
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 180,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onViewLog(record)}
            >
              日志
            </Button>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onTerminate(record)}
            >
              终止
            </Button>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onRetry(record)}
            >
              重试
            </Button>
          </Space>
        )
      }
    ],
    [onViewLog, onTerminate, onRetry, syncStatusFilters]
  );

  return columns;
};
