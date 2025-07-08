import { changeNodesAndEdgesId } from './../../utils';
import { useCallback, useRef, useEffect } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import { useStore } from '../../store';
import type { CodeNodeType, OutputVar, EnhancementNodeType } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';

const useConfig = (id: string, payload: CodeNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const { inputs, setInputs } = useNodeCrud<CodeNodeType>(id, payload);
  const { handleVarListChange, handleAddVariable } = useVarList<CodeNodeType>({
    inputs,
    setInputs
  });
  const inputRef = useRef(inputs);

  useEffect(() => {
    inputRef.current = inputs;
  }, [inputs]);

  const appScenarios: { [key: string]: string } = {
    tongyong: '通用',
    fenlei: '文本分类',
    tiqu: '文本提取',
    shengcheng: '文本生成',
    duolong: '多轮回答'
  };

  const onValuesChange = useCallback(
    (payload: EnhancementNodeType) => {
      console.log(payload, '==use');
      const data = {
        type: 'enhancement',
        title: '数据增强节点',
        desc: '',
        enha_modle_id: payload?.enha_modle_id, // 数据增强模型
        app_scenarios: {
          name: appScenarios[payload?.app_scenarios_name],
          type: payload?.app_scenarios_name,
          option: {
            sample_num: payload?.sample_num,
            similarity_threshold: payload?.similarity_threshold,
            generate_sample_num: payload?.generate_sample_num,
            enhanced_proportion: payload?.enhanced_proportion,
            prompt: payload?.prompt,
            sample_data: payload?.sample_data
          }
        }
      };
      const newInputs = produce(inputRef.current, (draft: any) => {
        draft.enha_modle_id = payload.enha_modle_id;
        draft.generate_sample_num = payload?.generate_sample_num;
        draft.similarity_threshold = payload?.similarity_threshold;
        draft.sample_num = payload?.sample_num;
        draft.prompt = payload.prompt;
        draft.prompt_checkbox = payload.prompt_checkbox;
        draft.data = data;
        draft.enhanced_proportion = payload.enhanced_proportion;
        draft.sample_data = payload.sample_data;
        draft.app_scenarios_name = payload.app_scenarios_name;
        draft.customPromptChecked = payload.customPromptChecked;
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  const setBoostPageData = useCallback(
    (modelList) => {
      const newInputs = produce(inputRef.current, (draft: any) => {
        draft.modelList = modelList;
      });
      setInputs(newInputs);
    },
    [setInputs]
  );
  return {
    readOnly,
    inputs,
    handleVarListChange,
    handleAddVariable,
    onValuesChange,
    setBoostPageData
  };
};

export default useConfig;
