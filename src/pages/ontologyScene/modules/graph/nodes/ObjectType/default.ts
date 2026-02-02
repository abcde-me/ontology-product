import {
  ALL_BLOCKS_WITHOUT_END,
  ALL_BLOCKS_WITHOUT_START
} from '@ceai-front/workflow';
import type { NodeDefault } from '@ceai-front/workflow';

const nodeDefault: NodeDefault<any> = {
  defaultValue: {
    _isSingleRun: true,
    variables: [],
    outputs: [
      {
        variable: 'arrstring',
        label: 'arrstring',
        required: false,
        type: 'array[string]' as any
      },
      {
        variable: 'arrobj',
        label: 'arrobj',
        required: false,
        type: 'array[object]' as any,
        children: [
          {
            variable: 'text',
            label: 'text',
            required: false,
            type: 'string' as any,
            id: '112223'
          },
          {
            variable: 'number',
            label: 'number',
            required: false,
            type: 'number' as any,
            id: '112224'
          }
        ],
        id: '11222'
      }
    ]
  },
  getAvailablePrevNodes() {
    return ALL_BLOCKS_WITHOUT_END();
  },
  getAvailableNextNodes() {
    const nodes = ALL_BLOCKS_WITHOUT_START().filter(
      (type: string) => type !== 'llm'
    );
    return nodes;
  },
  getUsedVars(payload: any) {
    return [];
  },
  updateUsedVars() {},
  checkValid() {
    return {
      isValid: false,
      errorMessage: '这里有错误哦~~'
    };
  }
};

export default nodeDefault;
