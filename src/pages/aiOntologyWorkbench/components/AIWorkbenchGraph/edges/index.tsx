import { useNodesReadOnly } from '@ceai-front/workflow';
import React, { useMemo } from 'react';
import { useNodes } from 'reactflow';
import { useAIWorkbenchGraphStore } from '../store';
import IconLink from '@/pages/ontologyScene/assets/graph-link-icon.svg';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

export function CustomLabel(props: any) {
  const { labelX, labelY, defaultLabelRenderer, source, target, data, id } =
    props;

  const { openBottomPanel, highlightedNodeCode } = useAIWorkbenchGraphStore();
  const { nodesReadOnly } = useNodesReadOnly();
  const nodes = useNodes<any>();

  const sourceNode = useMemo(() => {
    return nodes.find((node) => node.id === source);
  }, [nodes, source]);

  const targetNode = useMemo(() => {
    return nodes.find((node) => node.id === target);
  }, [nodes, target]);

  // 判断当前边是否被高亮（根据 code 匹配）
  const isHighlighted = highlightedNodeCode === data?.code;

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
            // 打开底部面板显示链接详情
            openBottomPanel({
              type: 'link',
              id: data?.id || id,
              data: {
                ...data,
                sourceNode,
                targetNode
              }
            });
          }}
        >
          <div
            className="flex h-[24px] max-w-[198px] items-center justify-center gap-[6px] rounded-[4px] border px-[6px] hover:shadow-[0px_2px_8px_0px_#00000014]"
            style={{
              backgroundColor: isHighlighted ? '#e6f4ff' : '#fff',
              borderColor: isHighlighted ? '#1890ff' : 'var(--color-border-1)',
              borderWidth: isHighlighted ? '2px' : '1px',
              transition: 'all 0.3s ease'
            }}
          >
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
