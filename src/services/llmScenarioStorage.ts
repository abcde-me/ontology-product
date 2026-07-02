import { LLM_ENV_DEFAULTS } from '@/config/llmDefaults';
import {
  buildEmbeddingModelConfig,
  EMBEDDING_ENV_DEFAULTS,
  resolveEmbeddingApiKey,
  type EmbeddingModelConfig
} from '@/config/embeddingDefaults';
import {
  BUILTIN_LLM_SCENARIOS,
  resolveLlmScenarioModule,
  sortLlmScenarioDefinitions
} from '@/services/llmScenarioDefinitions';
import { getRegisteredLlmScenario } from '@/services/llmScenarioRegistry';
import type {
  LlmScenarioConfig,
  ListLlmScenarioRes,
  UpdateLlmScenarioReq
} from '@/types/llmScenario';

const STORAGE_KEY = 'ONTO_LLM_SCENARIO_CONFIG';
const ONTOLOGY_FIELD_VECTORIZATION_CODE = 'ontology_field_vectorization';

const isEmbeddingScenario = (code: string) =>
  code === ONTOLOGY_FIELD_VECTORIZATION_CODE;

const buildDefaultConfig = (
  definition: (typeof BUILTIN_LLM_SCENARIOS)[number]
): LlmScenarioConfig => ({
  code: definition.code,
  name: definition.name,
  module: resolveLlmScenarioModule(definition),
  description: definition.description,
  enabled: true,
  provider: isEmbeddingScenario(definition.code)
    ? EMBEDDING_ENV_DEFAULTS.provider
    : LLM_ENV_DEFAULTS.provider,
  model: isEmbeddingScenario(definition.code)
    ? EMBEDDING_ENV_DEFAULTS.model
    : LLM_ENV_DEFAULTS.model,
  apiName: isEmbeddingScenario(definition.code)
    ? EMBEDDING_ENV_DEFAULTS.apiName
    : LLM_ENV_DEFAULTS.apiName,
  baseUrl: isEmbeddingScenario(definition.code)
    ? EMBEDDING_ENV_DEFAULTS.baseUrl
    : LLM_ENV_DEFAULTS.baseUrl
});

const readStore = (): Record<string, Partial<LlmScenarioConfig>> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Record<string, Partial<LlmScenarioConfig>>;
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, Partial<LlmScenarioConfig>>) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const mergeWithDefaults = (): LlmScenarioConfig[] => {
  const store = readStore();

  return sortLlmScenarioDefinitions([...BUILTIN_LLM_SCENARIOS]).map(
    (definition) => {
      const defaults = buildDefaultConfig(definition);
      const saved = store[definition.code] || {};

      return {
        ...defaults,
        ...saved,
        code: definition.code,
        name: definition.name,
        module: resolveLlmScenarioModule(definition),
        description: definition.description
      };
    }
  );
};

export const listLlmScenariosFromStorage = (): ListLlmScenarioRes => {
  const items = mergeWithDefaults();
  return { items, total: items.length };
};

export const getLlmScenarioFromStorage = (
  code: string
): LlmScenarioConfig | undefined => {
  return mergeWithDefaults().find((item) => item.code === code);
};

export const updateLlmScenarioInStorage = (
  params: UpdateLlmScenarioReq
): LlmScenarioConfig => {
  const definition = getRegisteredLlmScenario(params.code);

  if (!definition) {
    throw new Error('未知的大模型环节');
  }

  const store = readStore();
  const defaults = buildDefaultConfig(definition);
  const next: LlmScenarioConfig = {
    ...defaults,
    ...(store[params.code] || {}),
    ...params,
    code: definition.code,
    name: definition.name,
    module: resolveLlmScenarioModule(definition),
    description: definition.description,
    updatedAt: new Date().toISOString()
  };

  store[params.code] = next;
  writeStore(store);
  return next;
};

/** 判断指定环节是否启用大模型 */
export const isLlmScenarioEnabled = (code: string): boolean => {
  return getLlmScenarioFromStorage(code)?.enabled ?? true;
};

/** 获取指定环节的大模型参数（未启用时返回 null） */
export const getLlmScenarioModelConfig = (code: string) => {
  const scenario = getLlmScenarioFromStorage(code);

  if (!scenario?.enabled) {
    return null;
  }

  return {
    provider: scenario.provider,
    model: scenario.model,
    apiName: scenario.apiName,
    baseUrl: scenario.baseUrl
  };
};

/** 解析「本体字段向量化」环节的完整 Embedding 配置（含 API Key） */
export const resolveEmbeddingModelConfig = (): EmbeddingModelConfig => {
  const defaults = buildEmbeddingModelConfig();
  const scenario = getLlmScenarioFromStorage(ONTOLOGY_FIELD_VECTORIZATION_CODE);
  const apiKey = resolveEmbeddingApiKey();

  if (!scenario?.enabled) {
    return { ...defaults, apiKey };
  }

  return {
    apiName: scenario.apiName || defaults.apiName,
    apiKey,
    provider: scenario.provider || defaults.provider,
    model: scenario.model || defaults.model,
    baseUrl: scenario.baseUrl || defaults.baseUrl,
    dimension: defaults.dimension
  };
};

/** 解析指定环节的完整大模型配置（含 API Key） */
export const resolveScenarioLlmConfig = (code: string) => {
  const modelConfig = getLlmScenarioModelConfig(code);

  if (!modelConfig) {
    return null;
  }

  const apiKey = isEmbeddingScenario(code)
    ? resolveEmbeddingApiKey()
    : LLM_ENV_DEFAULTS.apiKey;

  return {
    ...modelConfig,
    apiKey
  };
};

/** 指定环节是否可用大模型（已启用且配置了 API Key） */
export const isScenarioLlmAvailable = (code: string): boolean => {
  const config = resolveScenarioLlmConfig(code);
  return !!config?.apiKey?.trim();
};
