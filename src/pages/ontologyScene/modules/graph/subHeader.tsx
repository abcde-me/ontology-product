import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ZoomInOut } from '@ceai-front/workflow';
import { Space } from '@arco-design/web-react';
import { useNodes, useNodesInitialized, useReactFlow } from 'reactflow';
import React from 'react';

function ZoomToolbarPortal({
  targetRef,
  children
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (targetRef.current) {
      setTarget(targetRef.current);
      return undefined;
    }

    const timerId = window.setInterval(() => {
      if (targetRef.current) {
        setTarget(targetRef.current);
        window.clearInterval(timerId);
      }
    }, 50);

    return () => {
      window.clearInterval(timerId);
    };
  }, [targetRef]);

  if (!target) {
    return null;
  }

  return createPortal(children, target);
}

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

interface CustomSubHeaderProps {
  embedToolbarRef?: RefObject<HTMLDivElement | null>;
}

export default function CustomSubHeader({
  embedToolbarRef
}: CustomSubHeaderProps) {
  const zoomControl = <ZoomInOut />;

  return (
    <>
      <AutoFitView />
      {embedToolbarRef ? (
        <ZoomToolbarPortal targetRef={embedToolbarRef}>
          {zoomControl}
        </ZoomToolbarPortal>
      ) : (
        <Space size="large">{zoomControl}</Space>
      )}
    </>
  );
}
