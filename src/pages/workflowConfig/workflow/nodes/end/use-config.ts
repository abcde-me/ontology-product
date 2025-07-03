import { useCallback } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import type { EndNodeType } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
const useConfig = (id: string, payload: EndNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();
  const { inputs, setInputs } = useNodeCrud<EndNodeType>(id, payload);

  const { handleVarListChange, handleAddVariable } = useVarList<EndNodeType>({
    inputs,
    setInputs: (newInputs) => {
      setInputs(newInputs);
    },
    varKey: 'outputs'
  });

  const updateInputs = useCallback(
    (payload: EndNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.target_path = payload.target_path;
        draft.target_path_name = payload.target_path_name;
        draft.dataSource = payload.dataSource;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );
  return {
    updateInputs,
    readOnly,
    inputs,
    handleVarListChange,
    handleAddVariable
  };
};

export default useConfig;
