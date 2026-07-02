import React, { useMemo, useState } from 'react';
import { Pagination, Message, Modal } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { useParams, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useTable } from '@/pages/dataSource/hooks/useTable';
import { useColumns } from './hooks/useColumns';
import { RunStatus } from './types';
import type { ExecutionLogItem } from './types';
import { fetchExecutionLogList } from './services/api';
import { LogDetailDrawer } from './components';
import styles from './index.module.scss';

export default function DataTaskExecutionLog() {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [logRecord, setLogRecord] = useState<ExecutionLogItem | undefined>();

  const taskName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('taskName') || '数据任务';
  }, [location.search]);

  const backPath = useMemo(
    () =>
      location.pathname.includes('/dataTask2/')
        ? '/tenant/compute/onto/dataConnection/dataTask2'
        : '/tenant/compute/onto/dataConnection/dataTask',
    [location.pathname]
  );

  const statusFilters = [
    { text: '执行中', value: RunStatus.RUNNING },
    { text: '成功', value: RunStatus.SUCCESS },
    { text: '失败', value: RunStatus.FAILED }
  ];

  const { data, loading, pagination, onChange, refresh } = useTable<
    ExecutionLogItem,
    any
  >({
    service: async (params) => {
      const result = await fetchExecutionLogList({
        taskId: taskId || '',
        pageNo: params.page || 1,
        pageSize: params.pageSize || 10,
        statuses: statusFilter.length > 0 ? statusFilter : undefined
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
    defaultPageSize: 10,
    deps: [taskId, statusFilter]
  });

  const handleViewLog = (record: ExecutionLogItem) => {
    setLogRecord(record);
  };

  const handleRerun = (record: ExecutionLogItem) => {
    Modal.confirm({
      title: '确认重跑',
      content: `确认重跑运行实例 ${record.runId}？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        Message.success('重跑任务已提交');
        refresh();
      }
    });
  };

  const handleTerminate = (record: ExecutionLogItem) => {
    Modal.confirm({
      title: '确认终止',
      content: `确认终止运行实例 ${record.runId}？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        Message.success('终止成功');
        refresh();
      }
    });
  };

  const handleTableChange = (_pag: any, _sorter: any, filters: any) => {
    if (filters !== undefined) {
      setStatusFilter(filters.status || []);
    }

    onChange(_pag, _sorter, filters);
  };

  const columns = useColumns({
    onViewLog: handleViewLog,
    onRerun: handleRerun,
    onTerminate: handleTerminate,
    statusFilters
  });

  return (
    <div className={styles['execution-log-page']}>
      <PageHeader
        showBack
        title={`执行记录 - ${taskName}`}
        subTitle="查看数据任务的运行实例、执行状态及操作记录"
        backPath={backPath}
      />

      <div className={styles['execution-log-divider']} />

      <div className={styles['execution-log-content']}>
        <SearchTable
          tableProps={{
            columns,
            data,
            loading,
            rowKey: 'id',
            border: false,
            pagination: false,
            scroll: { x: true },
            onChange: handleTableChange
          }}
        />

        {Number(pagination?.total) > 0 && (
          <div className="mt-[12px] flex items-center justify-end">
            <Pagination
              {...pagination}
              onChange={(page, pageSize) => {
                onChange(
                  {
                    ...pagination,
                    current: page,
                    pageSize
                  } as any,
                  undefined,
                  undefined
                );
              }}
            />
          </div>
        )}
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
