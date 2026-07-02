import React, { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import type { TableColumnProps } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import {
  FILE_EXTRACT_TASK_STATUS_LABEL,
  FILE_EXTRACT_TYPE_LABEL
} from '../constants/fileExtract';
import type { FileExtractTask } from '../types/fileExtract';
import styles from '../index.module.scss';

const statusColorMap = {
  pending: 'gray',
  running: 'arcoblue',
  completed: 'green',
  failed: 'red'
} as const;

interface UseExtractTaskColumnsProps {
  onViewDetail: (record: FileExtractTask) => void;
  onDelete: (record: FileExtractTask) => void;
  deletingId?: string;
}

export const useExtractTaskColumns = ({
  onViewDetail,
  onDelete,
  deletingId
}: UseExtractTaskColumnsProps) => {
  const columns: TableColumnProps<FileExtractTask>[] = useMemo(
    () => [
      {
        title: '文件名',
        dataIndex: 'fileName',
        width: 280,
        ellipsis: true,
        render: (value) => (
          <GlobalTooltip.Ellipsis
            text={value || '-'}
            className={styles['table-name']}
          />
        )
      },
      {
        title: '提取类型',
        dataIndex: 'extractType',
        width: 140,
        render: (value: FileExtractTask['extractType']) =>
          FILE_EXTRACT_TYPE_LABEL[value] || '-'
      },
      {
        title: '提取状态',
        dataIndex: 'status',
        width: 120,
        render: (value: FileExtractTask['status']) => (
          <Tag color={statusColorMap[value]}>
            {FILE_EXTRACT_TASK_STATUS_LABEL[value]}
          </Tag>
        )
      },
      {
        title: '提取时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (value) => value || '-'
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              className={styles['table-action']}
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            <Popconfirm
              title="确认删除该提取任务？删除后不可恢复。"
              onOk={() => onDelete(record)}
            >
              <Button
                type="text"
                className={styles['table-action']}
                status="danger"
                loading={deletingId === record.id}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [deletingId, onDelete, onViewDetail]
  );

  return columns;
};
