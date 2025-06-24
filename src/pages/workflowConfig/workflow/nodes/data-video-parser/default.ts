import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type VideoParserNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<VideoParserNodeType> = {
  defaultValue: {
    files: [],
    selected_files_num: -1,
    is_poly_orbit: 0,
    is_denoise: 0,
    audio_options: [],
    vad_enabled: 1,
    activity_mode: 1,
    is_open_multi_conv: 0,
    vad_options: ['vad'],
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
  checkValid(payload: VideoParserNodeType, t: any) {
    let errorMessages = '';
    const { selected_files_num } = payload;

    if (selected_files_num <= 0) {
      errorMessages = '需要选择至少一个视频文件';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
