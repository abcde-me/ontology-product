import { SQLNodeConfig } from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import produce from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import SQLNodeDefault from '@/pages/workflowConfig/workflow/nodes/sql-node/default';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { useStoreApi } from 'reactflow';
import { isArray } from 'lodash-es';

export default function useConfig(id: string, payload: SQLNodeConfig) {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const { inputs, setInputs } = useNodeCrud(id, payload);

  const handleValueChange = useCallback(
    (value: SQLNodeConfig) => {
      const newInputs = produce(inputs, (draft) => {
        const {
          sql_id,
          local_params,
          raw_script,
          fail_retry_interval,
          fail_retry_times,
          task_priority
        } = value;
        draft.sql_id = sql_id;
        draft.raw_script = raw_script;
        draft.local_params = local_params;
        draft.task_priority = task_priority;
        draft.fail_retry_times = fail_retry_times;
        draft.fail_retry_interval = fail_retry_interval;
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
