import { useNodesReadOnly } from '@ceai-front/workflow';
import { Badge, Tag } from '@arco-design/web-react';
import React, { useMemo } from 'react';
import cn from 'classnames';
import { IconLink } from '@arco-design/web-react/icon';
import { useNodes } from 'reactflow';
import { useDemoStore } from '../common/store';
import { DotStatus } from '@ceai-front/arco-material';
import { OBJECT_TYPE_SYNC_STATUS_CONFIG } from '@/pages/ontologyScene/common/constants';

export default function CustomLabel(props: any) {
  const { labelX, labelY, defaultLabelRenderer, source, target, data } = props;

  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSourceNode = useDemoStore((s) => s.setSourceNode);
  const setTargetNode = useDemoStore((s) => s.setTargetNode);
  const { nodesReadOnly } = useNodesReadOnly();
  const nodes = useNodes<any>();

  const sourceNode = useMemo(() => {
    return nodes.find((node) => node.id === source);
  }, [nodes]);

  const targetNode = useMemo(() => {
    return nodes.find((node) => node.id === target);
  }, [nodes]);

  return (
    <>
      {!nodesReadOnly ? (
        defaultLabelRenderer
      ) : (
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all'
          }}
          onClick={() => {
            setShowCustomEdgePanel((s) => !s);
          }}
        >
          <div className="flex h-[24px] items-center justify-center gap-[6px] rounded-[4px] border border-[var(--color-border-1)] bg-[#fff] pl-[6px]">
            <IconLink />
            <span className="text-[var(--color-text-1)]">{data?.name}</span>
            <DotStatus
              color={OBJECT_TYPE_SYNC_STATUS_CONFIG[data.syncStatus]?.color}
              text=""
            />
          </div>
        </div>
      )}
    </>
  );
}
