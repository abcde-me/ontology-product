import React, { useEffect, useState } from 'react';
import { Empty, Typography } from '@arco-design/web-react';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { useStoreApi } from 'reactflow';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';

export const PrevNodes = ({ node }: { node: React.Key }) => {
  const [prevNodes, setPrevNodes] = useState<NodeProps<Record<string, any>>[]>(
    []
  );

  const { getNodes, edges } = useStoreApi().getState();
  const { handleNodeSelect } = useNodesInteractions();

  useEffect(() => {
    const nodes = getNodes();
    const prevNodeIds = edges.flatMap(({ target, source }) => {
      return target === node ? source : [];
    });
    const allNodes = nodes.filter(({ id }) => prevNodeIds.includes(id));
    setPrevNodes(allNodes);
  }, [node, edges]);
  return (
    <>
      <Typography.Text bold className={'mb-2'}>
        前置任务节点
      </Typography.Text>
      {!!prevNodes.length ? (
        <>
          {prevNodes.map((node) => {
            const { title, type } = node.data;
            return (
              <div
                key={node.id}
                className={
                  'dependent-item mb-2 mt-2 flex items-center gap-3 rounded-[12px] p-4 hover:cursor-pointer'
                }
                onClick={() => {
                  handleNodeSelect(node.id);
                }}
              >
                <BlockIcon type={type} size={'md'} />
                <Typography.Text bold>{title}</Typography.Text>
              </div>
            );
          })}
        </>
      ) : (
        <Empty description={'暂无前置任务节点'} />
      )}
    </>
  );
};
