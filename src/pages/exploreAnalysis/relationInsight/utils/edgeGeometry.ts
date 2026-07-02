import type { Node } from 'reactflow';
import type { KnowledgeGraphNodeData } from '../types';

interface Point {
  x: number;
  y: number;
}

interface CircleMetrics extends Point {
  radius: number;
}

export const getNodeCircleMetrics = (
  node: Node<KnowledgeGraphNodeData>
): CircleMetrics | null => {
  const { data, positionAbsolute, width } = node;
  if (!positionAbsolute) {
    return null;
  }

  const size = data.size;
  const borderOffset = data.isFocus ? 3 : 0;
  const radius = size / 2 + borderOffset;
  const nodeWidth = width ?? size;

  return {
    x: positionAbsolute.x + nodeWidth / 2,
    y: positionAbsolute.y + size / 2,
    radius
  };
};

const getCircleIntersectionPoint = (
  from: CircleMetrics,
  toward: Point
): Point => {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;

  return {
    x: from.x + (dx / len) * from.radius,
    y: from.y + (dy / len) * from.radius
  };
};

export const buildCenterStraightEdge = (
  sourceNode: Node<KnowledgeGraphNodeData>,
  targetNode: Node<KnowledgeGraphNodeData>
): { path: string; labelX: number; labelY: number } | null => {
  const sourceCircle = getNodeCircleMetrics(sourceNode);
  const targetCircle = getNodeCircleMetrics(targetNode);

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
