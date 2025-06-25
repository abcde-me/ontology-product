import { useCallback } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import type { CodeNodeType } from './types';
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
    (payload: CodeNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.data_standardization = payload.data_standardization;
        draft.threshold = payload.threshold;
        draft.threshold_switch = payload.threshold_switch;
        draft.oh_is = payload.oh_is;
        draft.df_is = payload.df_is;
        draft.qd_is = payload.qd_is;
        draft.mg_is = payload.mg_is;
        draft.ts_remove = payload.ts_remove;
        draft.remove_url = payload.remove_url;
        draft.remove_invisible = payload.remove_invisible;
        draft.remove_html = payload.remove_html;
        draft.unicode = payload.unicode;
        draft.traditional_to_simplified = payload.traditional_to_simplified;
        draft.case_transform = payload.case_transform;
        draft.case_uniformity = payload.case_uniformity;
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
