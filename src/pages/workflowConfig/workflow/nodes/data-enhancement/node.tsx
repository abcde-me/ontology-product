import type { FC } from 'react';
import React, { useEffect } from 'react';
import type { CodeNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { Tooltip } from '@arco-design/web-react';
import { useUnmountedRef } from 'ahooks';
import { getModelList } from '@/api/modelV2';
import useConfig from './use-config';
import './data-enhancement.scss';

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { app_scenarios, enha_modle_id, modelList, prompt_checkbox } =
    props.data;
  const {
    sample_num,
    similarity_threshold,
    generate_sample_num
  } = app_scenarios?.option ?? {};
  const app_scenarios_type = app_scenarios?.type ?? '';
  const { handleModelChange, setBoostPageData } = useConfig(
    props.id,
    props.data
  );
  const appScenarios: { [key: string]: string } = {
    tongyong: '问答对生成',
    fenlei: '文本分类',
    tiqu: '文本提取',
    shengcheng: '文本扩写',
    duolong: '多轮回答'
  };
  let defaultModelName = null;
  const unmountedRef = useUnmountedRef();
  useEffect(() => {
    getModelList().then((res: any) => {
      if (unmountedRef.current) return;
      const modelList =
        res.data.find((d) => d.type === 'enha_model')?.model_data || [];

      const model_emb_model_id = modelList[0]?.id || '';
      const model_emb_model_name = modelList[0]?.type || '';
      defaultModelName = model_emb_model_name;
      const fields = {} as Record<string, any>;
      if (!enha_modle_id) {
        fields.enha_modle_id = model_emb_model_id;
      }
      if (!app_scenarios_type) {
        fields.app_scenarios = {};
        fields.app_scenarios.name = '问答对生成';
        fields.app_scenarios.type = 'tongyong';
      }
      handleModelChange(fields);
      setBoostPageData(modelList);
    });
  }, []);
  return (
    <div className={`wk-node-content data-enhancement-node`}>
      <div className="input-header">
        <span className="txt">增强类型</span>
      </div>
      <div className="enhancement-content">
        {app_scenarios_type && (
          <div className="enhancement-item">
            场景：{appScenarios[app_scenarios_type]}
          </div>
        )}
        {enha_modle_id && (
          <div className="enhancement-item">
            模型：
            {modelList?.find((item) => item.id === enha_modle_id)?.type ||
              defaultModelName}
          </div>
        )}
        {(app_scenarios_type === 'tongyong' ||
          app_scenarios_type === 'duolong') &&
          sample_num > 0 && (
            <Tooltip content={`指令生成依赖样本数: ${sample_num}`}>
              <div className="enhancement-item">{`指令生成依赖样本数: ${sample_num}`}</div>
            </Tooltip>
          )}
        {/* 这期先不做 */}
        {/* {(app_scenarios_type === 'fenlei' ||
          app_scenarios_type === 'shengcheng') &&
          (enhanced_proportion || enhanced_proportion === 0) && (
            <Tooltip content={`任务描述增强占比: ${enhanced_proportion}`}>
              <div className="enhancement-item">{`任务描述增强占比: ${enhanced_proportion}`}</div>
            </Tooltip>
          )} */}
        {(similarity_threshold || similarity_threshold === 0) && (
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
