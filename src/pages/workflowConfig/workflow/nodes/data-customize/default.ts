import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { type CustomNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const nodeDefault: NodeDefault<CustomNodeType> = {
  defaultValue: {
    script_content: '',
    scripting_type: '',
    engine_id: '',
    desc: '执行自定义Python代码逻辑',
    custom_run_status: false
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
  checkValid(payload: CustomNodeType) {
    let errorMessages = '';
    const { script_content, custom_run_status } = payload;

    if (!custom_run_status) {
      errorMessages = '代码运行失败';
    }

    if (script_content === '') {
      errorMessages = '代码不可为空';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
