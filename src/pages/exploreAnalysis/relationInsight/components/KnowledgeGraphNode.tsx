import React from 'react';
import classNames from 'classnames';
import { Handle, Position, useStore, type NodeProps } from 'reactflow';
import type { KnowledgeGraphNodeData } from '../types';
import {
  FOCUS_NODE_BORDER,
  getFocusNodeGradient,
  getNodeDisplayColor,
  getNodeGradient,
  NODE_LABEL_COLOR,
  NODE_LABEL_SELECTED_COLOR
} from '../utils/nodeColors';
import styles from '../index.module.scss';

export const KnowledgeGraphNode: React.FC<
  NodeProps<KnowledgeGraphNodeData>
> = ({ id, data, selected }) => {
  const dragging = useStore((store) =>
    Boolean(store.nodeInternals.get(id)?.dragging)
  );
  const size = data.size;
  const isFocusNode = Boolean(data.isFocus);
  const labelFontSize = size >= 80 ? 12 : 11;

  const nodeFill = isFocusNode
    ? getFocusNodeGradient(selected)
    : getNodeGradient(getNodeDisplayColor(data, selected));
  const circleShadow = dragging
    ? '0 2px 8px rgba(15, 23, 42, 0.12)'
    : '0 2px 6px rgba(15, 23, 42, 0.1)';
  const circleBorder = isFocusNode
    ? `3px solid ${FOCUS_NODE_BORDER}`
    : selected
      ? '2px solid rgba(255, 255, 255, 0.95)'
      : '1px solid rgba(255, 255, 255, 0.35)';

  return (
    <div
      className={classNames(styles['kg-node-wrap'], {
        [styles['kg-node-wrap-focus']]: isFocusNode,
        [styles['kg-node-wrap-selected']]: selected && !isFocusNode
      })}
      style={{ width: size, height: size }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={styles['kg-node-handle']}
      />
      <div
        className={classNames(styles['kg-node-circle'], {
          [styles['kg-node-circle-focus']]: isFocusNode,
          [styles['kg-node-circle-neighbor']]: !isFocusNode,
          [styles['kg-node-circle-dragging']]: dragging,
          [styles['kg-node-circle-selected']]: selected
        })}
        style={{
          width: size,
          height: size,
          background: nodeFill,
          boxShadow: circleShadow,
          border: circleBorder
        }}
        title={data.label}
      >
        <span
          className={classNames(styles['kg-node-text'], {
            [styles['kg-node-text-selected']]: selected
          })}
          style={{
            fontSize: labelFontSize,
            maxWidth: `${Math.round(size * 0.72)}px`,
            color: selected ? NODE_LABEL_SELECTED_COLOR : NODE_LABEL_COLOR
          }}
          title={data.label}
        >
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles['kg-node-handle']}
      />
    </div>
  );
};
