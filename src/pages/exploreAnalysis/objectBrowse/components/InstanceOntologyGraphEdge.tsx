import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps
} from 'reactflow';
import styles from './InstanceOntologyGraphEdge.module.scss';

export const InstanceOntologyGraphEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  label
}) => {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
    offset: 20
  });
  const edgeLabel = data?.linkName || label;
  const strokeColor = data?.edgeColor || '#3B82F6';

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5
        }}
      />
      {edgeLabel ? (
        <EdgeLabelRenderer>
          <div
            className={styles.label}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`
            }}
          >
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};
