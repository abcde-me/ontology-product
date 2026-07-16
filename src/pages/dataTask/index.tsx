import React, { useEffect, useState } from 'react';
import { Form, Pagination, Message, Modal } from '@arco-design/web-react';
import { useHistory, useLocation } from 'react-router-dom';
import { SearchTable } from '@ceai-front/arco-material';
import { CreateDataTaskModal, PageHeader, SearchForm } from './components';
import { useTable } from '@/pages/dataSource/hooks/useTable';
import { useColumns } from './hooks/useColumns';
import type { DataTaskItem } from './types';
import { TaskType, ScheduleType, TaskStatus, ExecutionStatus } from './types';
import {
  createDataTask,
  fetchDataTaskList,
  deleteDataTask,
  copyDataTask,
  toggleDataTaskStatus
} from './services/api';
import { createEmptyWorkflowDraft } from './mocks/workflowDraftApi';
import { setWorkflowDraft } from './editor/services/draftApi';
import styles from './index.module.scss';

export default function DataTaskManagement() {
  const history = useHistory();
  const location = useLocation();
  const [form] = Form.useForm();
  const [createVisible, setCreateVisible] = useState(false);
  const [createInitialName, setCreateInitialName] = useState('');
  const [creating, setCreating] = useState(false);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string[]>([]);
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [executionStatusFilter, setExecutionStatusFilter] = useState<string[]>(
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') !== '1') {
      return;
    }
    const presetName = params.get('name')?.trim() || '';
    setCreateInitialName(presetName);
    setCreateVisible(true);
    params.delete('create');
    params.delete('name');
    const search = params.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : ''
    });
  }, [history, location.pathname, location.search]);

  const taskTypeFilters = [
    { text: '表-表同步', value: TaskType.TABLE_SYNC },
    { text: 'DAG工作流', value: TaskType.WORKFLOW_DAG }
  ];

  const scheduleTypeFilters = [
    { text: '周期调度', value: ScheduleType.PERIODIC },
    { text: '单次调度', value: ScheduleType.ONCE },
    { text: '立即执行', value: ScheduleType.IMMEDIATE }
  ];

  const statusFilters = [
    { text: '开发中', value: TaskStatus.DEVELOPING },
    { text: '发布中', value: TaskStatus.PUBLISHING },
    { text: '已上线', value: TaskStatus.ONLINE },
    { text: '已下线', value: TaskStatus.OFFLINE }
  ];

  const executionStatusFilters = [
    { text: '执行中', value: ExecutionStatus.RUNNING },
    { text: '执行成功', value: ExecutionStatus.SUCCESS },
    { text: '执行失败', value: ExecutionStatus.FAILED }
  ];

  const { data, loading, pagination, submit, onChange, refresh } = useTable<
    DataTaskItem,
    any
  >({
    service: async (params) => {
      const result = await fetchDataTaskList({
        pageNo: params.page || 1,
        pageSize: params.pageSize || 10,
        filter: params.keyword || '',
        taskTypes: taskTypeFilter.length > 0 ? taskTypeFilter : undefined,
        scheduleTypes:
          scheduleTypeFilter.length > 0 ? scheduleTypeFilter : undefined,
        statuses: statusFilter.length > 0 ? statusFilter : undefined,
        executionStatuses:
          executionStatusFilter.length > 0 ? executionStatusFilter : undefined
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
    deps: [
      taskTypeFilter,
      scheduleTypeFilter,
      statusFilter,
      executionStatusFilter
    ]
  });

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除该数据任务？删除后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDataTask(id);
          Message.success('删除成功');
          refresh();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        }
      }
    });
  };

  const handleCopy = async (record: DataTaskItem) => {
    try {
      await copyDataTask(record.id);
      Message.success('复制成功');
      refresh();
    } catch (error: any) {
      Message.error(error?.message || '复制失败');
    }
  };

  const handleViewDetail = (record: DataTaskItem) => {
    history.push(
      `/tenant/compute/onto/dataConnection/dataTask2/edit/${record.id}`
    );
  };

  const handleViewExecutionLog = (record: DataTaskItem) => {
    history.push(
      `/tenant/compute/onto/dataConnection/dataTask2/executionLog/${record.id}?taskName=${encodeURIComponent(record.name)}`
    );
  };

  const handleToggleStatus = async (record: DataTaskItem, online: boolean) => {
    try {
      await toggleDataTaskStatus(record.id, online);
      Message.success(online ? '上线成功' : '下线成功');
      refresh();
    } catch (error: any) {
      Message.error(error?.message || '操作失败');
    }
  };

  const handleAdd = () => {
    setCreateInitialName('');
    setCreateVisible(true);
  };

  const handleCreateSubmit = async (values: {
    name: string;
    description?: string;
  }) => {
    setCreating(true);
    try {
      const created = await createDataTask({
        name: values.name,
        description: values.description
      });
      const emptyDraft = createEmptyWorkflowDraft(created.id);
      setWorkflowDraft(emptyDraft, created.id);
      setCreateVisible(false);
      Message.success('创建成功');
      history.push(
        `/tenant/compute/onto/dataConnection/dataTask2/edit/${created.id}`
      );
    } catch (error: any) {
      Message.error(error?.message || '创建失败');
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const handleTableChange = (_pag: any, _sorter: any, filters: any) => {
    if (filters !== undefined) {
      setTaskTypeFilter(filters.taskType || []);
      setScheduleTypeFilter(filters.scheduleType || []);
      setStatusFilter(filters.status || []);
      setExecutionStatusFilter(filters.latestExecutionStatus || []);
    }

    onChange(_pag, _sorter, filters);
  };

  const columns = useColumns({
    onDelete: handleDelete,
    onCopy: handleCopy,
    onViewDetail: handleViewDetail,
    onViewExecutionLog: handleViewExecutionLog,
    onToggleStatus: handleToggleStatus,
    taskTypeFilters,
    scheduleTypeFilters,
    statusFilters,
    executionStatusFilters
  });

  return (
    <div className={styles['data-task-page']}>
      <PageHeader />

      <SearchTable
        className="mt-4"
        searchForm={
          <SearchForm form={form} onSearch={submit} onAdd={handleAdd} />
        }
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

      <CreateDataTaskModal
        visible={createVisible}
        loading={creating}
        initialName={createInitialName}
        onCancel={() => {
          setCreateVisible(false);
          setCreateInitialName('');
        }}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
