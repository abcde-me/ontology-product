import { FC, useEffect, useState } from 'react';
import React from 'react';
import type { EndNodeType } from './types';
import { getWorkflowTargetPath } from '@/api/workflow';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ data }) => {
  const { target_path_name, target_path_id, name } = data;
  const dirsArr: Record<string, any>[] = [];
  const [targetPathName, setTargetPathName] = useState(name);
  useEffect(() => {
    setTargetPathName(name);
  }, [target_path_name, target_path_id, targetPathName, name]);
  return (
    <div className={`wk-node-content end-node-content`}>
      <div className="end-node-content-item">
        <div className="txt">数据集名称</div>
        {targetPathName && targetPathName ? (
          <div className="val">{targetPathName}</div>
        ) : (
          <div className="item-text">暂无名称</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Node);
