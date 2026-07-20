import type {
  CreateImplicitRelationTaskInput,
  ImplicitAnalysisScope,
  ImplicitRelationTask,
  ImplicitRelationTaskListItem
} from '../types';
import { getImplicitRelationKnowledge } from './implicitRelationStore';
import {
  formatInstanceScopeSummary,
  formatObjectTypeSummary
} from './scopeInstances';

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

const normalizeScope = (
  scope: ImplicitAnalysisScope | undefined,
  task: ImplicitRelationTask
): ImplicitAnalysisScope | undefined => {
  if (scope?.ontologySceneId && scope.objectTypes) {
    return {
      ontologySceneId: scope.ontologySceneId,
      ontologySceneName: scope.ontologySceneName,
      objectTypes: scope.objectTypes,
      instanceMode: scope.instanceMode === 'selected' ? 'selected' : 'all',
      instances: Array.isArray(scope.instances) ? scope.instances : []
    };
  }
  if (task.ontologySceneId) {
    return {
      ontologySceneId: task.ontologySceneId,
      ontologySceneName: task.ontologySceneName,
      objectTypes: [],
      instanceMode: 'all',
      instances: []
    };
  }
  return undefined;
};

const normalizeAlgorithm = (
  algorithm?: string
): ImplicitRelationTask['algorithm'] => {
  if (algorithm === 'path-prediction') {
    return 'path-prediction';
  }
  if (algorithm === 'spatiotemporal') {
    return 'spatiotemporal';
  }
  if (algorithm === 'core-node') {
    return 'core-node';
  }
  if (algorithm === 'weak-link') {
    return 'weak-link';
  }
  return 'community';
};

const normalizeTask = (task: ImplicitRelationTask): ImplicitRelationTask => {
  const scope = normalizeScope(task.scope, task);
  return {
    ...task,
    algorithm: normalizeAlgorithm(task.algorithm),
    ontologySceneId: scope?.ontologySceneId ?? task.ontologySceneId,
    ontologySceneName: scope?.ontologySceneName ?? task.ontologySceneName,
    scope
  };
};

export const listImplicitRelationTasks = (): ImplicitRelationTaskListItem[] => {
  const { tasks } = readStorage();
  return Object.values(tasks)
    .map(normalizeTask)
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .map((task) => {
      const knowledge = getImplicitRelationKnowledge(task.id);
      return {
        ...task,
        discoveryCount: knowledge.result?.discoveries.length ?? 0,
        lastRanAt: knowledge.result?.ranAt,
        objectTypeSummary: formatObjectTypeSummary(
          task.scope?.objectTypes || []
        ),
        instanceSummary: formatInstanceScopeSummary(
          task.scope?.instanceMode || 'all',
          task.scope?.instances.length || 0,
          task.scope?.objectTypes.length || 0
        )
      };
    });
};

export const getImplicitRelationTask = (
  id: string
): ImplicitRelationTask | null => {
  const task = readStorage().tasks[id];
  return task ? normalizeTask(task) : null;
};

export const createImplicitRelationTask = (
  input: CreateImplicitRelationTaskInput,
  options?: { allowIncompleteScope?: boolean }
): ImplicitRelationTask => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('任务名称不能为空');
  }

  const scope: ImplicitAnalysisScope | undefined = input.scope?.ontologySceneId
    ? {
        ontologySceneId: input.scope.ontologySceneId,
        ontologySceneName: input.scope.ontologySceneName,
        objectTypes: input.scope.objectTypes || [],
        instanceMode:
          input.scope.instanceMode === 'selected' ? 'selected' : 'all',
        instances: input.scope.instances || []
      }
    : undefined;

  if (!options?.allowIncompleteScope) {
    if (!scope?.ontologySceneId) {
      throw new Error('请选择本体图谱');
    }
    if (!scope.objectTypes.length) {
      throw new Error('请选择对象类型');
    }
    if (scope.instanceMode === 'selected' && !scope.instances.length) {
      throw new Error('请选择至少一个实例');
    }
  }

  const now = new Date().toISOString();

  const task: ImplicitRelationTask = {
    id: generateId(),
    name,
    description: input.description?.trim() || undefined,
    ontologySceneId: scope?.ontologySceneId,
    ontologySceneName: scope?.ontologySceneName,
    algorithm: input.algorithm,
    scope,
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
    Pick<
      ImplicitRelationTask,
      | 'name'
      | 'description'
      | 'ontologySceneId'
      | 'ontologySceneName'
      | 'algorithm'
      | 'scope'
    >
  >
): ImplicitRelationTask => {
  const payload = readStorage();
  const existing = payload.tasks[id];
  if (!existing) {
    throw new Error('关系挖掘任务不存在');
  }

  const nextScope = patch.scope
    ? normalizeScope(patch.scope, { ...existing, ...patch })
    : existing.scope;

  const next: ImplicitRelationTask = {
    ...normalizeTask(existing),
    ...patch,
    name: patch.name?.trim() || existing.name,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    scope: nextScope,
    ontologySceneId:
      nextScope?.ontologySceneId ??
      patch.ontologySceneId ??
      existing.ontologySceneId,
    ontologySceneName:
      nextScope?.ontologySceneName ??
      patch.ontologySceneName ??
      existing.ontologySceneName,
    updatedAt: new Date().toISOString()
  };

  payload.tasks[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteImplicitRelationTask = (id: string) => {
  const payload = readStorage();
  if (!payload.tasks[id]) {
    throw new Error('关系挖掘任务不存在');
  }

  delete payload.tasks[id];
  writeStorage(payload);
  window.localStorage.removeItem(`dev_implicit_relation_${id}`);
};
