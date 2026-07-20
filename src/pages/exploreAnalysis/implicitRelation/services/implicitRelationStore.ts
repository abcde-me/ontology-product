import type {
  ImplicitDiscoveryResult,
  ImplicitRelationKnowledge
} from '../types';

const storageKey = (taskId: string) => `dev_implicit_relation_${taskId}`;

const emptyKnowledge = (): ImplicitRelationKnowledge => ({
  result: null
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
      result: parsed.result ?? null
    };
  } catch {
    return emptyKnowledge();
  }
};

export const saveImplicitRelationKnowledge = (
  taskId: string,
  knowledge: ImplicitRelationKnowledge
) => {
  window.localStorage.setItem(storageKey(taskId), JSON.stringify(knowledge));
  return knowledge;
};

export const saveDiscoveryResult = (
  taskId: string,
  result: ImplicitDiscoveryResult
) =>
  saveImplicitRelationKnowledge(taskId, {
    result
  });

export const clearDiscoveryResult = (taskId: string) =>
  saveImplicitRelationKnowledge(taskId, emptyKnowledge());

export const updateDiscoverySuggestedName = (
  taskId: string,
  discoveryId: string,
  suggestedName: string
): ImplicitRelationKnowledge | null => {
  const knowledge = getImplicitRelationKnowledge(taskId);
  if (!knowledge.result) {
    return null;
  }

  const trimmed = suggestedName.trim();
  if (!trimmed) {
    return knowledge;
  }

  const next: ImplicitRelationKnowledge = {
    result: {
      ...knowledge.result,
      discoveries: knowledge.result.discoveries.map((item) =>
        item.id === discoveryId ? { ...item, suggestedName: trimmed } : item
      )
    }
  };

  return saveImplicitRelationKnowledge(taskId, next);
};
