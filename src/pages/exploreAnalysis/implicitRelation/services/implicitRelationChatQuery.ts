import type {
  ApplicationScenarioRule,
  InstanceInferenceResult,
  ThinkingProgressCallbacks
} from '@/pages/applicationScene/types';
import { executeInstanceInferenceQuery } from '@/pages/applicationScene/services/instanceInferenceQuery';
import { formatInstanceFieldBlock } from '@/pages/applicationScene/services/formatInstanceFields';
import type { GeneratedRichRelation, InferenceRule } from '../types';
import { resolveRuleDescription } from './ruleDescription';
import {
  getKnowledgeBaseContent,
  parseKnowledgeBaseId
} from './testDataSources';

export type ImplicitRelationDataSource = 'ontologyScene' | 'knowledgeBase';

export const convertToScenarioRules = (
  rules: InferenceRule[]
): ApplicationScenarioRule[] => {
  const now = new Date().toISOString();
  return rules
    .filter((rule) => rule.enabled !== false)
    .map((rule) => ({
      id: rule.id,
      scenarioId: 'implicit-relation',
      name: rule.name,
      condition:
        rule.category === 'rule'
          ? rule.condition || ''
          : resolveRuleDescription(rule),
      action:
        rule.category === 'rule'
          ? rule.action || '推导隐性关联'
          : '推导隐性关联',
      description: resolveRuleDescription(rule),
      priority: rule.priority ?? 3,
      enabled: rule.enabled,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt || now
    }));
};

export const buildRichRelationContext = (
  relations: GeneratedRichRelation[]
): string => {
  if (!relations.length) {
    return '';
  }

  return relations
    .map((relation) => `• ${relation.name}：${relation.description}`)
    .join('\n');
};

export const formatInstanceInferenceReply = (
  result: InstanceInferenceResult,
  sceneLabel?: string
): string => {
  const resolvedLines =
    result.resolvedValues
      ?.slice(0, 8)
      .map(
        (item) =>
          `• ${item.fieldLabel || item.fieldName}：${item.value}（${item.objectTypeName}）`
      )
      .join('\n') || '';

  const hitLines = result.hits
    .slice(0, 8)
    .map((hit) => {
      const rulePart = hit.matchedRuleNames.length
        ? `（规则：${hit.matchedRuleNames.join('、')}）`
        : '';

      let samplePart = '';
      if (hit.sampleInstances?.length) {
        const preview = hit.sampleInstances
          .slice(0, 2)
          .map((instance) =>
            formatInstanceFieldBlock(instance, hit.fieldLabels)
          )
          .join('\n\n');
        samplePart = `\n${preview}${
          hit.sampleInstances.length > 2 ? '\n    ...' : ''
        }`;
      }

      return `• ${hit.objectTypeName}：${hit.instanceCount} 条实例${rulePart}${samplePart}`;
    })
    .join('\n');

  const summaryPrefix = sceneLabel ? `【${sceneLabel}】\n` : '';
  const mainSections = [result.summary];
  if (resolvedLines) {
    mainSections.push(`查询结果：\n${resolvedLines}`);
  } else if (hitLines) {
    mainSections.push(hitLines);
  }

  return `${summaryPrefix}${mainSections.join('\n\n')}`;
};

const extractKnowledgeHint = (content: string, query: string) => {
  const tokens = query
    .split(/[\s,，;；、。]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);

  if (!tokens.length) {
    return '';
  }

  const paragraphs = content.split(/\n\n+/);
  return paragraphs
    .filter((paragraph) => tokens.some((token) => paragraph.includes(token)))
    .slice(0, 2)
    .join('\n\n');
};

const resolveKnowledgeSceneIds = (knowledgeBaseIds: string[]) => [
  ...new Set(
    knowledgeBaseIds
      .map((id) => parseKnowledgeBaseId(id)?.sceneId)
      .filter((sceneId): sceneId is number => Number.isFinite(sceneId))
  )
];

export const executeImplicitRelationChatQuery = async (params: {
  query: string;
  selectedRules: InferenceRule[];
  selectedRichRelations: GeneratedRichRelation[];
  dataSource: ImplicitRelationDataSource;
  ontologySceneIds: number[];
  knowledgeBaseIds: string[];
  sceneNameMap?: Record<number, string>;
  progress?: ThinkingProgressCallbacks;
}): Promise<{ content: string; results?: InstanceInferenceResult[] }> => {
  const {
    query,
    selectedRules,
    selectedRichRelations,
    dataSource,
    ontologySceneIds,
    knowledgeBaseIds,
    sceneNameMap = {},
    progress
  } = params;

  if (selectedRules.length === 0) {
    return { content: '请至少选择一条推理规则后再查询。' };
  }

  if (dataSource === 'ontologyScene' && ontologySceneIds.length === 0) {
    return { content: '请至少选择一个本体场景库。' };
  }

  if (dataSource === 'knowledgeBase' && knowledgeBaseIds.length === 0) {
    return { content: '请至少选择一个知识库。' };
  }

  const enabledRelations = selectedRichRelations.filter(
    (relation) => relation.enabled !== false
  );

  if (enabledRelations.length) {
    progress?.onThinkingLine?.(`▸ 已选补充关系 ${enabledRelations.length} 条`);
  }

  progress?.onThinkingLine?.(`▸ 已选推理规则 ${selectedRules.length} 条`);

  const rules = convertToScenarioRules(selectedRules);
  if (!rules.length) {
    return { content: '所选推理规则均已禁用，请启用后重试。' };
  }

  const richContext = buildRichRelationContext(enabledRelations);
  if (richContext) {
    progress?.onThinkingLine?.('▸ 补充关系上下文已注入');
  }

  let knowledgeHint = '';
  let targetSceneIds = ontologySceneIds;

  if (dataSource === 'ontologyScene') {
    progress?.onThinkingLine?.(
      `▸ 数据源：本体场景库（${ontologySceneIds.length} 个）`
    );
  } else {
    progress?.onThinkingLine?.(
      `▸ 数据源：知识库（${knowledgeBaseIds.length} 个）`
    );

    const knowledgeContents = knowledgeBaseIds
      .map((id) => getKnowledgeBaseContent(id))
      .filter(Boolean);

    if (knowledgeContents.length) {
      knowledgeHint = extractKnowledgeHint(
        knowledgeContents.join('\n\n'),
        query
      );
      progress?.onThinkingLine?.('▸ 已加载所选知识库内容');
    } else {
      progress?.onThinkingLine?.('▸ 所选知识库暂无内容');
    }

    targetSceneIds = resolveKnowledgeSceneIds(knowledgeBaseIds);
  }

  if (!targetSceneIds.length) {
    return {
      content: knowledgeHint
        ? `【知识库参考】\n${knowledgeHint}\n\n未找到可检索实例的关联场景库。`
        : '未找到可检索实例的关联场景库，请检查选择。'
    };
  }

  const results: InstanceInferenceResult[] = [];
  const replySections: string[] = [];

  for (const sceneId of targetSceneIds) {
    const sceneLabel = sceneNameMap[sceneId] || `场景 #${sceneId}`;
    progress?.onThinkingLine?.(`▸ 检索场景库：${sceneLabel}…`);

    const result = await executeInstanceInferenceQuery({
      ontologySceneId: sceneId,
      query,
      rules,
      progress
    });

    results.push(result);
    replySections.push(formatInstanceInferenceReply(result, sceneLabel));
  }

  let content =
    replySections.length > 1
      ? replySections.join('\n\n---\n\n')
      : replySections[0] || '未查询到结果。';

  if (knowledgeHint) {
    content = `【知识库参考】\n${knowledgeHint}\n\n${content}`;
  }

  if (richContext) {
    content = `【补充关系】\n${richContext}\n\n${content}`;
  }

  return { content, results };
};
