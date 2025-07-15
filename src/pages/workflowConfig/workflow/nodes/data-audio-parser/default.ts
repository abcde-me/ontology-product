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
    activity_mode_num: '',
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
    const {
      selected_files_num,
      audio_model_id,
      activity_mode,
      activity_mode_num
    } = payload;

    if (selected_files_num <= 0 || selected_files_num === undefined) {
      errorMessages = '需要选择至少一个音频文件';
    }
    if (selected_files_num > 4096) {
      errorMessages = '最多选择4096个音频文件';
    }
    if (!audio_model_id) {
      errorMessages = '需要选择模型';
    }
    if (activity_mode === 2 && !activity_mode_num) {
      errorMessages = '需要填写时长';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
