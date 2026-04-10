import { useNodesReadOnly } from '@ceai-front/workflow';
import React, { useMemo } from 'react';
import { useNodes } from 'reactflow';
import { useDemoStore } from '../common/store';
import IconLink from '../../../assets/graph-link-icon.svg';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

export default function CustomLabel(props: any) {
  const { labelX, labelY, defaultLabelRenderer, source, target, data, id } =
    props;

  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSourceNode = useDemoStore((s) => s.setSourceNode);
  const setTargetNode = useDemoStore((s) => s.setTargetNode);
  const setSelectedEdgeId = useDemoStore((s) => s.setSelectedEdgeId);
  const { nodesReadOnly } = useNodesReadOnly();
  const nodes = useNodes<any>();

  const sourceNode = useMemo(() => {
    return nodes.find((node) => node.id === source);
  }, [nodes, source]);

  const targetNode = useMemo(() => {
    return nodes.find((node) => node.id === target);
  }, [nodes, target]);

  // 如果是空态边，不显示标签
  if (data?.isEmptyState) {
    return null;
  }

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
            // 保存边的ID（链接ID）和节点信息
            // 边的 id 是字符串格式的链接ID，需要转换为数字
            setSelectedEdgeId(data?.id ?? null);
            setSourceNode(sourceNode);
            setTargetNode(targetNode);
            setShowCustomEdgePanel((s) => !s);
          }}
        >
          <div className="flex h-[24px] max-w-[198px] items-center justify-center gap-[6px] rounded-[4px] border border-[var(--color-border-1)] bg-[#fff] px-[6px] hover:shadow-[0px_2px_8px_0px_#00000014]">
            <IconLink className="h-[18px] w-[18px] flex-shrink-0" />
            <EllipsisPopover
              className="min-w-0 text-[var(--color-text-1)]"
              preferTypography
              value={data?.name}
            ></EllipsisPopover>
          </div>
        </div>
      )}
    </>
  );
}
