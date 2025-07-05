import { changeNodesAndEdgesId } from './../../utils';
import { useCallback } from 'react';
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
  const appScenarios: { [key: string]: string } = {
    tongyong: '通用',
    fenlei: '文本分类',
    tiqu: '文本提取',
    shengcheng: '文本生成',
    duolong: '多轮回答'
  };

  const data = {
    type: 'enhancement',
    title: '数据增强节点',
    desc: '',
    enha_modle_id: inputs?.enha_modle_id, // 数据增强模型
    app_scenarios: {
      name: appScenarios[inputs?.app_scenarios_name],
      type: inputs?.app_scenarios,
      option: {
        sample_num: inputs?.sample_num,
        similarity_threshold: inputs?.similarity_threshold,
        generate_sample_num: inputs?.generate_sample_num,
        enhanced_proportion: inputs?.enhanced_proportion,
        prompt: inputs?.prompt,
        sample_data: inputs?.sample_data
      }
    }
  };

  const onValuesChange = useCallback(
    (payload: EnhancementNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        console.log(payload, draft, '=========111111');
        draft.enha_modle_id = payload.enha_modle_id;
        draft.generate_sample_num = payload?.generate_sample_num;
        draft.similarity_threshold = payload?.similarity_threshold;
        draft.sample_num = payload?.sample_num;
        draft.prompt = payload.prompt;
        draft.prompt_checkbox = payload.prompt_checkbox;
        draft.data = data;
        draft.modelList = payload.modelList;
        draft.enhanced_proportion = payload.enhanced_proportion;
        draft.sample_data = payload.sample_data;
        draft.app_scenarios_name = payload.app_scenarios_name;
        draft.customPromptChecked = payload.customPromptChecked;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );
  return {
    readOnly,
    inputs,
    handleVarListChange,
    handleAddVariable,
    onValuesChange
  };
};

export default useConfig;
