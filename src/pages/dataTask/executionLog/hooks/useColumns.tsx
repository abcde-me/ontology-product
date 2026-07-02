import React, { useMemo } from 'react';
import { Button, Space, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { DotStatus } from '@ceai-front/arco-material';
import type { ExecutionLogItem } from '../types';
import { RunStatus } from '../types';

const runStatusMap = {
  [RunStatus.RUNNING]: { text: '执行中', color: '#ff7d00' },
  [RunStatus.SUCCESS]: { text: '成功', color: '#165dff' },
  [RunStatus.FAILED]: { text: '失败', color: '#f53f3f' }
};

interface UseColumnsProps {
  onViewLog: (record: ExecutionLogItem) => void;
  onRerun: (record: ExecutionLogItem) => void;
  onTerminate: (record: ExecutionLogItem) => void;
  statusFilters?: Array<{ text: string; value: string }>;
}

export const useColumns = ({
  onViewLog,
  onRerun,
  onTerminate,
  statusFilters
}: UseColumnsProps) => {
  const columns: ColumnProps<ExecutionLogItem>[] = useMemo(
    () => [
      {
        title: '运行ID',
        dataIndex: 'runId',
        width: 160
      },
      {
        title: '运行状态',
        dataIndex: 'status',
        width: 120,
        filters: statusFilters || [],
        filterMultiple: true,
        render: (status: RunStatus) => {
          const config = runStatusMap[status];
          return <DotStatus text={config.text} color={config.color} />;
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        width: 180
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        width: 180,
        render: (time?: string) => time || '-'
      },
      {
        title: '运行时长',
        dataIndex: 'duration',
        width: 140,
        render: (duration?: string) => duration || '-'
      },
      {
        title: (
          <span className="inline-flex items-center">
            失败重跑次数
            <Tooltip content="已重跑次数 / 最大重跑次数">
              <IconQuestionCircle className="ml-1 cursor-pointer text-[#86909c]" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'retryCount',
        width: 160,
        render: (_, record) => `${record.retryCount} / ${record.maxRetryCount}`
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 200,
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
              onClick={() => onRerun(record)}
            >
              重跑
            </Button>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onTerminate(record)}
            >
              终止
            </Button>
          </Space>
        )
      }
    ],
    [onViewLog, onRerun, onTerminate, statusFilters]
  );

  return columns;
};
