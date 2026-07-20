import React, { useEffect, useRef, useState } from 'react';
import { Drawer, Empty, Spin, Tag } from '@arco-design/web-react';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type { DiscoveredImplicitRelation } from '../types';
import {
  summarizeRelationEvidence,
  type EvidenceSummarySource
} from '../services/summarizeEvidence';
import EditableRelationName from './EditableRelationName';
import styles from './EvidenceDrawer.module.scss';

interface EvidenceDrawerProps {
  visible: boolean;
  discovery: DiscoveredImplicitRelation | null;
  onClose: () => void;
  onRename?: (discoveryId: string, name: string) => void;
}

export default function EvidenceDrawer({
  visible,
  discovery,
  onClose,
  onRename
}: EvidenceDrawerProps) {
  const [aiSummary, setAiSummary] = useState<string>();
  const [aiSource, setAiSource] = useState<EvidenceSummarySource>();
  const [aiLoading, setAiLoading] = useState(false);
  const cacheRef = useRef<
    Map<string, { summary: string; source: EvidenceSummarySource }>
  >(new Map());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!visible || !discovery) {
      abortRef.current?.abort();
      abortRef.current = null;
      setAiSummary(undefined);
      setAiSource(undefined);
      setAiLoading(false);
      return;
    }

    const cached = cacheRef.current.get(discovery.id);
    if (cached) {
      setAiSummary(cached.summary);
      setAiSource(cached.source);
      setAiLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAiLoading(true);
    setAiSummary(undefined);
    setAiSource(undefined);

    void summarizeRelationEvidence({
      discovery,
      signal: controller.signal
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        cacheRef.current.set(discovery.id, result);
        setAiSummary(result.summary);
        setAiSource(result.source);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setAiSummary('暂时无法生成通俗解读，请先查看下方证据链。');
        setAiSource('local');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAiLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [visible, discovery]);

  return (
    <Drawer
      width={420}
      title="关系证据"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      {!discovery ? (
        <Empty description="请选择一条发现详情" />
      ) : (
        <div className={styles.body}>
          <div className={styles.nameRow}>
            <span className={styles.nameLabel}>关系名称</span>
            {onRename ? (
              <EditableRelationName
                value={discovery.suggestedName}
                size="small"
                onChange={(name) => onRename(discovery.id, name)}
              />
            ) : (
              <span className={styles.relationName}>
                {discovery.suggestedName}
              </span>
            )}
          </div>
          <div className={styles.pair}>
            <span className={styles.node}>{discovery.sourceNodeName}</span>
            <span className={styles.arrow}>⇢</span>
            <span className={styles.node}>{discovery.targetNodeName}</span>
          </div>
          <div className={styles.meta}>
            <Tag color="orangered" size="small">
              {DISCOVERY_ALGORITHM_LABEL[discovery.algorithm]}
            </Tag>
            <Tag size="small">置信度 {discovery.confidence.toFixed(2)}</Tag>
          </div>

          <div className={styles.aiCard}>
            <div className={styles.aiHeader}>
              <span className={styles.sectionTitle}>AI 通俗解读</span>
              {aiSource ? (
                <Tag
                  size="small"
                  color={aiSource === 'llm' ? 'arcoblue' : 'gray'}
                >
                  {aiSource === 'llm' ? '大模型' : '本地'}
                </Tag>
              ) : null}
            </div>
            {aiLoading ? (
              <div className={styles.aiLoading}>
                <Spin tip="正在生成通俗说明..." />
              </div>
            ) : (
              <div className={styles.aiSummary}>
                {aiSummary || '暂无通俗解读'}
              </div>
            )}
          </div>

          <div className={styles.sectionTitle}>证据链</div>
          <div className={styles.evidenceList}>
            {discovery.evidence.map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className={styles.evidenceCard}
              >
                <div className={styles.evidenceTitle}>
                  {index + 1}. {item.title}
                </div>
                <div className={styles.evidenceDetail}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
