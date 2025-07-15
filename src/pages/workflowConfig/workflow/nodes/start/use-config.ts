import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import { useBoolean } from 'ahooks';
import type { StartNodeType } from './types';
import { ChangeType } from '@/pages/workflowConfig/workflow/types';
import type {
  InputVar,
  MoreInfo,
  ValueSelector
} from '@/pages/workflowConfig/workflow/types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import {
  useIsChatMode,
  useNodesReadOnly,
  useWorkflow
} from '@/pages/workflowConfig/workflow/hooks';
import StartNodeDefault from './default';

const useConfig = (id: string, payload: StartNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const defaultConfig = StartNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<StartNodeType>(id, payload);

  useEffect(() => {
    const isReady = defaultConfig && Object.keys(defaultConfig).length > 0;
    if (isReady) {
      setInputs({
        ...defaultConfig,
        ...inputs
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig]);

  const updateInputs = useCallback(
    (payload: StartNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.data_path_id = payload.data_path_id;
        draft.data_path_name = payload.data_path_name;
        draft.data_category = payload.data_category;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  const updatePathName = useCallback(
    (name: string) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.data_path_name = name;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  return {
    readOnly,
    updateInputs,
    updatePathName,
    inputs
  };
};

export default useConfig;
