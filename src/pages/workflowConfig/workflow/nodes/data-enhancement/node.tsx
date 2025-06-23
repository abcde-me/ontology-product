import type { FC } from 'react'
import React, { useState } from 'react'
import type { CodeNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import { useStoreApi } from 'reactflow'
import './data-enhancement.scss';

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { app_scenarios } = props.data;
  console.log(props.data, '=========enh');
  const store = useStoreApi()
  const appScenarios: { [key: number]: string } = {
    1: '按通用',
    2: '文本分类',
    3: '文本提取',
    4: '文本生成',
    5: '多轮回答',
  };
  return (
    <div className={`wk-node-content data-enhancement-content`}>
      <div className="input-header">
        <span className="txt">增强类型</span>
      </div>
      <div className="enhancement-content">
        <div className="enhancement-item">
          {app_scenarios && appScenarios[app_scenarios]}
        </div>
        <div className="enhancement-item">过滤相似度阈值</div>
        <div className="enhancement-item">过滤相似度阈值</div>
      </div>
    </div>
  );
}

export default React.memo(Node)
