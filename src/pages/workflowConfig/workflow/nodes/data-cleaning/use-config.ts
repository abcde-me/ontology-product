import { useCallback, useEffect, useRef } from 'react';
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
  const inputRef = useRef(inputs);

  useEffect(() => {
    inputRef.current = inputs;
  }, [inputs]);

  const onValuesChange = useCallback(
    (payload: CodeNodeType) => {
      const newInputs = produce(inputRef.current, (draft: any) => {
        draft.type = 'cleaning';
        draft.title = '数据清洗节点';
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
        draft.mg_duplicate_checkbox = payload.mg_duplicate_checkbox;
        draft.mg_duplicate_ngram = payload.mg_duplicate_ngram;
        draft.mg_duplicate = payload?.mg_duplicate;
        draft.dclean_type = [
          {
            type: 'data_standardization',
            title: '数据标准化',
            options: {
              // 1 处理 0 不处理
              unicode: payload?.unicode ? 1 : 0,
              traditional_to_simplified: payload?.traditional_to_simplified
                ? 1
                : 0,
              case_transform: payload?.case_uniformity
                ? payload?.case_transform
                : 0
            }
          },
          {
            type: 'data_filter',
            title: '数据过滤',
            options: {
              threshold: payload?.threshold_switch ? payload?.threshold : 0
            }
          },
          {
            type: 'special_character_deletion',
            title: '特殊字符删除',
            options: {
              // 1 删除 0 不删除
              remove_url: payload?.remove_url ? 1 : 0,
              remove_invisible: payload?.remove_invisible ? 1 : 0,
              remove_html: payload?.remove_html ? 1 : 0
            }
          },
          {
            type: 'delete_sensitive_words',
            title: '去除敏感词',
            options: {
              // 1 处理 0 不处理
              mg_is: payload?.mg_is ? 1 : 0
            }
          },
          {
            type: 'data_detoxification',
            title: '数据去毒化',
            options: {
              //  1 去毒 0 不去毒
              qd_is: payload?.qd_is ? 1 : 0
            }
          },
          {
            type: 'data_filling',
            title: '数据填补',
            options: {
              // 1 处理 0 不处理
              df_is: payload?.df_is ? 1 : 0
            }
          },
          {
            type: 'outlier_handling',
            title: '异常值处理',
            options: {
              // 1 处理 0 不处理
              oh_is: payload?.oh_is ? 1 : 0
            }
          },
          {
            type: 'deduplication',
            title: '数据去重',
            options: {
              // 1 处理 0 不处理
              ngram:
                payload?.mg_duplicate_checkbox === 'ngram'
                  ? payload?.mg_duplicate_ngram
                  : 0,
              md5: payload?.mg_duplicate_checkbox === 'md5' ? 1 : 0
            }
          }
        ];
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
