import { useCallback, useEffect, useRef } from 'react';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import type { CustomNodeType, OutputVar } from './types';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import CustomNodeDefault from './default';
import produce from 'immer';

const useConfig = (id: string, payload: CustomNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const defaultConfig = CustomNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud(id, payload);
  const inputRef = useRef(inputs);

  useEffect(() => {
    inputRef.current = inputs;
  }, [inputs]);

  useEffect(() => {
    const isReady = defaultConfig && Object.keys(defaultConfig).length > 0;
    if (isReady && inputs.customize_code === undefined) {
      setInputs({
        ...inputs,
        ...defaultConfig
      });
    }
  }, [defaultConfig]);

  const handleValueChange = useCallback(
    (value: CustomNodeType) => {
      const newInputs = produce(inputRef.current, (draft) => {
        draft.customize_code = value.customize_code;
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  return {
    readOnly,
    inputs,
    handleValueChange
  };
};

export default useConfig;
