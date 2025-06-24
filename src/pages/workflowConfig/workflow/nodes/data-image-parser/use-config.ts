import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import type { ImageParserNodeType, OutputVar } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import TextNodeDefault from './default';

const useConfig = (id: string, payload: ImageParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useAppStore.getState().appDetail?.id;

  const defaultConfig = TextNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<ImageParserNodeType>(id, payload);

  useEffect(() => {
    const isReady = defaultConfig && Object.keys(defaultConfig).length > 0;
    if (isReady && inputs.selected_files_num === undefined) {
      setInputs({
        ...inputs,
        ...defaultConfig
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig]);

  const handleFilesChange = useCallback(
    (files: string[], count: number) => {
      const newInputs = produce(inputs, (draft) => {
        draft.files = files;
        draft.selected_files_num = count;
      });
      console.log('handleFilesChange', files, inputs, newInputs);
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  // const handleFilesCountChange = useCallback(
  //   (count: number) => {
  //     const newInputs = produce(inputs, (draft) => {
  //       draft.selected_files_num = count;
  //     });
  //     setInputs(newInputs);
  //   },
  //   [inputs, setInputs]
  // );

  const handleFiledsChange = useCallback(
    (fields: ImageParserNodeType) => {
      const newInputs = produce(inputs, (draft) => {
        draft.pic_model_id = fields.pic_model_id;
        draft.pic_embc_model_id = fields.pic_embc_model_id;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  return {
    readOnly,
    inputs,
    handleFilesChange,
    handleFiledsChange
  };
};

export default useConfig;
