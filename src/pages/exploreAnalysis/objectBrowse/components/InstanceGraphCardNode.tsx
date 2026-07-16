import React from 'react';
import classNames from 'classnames';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { KnowledgeGraphNodeData } from '@/pages/exploreAnalysis/relationInsight/types';
import styles from './InstanceGraphCardNode.module.scss';

const MAX_VISIBLE_FIELDS = 4;

export const InstanceGraphCardNode: React.FC<
  NodeProps<KnowledgeGraphNodeData>
> = ({ data, selected }) => {
  const fields = (data.detailFields || []).slice(0, MAX_VISIBLE_FIELDS);
  const hiddenCount = Math.max(
    0,
    (data.detailFields?.length || 0) - MAX_VISIBLE_FIELDS
  );

  return (
    <div
      className={classNames(styles.card, {
        [styles.cardFocus]: data.isFocus,
        [styles.cardSelected]: selected
      })}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={styles.handle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={styles.handle}
      />

      <div className={styles.header}>
        <div className={styles.title} title={data.label}>
          {data.label}
        </div>
        {data.objectTypeName ? (
          <div className={styles.typeTag} title={data.objectTypeName}>
            {data.objectTypeName}
          </div>
        ) : null}
      </div>

      <div className={styles.body}>
        {fields.length ? (
          fields.map((field) => (
            <div key={`${field.label}-${field.value}`} className={styles.field}>
              <span className={styles.fieldLabel}>{field.label}</span>
              <span className={styles.fieldValue} title={field.value}>
                {field.value}
              </span>
            </div>
          ))
        ) : (
          <div className={styles.emptyField}>暂无属性信息</div>
        )}
        {hiddenCount > 0 ? (
          <div className={styles.moreHint}>还有 {hiddenCount} 项属性</div>
        ) : null}
      </div>
    </div>
  );
};
