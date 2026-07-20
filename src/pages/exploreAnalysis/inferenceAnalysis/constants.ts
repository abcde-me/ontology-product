import type {
  InferenceRelatedNode,
  InferenceTaskStatus,
  InferenceType
} from './types';

export const INFERENCE_ANALYSIS_BASE_PATH =
  '/tenant/compute/onto/exploreAnalysis/inferenceAnalysis';

export const INFERENCE_TYPE_LABEL: Record<InferenceType, string> = {
  root_cause: '根因分析',
  anomaly_detection: '异常检测',
  simulation_prediction: '推演预测'
};

/** 推理类型说明（新建弹窗等处展示） */
export const INFERENCE_TYPE_DESC: Record<InferenceType, string> = {
  root_cause: '从异常现象或目标结论出发，沿因果链追溯根本原因与关键影响因素。',
  anomaly_detection:
    '基于本体事实、映射与公理，识别偏离正常模式的数据、行为或状态异常。',
  simulation_prediction:
    '在已知事实与约束条件下，推演未来状态、趋势或可能结果。'
};

export const INFERENCE_TYPE_HINT =
  '根因分析侧重追溯原因；异常检测侧重发现偏离；推演预测侧重由现状推未来。';

/** 兼容旧版 forward / backward 存储值 */
export const LEGACY_INFERENCE_TYPE_LABEL: Record<string, string> = {
  forward: '推演预测',
  backward: '根因分析'
};

export const resolveInferenceTypeLabel = (type: string) =>
  INFERENCE_TYPE_LABEL[type as InferenceType] ||
  LEGACY_INFERENCE_TYPE_LABEL[type] ||
  type;

/** 兼容旧版 forward / backward 存储值 */
export const normalizeInferenceType = (type: string): InferenceType => {
  if (
    type === 'root_cause' ||
    type === 'anomaly_detection' ||
    type === 'simulation_prediction'
  ) {
    return type;
  }
  if (type === 'forward') {
    return 'simulation_prediction';
  }
  if (type === 'backward') {
    return 'root_cause';
  }
  return 'root_cause';
};

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
    label: INFERENCE_TYPE_LABEL.root_cause,
    value: 'root_cause',
    description: INFERENCE_TYPE_DESC.root_cause
  },
  {
    label: INFERENCE_TYPE_LABEL.anomaly_detection,
    value: 'anomaly_detection',
    description: INFERENCE_TYPE_DESC.anomaly_detection
  },
  {
    label: INFERENCE_TYPE_LABEL.simulation_prediction,
    value: 'simulation_prediction',
    description: INFERENCE_TYPE_DESC.simulation_prediction
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
