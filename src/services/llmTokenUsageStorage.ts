import { listLlmModelsFromStorage } from '@/services/llmModelStorage';
import type {
  LlmModelTokenUsage,
  LlmModelTokenUsageMap,
  LlmTokenUsageSnapshot,
  RecordLlmTokenUsageParams
} from '@/types/llmTokenUsage';

const STORAGE_KEY = 'ONTO_LLM_MODEL_TOKEN_USAGE';

const emptyUsage = (modelId: string): LlmModelTokenUsage => ({
  modelId,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  requestCount: 0
});

const readStore = (): LlmModelTokenUsageMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as LlmModelTokenUsageMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (store: LlmModelTokenUsageMap) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const resolveModelIdByProviderModel = (
  provider?: string,
  model?: string
): string | undefined => {
  if (!model?.trim()) {
    return undefined;
  }

  const normalizedProvider = provider?.trim().toLowerCase();
  const normalizedModel = model.trim().toLowerCase();

  const matched = listLlmModelsFromStorage().items.find((item) => {
    const sameModel = item.model.trim().toLowerCase() === normalizedModel;
    const sameProvider =
      !normalizedProvider ||
      item.provider.trim().toLowerCase() === normalizedProvider;

    return sameModel && sameProvider;
  });

  return matched?.id;
};

const normalizeUsage = (
  usage: Partial<LlmTokenUsageSnapshot>
): LlmTokenUsageSnapshot => {
  const promptTokens = Math.max(0, Number(usage.promptTokens) || 0);
  const completionTokens = Math.max(0, Number(usage.completionTokens) || 0);
  const totalTokens =
    Math.max(0, Number(usage.totalTokens) || 0) ||
    promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    totalTokens
  };
};

export const recordModelTokenUsage = (params: RecordLlmTokenUsageParams) => {
  const usage = normalizeUsage(params.usage);
  if (
    usage.totalTokens <= 0 &&
    usage.promptTokens <= 0 &&
    usage.completionTokens <= 0
  ) {
    return;
  }

  const modelId =
    params.modelId ||
    resolveModelIdByProviderModel(params.provider, params.model);

  if (!modelId) {
    return;
  }

  const store = readStore();
  const current = store[modelId] || emptyUsage(modelId);

  store[modelId] = {
    modelId,
    promptTokens: current.promptTokens + usage.promptTokens,
    completionTokens: current.completionTokens + usage.completionTokens,
    totalTokens: current.totalTokens + usage.totalTokens,
    requestCount: current.requestCount + 1,
    lastUsedAt: new Date().toISOString()
  };

  writeStore(store);
};

export const getModelTokenUsageMap = (): LlmModelTokenUsageMap => readStore();

export const getModelTokenUsage = (
  modelId: string
): LlmModelTokenUsage | undefined => {
  return readStore()[modelId];
};

export const getAllModelsTokenUsageSummary = () => {
  const store = readStore();
  return Object.values(store).reduce(
    (summary, item) => ({
      promptTokens: summary.promptTokens + item.promptTokens,
      completionTokens: summary.completionTokens + item.completionTokens,
      totalTokens: summary.totalTokens + item.totalTokens,
      requestCount: summary.requestCount + item.requestCount
    }),
    {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      requestCount: 0
    }
  );
};

export const extractUsageFromChatResponse = (
  payload: Record<string, unknown> | null | undefined
): LlmTokenUsageSnapshot | null => {
  const usage = payload?.usage as Record<string, unknown> | undefined;
  if (!usage) {
    return null;
  }

  const promptTokens = Number(usage.prompt_tokens ?? usage.promptTokens ?? 0);
  const completionTokens = Number(
    usage.completion_tokens ?? usage.completionTokens ?? 0
  );
  const totalTokens = Number(usage.total_tokens ?? usage.totalTokens ?? 0);

  if (promptTokens + completionTokens + totalTokens <= 0) {
    return null;
  }

  return normalizeUsage({ promptTokens, completionTokens, totalTokens });
};

/** 粗略估算 Token 数（无 usage 字段时的兜底） */
export const estimateTokensFromText = (text: string): number => {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  const cjkCount = (normalized.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherCount = normalized.length - cjkCount;
  return Math.max(1, Math.ceil(cjkCount / 1.5 + otherCount / 4));
};

export const formatTokenCount = (value: number) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('zh-CN');
};
