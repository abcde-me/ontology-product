import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import type { EndNodeType } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const nodeDefault: NodeDefault<EndNodeType> = {
  defaultValue: {
    outputs: []
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS.filter(
          (type) => type !== BlockEnum.End
        );
    return nodes;
  },
  getAvailableNextNodes() {
    return [];
  },
  checkValid(payload: EndNodeType) {
    let isValid = true;
    let errorMessages = '';
    if (payload.target_path === undefined) {
      isValid = true;
      errorMessages = '数据目标目录未配置';
    }
    return {
      isValid,
      errorMessage: errorMessages
    };
  }
};

export default nodeDefault;
