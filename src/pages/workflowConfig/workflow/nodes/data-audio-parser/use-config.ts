import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import type { AudioParserNodeType, OutputVar } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import TextNodeDefault from './default';

const useConfig = (id: string, payload: AudioParserNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const defaultConfig = TextNodeDefault.defaultValue;
  const { inputs, setInputs } = useNodeCrud<AudioParserNodeType>(id, payload);

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
    (fields: AudioParserNodeType) => {
      const newInputs = produce(inputs, (draft) => {
        draft.audio_pret = fields.audio_pret;
        draft.vad_enabled = fields.vad_options.includes('vad') ? 2 : 1;
        (draft.activity_mode = fields.activity_mode),
          (draft.is_open_multi_conv = fields.vad_options.includes('conv')
            ? 2
            : 1),
          (draft.vad_options = fields.vad_options);
        draft.audio_model_id = fields.audio_model_id;
        draft.after_proc = fields.after_proc;
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
