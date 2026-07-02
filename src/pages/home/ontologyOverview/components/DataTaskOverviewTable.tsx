import React, { useMemo } from 'react';
import { Button, Table } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { DotStatus } from '@ceai-front/arco-material';
import { ExecutionStatus } from '@/pages/dataTask/types';
import type { OverviewDataTaskItem } from '../types';
import styles from '../index.module.scss';

const syncStatusMap = {
  [ExecutionStatus.RUNNING]: { text: '同步中', color: '#165dff' },
  [ExecutionStatus.SUCCESS]: { text: '同步成功', color: '#00b42a' },
  [ExecutionStatus.FAILED]: { text: '同步失败', color: '#f53f3f' }
};

interface DataTaskOverviewTableProps {
  data: OverviewDataTaskItem[];
  onEnterDataTask?: () => void;
}

export const DataTaskOverviewTable: React.FC<DataTaskOverviewTableProps> = ({
  data,
  onEnterDataTask
}) => {
  const columns: ColumnProps<OverviewDataTaskItem>[] = useMemo(
    () => [
      {
        title: '序号',
        width: 72,
        render: (_, __, index) => index + 1
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        width: 260,
        ellipsis: true
      },
      {
        title: '同步状态',
        dataIndex: 'latestExecutionStatus',
        width: 120,
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
      }
    ],
    []
  );

  return (
    <div className={`${styles['section-card']} ${styles['task-table-card']}`}>
      <div className={styles['section-header']}>
        <div className={styles['section-title']}>数据任务列表</div>
        {onEnterDataTask ? (
          <Button
            type="text"
            className={styles['link-button']}
            onClick={onEnterDataTask}
          >
            进入数据任务 →
          </Button>
        ) : null}
      </div>
      <Table
        className={styles['task-table']}
        columns={columns}
        data={data}
        rowKey="id"
        pagination={false}
        border={false}
        tableLayoutFixed
      />
    </div>
  );
};
