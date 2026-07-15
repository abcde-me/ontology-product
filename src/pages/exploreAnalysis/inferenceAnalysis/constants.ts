import type {
  InferenceRelatedNode,
  InferenceTaskStatus,
  InferenceType
} from './types';

export const INFERENCE_TYPE_LABEL: Record<InferenceType, string> = {
  forward: '正向推理',
  backward: '逆向推理'
};

/** 推理类型说明（新建弹窗等处展示） */
export const INFERENCE_TYPE_DESC: Record<InferenceType, string> = {
  forward:
    '从已知事实、语义映射与领域公理出发，依据规则推导出新结论（由因推果）。',
  backward:
    '从目标结论或假设出发，反向追溯所需前提、证据与约束条件（由果溯因）。'
};

export const INFERENCE_TYPE_HINT =
  '正向推理侧重由已知推导结论；逆向推理侧重由目标反推条件。';

export const INFERENCE_STATUS_LABEL: Record<InferenceTaskStatus, string> = {
  not_started: '未开始',
  running: '进行中',
  completed: '已完成'
};

export const INFERENCE_STATUS_COLOR: Record<InferenceTaskStatus, string> = {
  not_started: 'gray',
  running: 'arcoblue',
  completed: 'green'
};

export const INFERENCE_TYPE_OPTIONS: Array<{
  label: string;
  value: InferenceType;
  description: string;
}> = [
  {
    label: INFERENCE_TYPE_LABEL.forward,
    value: 'forward',
    description: INFERENCE_TYPE_DESC.forward
  },
  {
    label: INFERENCE_TYPE_LABEL.backward,
    value: 'backward',
    description: INFERENCE_TYPE_DESC.backward
  }
];

export const INFERENCE_NODE_TYPE_LABEL: Record<
  InferenceRelatedNode['nodeType'],
  string
> = {
  scene: '本体场景',
  semantic_mapping: '语义映射',
  domain_axiom: '领域公理',
  concept: '概念节点',
  conclusion: '结论节点'
};

export const INFERENCE_NODE_TYPE_COLOR: Record<
  InferenceRelatedNode['nodeType'],
  string
> = {
  scene: 'cyan',
  semantic_mapping: 'arcoblue',
  domain_axiom: 'purple',
  concept: 'orangered',
  conclusion: 'green'
};
