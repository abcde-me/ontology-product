import React, { useMemo } from 'react';
import { Empty, Modal, Tag } from '@arco-design/web-react';
import dayjs from 'dayjs';
import {
  AXIOM_SOURCE_COLOR,
  AXIOM_SOURCE_LABEL
} from '@/pages/knowledgeManagement/domainAxiom/constants';
import { getDomainAxiom } from '@/pages/knowledgeManagement/domainAxiom/services/axiomStorage';
import type { DomainAxiom } from '@/pages/knowledgeManagement/domainAxiom/types';
import styles from '../index.module.scss';

interface DomainAxiomsPreviewModalProps {
  visible: boolean;
  axiomIds?: string[];
  taskName?: string;
  onCancel: () => void;
}

export default function DomainAxiomsPreviewModal({
  visible,
  axiomIds,
  taskName,
  onCancel
}: DomainAxiomsPreviewModalProps) {
  const axioms = useMemo(() => {
    if (!visible || !axiomIds?.length) {
      return [] as DomainAxiom[];
    }
    return axiomIds
      .map((id) => getDomainAxiom(id))
      .filter(Boolean) as DomainAxiom[];
  }, [axiomIds, visible]);

  const missingCount = (axiomIds?.length || 0) - axioms.length;

  return (
    <Modal
      title={taskName ? `领域公理 · ${taskName}` : '领域公理'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      unmountOnExit
      style={{ width: 720 }}
    >
      {!axiomIds?.length ? (
        <Empty description="该任务未关联领域公理" />
      ) : !axioms.length ? (
        <Empty description="关联的领域公理已不存在或已被删除" />
      ) : (
        <div className={styles.previewList}>
          {axioms.map((item) => (
            <div key={item.id} className={styles.previewCard}>
              <div className={styles.previewCardHeader}>
                <div className={styles.previewCardTitle}>{item.name}</div>
                <Tag
                  size="small"
                  color={AXIOM_SOURCE_COLOR[item.sourceType] || 'gray'}
                >
                  {AXIOM_SOURCE_LABEL[item.sourceType] || item.sourceType}
                </Tag>
                <Tag size="small" color={item.enabled ? 'green' : 'gray'}>
                  {item.enabled ? '已启用' : '已停用'}
                </Tag>
              </div>
              <div className={styles.previewMetaGrid}>
                <div>
                  <span className={styles.previewMetaLabel}>所属领域</span>
                  <div className={styles.previewMetaValue}>
                    {item.domain || '-'}
                  </div>
                </div>
                <div>
                  <span className={styles.previewMetaLabel}>关联本体场景</span>
                  <div className={styles.previewMetaValue}>
                    {item.ontologySceneName ||
                      (item.ontologySceneId
                        ? `场景 #${item.ontologySceneId}`
                        : '-')}
                  </div>
                </div>
                <div>
                  <span className={styles.previewMetaLabel}>应用场景</span>
                  <div className={styles.previewMetaValue}>
                    {item.applicationScenarioName || '-'}
                  </div>
                </div>
                <div>
                  <span className={styles.previewMetaLabel}>创建人</span>
                  <div className={styles.previewMetaValue}>
                    {item.creator || '-'}
                  </div>
                </div>
                <div className={styles.previewMetaFull}>
                  <span className={styles.previewMetaLabel}>公理表达式</span>
                  <div className={styles.previewExpression}>
                    {item.expression || '-'}
                  </div>
                </div>
                <div className={styles.previewMetaFull}>
                  <span className={styles.previewMetaLabel}>描述</span>
                  <div className={styles.previewMetaValue}>
                    {item.description || '-'}
                  </div>
                </div>
                <div>
                  <span className={styles.previewMetaLabel}>源文件</span>
                  <div className={styles.previewMetaValue}>
                    {item.sourceFileName || '-'}
                  </div>
                </div>
                <div>
                  <span className={styles.previewMetaLabel}>更新时间</span>
                  <div className={styles.previewMetaValue}>
                    {item.updatedAt
                      ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {missingCount > 0 ? (
            <div className={styles.previewMissingHint}>
              另有 {missingCount} 条关联公理已删除或不可用
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
