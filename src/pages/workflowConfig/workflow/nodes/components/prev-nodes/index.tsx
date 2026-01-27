import React, { useEffect, useState } from 'react';
import { Empty, Typography } from '@arco-design/web-react';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { useStoreApi } from 'reactflow';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';
import styles from './index.module.scss';
import { NoDataCard } from '@ceai-front/arco-material';

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
      <div
        className={
          'mb-3 font-PingFangSc text-[14px] font-[600] leading-[22px] text-default'
        }
      >
        前置任务节点
      </div>
      {!!prevNodes.length ? (
        <>
          {prevNodes.map((node) => {
            const { title, type } = node.data;
            return (
              <div
                key={node.id}
                className={`dependent-item mb-2 mt-2 flex items-center gap-2 rounded-[12px] p-4 hover:cursor-pointer ${styles['node-item']}`}
                onClick={() => {
                  handleNodeSelect(node.id);
                }}
              >
                <BlockIcon type={type} size={'md'} />
                <div
                  className={
                    'font-PingFangSc text-[12px] font-[600] leading-[18px] text-[#1E293B]'
                  }
                >
                  {title}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <NoDataCard title={'暂无前置任务节点'} type={'block'} />
      )}
    </>
  );
};
