import { useCallback } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import type { EndNodeType } from './types';
import { findVariableNameById } from '../utils';
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
  const data = {
    type: 'end',
    title: '结束节点',
    desc: '',
    selected: false,
    target_path_id: payload.target_path_id,
    target_path_name: findVariableNameById(
      payload.target_path_id,
      inputs?.dataSource,
      'name'
    )
  };
  const updateInputs = useCallback(
    (payload: EndNodeType) => {
      // 通过target_path_id来取dataSource中对应的name
      const newInputs = produce(inputs, (draft: any) => {
        draft.target_path_id = payload.target_path_id;
        draft.target_path_name = findVariableNameById(
          payload.target_path_id,
          inputs?.dataSource,
          'name'
        );
        draft.dataSource = payload.dataSource;
        draft.data = payload.data;
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
