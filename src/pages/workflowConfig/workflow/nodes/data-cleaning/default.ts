import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { CodeLanguage, type CodeNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<CodeNodeType> = {
  defaultValue: {
    code: '',
    code_language: CodeLanguage.python3,
    variables: [],
    outputs: {}
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS.filter(
        (type) => type !== BlockEnum.End
      );
    return nodes;
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },

  checkValid(payload: CodeNodeType, t: any) {
    const isDataChecked = () => {
      return [unicode, traditional_to_simplified, case_uniformity].some(
        Boolean
      );
    };
    const isChecked = () => {
      return [remove_url, remove_invisible, remove_html].some(Boolean);
    };

    let errorMessages = '';
    const {
      data_standardization,
      threshold,
      threshold_switch,
      oh_is,
      df_is,
      qd_is,
      mg_is,
      ts_remove,
      remove_url,
      remove_invisible,
      remove_html,
      unicode,
      traditional_to_simplified,
      case_uniformity,
      case_transform,
    } = payload;
    // 是否有其中一项true
    const isCleaningChecked = () => {
      return [
        data_standardization && isDataChecked(),
        ts_remove && isChecked(),
        mg_is,
        qd_is,
        df_is,
        oh_is,
        threshold_switch && threshold > 0
      ].some(Boolean);
    };
    if (case_uniformity && !case_transform) {
      errorMessages = '请选择大小写统一';
    }
    if (!isCleaningChecked()) {
      errorMessages = '数据清洗类型至少选择一项';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
