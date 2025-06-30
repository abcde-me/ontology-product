import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import type { TextParserNodeType, OutputVar } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import TextNodeDefault from './default';

const useConfig = (id: string, payload: TextParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const defaultConfig = TextNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<TextParserNodeType>(id, payload);

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
  // const handleFilesCountChange = useCallback((count: number) => {
  //   const newInputs = produce(inputs, (draft) => {
  //     draft.selected_files_num = count
  //   })
  //   console.log('handleFilesCountChange', count, inputs, newInputs)
  //   setInputs(newInputs)
  // }, [inputs, setInputs])
  const handleFiledsChange = useCallback(
    (fields: TextParserNodeType) => {
      const newInputs = produce(inputs, (draft) => {
        draft.text_slice_rule = fields.text_slice_rule;
        draft.slice_max_size = fields.slice_max_size;
        draft.text_proc_rules = fields.text_proc_rules;
        draft.text_ocr_model_id = fields.text_ocr_model_id;
        draft.text_pic_model_id = fields.text_pic_model_id;
        draft.text_emb_model_id = fields.text_emb_model_id;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  return {
    readOnly,
    inputs,
    handleFilesChange,
    // handleFilesCountChange,
    handleFiledsChange
  };
};

export default useConfig;
