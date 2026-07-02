import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Message } from '@arco-design/web-react';
import { SearchTable } from '@ceai-front/arco-material';
import { IconSearch } from '@ceai-front/svg-icons';
import { useHistory } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useArcoTable } from '@/hooks';
import { FILE_EXTRACT_RESULT_PATH } from './constants/fileExtract';
import { useExtractTaskColumns } from './hooks/useExtractTaskColumns';
import {
  deleteFileExtractTask,
  listAllFileExtractTasks
} from './services/fileExtractStorage';
import type { FileExtractTask } from './types/fileExtract';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/dataConnection/dataResource';

export default function FileExtractTaskListPage() {
  const history = useHistory();
  const [form] = Form.useForm();
  const [deletingId, setDeletingId] = useState<string>();

  const { onSubmit, tableProps, refresh } = useArcoTable<FileExtractTask>(
    ({ query, pagination }) => {
      const filter = String(
        (query as unknown as { filter?: string })?.filter || ''
      )
        .trim()
        .toLowerCase();
      const allTasks = listAllFileExtractTasks();
      const filtered = filter
        ? allTasks.filter(
            (task) =>
              task.fileName.toLowerCase().includes(filter) ||
              task.requirement.toLowerCase().includes(filter)
          )
        : allTasks;

      const pageNo = pagination.current || 1;
      const pageSize = pagination.pageSize || 10;
      const start = (pageNo - 1) * pageSize;

      return Promise.resolve({
        items: filtered.slice(start, start + pageSize),
        total: filtered.length
      });
    },
    {
      form,
      defaultPageSize: 10
    }
  );

  useEffect(() => {
    const hasActiveTask = (tableProps.data || []).some(
      (task) => task.status === 'pending' || task.status === 'running'
    );
    if (!hasActiveTask) {
      return;
    }

    const timer = window.setInterval(() => {
      refresh();
    }, 1500);

    return () => window.clearInterval(timer);
  }, [refresh, tableProps.data]);

  const handleViewDetail = useCallback(
    (record: FileExtractTask) => {
      history.push(`${FILE_EXTRACT_RESULT_PATH}/${record.id}`);
    },
    [history]
  );

  const handleDelete = useCallback(
    (record: FileExtractTask) => {
      setDeletingId(record.id);
      try {
        const deleted = deleteFileExtractTask(record.id);
        if (!deleted) {
          Message.error('提取任务不存在或已被删除');
          return;
        }
        Message.success(`「${record.fileName}」提取任务已删除`);
        refresh();
      } finally {
        setDeletingId(undefined);
      }
    },
    [refresh]
  );

  const columns = useExtractTaskColumns({
    onViewDetail: handleViewDetail,
    onDelete: handleDelete,
    deletingId
  });

  return (
    <div className={styles['extract-task-list-page']}>
      <PageHeader
        className="flex-shrink-0"
        title="文件提取列表"
        showBack
        backPath={LIST_PATH}
        subTitle="查看文件信息提取任务状态与结果"
      />

      <div className={styles['extract-task-list-content']}>
        <SearchTable
          searchForm={
            <Form form={form} autoComplete="off" className="w-[280px]">
              <Form.Item noStyle field="filter">
                <Input
                  placeholder="请输入文件名或提取要求"
                  allowClear
                  onChange={onSubmit}
                  suffix={<IconSearch />}
                />
              </Form.Item>
            </Form>
          }
          tableProps={{
            columns,
            ...tableProps,
            rowKey: 'id',
            border: false,
            tableLayoutFixed: true,
            scroll: { x: 860 }
          }}
        />
      </div>
    </div>
  );
}
