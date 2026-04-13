import React, { useMemo } from 'react';
import { Button, Space, TableColumnProps } from '@arco-design/web-react';
import {
  CopyItemIcon,
  DotStatus,
  GlobalTooltip
} from '@ceai-front/arco-material';
import { AutoExecLogItem } from '../types';
import PermissionButton from '@/components/PermissionButton';
import { AUTOMATION_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';

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
  const infoViewAble = useHasPermission(AUTOMATION_PERMISSIONS.GET);

  // 先关闭所有打开的抽屉
  const closeDrawer = () => {
    [onViewLog, onViewSnapshot, onViewRule, onViewAction].forEach((fn) => {
      // @ts-ignore
      fn(undefined);
    });
  };

  return useMemo(
    () => [
      {
        title: '日志id',
        dataIndex: 'logId',
        width: 220,
        fixed: 'left',
        render: (value, record) =>
          value ? (
            <div className="flex w-full items-center gap-[8px]">
              <div
                className={'min-w-0 cursor-pointer'}
                onClick={() => {
                  if (!infoViewAble) return;
                  closeDrawer();
                  onViewLog?.(record);
                }}
              >
                <GlobalTooltip.Ellipsis
                  text={String(value)}
                  className={`${infoViewAble ? 'link-text' : ''} w-full`}
                />
              </div>
              <CopyItemIcon value={String(value)} className="flex-shrink-0" />
            </div>
          ) : (
            '-'
          )
      },
      {
        title: '规则名称',
        dataIndex: 'ruleName',
        width: 220,
        render: (value, record) => {
          const text = value || '-';
          const canOpen = Boolean(record?.id) && infoViewAble;
          return (
            <div
              className={canOpen ? 'cursor-pointer' : undefined}
              onClick={() => {
                if (canOpen) {
                  closeDrawer();
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
        width: 110,
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
        width: 180,
        render: (value) => value || '-'
      },
      {
        title: '耗时',
        dataIndex: 'duration',
        sorter: true,
        width: 80,
        render: (value) => value || '-'
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <PermissionButton
              permission={{
                permission: AUTOMATION_PERMISSIONS.GET
              }}
              type="text"
              className={actionClassName}
              onClick={() => {
                closeDrawer();
                onViewLog?.(record);
              }}
            >
              查看日志
            </PermissionButton>
            <PermissionButton
              permission={{
                permission: AUTOMATION_PERMISSIONS.GET
              }}
              type="text"
              className={actionClassName}
              onClick={() => {
                closeDrawer();
                onViewSnapshot?.(record);
              }}
            >
              规则快照
            </PermissionButton>
          </Space>
        )
      }
    ],
    [actionClassName, onViewLog, onViewSnapshot, onViewRule, onViewAction]
  );
};
