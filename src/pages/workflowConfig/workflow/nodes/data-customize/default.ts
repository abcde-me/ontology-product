import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type CustomNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const i18nPrefix = 'workflow.errorMsg';

const nodeDefault: NodeDefault<CustomNodeType> = {
  defaultValue: {
    script_content: '',
    scripting_type: '',
    engine_id: ''
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
  checkValid(payload: CustomNodeType, t: any) {
    let errorMessages = '';
    const { script_content } = payload;

    if (!script_content) {
      errorMessages = '请输入自定义脚本';
    }
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
