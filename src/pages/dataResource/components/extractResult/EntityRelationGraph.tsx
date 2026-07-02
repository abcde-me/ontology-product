import React, { useEffect, useMemo, useRef } from 'react';
import dagre from '@dagrejs/dagre';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  ExtractedEntity,
  ExtractedRelation
} from '../../types/fileExtract';
import {
  EntityKnowledgeGraphNode,
  type EntityGraphNodeData
} from './EntityKnowledgeGraphNode';
import { EntityStraightEdge } from './EntityStraightEdge';
import styles from '../../index.module.scss';

const NODE_SIZE = 72;
const NODE_WIDTH = 96;
const NODE_HEIGHT = 108;

const ENTITY_NODE_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#6366F1',
  '#EF4444'
];

const nodeTypes = {
  entityNode: EntityKnowledgeGraphNode
};

const edgeTypes = {
  straight: EntityStraightEdge
};

const hashEntityColor = (entityId: string) => {
  let hash = 0;
  for (let index = 0; index < entityId.length; index += 1) {
    hash = (hash * 31 + entityId.charCodeAt(index)) | 0;
  }
  return ENTITY_NODE_COLORS[Math.abs(hash) % ENTITY_NODE_COLORS.length];
};

const buildHighlightContext = (
  entities: ExtractedEntity[],
  relations: ExtractedRelation[],
  highlightedEntityId?: string | null,
  highlightedRelationId?: string | null
) => {
  const hasHighlight = Boolean(highlightedEntityId || highlightedRelationId);

  const highlightedEntityIds = new Set<string>();
  const highlightedRelationIds = new Set<string>();

  if (highlightedEntityId) {
    highlightedEntityIds.add(highlightedEntityId);
    relations.forEach((relation) => {
      if (
        relation.sourceEntityId === highlightedEntityId ||
        relation.targetEntityId === highlightedEntityId
      ) {
        highlightedRelationIds.add(relation.id);
        highlightedEntityIds.add(relation.sourceEntityId);
        highlightedEntityIds.add(relation.targetEntityId);
      }
    });
  }

  if (highlightedRelationId) {
    const relation = relations.find(
      (item) => item.id === highlightedRelationId
    );
    if (relation) {
      highlightedRelationIds.add(relation.id);
      highlightedEntityIds.add(relation.sourceEntityId);
      highlightedEntityIds.add(relation.targetEntityId);
    }
  }

  return {
    hasHighlight,
    highlightedEntityIds,
    highlightedRelationIds,
    focusEntityId: highlightedEntityId || null
  };
};

const layoutGraph = (
  entities: ExtractedEntity[],
  relations: ExtractedRelation[],
  highlightedEntityId?: string | null,
  highlightedRelationId?: string | null
): { nodes: Node<EntityGraphNodeData>[]; edges: Edge[] } => {
  const highlight = buildHighlightContext(
    entities,
    relations,
    highlightedEntityId,
    highlightedRelationId
  );

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR', nodesep: 56, ranksep: 88 });

  entities.forEach((entity) => {
    graph.setNode(entity.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  relations.forEach((relation) => {
    if (
      graph.hasNode(relation.sourceEntityId) &&
      graph.hasNode(relation.targetEntityId)
    ) {
      graph.setEdge(relation.sourceEntityId, relation.targetEntityId);
    }
  });

  dagre.layout(graph);

  const nodes: Node<EntityGraphNodeData>[] = entities.map((entity) => {
    const layoutNode = graph.node(entity.id);
    const isHighlighted = highlight.highlightedEntityIds.has(entity.id);
    const isFocus = highlight.focusEntityId === entity.id;

    return {
      id: entity.id,
      type: 'entityNode',
      position: {
        x: (layoutNode?.x ?? 0) - NODE_WIDTH / 2,
        y: (layoutNode?.y ?? 0) - NODE_HEIGHT / 2
      },
      data: {
        label: entity.name,
        type: entity.type,
        color: hashEntityColor(entity.id),
        highlighted: isFocus || (isHighlighted && !highlight.focusEntityId),
        connected:
          isHighlighted && Boolean(highlight.focusEntityId) && !isFocus,
        dimmed: highlight.hasHighlight && !isHighlighted
      },
      draggable: true,
      style: { width: NODE_WIDTH, height: NODE_HEIGHT }
    };
  });

  const edges: Edge[] = relations
    .filter(
      (relation) =>
        entities.some((entity) => entity.id === relation.sourceEntityId) &&
        entities.some((entity) => entity.id === relation.targetEntityId)
    )
    .map((relation) => {
      const isHighlighted = highlight.highlightedRelationIds.has(relation.id);
      const strokeColor = isHighlighted
        ? 'rgb(var(--primary-6))'
        : highlight.hasHighlight
          ? 'var(--color-border-3)'
          : 'rgb(var(--primary-5))';

      return {
        id: relation.id,
        type: 'straight',
        source: relation.sourceEntityId,
        target: relation.targetEntityId,
        label: relation.relationType,
        animated: isHighlighted,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: strokeColor
        },
        style: {
          stroke: strokeColor,
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          opacity: highlight.hasHighlight && !isHighlighted ? 0.35 : 1
        },
        labelStyle: {
          fill: isHighlighted ? 'rgb(var(--primary-6))' : 'var(--color-text-3)',
          fontSize: 11,
          fontWeight: isHighlighted ? 600 : 400
        }
      };
    });

  return { nodes, edges };
};

interface GraphViewportSyncProps {
  highlightedEntityId?: string | null;
  highlightedRelationId?: string | null;
  nodeIds: string[];
}

const GraphViewportSync: React.FC<GraphViewportSyncProps> = ({
  highlightedEntityId,
  highlightedRelationId,
  nodeIds
}) => {
  const { fitView } = useReactFlow();
  const prevHighlightRef = useRef<string | null>(null);

  useEffect(() => {
    const nextHighlight = highlightedEntityId || highlightedRelationId || null;
    if (!nextHighlight) {
      prevHighlightRef.current = null;
      return;
    }

    if (nextHighlight === prevHighlightRef.current) {
      return;
    }

    prevHighlightRef.current = nextHighlight;

    const focusNodeIds = highlightedEntityId ? [highlightedEntityId] : nodeIds;

    if (!focusNodeIds.length) {
      return;
    }

    window.requestAnimationFrame(() => {
      fitView({
        nodes: focusNodeIds.map((id) => ({ id })),
        padding: 0.35,
        duration: 300,
        maxZoom: 1.2
      });
    });
  }, [fitView, highlightedEntityId, highlightedRelationId, nodeIds]);

  return null;
};

interface EntityRelationGraphProps {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
  highlightedEntityId?: string | null;
  highlightedRelationId?: string | null;
}

export const EntityRelationGraph: React.FC<EntityRelationGraphProps> = ({
  entities,
  relations,
  highlightedEntityId,
  highlightedRelationId
}) => {
  const graph = useMemo(
    () =>
      layoutGraph(
        entities,
        relations,
        highlightedEntityId,
        highlightedRelationId
      ),
    [entities, relations, highlightedEntityId, highlightedRelationId]
  );

  const focusNodeIds = useMemo(() => {
    if (highlightedEntityId) {
      return [highlightedEntityId];
    }
    if (highlightedRelationId) {
      const relation = relations.find(
        (item) => item.id === highlightedRelationId
      );
      if (relation) {
        return [relation.sourceEntityId, relation.targetEntityId];
      }
    }
    return [];
  }, [highlightedEntityId, highlightedRelationId, relations]);

  if (!entities.length) {
    return (
      <div className={styles['extract-result-empty']}>
        暂无实体数据，无法生成图谱
      </div>
    );
  }

  return (
    <div className={styles['entity-relation-graph']}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="var(--color-border-2)" />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) =>
              (node.data as EntityGraphNodeData | undefined)?.color || '#94A3B8'
            }
          />
          <Controls showInteractive={false} />
          <GraphViewportSync
            highlightedEntityId={highlightedEntityId}
            highlightedRelationId={highlightedRelationId}
            nodeIds={focusNodeIds}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
