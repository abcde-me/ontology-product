import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Spin, Table, Typography } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { OntoModal } from '@/components/OSModal';
import type { DataSourceNodeConfig } from '@/pages/dataTask/types';
import {
  getPreviewSourceTypeLabel,
  previewDataSource,
  type DataSourcePreviewResult
} from '@/pages/dataTask/services/previewDataSource';
import { useUserInfoStore } from '@/store/userInfoStore';
import styles from './DataSourcePreviewModal.module.scss';

interface DataSourcePreviewModalProps {
  visible: boolean;
  config: DataSourceNodeConfig | null;
  onClose: () => void;
}

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

export default function DataSourcePreviewModal({
  visible,
  config,
  onClose
}: DataSourcePreviewModalProps) {
  const getEffectiveProjectId = useUserInfoStore(
    (state) => state.getEffectiveProjectId
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<DataSourcePreviewResult | null>(null);

  useEffect(() => {
    if (!visible || !config) {
      setPreview(null);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    setPreview(null);

    void previewDataSource(config, getEffectiveProjectId())
      .then((result) => {
        if (!active) {
          return;
        }
        setPreview(result);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : '数据预览失败');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [config, getEffectiveProjectId, visible]);

  const columns = useMemo<ColumnProps<Record<string, unknown>>[]>(() => {
    if (!preview?.columns.length) {
      return [];
    }

    return preview.columns.map((column) => ({
      title: column.title,
      dataIndex: column.dataIndex,
      width: 180,
      ellipsis: true,
      render: (value: unknown) => (
        <GlobalTooltip.Ellipsis text={formatCellValue(value)} />
      )
    }));
  }, [preview?.columns]);

  const tableMinWidth = useMemo(() => {
    const count = preview?.columns.length ?? 0;
    return Math.max(640, count * 180);
  }, [preview?.columns.length]);

  const title = config
    ? `数据预览 - ${getPreviewSourceTypeLabel(config.sourceType)}`
    : '数据预览';

  const renderBody = () => {
    if (error) {
      return (
        <div className={styles['preview-empty']}>
          <Typography.Paragraph type="secondary">{error}</Typography.Paragraph>
        </div>
      );
    }

    if (!preview?.rows.length) {
      return (
        <div className={styles['preview-empty']}>
          <Empty description={preview?.message || '暂无预览数据'} />
        </div>
      );
    }

    return (
      <>
        {preview.message ? (
          <div className={styles['preview-tip']}>{preview.message}</div>
        ) : null}
        <Table
          className={styles['preview-table']}
          size="small"
          stripe
          border={false}
          pagination={false}
          scroll={{ x: tableMinWidth, y: 420 }}
          rowKey={(_, index) => String(index)}
          columns={columns}
          data={preview.rows}
        />
      </>
    );
  };

  return (
    <OntoModal
      title={title}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: 960 }}
      unmountOnExit
    >
      <Spin loading={loading} className={styles['preview-spin']}>
        {renderBody()}
      </Spin>
    </OntoModal>
  );
}
