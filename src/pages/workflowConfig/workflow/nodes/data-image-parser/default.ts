import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type ImageParserNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const nodeDefault: NodeDefault<ImageParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    pic_model_id: '',
    image_model: '',
    pic_emb_model_id: ''
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
  checkValid(payload: ImageParserNodeType) {
    let errorMessages = '';
    const { selected_files_num, pic_model_id, pic_emb_model_id } = payload;

    if (selected_files_num <= 0 || selected_files_num === undefined) {
      errorMessages = '需要选择至少一个图片文件';
    }
    if (selected_files_num > 65536) {
      errorMessages = '最多选择65536个图片文件';
    }
    if (!pic_model_id || !pic_emb_model_id) {
      errorMessages = '需要选择模型';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
