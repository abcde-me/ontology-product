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
          unicode: inputs?.unicode,
          traditional_to_simplified: inputs?.traditional_to_simplified,
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
          remove_url: inputs?.remove_url,
          remove_invisible: inputs?.remove_invisible,
          remove_html: inputs?.remove_html
        }
      },
      {
        type: 'delete_sensitive_words',
        title: '去除敏感词',
        options: {
          mg_is: inputs?.mg_is
        }
      },
      {
        type: 'data_detoxification',
        title: '数据去毒化',
        options: {
          qd_is: inputs?.qd_is
        }
      },
      {
        type: 'data_filling',
        title: '数据去毒化',
        options: {
          df_is: inputs?.df_is
        }
      },
      {
        type: 'outlier_handling',
        title: '异常值处理',
        options: {
          oh_is: inputs?.oh_is
        }
      }
    ]
  };

  const updateInputs = useCallback(
    (payload: CodeNodeType) => {
      const newInputs = produce(inputs, (draft: any) => {
        draft.data_standardization = payload.data_standardization;
        draft.threshold = payload.threshold;
        draft.threshold_switch = payload.threshold_switch;
        draft.oh_is = payload.oh_is;
        draft.df_is = payload.df_is;
        draft.qd_is = payload.qd_is;
        draft.mg_is = payload.mg_is;
        draft.ts_remove = payload.ts_remove;
        draft.remove_url = payload.remove_url;
        draft.remove_invisible = payload.remove_invisible;
        draft.remove_html = payload.remove_html;
        draft.unicode = payload.unicode;
        draft.traditional_to_simplified = payload.traditional_to_simplified;
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
    updateInputs
  };
};

export default useConfig;
