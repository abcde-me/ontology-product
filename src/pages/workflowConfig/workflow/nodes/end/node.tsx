import { FC } from 'react';
import React from 'react';
import type { EndNodeType } from './types';
import { findVariableNameById } from '../utils';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ id, data }) => {
  const { target_path_name } = data;

  return (
    <div className={`wk-node-content end-node-content`}>
      <div className="end-node-content-item">
        <div className="txt">目标数据目录</div>
        <div className="val">
          {target_path_name}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
