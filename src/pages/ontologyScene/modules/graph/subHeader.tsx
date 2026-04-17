import { useEffect, useRef } from 'react';
import { ZoomInOut } from '@ceai-front/workflow';
import { Space } from '@arco-design/web-react';
import { useNodes, useNodesInitialized, useReactFlow } from 'reactflow';
import React from 'react';

function AutoFitView() {
  const nodes = useNodes();
  const nodesInitialized = useNodesInitialized();
  const { fitView } = useReactFlow();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (!nodesInitialized || nodes.length === 0 || hasFittedRef.current) {
      return;
    }

    hasFittedRef.current = true;

    const frameId = window.requestAnimationFrame(() => {
      fitView({
        padding: 0.16,
        // duration: 300,
        minZoom: 0.3,
        maxZoom: 1
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [fitView, nodes, nodesInitialized]);

  return null;
}

export default function CustomSubHeader() {
  return (
    <Space size="large">
      <AutoFitView />
      <ZoomInOut />
    </Space>
  );
}
