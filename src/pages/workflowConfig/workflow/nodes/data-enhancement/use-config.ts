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

  const newDataEnhancement = {
    type: 'enhancement',
    title: '数据增强节点',
    desc: '',
    app_scenarios: inputs?.app_scenarios, // 应用场景
    sample_num: inputs?.sample_num, // 指令生成依赖样本数
    similarity_threshold: inputs?.similarity_threshold, // 过滤相似度阈值,0~1
    generate_sample_num: inputs?.generate_sample_num, //生成样本数
    prompt: inputs?.prompt, // 提示词
    enha_modle_id: inputs?.enha_modle_id // 数据增强模型
  };

  const updateInputs = useCallback(
    (payload: EnhancementNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.app_scenarios = payload.app_scenarios;
        draft.enha_modle_id = payload.enha_modle_id;
        draft.generate_sample_num = payload?.generate_sample_num;
        draft.similarity_threshold = payload?.similarity_threshold;
        draft.sample_num = payload?.sample_num;
        draft.prompt = payload.prompt;
        draft.prompt_checkbox = payload.prompt_checkbox;
        draft.newDataEnhancement = newDataEnhancement;
        draft.modelList = payload.modelList;
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
    updateInputs
  };
};

export default useConfig;
