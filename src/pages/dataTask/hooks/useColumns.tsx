import React, { useMemo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { DotStatus } from '@ceai-front/arco-material';
import { ContentWithCopy } from '@/components/ContentWithCopy';
import { PermissionWrapper } from '@/components/PermissionGuard/PermissionWrapper';
import { DATA_SOURCE_PERMISSIONS } from '@/config/permissions';
import dayjs from 'dayjs';
import type { DataTaskItem } from '../types';
import { TaskType, ScheduleType, TaskStatus, ExecutionStatus } from '../types';

const taskTypeMap = {
  [TaskType.TABLE_SYNC]: '表-表同步',
  [TaskType.WORKFLOW_DAG]: 'DAG工作流'
};

const scheduleTypeMap = {
  [ScheduleType.PERIODIC]: '周期调度',
  [ScheduleType.ONCE]: '单次调度',
  [ScheduleType.IMMEDIATE]: '立即执行'
};

const statusMap = {
  [TaskStatus.DEVELOPING]: { text: '开发中', color: '#ff7d00' },
  [TaskStatus.PUBLISHING]: { text: '发布中', color: '#165dff' },
  [TaskStatus.ONLINE]: { text: '已上线', color: '#00b42a' },
  [TaskStatus.OFFLINE]: { text: '已下线', color: '#86909c' }
};

const executionStatusMap = {
  [ExecutionStatus.RUNNING]: { text: '执行中', color: '#165dff' },
  [ExecutionStatus.SUCCESS]: { text: '执行成功', color: '#00b42a' },
  [ExecutionStatus.FAILED]: { text: '执行失败', color: '#f53f3f' }
};

interface UseColumnsProps {
  onDelete: (id: string) => void;
  onCopy: (record: DataTaskItem) => void;
  onViewDetail: (record: DataTaskItem) => void;
  onViewExecutionLog: (record: DataTaskItem) => void;
  onToggleStatus: (record: DataTaskItem, online: boolean) => void;
  taskTypeFilters?: Array<{ text: string; value: string }>;
  scheduleTypeFilters?: Array<{ text: string; value: string }>;
  statusFilters?: Array<{ text: string; value: string }>;
  executionStatusFilters?: Array<{ text: string; value: string }>;
}

export const useColumns = ({
  onDelete,
  onCopy,
  onViewDetail,
  onViewExecutionLog,
  onToggleStatus,
  taskTypeFilters,
  scheduleTypeFilters,
  statusFilters,
  executionStatusFilters
}: UseColumnsProps) => {
  const columns: ColumnProps<DataTaskItem>[] = useMemo(
    () => [
      {
        title: '任务类型',
        dataIndex: 'taskType',
        width: 140,
        filters: taskTypeFilters || [],
        filterMultiple: true,
        render: (type: TaskType) => taskTypeMap[type] || type
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        width: 320,
        render: (text, record) => (
          <ContentWithCopy
            value={text}
            onClick={() => onViewDetail(record)}
            textClassName="link-text hover:cursor-pointer hover:font-[500]"
          />
        )
      },
      {
        title: '调度方式',
        dataIndex: 'scheduleType',
        width: 140,
        filters: scheduleTypeFilters || [],
        filterMultiple: true,
        render: (type: ScheduleType) => scheduleTypeMap[type] || type
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        width: 120,
        filters: statusFilters || [],
        filterMultiple: true,
        render: (status: TaskStatus) => {
          const config = statusMap[status];
          return <DotStatus text={config.text} color={config.color} />;
        }
      },
      {
        title: '最新执行状态',
        dataIndex: 'latestExecutionStatus',
        width: 140,
        filters: executionStatusFilters || [],
        filterMultiple: true,
        render: (status: ExecutionStatus) => {
          const config = executionStatusMap[status];
          return <DotStatus text={config.text} color={config.color} />;
        }
      },
      {
        title: '更新人',
        dataIndex: 'updater',
        width: 180,
        render: (_, record) => `${record.updater} [${record.updaterName}]`
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 180,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 280,
        fixed: 'right' as const,
        render: (_, record) => {
          const canOnline =
            record.status === TaskStatus.OFFLINE ||
            record.status === TaskStatus.DEVELOPING;
          const canOffline =
            record.status === TaskStatus.ONLINE ||
            record.status === TaskStatus.PUBLISHING;

          return (
            <Space size={16}>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onViewDetail(record)}
              >
                详情
              </Button>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onViewExecutionLog(record)}
              >
                执行记录
              </Button>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onCopy(record)}
              >
                复制
              </Button>
              {canOnline && (
                <Button
                  type="text"
                  size="small"
                  className="p-0"
                  onClick={() => onToggleStatus(record, true)}
                >
                  上线
                </Button>
              )}
              {canOffline && (
                <Button
                  type="text"
                  size="small"
                  className="p-0"
                  onClick={() => onToggleStatus(record, false)}
                >
                  下线
                </Button>
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
          );
        }
      }
    ],
    [
      onDelete,
      onCopy,
      onViewDetail,
      onViewExecutionLog,
      onToggleStatus,
      taskTypeFilters,
      scheduleTypeFilters,
      statusFilters,
      executionStatusFilters
    ]
  );

  return columns;
};
