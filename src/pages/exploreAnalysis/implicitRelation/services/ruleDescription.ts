import { GRAPH_ALGORITHM_OPTIONS } from '../constants';
import type { InferenceRule } from '../types';

export const resolveRuleDescription = (rule: InferenceRule) => {
  if (rule.description?.trim()) {
    return rule.description.trim();
  }

  if (rule.category === 'rule') {
    const parts = [rule.condition, rule.action].filter(Boolean);
    return parts.length ? parts.join(' → ') : '-';
  }

  if (rule.category === 'graphAlgorithm') {
    const algorithmLabel =
      GRAPH_ALGORITHM_OPTIONS.find((item) => item.value === rule.graphAlgorithm)
        ?.label || rule.graphAlgorithm;
    return algorithmLabel
      ? `${algorithmLabel}${rule.maxDepth ? `，深度 ${rule.maxDepth}` : ''}`
      : '-';
  }

  if (rule.category === 'llmCommonSense') {
    return rule.prompt?.trim() || '-';
  }

  return '-';
};
