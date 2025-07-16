import { FC, useEffect, useState } from 'react';
import React from 'react';
import type { EndNodeType } from './types';
import { findVariableNameById } from '../utils';
import { getWorkflowTargetPath } from '@/api/workflow';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import './end.scss';

const Node: FC<NodeProps<EndNodeType>> = ({ id, data }) => {
  const { target_path_name, target_path_id } = data;
  const dirsArr: Record<string, any>[] = [];
  const [targetPathName, setTargetPathName] = useState(target_path_name);
  useEffect(() => {
    getWorkflowTargetPath(2, '').then(res => {
      if (res.status === 200) {
        const resData = res.data.dst.forEach((catalog) => {
          // 重置name结构
          const restData = catalog.children?.volume.map(item => {
            return {
              ...item,
              parent_name: catalog.name
            }
          })
          dirsArr.push(...(restData || []));
        });
        setTargetPathName(dirsArr?.find((item) => item?.id === target_path_id)?.name)
      }
    });
  }, [targetPathName]);
  return (
    <div className={`wk-node-content end-node-content`}>
      <div className="end-node-content-item">
        <div className="txt">目标数据目录</div>
        {target_path_name && target_path_name ?
          <div className="val">
            {targetPathName}
          </div>
          : <div className='item-text'>未配置</div>}

      </div>
    </div >
  );
};

export default React.memo(Node);
