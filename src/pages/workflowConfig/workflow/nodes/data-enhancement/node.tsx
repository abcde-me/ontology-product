import type { FC } from 'react';
import React, { useState } from 'react';
import type { CodeNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { RiArrowDownSFill } from '@remixicon/react';
import { useStoreApi } from 'reactflow';
import './data-enhancement.scss';

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { app_scenarios, enha_modle } = props.data;
  console.log(props.data, '=========enh');
  const store = useStoreApi();
  const appScenarios: { [key: number]: string } = {
    1: '按通用',
    2: '文本分类',
    3: '文本提取',
    4: '文本生成',
    5: '多轮回答'
  };
  const enhaModle: { [key: number]: string } = {
    1: '模型1',
    2: '模型2',
    3: '模型3',
    4: '模型4',
    5: '模型5'
  };
  return (
    <div className={`wk-node-content data-enhancement-node`}>
      <div className="input-header">
        <span className="txt">增强类型</span>
      </div>
      <div className="enhancement-content">
        {app_scenarios && (
          <div className="enhancement-item">{appScenarios[app_scenarios]}</div>
        )}
        {enha_modle && (
          <div className="enhancement-item">{enhaModle[enha_modle]}</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Node);
