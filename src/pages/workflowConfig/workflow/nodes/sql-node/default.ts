import type { NodeDefault } from '../../types';
import { SQLNodeConfig } from './types';
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks';
import { STRUCT_FLOW_NODES } from '@/pages/workflowConfig/workflow/constants';

const SQLNodeDefault: NodeDefault<SQLNodeConfig> = {
  defaultValue: {
    local_params: [
      {
        prop: undefined,
        direct: 'IN',
        type: 'VARCHAR',
        value: undefined
      }
    ],
    flow_type: 'struct',
    raw_script: undefined,
    fail_retry_interval: '1',
    fail_retry_times: '0',
    task_priority: 'MEDIUM'
  },
  getAvailablePrevNodes(isChatMode: boolean) {
    return ALL_COMPLETION_AVAILABLE_BLOCKS.filter((type) =>
      STRUCT_FLOW_NODES.includes(type)
    );
  },
  getAvailableNextNodes(isChatMode: boolean) {
    return ALL_COMPLETION_AVAILABLE_BLOCKS.filter((type) =>
      STRUCT_FLOW_NODES.includes(type)
    );
  },
  checkValid(payload: SQLNodeConfig) {
    let errorMessages = '';
    const { raw_script } = payload;
    if (!raw_script) {
      errorMessages = 'SQL脚本不可为空';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default SQLNodeDefault;
