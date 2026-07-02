import React, { useEffect, useState } from 'react';
import { Spin, Typography } from '@arco-design/web-react';
import { OntoModal } from '@/components/OSModal';
import type {
  FileResourceListItem,
  FileResourcePreviewPayload
} from '../types';
import { getFileResourcePreview } from '../services/fileApi';
import { formatFileSize } from '../utils/formatFileSize';
import styles from '../index.module.scss';

interface FilePreviewModalProps {
  visible: boolean;
  record: FileResourceListItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  visible,
  record,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FileResourcePreviewPayload | null>(
    null
  );

  useEffect(() => {
    if (!visible || !record) {
      setPreview(null);
      return;
    }

    let active = true;
    setLoading(true);

    void getFileResourcePreview(record)
      .then((payload) => {
        if (active) {
          setPreview(payload);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [visible, record]);

  const renderBody = () => {
    if (!preview) {
      return null;
    }

    if (preview.mode === 'image' && preview.url) {
      return (
        <div className={styles['file-preview-image-wrap']}>
          <img
            src={preview.url}
            alt={preview.fileName}
            className={styles['file-preview-image']}
          />
        </div>
      );
    }

    if (preview.mode === 'pdf' && preview.url) {
      return (
        <iframe
          title={preview.fileName}
          src={preview.url}
          className={styles['file-preview-iframe']}
        />
      );
    }

    if (preview.mode === 'text' && preview.text) {
      return <pre className={styles['file-preview-text']}>{preview.text}</pre>;
    }

    return (
      <div className={styles['file-preview-placeholder']}>
        <Typography.Paragraph type="secondary">
          {preview.message}
        </Typography.Paragraph>
        {record ? (
          <div className={styles['file-preview-meta']}>
            <div>文件名称：{record.fileName}</div>
            <div>文件大小：{formatFileSize(record.fileSize)}</div>
            <div>文件格式：{record.fileFormat}</div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <OntoModal
      title={`文件预览 - ${record?.fileName ?? ''}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: preview?.mode === 'text' ? 720 : 960 }}
      unmountOnExit
    >
      <Spin loading={loading} className={styles['file-preview-spin']}>
        {renderBody()}
      </Spin>
    </OntoModal>
  );
};
