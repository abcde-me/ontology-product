import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { SeatunnelConfig } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';

const SeatunnelNodeDefault: NodeDefault<SeatunnelConfig> = {
  defaultValue: {
    fail_retry_interval: '1',
    fail_retry_times: '3',
    task_priority: 'MEDIUM',
    desc: ''
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS.filter(
          (type) => type !== BlockEnum.End
        );
    return nodes.filter(({}) => {});
  },
  getAvailableNextNodes(isChatMode: boolean) {
    const nodes = isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },
  checkValid(payload: SeatunnelConfig) {
    const errorMessages = '';
    // const { raw_script, sql_id } = payload;
    // if (!raw_script) {
    //   errorMessages = 'SQL脚本不可为空';
    // }
    //
    // if (!sql_id?.length) {
    //   errorMessages = '请选择SQL脚本';
    // }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};
export default SeatunnelNodeDefault;
