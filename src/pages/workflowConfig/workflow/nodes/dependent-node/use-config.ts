import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import { useCallback } from 'react';
import { cloneDeep } from 'lodash-es';
import { DependentNodeConfig } from '@/pages/workflowConfig/workflow/nodes/dependent-node/types';

export default function useConfig(id: string, payload: DependentNodeConfig) {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const { inputs, setInputs } = useNodeCrud(id, payload);

  const handleValueChange = useCallback(
    (value: DependentNodeConfig) => {
      const newInputs = cloneDeep(inputs);
      newInputs.fail_retry_interval = value.fail_retry_interval.toString();
      newInputs.fail_retry_times = value.fail_retry_times.toString();
      setInputs({ ...newInputs, ...value });
    },
    [setInputs]
  );

  return {
    readOnly,
    onValuesChange: handleValueChange,
    inputs
  };
}
