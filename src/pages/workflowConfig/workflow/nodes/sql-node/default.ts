import type { NodeDefault } from '../../types';
import { SQLNodeConfig } from './types';
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks';
import { STRUCT_FLOW_NODES } from '@/pages/workflowConfig/workflow/constants';
import { STRUCT_NODE_EXEC_DEFAULT_PARAMS } from '@/pages/workflowConfig/workflow/nodes/constants';

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
    raw_script: undefined,
    ...STRUCT_NODE_EXEC_DEFAULT_PARAMS
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
