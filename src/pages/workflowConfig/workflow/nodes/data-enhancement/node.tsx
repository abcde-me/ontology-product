import type { FC } from 'react';
import React, { useState } from 'react';
import type { CodeNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { RiArrowDownSFill } from '@remixicon/react';
import { useStoreApi } from 'reactflow';
import { Tooltip } from '@arco-design/web-react';
import './data-enhancement.scss';

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const {
    app_scenarios_name,
    enha_modle_id,
    enhanced_proportion,
    sample_num,
    similarity_threshold,
    generate_sample_num,
    prompt,
    modelList,
    prompt_checkbox
  } = props.data;
  const store = useStoreApi();
  const appScenarios: { [key: string]: string } = {
    tongyong: '通用',
    fenlei: '文本分类',
    tiqu: '文本提取',
    shengcheng: '文本生成',
    duolong: '多轮回答'
  };
  const ModelLs = modelList?.find((item) => item.type === 'enha_model')?.model_data || []
  const defaultModelId = ModelLs[0]?.id || '';
  console.log(ModelLs, defaultModelId, '=======node-ebch', modelList);
  return (
    <div className={`wk-node-content data-enhancement-node`}>
      <div className="input-header">
        <span className="txt">增强类型</span>
      </div>
      <div className="enhancement-content">
        {app_scenarios_name && (
          <div className="enhancement-item">
            场景：{appScenarios[app_scenarios_name]}
          </div>
        )}
        {enha_modle_id && (
          <div className="enhancement-item">
            模型：
            {modelList?.find((item) => item.id === enha_modle_id || defaultModelId)?.type || ''}
          </div>
        )}
        {(app_scenarios_name === 'tongyong' ||
          app_scenarios_name === 'duolong') &&
          sample_num > 0 && (
            <Tooltip content={`指令生成依赖样本数: ${sample_num}`}>
              <div className="enhancement-item">{`指令生成依赖样本数: ${sample_num}`}</div>
            </Tooltip>
          )}
        {(app_scenarios_name === 'fenlei' ||
          app_scenarios_name === 'shengcheng') &&
          enhanced_proportion > 0 && (
            <Tooltip content={`任务描述增强占比: ${enhanced_proportion}`}>
              <div className="enhancement-item">{`任务描述增强占比: ${enhanced_proportion}`}</div>
            </Tooltip>
          )}
        {similarity_threshold && (
          <Tooltip content={`过滤相似度阈值: ${similarity_threshold}`}>
            <div className="enhancement-item">{`过滤相似度阈值: ${similarity_threshold}`}</div>
          </Tooltip>
        )}
        {generate_sample_num && (
          <Tooltip content={`生成样本数: ${generate_sample_num}`}>
            <div className="enhancement-item">{`生成样本数: ${generate_sample_num}`}</div>
          </Tooltip>
        )}
        {prompt_checkbox && (
          <Tooltip content={`提示词: ${prompt}`}>
            <div className="enhancement-item">{`提示词: ${prompt || ''}`}</div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default React.memo(Node);
