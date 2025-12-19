import { BlockEnum } from '../../types';
import type { NodeDefault } from '../../types';
import { SeatunnelConfig } from './types';
import {
  ALL_CHAT_AVAILABLE_BLOCKS,
  ALL_COMPLETION_AVAILABLE_BLOCKS
} from '@/pages/workflowConfig/workflow/blocks';
import { isNil } from 'lodash-es';
import { STRUCT_FLOW_NODES } from '@/pages/workflowConfig/workflow/constants';

const SeatunnelNodeDefault: NodeDefault<SeatunnelConfig> = {
  defaultValue: {
    fail_retry_interval: '1',
    fail_retry_times: '3',
    task_priority: 'MEDIUM',
    desc: ''
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
  checkValid(payload: SeatunnelConfig) {
    let errorMessages = '';
    const {
      primary_keys = [],
      source_database,
      target_datasource_id,
      local_params,
      field_mapping_list = []
    } = payload;
    if (isNil(source_database)) {
      errorMessages = '来源表不能为空';
    } else if (
      !isNil(local_params) &&
      local_params.some(({ value }) => !value?.trim())
    ) {
      errorMessages = '参数不能为空';
    } else if (isNil(target_datasource_id)) {
      errorMessages = '目标表不能为空';
    } else if (!field_mapping_list.length) {
      errorMessages = '请选择同步字段';
    } else if (!primary_keys.length) {
      errorMessages = '主键不能为空';
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages
    };
  }
};
export default SeatunnelNodeDefault;
