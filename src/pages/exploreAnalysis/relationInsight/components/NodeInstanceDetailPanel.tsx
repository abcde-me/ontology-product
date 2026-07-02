import React, { useMemo } from 'react';
import { Descriptions, Empty } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import type { KnowledgeGraphNodeData } from '../types';
import styles from '../index.module.scss';

interface NodeInstanceDetailPanelProps {
  data: KnowledgeGraphNodeData | null;
  onClose: () => void;
}

export const NodeInstanceDetailPanel: React.FC<
  NodeInstanceDetailPanelProps
> = ({ data, onClose }) => {
  const detailItems = useMemo(() => {
    if (!data) {
      return [];
    }

    if (data.detailFields?.length) {
      return data.detailFields;
    }

    return [
      { label: '对象类型', value: data.objectTypeName ?? data.subLabel ?? '-' },
      { label: '实例 ID', value: data.instanceId ?? '-' },
      { label: '名称', value: data.label }
    ];
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <div className={styles['node-detail-panel']}>
      <div className={styles['node-detail-header']}>
        <span className={styles['node-detail-title']}>实例详情</span>
        <button
          type="button"
          className={styles['node-detail-close']}
          onClick={onClose}
          aria-label="关闭"
        >
          <IconClose />
        </button>
      </div>
      <div className={styles['node-detail-name']}>{data.label}</div>
      {detailItems.length > 0 ? (
        <Descriptions
          column={1}
          size="small"
          border
          data={detailItems.map((item) => ({
            label: item.label,
            value: item.value
          }))}
        />
      ) : (
        <Empty description="暂无更多明细" />
      )}
    </div>
  );
};
