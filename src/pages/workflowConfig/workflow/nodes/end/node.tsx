import { FC } from 'react';
import React from 'react';
import type { EndNodeType } from './types';
import type {
  NodeProps,
} from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ id, data }) => {
  const { target_path, dataSource } = data;

  return (
    <div className={`wk-node-content end-node-content`}>
      <div className='end-node-content-item'>
        <div className="txt">目标数据目录</div>
        <div className="val">{dataSource?.find((item) => item?.id === target_path)?.name || '未配置'}</div>
      </div>
    </div>
  );
};

export default React.memo(Node);
