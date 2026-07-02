import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { ApplicationScenarioRule } from '../types';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

export interface AssistantQuickPrompt {
  id: string;
  label: string;
  value: string;
}

const MAX_PROMPTS = 4;

const truncateLabel = (text: string, max = 18) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const resolveSceneName = async (ontologySceneId: number) => {
  const sceneRes = await listOntologyModel({
    pageNo: 1,
    pageSize: 200,
    order: 'desc',
    orderBy: 'create_time'
  });

  if (!isOntologyApiSuccess(sceneRes) || !sceneRes.data?.result) {
    return undefined;
  }

  return sceneRes.data.result.find((item) => item.id === ontologySceneId)?.name;
};

const resolveObjectTypeNames = async (ontologySceneId: number) => {
  const topologyRes = await getOntologyTopology({ id: ontologySceneId });
  if (!isOntologyApiSuccess(topologyRes) || !topologyRes.data?.nodes?.length) {
    return [];
  }

  return topologyRes.data.nodes
    .map((node) => String(node.name || node.code || '').trim())
    .filter((name) => name.length > 0)
    .slice(0, 5);
};

export const buildAssistantQuickPrompts = async (params: {
  ontologySceneId?: number;
  rules: ApplicationScenarioRule[];
}): Promise<AssistantQuickPrompt[]> => {
  const { ontologySceneId, rules } = params;
  const enabledRules = rules.filter((rule) => rule.enabled);
  const prompts: AssistantQuickPrompt[] = [];

  if (!ontologySceneId) {
    if (enabledRules.length) {
      const rule = enabledRules[0];
      prompts.push({
        id: `rule-${rule.id}-pending-graph`,
        label: truncateLabel(`规则：${rule.name}`),
        value: `按规则查询：${rule.name}`
      });
    }

    prompts.push({
      id: 'hint-select-graph',
      label: '选择图谱后查询',
      value: enabledRules.length
        ? `按规则查询：${enabledRules[0].name}`
        : '查询对象类型相关实例'
    });

    if (!enabledRules.length) {
      prompts.push({
        id: 'create-generic-rule',
        label: '创建实例统计规则',
        value: '创建规则：实例覆盖检查：查询对象类型，则统计实例数量'
      });
    }

    return prompts.slice(0, MAX_PROMPTS);
  }

  const [sceneName, objectTypeNames] = await Promise.all([
    resolveSceneName(ontologySceneId),
    resolveObjectTypeNames(ontologySceneId)
  ]);

  enabledRules.slice(0, 2).forEach((rule) => {
    prompts.push({
      id: `query-rule-${rule.id}`,
      label: truncateLabel(`按规则：${rule.name}`),
      value: `按规则查询：${rule.name}`
    });
  });

  if (objectTypeNames.length >= 2) {
    const [first, second] = objectTypeNames;
    prompts.push({
      id: 'query-graph-pair',
      label: truncateLabel(`查询${first}与${second}`),
      value: `查询图谱「${sceneName || ontologySceneId}」中${first}与${second}相关实例`
    });
  } else if (objectTypeNames.length === 1) {
    const [objectTypeName] = objectTypeNames;
    prompts.push({
      id: 'query-graph-single',
      label: truncateLabel(`查询${objectTypeName}实例`),
      value: `查询${objectTypeName}相关实例`
    });
  }

  if (enabledRules[0]) {
    const rule = enabledRules[0];
    prompts.push({
      id: `update-rule-${rule.id}`,
      label: truncateLabel(`修改规则${rule.name}`),
      value: `修改规则 ${rule.name}：${rule.condition}，则 ${rule.action}`
    });
  } else if (objectTypeNames[0]) {
    const objectTypeName = objectTypeNames[0];
    prompts.push({
      id: 'create-rule-from-graph',
      label: truncateLabel(`创建${objectTypeName}规则`),
      value: `创建规则：${objectTypeName}实例统计：查询${objectTypeName}，则统计实例数量`
    });
  }

  if (!prompts.length) {
    prompts.push({
      id: 'fallback-query',
      label: '查询图谱实例',
      value: `查询图谱「${sceneName || ontologySceneId}」中的对象实例`
    });
  }

  const unique = new Map<string, AssistantQuickPrompt>();
  prompts.forEach((prompt) => {
    if (!unique.has(prompt.value)) {
      unique.set(prompt.value, prompt);
    }
  });

  return [...unique.values()].slice(0, MAX_PROMPTS);
};
