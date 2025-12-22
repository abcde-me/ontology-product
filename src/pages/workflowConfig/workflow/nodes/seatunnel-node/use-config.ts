import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import produce from 'immer';
import { useCallback } from 'react';
import { SeatunnelConfig } from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';

export default function useConfig(id: string, payload: SeatunnelConfig) {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const { inputs, setInputs } = useNodeCrud(id, payload);

  const handleValueChange = useCallback(
    (value: SeatunnelConfig) => {
      const newInputs = produce(inputs, (draft) => {
        Object.entries(value).forEach(([key, value]) => {
          draft[key] = value;
        });
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  return {
    readOnly,
    onValuesChange: handleValueChange,
    inputs
  };
}
