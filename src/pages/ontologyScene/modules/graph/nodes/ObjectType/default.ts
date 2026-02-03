import {
  ALL_BLOCKS_WITHOUT_END,
  ALL_BLOCKS_WITHOUT_START
} from '@ceai-front/workflow';
import type { NodeDefault } from '@ceai-front/workflow';

const nodeDefault: NodeDefault<any> = {
  defaultValue: {
    _isSingleRun: true,
    variables: [],
    outputs: []
  },
  getAvailablePrevNodes() {
    return ALL_BLOCKS_WITHOUT_END();
  },
  getAvailableNextNodes() {
    const nodes = ALL_BLOCKS_WITHOUT_START();
    return nodes;
  },
  getUsedVars(payload: any) {
    return [];
  },
  updateUsedVars() {},
  checkValid() {
    return {
      isValid: true,
      errorMessage: '这里有错误哦~~'
    };
  }
};

export default nodeDefault;
