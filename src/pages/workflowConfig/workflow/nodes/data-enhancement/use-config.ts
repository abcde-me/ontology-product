import { useCallback, useRef, useEffect } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import type { CodeNodeType, EnhancementNodeType } from './types';
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
      console.log('让我看看什么时候这里的值变化了～');
      const newInputs = produce(inputRef.current, (draft: any) => {
        draft.type = 'enhancement';
        draft.title = '数据增强节点';
        draft.enha_modle_id = payload.enha_modle_id;
        draft.prompt_checkbox = payload.prompt_checkbox;
        draft.app_scenarios = {
          name: appScenarios[payload?.app_scenarios?.name],
          type: payload?.app_scenarios?.type,
          option: {
            sample_num: payload?.app_scenarios?.option?.sample_num,
            similarity_threshold:
              payload?.app_scenarios?.option?.similarity_threshold,
            generate_sample_num:
              payload?.app_scenarios?.option?.generate_sample_num,
            enhanced_proportion:
              payload?.app_scenarios?.option?.enhanced_proportion,
            is_prompt: payload.prompt_checkbox ? 1 : 0,
            prompt: payload?.app_scenarios?.option?.prompt,
            sample_data: payload?.app_scenarios?.option?.sample_data
          }
        };
        draft.customPromptChecked = payload.customPromptChecked;
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  const handleModelChange = useCallback(
    (payload: Partial<EnhancementNodeType>) => {
      const newInputs = produce(
        inputRef.current,
        (draft: EnhancementNodeType) => {
          if (payload.enha_modle_id) {
            draft.enha_modle_id = payload.enha_modle_id;
          }
          if (payload?.app_scenarios?.name) {
            draft.app_scenarios.name = payload.app_scenarios.name;
          }
        }
      );
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
    setBoostPageData,
    handleModelChange
  };
};

export default useConfig;
