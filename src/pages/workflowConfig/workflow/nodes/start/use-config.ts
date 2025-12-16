import { useCallback, useEffect } from 'react';
import produce from 'immer';
import type { StartNodeType } from './types';
import type { BlockEnum } from '@/pages/workflowConfig/workflow/types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import StartNodeDefault from './default';
import { useStoreApi } from 'reactflow';
import { getLoadTaskFiles } from '@/api/loadApi';
import { useNodeDataUpdate } from '@/pages/workflowConfig/workflow/hooks';
import { CATEGORY_MAP } from '@/pages/workflowConfig/workflow/nodes/constants';

const useConfig = (id: string, payload: StartNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();
  const { handleNodeDataUpdateWithSyncDraft } = useNodeDataUpdate();
  const store = useStoreApi();

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
        draft.data_category = payload.data_category.map((category) => {
          return {
            ...category,
            category_type: CATEGORY_MAP[category.category]
          };
        });
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

  const doFileConfigChange = (
    nodeType: BlockEnum,
    dataPathId: string | number,
    config: any
  ) => {
    const { getNodes } = store.getState();
    const targetNodes = getNodes().filter(
      (node: any) => node.data.type === nodeType
    );

    if (!targetNodes.length) return;

    const sourcePath = dataPathId;
    if (sourcePath && config.enabled && config.format.length) {
      const formats = config.format
        .join('/')
        .split('/')
        .map((f) => f.toLowerCase());
      // console.log('sourcePath', targetNodes, sourcePath, formats);
      getLoadTaskFiles({
        data_path_id: sourcePath,
        file_type: formats,
        file_size: 2 * 1024 * 1024 * 1024 - 1, // 过滤掉2G以上文件
        page_size: 1,
        page: 1
      }).then((res: any) => {
        targetNodes.forEach((n: any) => {
          handleNodeDataUpdateWithSyncDraft({
            id: n.id,
            data: {
              ...n.data,
              selected_files_num: res.data?.total || 0,
              files: []
            }
          });
        });
      });
    } else {
      targetNodes.forEach((n: any) => {
        handleNodeDataUpdateWithSyncDraft({
          id: n.id,
          data: {
            ...n.data,
            selected_files_num: 0,
            files: []
          }
        });
      });
    }
  };

  return {
    readOnly,
    updateInputs,
    updatePathName,
    doFileConfigChange,
    inputs
  };
};

export default useConfig;
