import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type AudioParserNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<AudioParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    audio_pret: [],
    vad_enabled: 1,
    activity_mode: 1,
    is_open_multi_conv: 1,
    vad_options: ['vad', 'conv'],
    audio_model_id: '',
    after_proc: []
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
  checkValid(payload: AudioParserNodeType, t: any) {
    let errorMessages = '';
    const { selected_files_num, audio_model_id } = payload;

    if (selected_files_num <= 0) {
      errorMessages = '需要选择至少一个音频文件';
    }
    if (!audio_model_id) {
      errorMessages = '需要选择模型';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
