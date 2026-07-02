import React, { useCallback, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useStore,
  type EdgeProps,
  type Node
} from 'reactflow';
import type { EntityGraphNodeData } from './EntityKnowledgeGraphNode';
import styles from '../../index.module.scss';

const NODE_SIZE = 72;
const NODE_WIDTH = 96;
const CIRCLE_BORDER = 2;

interface CircleMetrics {
  x: number;
  y: number;
  radius: number;
}

const getCircleMetrics = (
  node: Node<EntityGraphNodeData>
): CircleMetrics | null => {
  if (!node.positionAbsolute) {
    return null;
  }

  return {
    x: node.positionAbsolute.x + NODE_WIDTH / 2,
    y: node.positionAbsolute.y + NODE_SIZE / 2,
    radius: NODE_SIZE / 2 + CIRCLE_BORDER
  };
};

const getCircleIntersectionPoint = (
  from: CircleMetrics,
  toward: { x: number; y: number }
): { x: number; y: number } => {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;

  return {
    x: from.x + (dx / len) * from.radius,
    y: from.y + (dy / len) * from.radius
  };
};

const buildCenterStraightEdge = (
  sourceNode: Node<EntityGraphNodeData>,
  targetNode: Node<EntityGraphNodeData>
): { path: string; labelX: number; labelY: number } | null => {
  const sourceCircle = getCircleMetrics(sourceNode);
  const targetCircle = getCircleMetrics(targetNode);

  if (!sourceCircle || !targetCircle) {
    return null;
  }

  const sourcePoint = getCircleIntersectionPoint(sourceCircle, targetCircle);
  const targetPoint = getCircleIntersectionPoint(targetCircle, sourceCircle);

  return {
    path: `M ${sourcePoint.x},${sourcePoint.y} L ${targetPoint.x},${targetPoint.y}`,
    labelX: (sourcePoint.x + targetPoint.x) / 2,
    labelY: (sourcePoint.y + targetPoint.y) / 2
  };
};

export const EntityStraightEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style,
  markerEnd,
  labelStyle
}) => {
  const sourceNode = useStore(
    useCallback(
      (store) =>
        store.nodeInternals.get(source) as
          | Node<EntityGraphNodeData>
          | undefined,
      [source]
    )
  );
  const targetNode = useStore(
    useCallback(
      (store) =>
        store.nodeInternals.get(target) as
          | Node<EntityGraphNodeData>
          | undefined,
      [target]
    )
  );

  const { path, labelX, labelY } = useMemo(() => {
    if (sourceNode && targetNode) {
      const centerEdge = buildCenterStraightEdge(sourceNode, targetNode);
      if (centerEdge) {
        return centerEdge;
      }
    }

    const [fallbackPath, fallbackLabelX, fallbackLabelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY
    });

    return {
      path: fallbackPath,
      labelX: fallbackLabelX,
      labelY: fallbackLabelY
    };
  }, [sourceNode, targetNode, sourceX, sourceY, targetX, targetY]);

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className={styles['entity-kg-edge-label']}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color: labelStyle?.fill,
              fontSize: labelStyle?.fontSize,
              fontWeight: labelStyle?.fontWeight
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};
