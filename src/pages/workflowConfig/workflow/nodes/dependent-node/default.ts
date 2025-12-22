import type { NodeDefault } from '../../types';
import { DependentNodeConfig, DependRelation, SQLNodeConfig } from './types';
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/pages/workflowConfig/workflow/blocks';
import { STRUCT_FLOW_NODES } from '@/pages/workflowConfig/workflow/constants';

const DependentNodeDefault: NodeDefault<DependentNodeConfig> = {
  defaultValue: {
    relation: DependRelation.AND,
    depend_item_list: [],
    flow_type: 'struct',
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
  checkValid(payload: DependentNodeConfig) {
    let errorMessages = '';
    const { depend_item_list } = payload;
    if (!depend_item_list.length) {
      errorMessages = '至少选择一条前置任务';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};

export default DependentNodeDefault;
