import { SQLNodeConfig } from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import produce from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import SQLNodeDefault from '@/pages/workflowConfig/workflow/nodes/sql-node/default';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { useStoreApi } from 'reactflow';
import { cloneDeep, isArray } from 'lodash-es';

export default function useConfig(id: string, payload: SQLNodeConfig) {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const { inputs, setInputs } = useNodeCrud(id, payload);

  const handleValueChange = useCallback(
    (value: SQLNodeConfig) => {
      let newInputs = cloneDeep(inputs);
      newInputs = {
        ...newInputs,
        ...value
      };
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
