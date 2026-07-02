import type {
  CreateImplicitRelationTaskInput,
  ImplicitRelationTask,
  ImplicitRelationTaskListItem
} from '../types';
import { getImplicitRelationKnowledge } from './implicitRelationStore';

const STORAGE_KEY = 'onto_implicit_relation_tasks_v1';

interface StoragePayload {
  tasks: Record<string, ImplicitRelationTask>;
}

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tasks: {} };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return { tasks: parsed?.tasks || {} };
  } catch {
    return { tasks: {} };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const generateId = () =>
  `implicit-relation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const listImplicitRelationTasks = (): ImplicitRelationTaskListItem[] => {
  const { tasks } = readStorage();
  return Object.values(tasks)
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .map((task) => {
      const knowledge = getImplicitRelationKnowledge(task.id);
      return {
        ...task,
        ruleCount: knowledge.inferenceRules.length,
        richRelationCount: knowledge.richRelations.length
      };
    });
};

export const getImplicitRelationTask = (
  id: string
): ImplicitRelationTask | null => readStorage().tasks[id] || null;

export const createImplicitRelationTask = (
  input: CreateImplicitRelationTaskInput
): ImplicitRelationTask => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('任务名称不能为空');
  }

  const now = new Date().toISOString();
  const task: ImplicitRelationTask = {
    id: generateId(),
    name,
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };

  const payload = readStorage();
  payload.tasks[task.id] = task;
  writeStorage(payload);
  return task;
};

export const updateImplicitRelationTask = (
  id: string,
  patch: Partial<
    Pick<ImplicitRelationTask, 'name' | 'description' | 'ontologySceneId'>
  >
): ImplicitRelationTask => {
  const payload = readStorage();
  const existing = payload.tasks[id];
  if (!existing) {
    throw new Error('隐性关系任务不存在');
  }

  const next: ImplicitRelationTask = {
    ...existing,
    ...patch,
    name: patch.name?.trim() || existing.name,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    updatedAt: new Date().toISOString()
  };

  payload.tasks[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteImplicitRelationTask = (id: string) => {
  const payload = readStorage();
  if (!payload.tasks[id]) {
    throw new Error('隐性关系任务不存在');
  }

  delete payload.tasks[id];
  writeStorage(payload);
  window.localStorage.removeItem(`dev_implicit_relation_${id}`);
};
