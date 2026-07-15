import React, { useCallback, useMemo } from 'react';
import {
  BaseEdge,
  getStraightPath,
  useStore,
  type EdgeProps,
  type Node
} from 'reactflow';
import { useCanvasMode } from '../context/CanvasModeContext';
import { buildCenterStraightEdge } from '../utils/edgeGeometry';
import {
  DEFAULT_EDGE_COLOR,
  getNodeDisplayColor,
  shadeNodeColor
} from '../utils/nodeColors';
import type { KnowledgeGraphNodeData } from '../types';
import styles from '../index.module.scss';

const DEFAULT_EDGE_MARKER = {
  type: 'arrowclosed' as const,
  width: 14,
  height: 14
};

const getSelectedNode = (
  nodeInternals: Map<string, Node>
): Node<KnowledgeGraphNodeData> | undefined => {
  for (const node of nodeInternals.values()) {
    if (node.selected) {
      return node as Node<KnowledgeGraphNodeData>;
    }
  }

  return undefined;
};

export const KnowledgeGraphEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd
}) => {
  const canvasMode = useCanvasMode();
  const sourceNode = useStore(
    useCallback(
      (store) =>
        store.nodeInternals.get(source) as
          | Node<KnowledgeGraphNodeData>
          | undefined,
      [source]
    )
  );
  const targetNode = useStore(
    useCallback(
      (store) =>
        store.nodeInternals.get(target) as
          | Node<KnowledgeGraphNodeData>
          | undefined,
      [target]
    )
  );
  const selectedNode = useStore((store) =>
    getSelectedNode(store.nodeInternals)
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

  const isConnectedToSelected = Boolean(
    selectedNode && (source === selectedNode.id || target === selectedNode.id)
  );

  const edgeColor =
    isConnectedToSelected && selectedNode
      ? getNodeDisplayColor(selectedNode.data, true)
      : ((data?.edgeColor as string | undefined) ?? DEFAULT_EDGE_COLOR);

  const markerId = `kg-edge-marker-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const activeMarkerEnd = isConnectedToSelected
    ? `url(#${markerId})`
    : markerEnd;
  const labelFill = isConnectedToSelected
    ? shadeNodeColor(edgeColor, -36)
    : undefined;

  const displayLabel = String(data?.linkName ?? '');
  const showLabel = canvasMode === 'minimal' && displayLabel;

  return (
    <>
      {isConnectedToSelected ? (
        <defs>
          <marker
            id={markerId}
            markerWidth={DEFAULT_EDGE_MARKER.width}
            markerHeight={DEFAULT_EDGE_MARKER.height}
            viewBox="-10 -10 20 20"
            markerUnits="strokeWidth"
            orient="auto-start-reverse"
            refX="0"
            refY="0"
          >
            <polyline
              stroke={edgeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              fill={edgeColor}
              points="-5,-4 0,0 -5,4 -5,-4"
            />
          </marker>
        </defs>
      ) : null}
      <BaseEdge
        id={id}
        path={path}
        markerEnd={activeMarkerEnd}
        style={{
          stroke: edgeColor,
          strokeWidth: isConnectedToSelected ? 2.5 : data?.isImplicit ? 2 : 1.5,
          strokeDasharray: data?.isImplicit ? '6 4' : undefined
        }}
      />
      {showLabel ? (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles['kg-edge-label-text']}
          style={labelFill ? { fill: labelFill } : undefined}
        >
          {displayLabel}
        </text>
      ) : null}
    </>
  );
};
