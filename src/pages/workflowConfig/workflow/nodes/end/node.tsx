import { FC, useEffect, useState } from 'react';
import React from 'react';
import type { EndNodeType } from './types';
import { getWorkflowTargetPath } from '@/api/workflow';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ data }) => {
  const { target_path_name, target_path_id } = data;
  // console.log('target_path_id', target_path_id, target_path_name);
  // const dirsArr: Record<string, any>[] = [];
  // const [targetPathName, setTargetPathName] = useState(target_path_name);
  // useEffect(() => {
  //   getWorkflowTargetPath(2, '').then((res) => {
  //     if (res.status === 200) {
  //       console.log('1111', res?.data?.dst);
  //       console.log('2222', target_path_id);
  //       console.log('res.data.items', res?.data?.dst?.find((item) => item?.id === target_path_id));
  //       setTargetPathName(
  //         res?.data?.dst?.find((item) => item?.id === target_path_id)?.name
  //       );
  //     }
  //   });
  // }, [target_path_name, target_path_id, targetPathName]);
  return (
    <div className={`wk-node-content end-node-content`}>
      <div className="end-node-content-item">
        <div className="txt">目标数据目录</div>
        {target_path_name && target_path_name ? (
          <div className="val">{target_path_name}</div>
        ) : (
          <div className="item-text">未配置</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Node);
