import React, { useMemo } from 'react';
import { Descriptions, Empty } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import type { KnowledgeGraphNodeData } from '@/pages/exploreAnalysis/relationInsight/types';
import styles from './ImplicitNodeDetailPanel.module.scss';

interface ImplicitNodeDetailPanelProps {
  data: KnowledgeGraphNodeData | null;
  onClose: () => void;
}

export default function ImplicitNodeDetailPanel({
  data,
  onClose
}: ImplicitNodeDetailPanelProps) {
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
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>实例属性</span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="关闭"
        >
          <IconClose />
        </button>
      </div>
      <div className={styles.name}>{data.label}</div>
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
        <Empty description="暂无属性信息" />
      )}
    </div>
  );
}
