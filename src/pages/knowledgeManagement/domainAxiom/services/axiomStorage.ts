import type {
  CreateDomainAxiomInput,
  DomainAxiom,
  DomainAxiomListItem,
  UpdateDomainAxiomInput
} from '../types';

const STORAGE_KEY = 'onto_domain_axiom_v1';

interface StoragePayload {
  axioms: Record<string, DomainAxiom>;
}

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { axioms: {} };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return { axioms: parsed?.axioms || {} };
  } catch {
    return { axioms: {} };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const generateId = () =>
  `domain-axiom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const listDomainAxioms = (): DomainAxiomListItem[] => {
  const { axioms } = readStorage();
  return Object.values(axioms).sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
};

export const getDomainAxiom = (id: string): DomainAxiom | null =>
  readStorage().axioms[id] || null;

export const createDomainAxiom = (
  input: CreateDomainAxiomInput & { creator: string }
): DomainAxiom => {
  const name = input.name.trim();
  const expression = input.expression.trim();
  if (!name) {
    throw new Error('公理名称不能为空');
  }
  if (!expression) {
    throw new Error('公理表达式不能为空');
  }

  const now = new Date().toISOString();
  const axiom: DomainAxiom = {
    id: generateId(),
    name,
    expression,
    description: input.description?.trim() || undefined,
    domain: input.domain?.trim() || undefined,
    ontologySceneId: input.ontologySceneId,
    ontologySceneName: input.ontologySceneName?.trim() || undefined,
    applicationScenarioId: input.applicationScenarioId?.trim() || undefined,
    applicationScenarioName: input.applicationScenarioName?.trim() || undefined,
    sourceType: input.sourceType,
    sourceFileName: input.sourceFileName?.trim() || undefined,
    enabled: input.enabled !== false,
    creator: input.creator.trim() || '未知用户',
    createdAt: now,
    updatedAt: now
  };

  const payload = readStorage();
  payload.axioms[axiom.id] = axiom;
  writeStorage(payload);
  return axiom;
};

export const createDomainAxiomsBatch = (
  inputs: Array<CreateDomainAxiomInput & { creator: string }>
): DomainAxiom[] => {
  if (!inputs.length) {
    throw new Error('请至少保留一条公理');
  }
  return inputs.map((item) => createDomainAxiom(item));
};

export const updateDomainAxiom = (
  id: string,
  patch: UpdateDomainAxiomInput
): DomainAxiom => {
  const payload = readStorage();
  const existing = payload.axioms[id];
  if (!existing) {
    throw new Error('领域公理不存在');
  }

  const next: DomainAxiom = {
    ...existing,
    name: patch.name?.trim() || existing.name,
    expression: patch.expression?.trim() || existing.expression,
    description:
      patch.description !== undefined
        ? patch.description.trim() || undefined
        : existing.description,
    domain:
      patch.domain !== undefined
        ? patch.domain.trim() || undefined
        : existing.domain,
    ontologySceneId:
      patch.ontologySceneId === null
        ? undefined
        : patch.ontologySceneId !== undefined
          ? patch.ontologySceneId
          : existing.ontologySceneId,
    ontologySceneName:
      patch.ontologySceneName === null
        ? undefined
        : patch.ontologySceneName !== undefined
          ? patch.ontologySceneName.trim() || undefined
          : existing.ontologySceneName,
    applicationScenarioId:
      patch.applicationScenarioId === null
        ? undefined
        : patch.applicationScenarioId !== undefined
          ? patch.applicationScenarioId.trim() || undefined
          : existing.applicationScenarioId,
    applicationScenarioName:
      patch.applicationScenarioName === null
        ? undefined
        : patch.applicationScenarioName !== undefined
          ? patch.applicationScenarioName.trim() || undefined
          : existing.applicationScenarioName,
    enabled: patch.enabled !== undefined ? patch.enabled : existing.enabled,
    updatedAt: new Date().toISOString()
  };

  if (!next.name) {
    throw new Error('公理名称不能为空');
  }
  if (!next.expression) {
    throw new Error('公理表达式不能为空');
  }

  payload.axioms[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteDomainAxiom = (id: string) => {
  const payload = readStorage();
  if (!payload.axioms[id]) {
    throw new Error('领域公理不存在');
  }
  delete payload.axioms[id];
  writeStorage(payload);
};
