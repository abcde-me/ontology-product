import { useCallback, useEffect, useRef, useState } from 'react';
import produce from 'immer';
import type { ImageParserNodeType, OutputVar } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import TextNodeDefault from './default';

const useConfig = (id: string, payload: ImageParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const defaultConfig = TextNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<ImageParserNodeType>(id, payload);
  const inputRef = useRef(inputs);

  useEffect(() => {
    inputRef.current = inputs;
  }, [inputs]);

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
      const newInputs = produce(inputRef.current, (draft) => {
        draft.files = files;
        draft.selected_files_num = count;
      });
      console.log('handleFilesChange', files, inputs, newInputs);
      setInputs(newInputs);
    },
    [setInputs]
  );

  const handleFieldsChange = useCallback(
    (fields: ImageParserNodeType) => {
      const newInputs = produce(inputRef.current, (draft) => {
        draft.pic_model_id = fields.pic_model_id;
        draft.pic_emb_model_id = fields.pic_emb_model_id;
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  const handleModelChange = useCallback(
    (fields: Partial<ImageParserNodeType>) => {
      const newInputs = produce(inputRef.current, (draft) => {
        if (fields.pic_model_id) {
          draft.pic_model_id = fields.pic_model_id;
        }
        if (fields.pic_emb_model_id) {
          draft.pic_emb_model_id = fields.pic_emb_model_id;
        }
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  return {
    readOnly,
    inputs,
    handleFilesChange,
    handleFieldsChange,
    handleModelChange
  };
};

export default useConfig;
