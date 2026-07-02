import type { InferenceRuleCategory, RichRelationKind } from './types';

export const RICH_RELATION_KIND_OPTIONS: Array<{
  value: RichRelationKind;
  label: string;
  description: string;
}> = [
  {
    value: 'symmetric',
    label: '对称关系',
    description: '若存在 A→B，则推导 B→A 的潜在关联'
  },
  {
    value: 'transitive',
    label: '传递性关系',
    description: '若存在 A→B 且 B→C，则推导 A→C 的潜在关联'
  },
  {
    value: 'inverse',
    label: '逆关系',
    description: '为现有有向链接生成方向相反的逆关系'
  }
];

export const INFERENCE_RULE_CATEGORY_OPTIONS: Array<{
  value: InferenceRuleCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'rule',
    label: '逻辑推理（IF-ELSE）',
    description: '基于 IF-ELSE 条件分支的形式化逻辑推理'
  },
  {
    value: 'graphAlgorithm',
    label: '图推理',
    description: '基于图拓扑结构的邻域、连通、路径等算法推理'
  },
  {
    value: 'llmCommonSense',
    label: '大模型常识联想',
    description: '结合领域常识与大模型语义联想进行推理'
  }
];

export const GRAPH_ALGORITHM_OPTIONS = [
  { value: 'neighbor-1', label: '1 跳邻域' },
  { value: 'neighbor-2', label: '2 跳邻域' },
  { value: 'connected', label: '连通分量扩展' },
  { value: 'shortest-path', label: '最短路径' }
];
