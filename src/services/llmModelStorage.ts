import { EMBEDDING_ENV_DEFAULTS } from '@/config/embeddingDefaults';
import { LLM_ENV_DEFAULTS } from '@/config/llmDefaults';
import type {
  CreateLlmModelReq,
  LlmModelConfig,
  ListLlmModelRes,
  UpdateLlmModelReq
} from '@/types/llmModel';

const STORAGE_KEY = 'ONTO_LLM_MODEL_CONFIG';

const BUILTIN_CHAT_ID = 'builtin_deepseek_chat';
const BUILTIN_EMBEDDING_ID = 'builtin_deepseek_embedding';

const createId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

const buildBuiltinModels = (): LlmModelConfig[] => {
  const timestamp = nowIso();

  return [
    {
      id: BUILTIN_CHAT_ID,
      name: 'DeepSeek Pro（默认对话）',
      modelType: 'chat',
      provider: LLM_ENV_DEFAULTS.provider,
      model: LLM_ENV_DEFAULTS.model,
      apiName: LLM_ENV_DEFAULTS.apiName,
      baseUrl: LLM_ENV_DEFAULTS.baseUrl,
      description: '系统默认对话大模型，供各业务环节引用',
      isBuiltin: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: BUILTIN_EMBEDDING_ID,
      name: 'DeepSeek Embedding（默认向量）',
      modelType: 'embedding',
      provider: EMBEDDING_ENV_DEFAULTS.provider,
      model: EMBEDDING_ENV_DEFAULTS.model,
      apiName: EMBEDDING_ENV_DEFAULTS.apiName,
      baseUrl: EMBEDDING_ENV_DEFAULTS.baseUrl,
      description: '系统默认向量化模型，供本体字段向量化等场景引用',
      isBuiltin: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
};

const readStore = (): LlmModelConfig[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildBuiltinModels();
    }

    const parsed = JSON.parse(raw) as LlmModelConfig[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : buildBuiltinModels();
  } catch {
    return buildBuiltinModels();
  }
};

const writeStore = (items: LlmModelConfig[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const assertUniqueModel = (
  items: LlmModelConfig[],
  model: string,
  provider: string,
  excludeId?: string
) => {
  const duplicated = items.find(
    (item) =>
      item.id !== excludeId &&
      item.model === model.trim() &&
      item.provider === provider.trim()
  );

  if (duplicated) {
    throw new Error(`已存在相同模型配置：${duplicated.name}`);
  }
};

export const listLlmModelsFromStorage = (): ListLlmModelRes => {
  const items = readStore();
  return { items, total: items.length };
};

export const getLlmModelFromStorage = (
  id: string
): LlmModelConfig | undefined => {
  return readStore().find((item) => item.id === id);
};

export const createLlmModelInStorage = (
  params: CreateLlmModelReq
): LlmModelConfig => {
  const items = readStore();
  assertUniqueModel(items, params.model, params.provider);

  const timestamp = nowIso();
  const next: LlmModelConfig = {
    id: createId(),
    name: params.name.trim(),
    modelType: params.modelType,
    provider: params.provider.trim(),
    model: params.model.trim(),
    apiName: params.apiName.trim(),
    baseUrl: params.baseUrl.trim(),
    description: params.description?.trim(),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  writeStore([next, ...items]);
  return next;
};

export const updateLlmModelInStorage = (
  params: UpdateLlmModelReq
): LlmModelConfig => {
  const items = readStore();
  const index = items.findIndex((item) => item.id === params.id);

  if (index < 0) {
    throw new Error('模型配置不存在');
  }

  assertUniqueModel(items, params.model, params.provider, params.id);

  const current = items[index];
  const next: LlmModelConfig = {
    ...current,
    name: params.name.trim(),
    modelType: params.modelType,
    provider: params.provider.trim(),
    model: params.model.trim(),
    apiName: params.apiName.trim(),
    baseUrl: params.baseUrl.trim(),
    description: params.description?.trim(),
    updatedAt: nowIso()
  };

  items[index] = next;
  writeStore(items);
  return next;
};

export const deleteLlmModelInStorage = (id: string): void => {
  const items = readStore();
  const target = items.find((item) => item.id === id);

  if (!target) {
    throw new Error('模型配置不存在');
  }

  if (target.isBuiltin) {
    throw new Error('系统预置模型不可删除');
  }

  writeStore(items.filter((item) => item.id !== id));
};
