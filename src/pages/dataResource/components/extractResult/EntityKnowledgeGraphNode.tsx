import React from 'react';
import classNames from 'classnames';
import { Handle, Position, useStore, type NodeProps } from 'reactflow';
import styles from '../../index.module.scss';

export interface EntityGraphNodeData {
  label: string;
  type: string;
  color: string;
  highlighted: boolean;
  connected: boolean;
  dimmed: boolean;
}

const NODE_SIZE = 72;

export const EntityKnowledgeGraphNode: React.FC<
  NodeProps<EntityGraphNodeData>
> = ({ id, data }) => {
  const dragging = useStore((store) =>
    Boolean(store.nodeInternals.get(id)?.dragging)
  );

  const { highlighted, connected, dimmed } = data;

  return (
    <div
      className={classNames(styles['entity-kg-node'], {
        [styles['entity-kg-node-highlighted']]: highlighted,
        [styles['entity-kg-node-connected']]: connected && !highlighted,
        [styles['entity-kg-node-dimmed']]: dimmed,
        [styles['entity-kg-node-dragging']]: dragging
      })}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={styles['entity-kg-node-handle']}
      />
      <div
        className={styles['entity-kg-node-circle']}
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          background: data.color
        }}
        title={data.label}
      >
        <span className={styles['entity-kg-node-label']} title={data.label}>
          {data.label}
        </span>
      </div>
      <div className={styles['entity-kg-node-type']} title={data.type}>
        {data.type}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles['entity-kg-node-handle']}
      />
    </div>
  );
};
