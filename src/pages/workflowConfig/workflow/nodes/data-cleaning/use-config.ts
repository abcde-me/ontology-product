import { useCallback } from 'react';
import produce from 'immer';
import useVarList from '../_base/hooks/use-var-list';
import type { CodeNodeType } from './types';
import useNodeCrud from '@/pages/workflowConfig/workflow/nodes/_base/hooks/use-node-crud';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';

const useConfig = (id: string, payload: CodeNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly();

  const appId = useTaskStore.getState().workflowDetail?.workflow_uuid;

  const { inputs, setInputs } = useNodeCrud<CodeNodeType>(id, payload);
  const { handleVarListChange, handleAddVariable } = useVarList<CodeNodeType>({
    inputs,
    setInputs
  });

  // 数据清洗节点 数据整理
  const dataCleaning = {
    type: 'cleaning',
    title: '数据清洗节点',
    desc: '',
    desc_type: [
      {
        type: 'data_standardization',
        title: '数据标准化',
        options: {
          // 1 处理 2 不处理
          unicode: inputs?.unicode ? 2 : 1,
          traditional_to_simplified: inputs?.traditional_to_simplified ? 2 : 1,
          case_transform: inputs?.case_transform
        }
      },
      {
        type: 'data_filter',
        title: '数据过滤',
        options: {
          threshold: inputs?.threshold
        }
      },
      {
        type: 'special_character_deletion',
        title: '特殊字符删除',
        options: {
          // 1 删除 2 不删除
          remove_url: inputs?.remove_url ? 1 : 2,
          remove_invisible: inputs?.remove_invisible ? 1 : 2,
          remove_html: inputs?.remove_html ? 1 : 2
        }
      },
      {
        type: 'delete_sensitive_words',
        title: '去除敏感词',
        options: {
          // 1 处理 2 不处理
          mg_is: inputs?.mg_is ? 1 : 2
        }
      },
      {
        type: 'data_detoxification',
        title: '数据去毒化',
        options: {
          //  1 去毒 2 不去毒
          qd_is: inputs?.qd_is ? 1 : 2
        }
      },
      {
        type: 'data_filling',
        title: '数据填补',
        options: {
          // 1 处理 2 不处理
          df_is: inputs?.df_is ? 1 : 2
        }
      },
      {
        type: 'outlier_handling',
        title: '异常值处理',
        options: {
          // 1 处理 2 不处理
          oh_is: inputs?.oh_is ? 1 : 2
        }
      }
    ]
  };

  const onValuesChange = useCallback(
    (payload: CodeNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.data_standardization = payload.data_standardization;
        draft.threshold = payload.threshold;
        draft.threshold_switch = payload.threshold_switch;
        draft.oh_is = payload.oh_is ? 1 : 2;
        draft.df_is = payload.df_is ? 1 : 2;
        draft.qd_is = payload.qd_is ? 1 : 2;
        draft.mg_is = payload.mg_is ? 1 : 2;
        draft.ts_remove = payload.ts_remove;
        draft.remove_url = payload.remove_url ? 1 : 2;
        draft.remove_invisible = payload.remove_invisible ? 1 : 2;
        draft.remove_html = payload.remove_html ? 1 : 2;
        draft.unicode = payload.unicode ? 2 : 1;
        draft.traditional_to_simplified = payload.traditional_to_simplified
          ? 2
          : 1;
        draft.case_transform = payload.case_transform;
        draft.case_uniformity = payload.case_uniformity;
        draft.data = dataCleaning;
      });
      setInputs(newInputs);
    },
    [inputs, setInputs]
  );

  return {
    readOnly,
    inputs,
    handleVarListChange,
    handleAddVariable,
    onValuesChange
  };
};

export default useConfig;
