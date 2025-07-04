import { useCallback, useEffect, useRef, useState } from 'react';
import produce from 'immer';
import type { VideoParserNodeType, OutputVar } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import TextNodeDefault from './default';

const useConfig = (id: string, payload: VideoParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const defaultConfig = TextNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<VideoParserNodeType>(id, payload);
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

  const handleFiledsChange = useCallback(
    (fields: VideoParserNodeType) => {
      const newInputs = produce(inputRef.current, (draft) => {
        draft.vad_enabled = fields.vad_options.includes('vad') ? 2 : 1;
        (draft.activity_mode = fields.activity_mode),
          (draft.is_open_multi_conv = fields.vad_options.includes('conv')
            ? 2
            : 1),
          (draft.vad_options = fields.vad_options);
        draft.audio_model_id = fields.audio_model_id;
        draft.after_proc = fields.after_proc;
        (draft.is_poly_orbit = fields.audio_options.includes('orbit') ? 2 : 1),
          (draft.is_denoise = fields.audio_options.includes('denoise') ? 2 : 1),
          (draft.audio_options = fields.audio_options);
      });
      setInputs(newInputs);
    },
    [setInputs]
  );

  return {
    readOnly,
    inputs,
    handleFilesChange,
    handleFiledsChange
  };
};

export default useConfig;
