import React, { useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  RelationGraphEdge,
  RelationGraphNode
} from '@/pages/exploreAnalysis/relationInsight/types';
import {
  CARD_NODE_HEIGHT,
  CARD_NODE_WIDTH
} from '../utils/buildInstanceOntologyGraph';
import { InstanceGraphCardNode } from './InstanceGraphCardNode';
import { InstanceOntologyGraphEdge } from './InstanceOntologyGraphEdge';
import styles from './InstanceOntologyGraph.module.scss';

const nodeTypes = {
  instanceCardNode: InstanceGraphCardNode
};

const edgeTypes = {
  instanceOntologyEdge: InstanceOntologyGraphEdge
};

interface InstanceOntologyGraphProps {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
  graphRevision: number;
  variant?: 'embedded' | 'fullscreen';
  layoutKey?: number;
}

const FitViewAfterSync: React.FC<{
  graphRevision: number;
  nodeCount: number;
  layoutKey?: number;
}> = ({ graphRevision, nodeCount, layoutKey = 0 }) => {
  const { fitView } = useReactFlow();
  const prevFitTriggerRef = useRef('');

  useEffect(() => {
    if (graphRevision <= 0 || nodeCount <= 0) {
      return;
    }

    const fitTrigger = `${graphRevision}-${layoutKey}`;
    if (fitTrigger === prevFitTriggerRef.current) {
      return;
    }

    prevFitTriggerRef.current = fitTrigger;
    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        void fitView({
          padding: 0.2,
          duration: 240,
          minZoom: 0.35,
          maxZoom: 1.2
        });
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [fitView, graphRevision, layoutKey, nodeCount]);

  return null;
};

const GraphCanvas: React.FC<InstanceOntologyGraphProps> = ({
  nodes,
  edges,
  graphRevision,
  variant = 'embedded',
  layoutKey = 0
}) => {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);
  const syncedRevisionRef = useRef(0);

  useEffect(() => {
    if (graphRevision <= 0 || graphRevision === syncedRevisionRef.current) {
      return;
    }

    syncedRevisionRef.current = graphRevision;
    setFlowNodes(
      nodes.map((node) => ({
        ...node,
        width: CARD_NODE_WIDTH,
        height: CARD_NODE_HEIGHT,
        draggable: true,
        selectable: true
      }))
    );
    setFlowEdges(
      edges.map((edge) => ({
        ...edge,
        animated: false
      }))
    );
  }, [edges, graphRevision, nodes, setFlowEdges, setFlowNodes]);

  return (
    <div
      className={
        variant === 'fullscreen'
          ? styles.canvasFullscreen
          : styles.canvasEmbedded
      }
    >
      <ReactFlow
        className={styles.flow}
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={false}
        nodesConnectable={false}
        nodesDraggable
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        minZoom={0.35}
        maxZoom={1.4}
        defaultEdgeOptions={{
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#3B82F6'
          }
        }}
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <FitViewAfterSync
          graphRevision={graphRevision}
          nodeCount={flowNodes.length}
          layoutKey={layoutKey}
        />
      </ReactFlow>
    </div>
  );
};

export const InstanceOntologyGraph: React.FC<InstanceOntologyGraphProps> = (
  props
) => (
  <ReactFlowProvider>
    <GraphCanvas {...props} />
  </ReactFlowProvider>
);
