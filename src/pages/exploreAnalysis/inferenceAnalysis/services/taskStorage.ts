import type {
  CreateInferenceAnalysisTaskInput,
  InferenceAnalysisTask,
  InferenceAnalysisTaskListItem,
  InferencePathStep,
  InferenceRelatedNode
} from '../types';

const STORAGE_KEY = 'onto_inference_analysis_tasks_v1';

/** 本地存储中可能仍存在旧版单数字段 */
interface LegacyInferenceAnalysisTask
  extends Omit<InferenceAnalysisTask, 'ontologySceneIds'> {
  ontologySceneIds?: number[];
  ontologySceneId?: number;
}

interface StoragePayload {
  tasks: Record<string, LegacyInferenceAnalysisTask>;
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
  `inference-analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeIds = (ids?: string[]) =>
  (ids || []).map((id) => String(id).trim()).filter(Boolean);

const normalizeSceneIds = (ids?: number[]) =>
  Array.from(
    new Set(
      (ids || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )
  );

/** 兼容旧版 ontologySceneId 单选字段 */
const resolveSceneIds = (task: LegacyInferenceAnalysisTask): number[] => {
  if (task.ontologySceneIds && task.ontologySceneIds.length > 0) {
    return normalizeSceneIds(task.ontologySceneIds);
  }
  if (task.ontologySceneId != null) {
    return normalizeSceneIds([task.ontologySceneId]);
  }
  return [];
};

const normalizePath = (
  steps?: InferencePathStep[]
): InferencePathStep[] | undefined => {
  if (!steps?.length) {
    return undefined;
  }
  return steps
    .map((step, index) => ({
      id: step.id || `path-${index + 1}`,
      order: Number.isFinite(step.order) ? step.order : index + 1,
      title: String(step.title || '').trim() || `步骤 ${index + 1}`,
      description: String(step.description || '').trim(),
      fromNode: step.fromNode?.trim() || undefined,
      toNode: step.toNode?.trim() || undefined,
      relation: step.relation?.trim() || undefined
    }))
    .sort((left, right) => left.order - right.order);
};

const normalizeRelatedNodes = (
  nodes?: InferenceRelatedNode[]
): InferenceRelatedNode[] | undefined => {
  if (!nodes?.length) {
    return undefined;
  }
  return nodes.map((node, index) => ({
    id: node.id || `node-${index + 1}`,
    name: String(node.name || '').trim() || `节点 ${index + 1}`,
    nodeType: node.nodeType || 'concept',
    role: String(node.role || '').trim() || '中间节点',
    conclusion: String(node.conclusion || '').trim() || '-',
    evidence: node.evidence?.trim() || undefined
  }));
};

const normalizeTask = (
  task: LegacyInferenceAnalysisTask
): InferenceAnalysisTask => ({
  id: task.id,
  name: task.name,
  description: task.description,
  inferenceType: task.inferenceType,
  status: task.status,
  ontologySceneIds: resolveSceneIds(task),
  semanticMappingIds: task.semanticMappingIds,
  domainAxiomIds: task.domainAxiomIds,
  resultContent: task.resultContent,
  inferencePath: normalizePath(task.inferencePath),
  relatedNodes: normalizeRelatedNodes(task.relatedNodes),
  creator: task.creator,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt
});

export const listInferenceAnalysisTasks =
  (): InferenceAnalysisTaskListItem[] => {
    const { tasks } = readStorage();
    return Object.values(tasks)
      .map(normalizeTask)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      );
  };

export const getInferenceAnalysisTask = (
  id: string
): InferenceAnalysisTask | null => {
  const task = readStorage().tasks[id];
  return task ? normalizeTask(task) : null;
};

export const createInferenceAnalysisTask = (
  input: CreateInferenceAnalysisTaskInput & { creator: string }
): InferenceAnalysisTask => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('任务名称不能为空');
  }
  if (!input.inferenceType) {
    throw new Error('请选择推理类型');
  }
  const ontologySceneIds = normalizeSceneIds(input.ontologySceneIds);
  if (ontologySceneIds.length === 0) {
    throw new Error('请选择本体场景');
  }

  const now = new Date().toISOString();
  const resultContent = input.resultContent?.trim() || undefined;
  const semanticMappingIds = normalizeIds(input.semanticMappingIds);
  const domainAxiomIds = normalizeIds(input.domainAxiomIds);
  const task: InferenceAnalysisTask = {
    id: generateId(),
    name,
    description: input.description?.trim() || undefined,
    inferenceType: input.inferenceType,
    status: resultContent ? 'completed' : 'running',
    ontologySceneIds,
    semanticMappingIds:
      semanticMappingIds.length > 0 ? semanticMappingIds : undefined,
    domainAxiomIds: domainAxiomIds.length > 0 ? domainAxiomIds : undefined,
    resultContent,
    inferencePath: normalizePath(input.inferencePath),
    relatedNodes: normalizeRelatedNodes(input.relatedNodes),
    creator: input.creator.trim() || '未知用户',
    createdAt: now,
    updatedAt: now
  };

  const payload = readStorage();
  payload.tasks[task.id] = task;
  writeStorage(payload);
  return task;
};

export const updateInferenceAnalysisTask = (
  id: string,
  patch: Partial<
    Pick<
      InferenceAnalysisTask,
      | 'name'
      | 'description'
      | 'inferenceType'
      | 'status'
      | 'ontologySceneIds'
      | 'semanticMappingIds'
      | 'domainAxiomIds'
      | 'resultContent'
      | 'inferencePath'
      | 'relatedNodes'
    >
  >
): InferenceAnalysisTask => {
  const payload = readStorage();
  const existingRaw = payload.tasks[id];
  if (!existingRaw) {
    throw new Error('推理分析任务不存在');
  }
  const existing = normalizeTask(existingRaw);

  const nextSemanticMappingIds =
    patch.semanticMappingIds !== undefined
      ? normalizeIds(patch.semanticMappingIds)
      : existing.semanticMappingIds;
  const nextDomainAxiomIds =
    patch.domainAxiomIds !== undefined
      ? normalizeIds(patch.domainAxiomIds)
      : existing.domainAxiomIds;
  const nextOntologySceneIds =
    patch.ontologySceneIds !== undefined
      ? normalizeSceneIds(patch.ontologySceneIds)
      : existing.ontologySceneIds;

  if (nextOntologySceneIds.length === 0) {
    throw new Error('请选择本体场景');
  }

  const next: InferenceAnalysisTask = {
    ...existing,
    ...patch,
    name: patch.name?.trim() || existing.name,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    ontologySceneIds: nextOntologySceneIds,
    semanticMappingIds:
      nextSemanticMappingIds && nextSemanticMappingIds.length > 0
        ? nextSemanticMappingIds
        : undefined,
    domainAxiomIds:
      nextDomainAxiomIds && nextDomainAxiomIds.length > 0
        ? nextDomainAxiomIds
        : undefined,
    resultContent:
      patch.resultContent !== undefined
        ? patch.resultContent?.trim() || undefined
        : existing.resultContent,
    inferencePath:
      patch.inferencePath !== undefined
        ? normalizePath(patch.inferencePath)
        : existing.inferencePath,
    relatedNodes:
      patch.relatedNodes !== undefined
        ? normalizeRelatedNodes(patch.relatedNodes)
        : existing.relatedNodes,
    updatedAt: new Date().toISOString()
  };

  payload.tasks[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteInferenceAnalysisTask = (id: string) => {
  const payload = readStorage();
  if (!payload.tasks[id]) {
    throw new Error('推理分析任务不存在');
  }

  delete payload.tasks[id];
  writeStorage(payload);
};
