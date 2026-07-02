import React, { useCallback, useEffect, useState } from 'react';
import { Form, Message, Modal } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { SearchForm } from '@/pages/dataTask/components/SearchForm';
import { LogDetailDrawer } from '@/pages/dataTask/executionLog/components';
import type { ExecutionLogItem } from '@/pages/dataTask/executionLog/types';
import { ExecutionStatus } from '@/pages/dataTask/types';
import { useTable } from '@/pages/dataSource/hooks/useTable';
import { fetchDataTaskOverviewList } from '@/pages/home/ontologyOverview/services/api';
import type { OverviewDataTaskItem } from '@/pages/home/ontologyOverview/types';
import { DataTaskStatsCards, PageHeader } from './components';
import { useColumns } from './hooks/useColumns';
import { resolveLatestExecutionLog } from './services/resolveLatestExecutionLog';
import {
  DEFAULT_DATA_TASK_OVERVIEW_STATS,
  fetchDataTaskOverviewStats,
  type DataTaskOverviewStats
} from './services/stats';
import styles from './index.module.scss';

export default function DataTaskOverview() {
  const [form] = Form.useForm();
  const [syncStatusFilter, setSyncStatusFilter] = useState<string[]>([]);
  const [logRecord, setLogRecord] = useState<ExecutionLogItem | undefined>();
  const [stats, setStats] = useState<DataTaskOverviewStats>(
    DEFAULT_DATA_TASK_OVERVIEW_STATS
  );

  const syncStatusFilters = [
    { text: '同步中', value: ExecutionStatus.RUNNING },
    { text: '同步成功', value: ExecutionStatus.SUCCESS },
    { text: '同步失败', value: ExecutionStatus.FAILED }
  ];

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchDataTaskOverviewStats();
      setStats(data);
    } catch (error) {
      console.error('获取数据任务统计失败:', error);
      setStats(DEFAULT_DATA_TASK_OVERVIEW_STATS);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const { data, loading, pagination, submit, onChange, refresh } = useTable<
    OverviewDataTaskItem,
    any
  >({
    service: async (params) => {
      const result = await fetchDataTaskOverviewList({
        pageNo: params.page || 1,
        pageSize: params.pageSize || 10,
        filter: params.keyword || '',
        executionStatuses:
          syncStatusFilter.length > 0 ? syncStatusFilter : undefined
      });

      return {
        data: {
          items: result.items,
          total: result.total,
          page: result.pageNo,
          pageSize: result.pageSize
        }
      };
    },
    form,
    defaultPageSize: 10,
    deps: [syncStatusFilter]
  });

  const handleViewLog = useCallback(async (record: OverviewDataTaskItem) => {
    try {
      const latestLog = await resolveLatestExecutionLog(
        record.id,
        record.latestExecutionStatus
      );
      if (!latestLog) {
        Message.warning('暂无执行日志');
        return;
      }
      setLogRecord(latestLog);
    } catch (error) {
      console.error('获取执行日志失败:', error);
      Message.error('获取执行日志失败');
    }
  }, []);

  const handleTerminate = (record: OverviewDataTaskItem) => {
    Modal.confirm({
      title: '确认终止',
      content: `确认终止任务「${record.name}」的当前运行实例？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        Message.success('终止成功');
        refresh();
        void loadStats();
      }
    });
  };

  const handleRetry = (record: OverviewDataTaskItem) => {
    Modal.confirm({
      title: '确认重试',
      content: `确认重试任务「${record.name}」？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        Message.success('重试任务已提交');
        refresh();
        void loadStats();
      }
    });
  };

  const handleTableChange = (
    pag: { current?: number; pageSize?: number },
    _sorter: unknown,
    filters: any
  ) => {
    if (filters !== undefined) {
      setSyncStatusFilter(filters.latestExecutionStatus || []);
    }

    onChange(pag, _sorter, filters);
  };

  const columns = useColumns({
    onViewLog: handleViewLog,
    onTerminate: handleTerminate,
    onRetry: handleRetry,
    syncStatusFilters
  });

  return (
    <div className={styles['data-task-page']}>
      <PageHeader />

      <DataTaskStatsCards stats={stats} />

      <div className={styles['table-section']}>
        <SearchTable
          searchForm={<SearchForm form={form} onSearch={submit} />}
          tableProps={{
            columns,
            data,
            loading,
            rowKey: 'id',
            border: false,
            scroll: { x: true },
            onChange: handleTableChange,
            pagination: {
              ...pagination,
              sizeOptions: [10, 20, 50, 100]
            }
          }}
        />
      </div>

      <LogDetailDrawer
        visible={!!logRecord}
        onClose={() => {
          setLogRecord(undefined);
        }}
        record={logRecord}
      />
    </div>
  );
}
