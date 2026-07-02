import type {
  ApplicationScenario,
  ApplicationScenarioListItem,
  ApplicationScenarioRule,
  CreateApplicationScenarioInput
} from '../types';

const STORAGE_KEY = 'onto_application_scenarios_v1';

interface StoragePayload {
  scenarios: Record<string, ApplicationScenario>;
  rules: Record<string, ApplicationScenarioRule[]>;
}

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { scenarios: {}, rules: {} };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return {
      scenarios: parsed?.scenarios || {},
      rules: parsed?.rules || {}
    };
  } catch {
    return { scenarios: {}, rules: {} };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const generateId = () =>
  `app-scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const listApplicationScenarios = (): ApplicationScenarioListItem[] => {
  const { scenarios, rules } = readStorage();
  return Object.values(scenarios)
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .map((scenario) => ({
      ...scenario,
      ruleCount: (rules[scenario.id] || []).length
    }));
};

export const getApplicationScenario = (
  id: string
): ApplicationScenario | null => readStorage().scenarios[id] || null;

export const createApplicationScenario = (
  input: CreateApplicationScenarioInput
): ApplicationScenario => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('场景名称不能为空');
  }

  const now = new Date().toISOString();
  const scenario: ApplicationScenario = {
    id: generateId(),
    name,
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };

  const payload = readStorage();
  payload.scenarios[scenario.id] = scenario;
  payload.rules[scenario.id] = [];
  writeStorage(payload);
  return scenario;
};

export const updateApplicationScenario = (
  id: string,
  patch: Partial<
    Pick<ApplicationScenario, 'name' | 'description' | 'ontologySceneId'>
  >
): ApplicationScenario => {
  const payload = readStorage();
  const existing = payload.scenarios[id];
  if (!existing) {
    throw new Error('应用场景不存在');
  }

  const next: ApplicationScenario = {
    ...existing,
    ...patch,
    name: patch.name?.trim() || existing.name,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    updatedAt: new Date().toISOString()
  };

  payload.scenarios[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteApplicationScenario = (id: string) => {
  const payload = readStorage();
  if (!payload.scenarios[id]) {
    throw new Error('应用场景不存在');
  }

  delete payload.scenarios[id];
  delete payload.rules[id];
  writeStorage(payload);
};

export const listApplicationScenarioRules = (
  scenarioId: string
): ApplicationScenarioRule[] => {
  const payload = readStorage();
  return [...(payload.rules[scenarioId] || [])].sort(
    (left, right) => right.priority - left.priority
  );
};

export const saveApplicationScenarioRule = (
  rule: ApplicationScenarioRule
): ApplicationScenarioRule => {
  const payload = readStorage();
  if (!payload.scenarios[rule.scenarioId]) {
    throw new Error('应用场景不存在');
  }

  const rules = [...(payload.rules[rule.scenarioId] || [])];
  const index = rules.findIndex((item) => item.id === rule.id);
  if (index >= 0) {
    rules[index] = rule;
  } else {
    rules.unshift(rule);
  }

  payload.rules[rule.scenarioId] = rules;
  payload.scenarios[rule.scenarioId] = {
    ...payload.scenarios[rule.scenarioId],
    updatedAt: new Date().toISOString()
  };
  writeStorage(payload);
  return rule;
};

export const deleteApplicationScenarioRule = (
  scenarioId: string,
  ruleId: string
) => {
  const payload = readStorage();
  if (!payload.scenarios[scenarioId]) {
    throw new Error('应用场景不存在');
  }

  payload.rules[scenarioId] = (payload.rules[scenarioId] || []).filter(
    (item) => item.id !== ruleId
  );
  payload.scenarios[scenarioId] = {
    ...payload.scenarios[scenarioId],
    updatedAt: new Date().toISOString()
  };
  writeStorage(payload);
};

export const findApplicationScenarioRuleByName = (
  scenarioId: string,
  name: string
): ApplicationScenarioRule | undefined => {
  const normalized = name.trim().toLowerCase();
  return listApplicationScenarioRules(scenarioId).find(
    (item) => item.name.trim().toLowerCase() === normalized
  );
};
