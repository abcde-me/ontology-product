import React, { memo } from 'react';
import type { EdgeProps } from 'reactflow';
import {
  BaseEdge,
  EdgeLabelRenderer,
  Position,
  getBezierPath
} from 'reactflow';
import styles from './custom-edge.module.scss';

interface CustomEdgeData {
  label?: string;
  labelIcon?: React.ReactNode;
  labelColor?: string;
  [key: string]: any;
}

const CustomEdge = ({
  id,
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style,
  markerEnd
}: EdgeProps) => {
  const edgeData = (data || {}) as CustomEdgeData;
  const { label, labelIcon, labelColor } = edgeData;

  // 计算贝塞尔曲线路径
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Left,
    curvature: 0.16
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: '#94a3b8', // 灰色虚线
          strokeWidth: 2,
          strokeDasharray: '5,5', // 虚线样式
          opacity: selected ? 1 : 0.8
        }}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className={styles['edge-label']}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: labelColor || '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#475569',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {labelIcon && (
              <span className={styles['edge-label-icon']}>{labelIcon}</span>
            )}
            <span className={styles['edge-label-text']}>{label}</span>
            <span
              className={styles['edge-label-dot']}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981', // 绿色圆点
                flexShrink: 0
              }}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CustomEdge);
