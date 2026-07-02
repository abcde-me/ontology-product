import React, { useMemo } from 'react';
import { Button, Popconfirm, Space } from '@arco-design/web-react';
import type { TableColumnProps } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { FileFormatBadge, FileNameCell } from '../components/FileFormatBadge';
import type { FileResourceListItem } from '../types';
import { formatFileSize } from '../utils/formatFileSize';
import styles from '../index.module.scss';

interface UseFileColumnsProps {
  onPreview: (record: FileResourceListItem) => void;
  onExtract: (record: FileResourceListItem) => void;
  onDelete: (record: FileResourceListItem) => void;
  deletingId?: string;
}

export const useFileColumns = ({
  onPreview,
  onExtract,
  onDelete,
  deletingId
}: UseFileColumnsProps) => {
  const columns: TableColumnProps<FileResourceListItem>[] = useMemo(
    () => [
      {
        title: '文件名称',
        dataIndex: 'fileName',
        ellipsis: true,
        render: (value, record) => (
          <FileNameCell
            fileName={value || '-'}
            fileFormat={record.fileFormat}
            onClick={() => onPreview(record)}
          />
        )
      },
      {
        title: '文件大小',
        dataIndex: 'fileSize',
        width: 120,
        render: (size: number) => (
          <span className={styles['file-size-text']}>
            {formatFileSize(size)}
          </span>
        )
      },
      {
        title: '文件格式',
        dataIndex: 'fileFormat',
        width: 120,
        render: (value) => <FileFormatBadge format={value || '-'} />
      },
      {
        title: '操作',
        dataIndex: 'actions',
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <Button
              type="text"
              className={styles['table-action']}
              onClick={() => onPreview(record)}
            >
              预览
            </Button>
            <Button
              type="text"
              className={styles['table-action']}
              onClick={() => onExtract(record)}
            >
              提取
            </Button>
            <Popconfirm
              title="确认删除该文件？删除后不可恢复。"
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
    [deletingId, onDelete, onExtract, onPreview]
  );

  return columns;
};
