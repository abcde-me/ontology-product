import React, { useMemo } from 'react';
import { Button, Space, TableColumnProps } from '@arco-design/web-react';
import { DotStatus, GlobalTooltip } from '@ceai-front/arco-material';
import { ContentWithCopy } from '@/pages/ontologyScene/componens';
import { AutoExecLogItem } from '../types';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '成功', color: '#10B981' },
  1: { label: '失败', color: '#E52E2D' },
  2: { label: '部分成功', color: '#F59E0B' },
  3: { label: '待执行', color: '#86909C' }
};

interface UseColumnsOptions {
  onViewLog?: (record: AutoExecLogItem) => void;
  onViewSnapshot?: (record: AutoExecLogItem) => void;
  onViewRule?: (record: AutoExecLogItem) => void;
  onViewAction?: (record: AutoExecLogItem) => void;
  actionClassName?: string;
}

export const useColumns = ({
  onViewLog,
  onViewSnapshot,
  onViewRule,
  onViewAction,
  actionClassName
}: UseColumnsOptions): TableColumnProps<AutoExecLogItem>[] => {
  return useMemo(
    () => [
      {
        title: '日志id',
        dataIndex: 'logId',
        width: 220,
        fixed: 'left',
        render: (value) =>
          value ? (
            <ContentWithCopy value={String(value)} className="link-text" />
          ) : (
            '-'
          )
      },
      {
        title: '规则名称',
        dataIndex: 'ruleName',
        width: 260,
        render: (value, record) => {
          const text = value || '-';
          const canOpen = Boolean(record?.id);
          return (
            <div
              className={canOpen ? 'cursor-pointer' : undefined}
              onClick={() => {
                if (canOpen) {
                  onViewRule?.(record);
                }
              }}
            >
              <GlobalTooltip.Ellipsis
                text={text}
                className={canOpen ? 'link-text' : undefined}
              />
            </div>
          );
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        filters: [
          { text: '成功', value: '0' },
          { text: '失败', value: '1' },
          { text: '部分成功', value: '2' },
          { text: '待执行', value: '3' }
        ],
        render: (value) => {
          const config = STATUS_MAP[value as number];
          if (!config) return '-';
          return <DotStatus color={config.color} text={config.label} />;
        }
      },
      {
        title: '时间',
        dataIndex: 'createdAt',
        sorter: true,
        width: 200,
        render: (value) => value || '-'
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              className={actionClassName}
              onClick={() => onViewLog?.(record)}
            >
              查看日志
            </Button>
            <Button
              type="text"
              className={actionClassName}
              onClick={() => onViewSnapshot?.(record)}
            >
              规则快照
            </Button>
          </Space>
        )
      }
    ],
    [actionClassName, onViewLog, onViewSnapshot, onViewRule, onViewAction]
  );
};
