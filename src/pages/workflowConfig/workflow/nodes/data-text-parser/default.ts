import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type TextParserNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<TextParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    text_slice_rule: 1,
    slice_max_size: 800,
    text_proc_rules: [1],
    text_ocr_model_id: '',
    text_pic_model_id: '',
    text_emb_model_id: ''
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
  checkValid(payload: TextParserNodeType, t: any) {
    let errorMessages = '';
    const {
      selected_files_num,
      text_emb_model_id,
      text_slice_rule,
      slice_max_size
    } = payload;

    if (selected_files_num <= 0 || selected_files_num === undefined) {
      errorMessages = '需要选择至少一个文本文件';
    }
    if (selected_files_num > 10) {
      errorMessages = '最多选择65536个文本文件';
    }
    if (!text_emb_model_id) {
      errorMessages = '需要选择模型';
    }
    if (text_slice_rule === 1 && !slice_max_size) {
      errorMessages = '请填写分段最大长度';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
