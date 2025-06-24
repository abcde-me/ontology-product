import { FC, useState } from 'react';
import React from 'react';
import cn from 'classnames';
import type { EndNodeType } from './types';
import type {
  NodeProps,
} from '@/pages/workflowConfig/workflow/types';
import {
  useWorkflow,
} from '@/pages/workflowConfig/workflow/hooks';
import { BlockEnum } from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ id, data }) => {
  const { getBeforeNodesInSameBranch } = useWorkflow();
  const availableNodes = getBeforeNodesInSameBranch(id);

  const startNode = availableNodes.find((node: any) => {
    return node.data.type === BlockEnum.Start;
  });

  const getNode = (id: string) => {
    return availableNodes.find((node) => node.id === id) || startNode;
  };

  const { target_path } = data;

  const [show, setShow] = useState(true);

  const toggleVars = () => {
    setShow((s) => !s);
  };

  return (
    <div className={`wk-node-content end-node-content`}>
      <div className='end-node-content-item'>
        <div className="txt">目标数据目录</div>
        <div className="val">{target_path || '未配置'}</div>
      </div>
    </div>
  );
};

export default React.memo(Node);
