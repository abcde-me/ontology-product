import { useCallback } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import { useStore } from '../../store';
import type { CodeNodeType, OutputVar, enhancementNodeType } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';


const useConfig = (id: string, payload: CodeNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useAppStore.getState().appDetail?.id;

  const { inputs, setInputs } = useNodeCrud<CodeNodeType>(id, payload);
  const { handleVarListChange, handleAddVariable } = useVarList<CodeNodeType>({
    inputs,
    setInputs
  });

  const updateInputs = useCallback(
    (payload: enhancementNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.app_scenarios = payload.app_scenarios;
        draft.enha_modle = payload.enha_modle;
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
