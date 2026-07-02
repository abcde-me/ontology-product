import type {
  GeneratedRichRelation,
  ImplicitRelationKnowledge,
  InferenceRule
} from '../types';

const storageKey = (taskId: string) => `dev_implicit_relation_${taskId}`;

const emptyKnowledge = (): ImplicitRelationKnowledge => ({
  richRelations: [],
  inferenceRules: [],
  llmCommonSensePrompt: ''
});

export const getImplicitRelationKnowledge = (
  taskId: string
): ImplicitRelationKnowledge => {
  try {
    const raw = window.localStorage.getItem(storageKey(taskId));
    if (!raw) {
      return emptyKnowledge();
    }
    const parsed = JSON.parse(raw) as Partial<ImplicitRelationKnowledge>;
    return {
      richRelations: Array.isArray(parsed.richRelations)
        ? parsed.richRelations
        : [],
      inferenceRules: Array.isArray(parsed.inferenceRules)
        ? parsed.inferenceRules
        : [],
      llmCommonSensePrompt:
        typeof parsed.llmCommonSensePrompt === 'string'
          ? parsed.llmCommonSensePrompt
          : ''
    };
  } catch {
    return emptyKnowledge();
  }
};

const persistKnowledge = (
  taskId: string,
  knowledge: ImplicitRelationKnowledge
) => {
  window.localStorage.setItem(storageKey(taskId), JSON.stringify(knowledge));
  return knowledge;
};

export const saveRichRelations = (
  taskId: string,
  richRelations: GeneratedRichRelation[]
) => {
  const current = getImplicitRelationKnowledge(taskId);
  return persistKnowledge(taskId, { ...current, richRelations });
};

export const saveInferenceRules = (
  taskId: string,
  inferenceRules: InferenceRule[]
) => {
  const current = getImplicitRelationKnowledge(taskId);
  return persistKnowledge(taskId, { ...current, inferenceRules });
};

export const upsertInferenceRule = (
  taskId: string,
  rule: InferenceRule
): InferenceRule => {
  const current = getImplicitRelationKnowledge(taskId);
  const index = current.inferenceRules.findIndex((item) => item.id === rule.id);
  const nextRules =
    index >= 0
      ? current.inferenceRules.map((item, idx) => (idx === index ? rule : item))
      : [...current.inferenceRules, rule];
  saveInferenceRules(taskId, nextRules);
  return rule;
};

export const deleteInferenceRule = (taskId: string, ruleId: string) => {
  const current = getImplicitRelationKnowledge(taskId);
  saveInferenceRules(
    taskId,
    current.inferenceRules.filter((item) => item.id !== ruleId)
  );
};

export const saveImplicitRelationKnowledge = (
  taskId: string,
  knowledge: ImplicitRelationKnowledge
) => persistKnowledge(taskId, knowledge);

export const findInferenceRuleByName = (taskId: string, name: string) =>
  getImplicitRelationKnowledge(taskId).inferenceRules.find(
    (item) => item.name === name
  );
