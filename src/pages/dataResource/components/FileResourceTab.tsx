import React, { useCallback, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Typography,
  Upload
} from '@arco-design/web-react';
import type { RequestOptions } from '@arco-design/web-react/es/Upload';
import { IconHistory, IconUpload } from '@arco-design/web-react/icon';
import { SearchTable } from '@ceai-front/arco-material';
import { IconSearch } from '@ceai-front/svg-icons';
import { useHistory } from 'react-router-dom';
import { useArcoTable } from '@/hooks';
import { FILE_EXTRACT_TASK_LIST_PATH } from '../constants/fileExtract';
import { useFileColumns } from '../hooks/useFileColumns';
import type { FileResourceListItem } from '../types';
import {
  FILE_UPLOAD_ACCEPT,
  FILE_UPLOAD_MAX_SIZE_MB
} from '../utils/fileFormat';
import {
  deleteFileResource,
  fetchFileResourceList,
  uploadFileResource
} from '../services/fileApi';
import { FilePreviewModal } from './FilePreviewModal';
import { FileExtractModal } from './FileExtractModal';
import { buildDataResourcePagination } from '../utils/tablePagination';
import styles from '../index.module.scss';

interface FileResourceTabProps {
  onStatsChange?: () => void;
}

export const FileResourceTab: React.FC<FileResourceTabProps> = ({
  onStatsChange
}) => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [previewRecord, setPreviewRecord] =
    useState<FileResourceListItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [extractRecord, setExtractRecord] =
    useState<FileResourceListItem | null>(null);
  const [extractVisible, setExtractVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string>();

  const handlePreview = useCallback((record: FileResourceListItem) => {
    setPreviewRecord(record);
    setPreviewVisible(true);
  }, []);

  const handleExtract = useCallback((record: FileResourceListItem) => {
    setExtractRecord(record);
    setExtractVisible(true);
  }, []);

  const { onSubmit, tableProps, refresh } = useArcoTable<FileResourceListItem>(
    async ({ query, pagination }) => {
      const result = await fetchFileResourceList({
        pageNo: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
        filter: (query as unknown as { filter?: string })?.filter
      });

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      form,
      defaultPageSize: 10
    }
  );

  const handleDelete = useCallback(
    async (record: FileResourceListItem) => {
      setDeletingId(record.id);
      try {
        await deleteFileResource(record.id);
        Message.success(`「${record.fileName}」已删除`);
        if (previewRecord?.id === record.id) {
          setPreviewVisible(false);
          setPreviewRecord(null);
        }
        refresh();
        onStatsChange?.();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '文件删除失败';
        Message.error(message);
      } finally {
        setDeletingId(undefined);
      }
    },
    [onStatsChange, previewRecord?.id, refresh]
  );

  const columns = useFileColumns({
    onPreview: handlePreview,
    onExtract: handleExtract,
    onDelete: handleDelete,
    deletingId
  });

  const handleUpload = async (option: RequestOptions) => {
    const { file } = option;
    if (!file) {
      return;
    }

    const maxBytes = FILE_UPLOAD_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      const error = new Error(`文件大小不能超过 ${FILE_UPLOAD_MAX_SIZE_MB}MB`);
      Message.error(error.message);
      option.onError?.(error);
      return;
    }

    setUploading(true);
    try {
      await uploadFileResource(file);
      Message.success('文件上传成功');
      refresh();
      onStatsChange?.();
      option.onSuccess?.({});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '文件上传失败';
      Message.error(message);
      option.onError?.(error instanceof Error ? error : new Error(message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className={styles['data-resource-table-card']}>
        <SearchTable
          className={styles['data-resource-search-table']}
          searchForm={
            <div className={styles['file-resource-toolbar']}>
              <div className={styles['file-resource-toolbar-left']}>
                <Form
                  form={form}
                  autoComplete="off"
                  className={styles['data-resource-search-form']}
                >
                  <Form.Item noStyle field="filter">
                    <Input
                      placeholder="请输入文件名称或格式"
                      allowClear
                      onChange={onSubmit}
                      prefix={<IconSearch />}
                      className={styles['data-resource-search-input']}
                    />
                  </Form.Item>
                </Form>
                <Typography.Text
                  type="secondary"
                  className={styles['file-resource-hint']}
                >
                  支持 PDF、CSV、TXT、图片等格式，可用于信息提取与本体建模
                </Typography.Text>
              </div>
              <div className={styles['file-resource-actions']}>
                <Upload
                  accept={FILE_UPLOAD_ACCEPT}
                  showUploadList={false}
                  multiple={false}
                  customRequest={handleUpload}
                >
                  <Button
                    type="primary"
                    icon={<IconUpload />}
                    loading={uploading}
                  >
                    文件上传
                  </Button>
                </Upload>
                <Button
                  type="outline"
                  icon={<IconHistory />}
                  onClick={() => history.push(FILE_EXTRACT_TASK_LIST_PATH)}
                >
                  文件提取列表
                </Button>
              </div>
            </div>
          }
          tableProps={{
            columns,
            ...tableProps,
            rowKey: 'id',
            border: false,
            scroll: { x: true },
            className: styles['data-resource-table'],
            pagination: buildDataResourcePagination(tableProps.pagination)
          }}
        />
      </div>

      <FilePreviewModal
        visible={previewVisible}
        record={previewRecord}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewRecord(null);
        }}
      />

      <FileExtractModal
        visible={extractVisible}
        record={extractRecord}
        onClose={() => {
          setExtractVisible(false);
          setExtractRecord(null);
        }}
      />
    </>
  );
};
