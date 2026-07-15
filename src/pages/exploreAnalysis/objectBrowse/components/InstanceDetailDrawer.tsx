import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Message,
  Popconfirm,
  Space,
  Tag,
  Typography
} from '@arco-design/web-react';
import type { InstanceQueryRow } from '../types';
import {
  getInstanceDisplayFields,
  resolveInstanceId
} from '../utils/instanceRow';
import type { FieldCommentMap } from '../utils/fieldDisplayLabel';
import {
  listAttachedRelationsForInstance,
  removeAttachedRelation,
  type AttachedImplicitRelation
} from '@/pages/exploreAnalysis/implicitRelation/services/attachedRelationStore';
import { DISCOVERY_ALGORITHM_LABEL } from '@/pages/exploreAnalysis/implicitRelation/constants';
import styles from './InstanceDetailDrawer.module.scss';

interface InstanceDetailDrawerProps {
  visible: boolean;
  record: InstanceQueryRow | null;
  sceneId?: number;
  objectTypeId?: number;
  fieldCommentMap?: FieldCommentMap;
  vectorFieldNames?: Set<string>;
  onClose: () => void;
}

export const InstanceDetailDrawer: React.FC<InstanceDetailDrawerProps> = ({
  visible,
  record,
  sceneId,
  objectTypeId,
  fieldCommentMap,
  vectorFieldNames,
  onClose
}) => {
  const [attachedRelations, setAttachedRelations] = useState<
    AttachedImplicitRelation[]
  >([]);

  const fields = useMemo(
    () =>
      record
        ? getInstanceDisplayFields(record, fieldCommentMap, vectorFieldNames)
        : [],
    [fieldCommentMap, record, vectorFieldNames]
  );

  const instanceId = record ? resolveInstanceId(record) : undefined;

  const reloadAttached = () => {
    if (
      !visible ||
      sceneId == null ||
      objectTypeId == null ||
      instanceId == null ||
      instanceId === ''
    ) {
      setAttachedRelations([]);
      return;
    }
    setAttachedRelations(
      listAttachedRelationsForInstance({
        sceneId,
        objectTypeId,
        instanceId: String(instanceId)
      })
    );
  };

  useEffect(() => {
    reloadAttached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, sceneId, objectTypeId, instanceId]);

  const handleRemove = (attachId: string) => {
    removeAttachedRelation(attachId);
    Message.success('已移除隐式关系');
    reloadAttached();
  };

  return (
    <Drawer
      width={560}
      title="实例明细"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {fields.length > 0 ? (
        <Descriptions
          column={1}
          border
          data={fields.map((item) => ({
            label: item.label,
            value: item.value
          }))}
        />
      ) : (
        <div>暂无明细数据</div>
      )}

      <div className={styles.relationSection}>
        <div className={styles.relationTitle}>
          隐式关系
          <Tag size="small" color="orangered">
            {attachedRelations.length}
          </Tag>
        </div>
        {attachedRelations.length === 0 ? (
          <Empty description="暂无挂接的隐式关系（可在关系挖掘中勾选后「添加到实例」）" />
        ) : (
          <div className={styles.relationList}>
            {attachedRelations.map((item) => (
              <div key={item.attachId} className={styles.relationCard}>
                <div className={styles.relationPair}>
                  <span className={styles.currentLabel}>
                    {item.instanceLabel || item.instanceId}
                  </span>
                  <span className={styles.arrow}>
                    {item.direction === 'out' ? '⇢' : '⇠'}
                  </span>
                  <span className={styles.peerLabel}>
                    {item.peerInstanceLabel || item.peerInstanceId}
                  </span>
                </div>
                <div className={styles.relationMeta}>
                  <Space size={6} wrap>
                    <Tag size="small">{item.suggestedName}</Tag>
                    <Tag size="small">
                      {DISCOVERY_ALGORITHM_LABEL[item.algorithm] ||
                        item.algorithm}
                    </Tag>
                    <Tag size="small" color="orangered">
                      置信度 {item.confidence.toFixed(2)}
                    </Tag>
                  </Space>
                </div>
                {item.evidenceTitles?.length ? (
                  <Typography.Text
                    type="secondary"
                    className={styles.evidenceText}
                  >
                    证据：{item.evidenceTitles.join('；')}
                  </Typography.Text>
                ) : null}
                <div className={styles.relationActions}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    来自任务：{item.taskName || item.taskId}
                  </Typography.Text>
                  <Popconfirm
                    title="确认移除此隐式关系挂接？"
                    onOk={() => handleRemove(item.attachId)}
                  >
                    <Button type="text" size="mini" status="danger">
                      移除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
