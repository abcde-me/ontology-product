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
    is_embedding: payload.is_embedding,
    Knowledge_base_name: payload.Knowledge_base_name,
    target_path_name: findVariableNameById(
      payload.target_path_id,
      inputs?.dataSource,
      'name'
    )
  };
  const onValuesChange = useCallback(
    (payload: EndNodeType, dataSource: Array<any>) => {
      // 通过target_path_id来取dataSource中对应的name
      const newInputs = produce(inputs, (draft: any) => {
        draft.target_path_id = payload.target_path_id;
        draft.is_embedding = payload.is_embedding;
        draft.Knowledge_base_name = payload.Knowledge_base_name;
        draft.target_path_name = findVariableNameById(
          payload.target_path_id,
          dataSource,
          'name'
        );
        draft.data = data;
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
