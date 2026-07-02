/**
 * DeepSeek OpenAI 兼容 Embedding API
 * @see https://api-docs.deepseek.com/zh-cn/
 */
import {
  EMBEDDING_ENV_DEFAULTS,
  resolveEmbeddingApiKey,
  type EmbeddingModelConfig
} from '@/config/embeddingDefaults';
import {
  extractUsageFromChatResponse,
  recordModelTokenUsage
} from '@/services/llmTokenUsageStorage';
import { isWujie } from '@/utils/env';

const DEV_PROXY_FALLBACK = 'http://localhost:9070/deepseek-api';
const REQUEST_TIMEOUT_MS = 60000;

const EMBEDDING_MODEL_CANDIDATES = [
  EMBEDDING_ENV_DEFAULTS.model,
  'embedding',
  'deepseek-embedding',
  'text-embedding-v1'
].filter((item, index, arr) => item && arr.indexOf(item) === index);

const resolveDevProxyBase = (): string => {
  if (typeof window === 'undefined') {
    return DEV_PROXY_FALLBACK;
  }

  const configured =
    process.env.REACT_APP_EMBEDDING_DEV_PROXY?.trim() ||
    process.env.REACT_APP_AI_WORKBENCH_LLM_DEV_PROXY?.trim() ||
    '';

  if (configured) {
    try {
      const url = new URL(configured);
      const { protocol, hostname, port } = window.location;
      if (
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1'
      ) {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}${url.pathname.replace(/\/$/, '')}`;
      }
      return configured.replace(/\/$/, '');
    } catch {
      // ignore invalid env
    }
  }

  return `${window.location.origin}/deepseek-api`;
};

export const resolveEmbeddingRequestUrl = (
  config?: Pick<EmbeddingModelConfig, 'baseUrl'>
): string => {
  const configured =
    (config?.baseUrl || EMBEDDING_ENV_DEFAULTS.baseUrl)?.trim() || '';
  const useDevProxy =
    process.env.NODE_ENV === 'development' &&
    (!configured ||
      configured.startsWith('/') ||
      !/^https?:\/\//i.test(configured));

  if (useDevProxy) {
    if (isWujie) {
      return `${resolveDevProxyBase()}/v1/embeddings`;
    }
    return `${window.location.origin}/deepseek-api/v1/embeddings`;
  }

  const base = configured.replace(/\/$/, '') || 'https://api.deepseek.com';
  return `${base}/v1/embeddings`;
};

const resolveApiKey = (config?: EmbeddingModelConfig) =>
  config?.apiKey?.trim() || resolveEmbeddingApiKey();

const normalizeEmbeddingPayload = (payload: unknown): number[] => {
  if (Array.isArray(payload)) {
    return payload.map(Number).filter((value) => Number.isFinite(value));
  }

  if (payload && typeof payload === 'object') {
    const data = payload as { embedding?: unknown; data?: unknown[] };
    if (Array.isArray(data.embedding)) {
      return data.embedding
        .map(Number)
        .filter((value) => Number.isFinite(value));
    }
    const first = data.data?.[0] as { embedding?: unknown } | undefined;
    if (first && Array.isArray(first.embedding)) {
      return first.embedding
        .map(Number)
        .filter((value) => Number.isFinite(value));
    }
  }

  return [];
};

const createLocalFallbackEmbedding = (
  text: string,
  dimension: number
): number[] => {
  const normalized = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const tokens = new Set<string>();

  for (let index = 0; index < normalized.length; index += 1) {
    tokens.add(normalized[index]);
    if (index + 1 < normalized.length) {
      tokens.add(normalized.slice(index, index + 2));
    }
  }

  normalized.split(/\s+/).forEach((token) => {
    if (token) {
      tokens.add(token);
    }
  });

  const vector = new Array(dimension).fill(0);

  tokens.forEach((token) => {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const slot = Math.abs(hash) % dimension;
    vector[slot] += 1;
  });

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm <= 0) {
    return vector;
  }

  return vector.map((value) => value / norm);
};

const requestEmbeddings = async (
  input: string | string[],
  config?: EmbeddingModelConfig,
  allowLocalFallback = true
): Promise<number[][]> => {
  const texts = (Array.isArray(input) ? input : [input]).map((item) =>
    String(item ?? '').trim()
  );
  const dimension = config?.dimension || EMBEDDING_ENV_DEFAULTS.dimension;
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    if (allowLocalFallback) {
      console.warn('[Embedding] 未配置 API Key，使用本地近似向量（开发兜底）');
      return texts.map((text) => createLocalFallbackEmbedding(text, dimension));
    }

    throw new Error(
      '未配置 Embedding API Key。请在环境变量中设置 REACT_APP_EMBEDDING_API_KEY 或 REACT_APP_AI_WORKBENCH_LLM_API_KEY，并在模型管理中启用「本体字段向量化」'
    );
  }
  const url = resolveEmbeddingRequestUrl(config);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    for (const model of EMBEDDING_MODEL_CANDIDATES) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input: texts.length === 1 ? texts[0] : texts,
          model,
          encoding_format: 'float'
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 404) {
          continue;
        }

        const errorText = await response.text();
        throw new Error(errorText || `Embedding 请求失败 (${response.status})`);
      }

      const result = await response.json();
      const usage = extractUsageFromChatResponse(
        result as Record<string, unknown>
      );

      if (usage) {
        recordModelTokenUsage({
          provider: config?.provider || EMBEDDING_ENV_DEFAULTS.provider,
          model,
          usage: {
            promptTokens: usage.promptTokens,
            completionTokens: 0,
            totalTokens: usage.totalTokens
          }
        });
      }

      const rows = Array.isArray(result?.data) ? result.data : [result];
      const embeddings = rows
        .map((row: unknown) => normalizeEmbeddingPayload(row))
        .filter((row: number[]) => row.length > 0);

      if (embeddings.length === texts.length) {
        return embeddings;
      }
    }

    if (!allowLocalFallback) {
      throw new Error(
        'DeepSeek Embedding API 暂不可用，请确认模型已开通或稍后重试'
      );
    }

    console.warn(
      '[Embedding] DeepSeek /v1/embeddings 不可用，使用本地近似向量（仅开发兜底）'
    );
    return texts.map((text) => createLocalFallbackEmbedding(text, dimension));
  } finally {
    window.clearTimeout(timer);
  }
};

export const createEmbedding = async (
  text: string,
  config?: EmbeddingModelConfig
): Promise<number[]> => {
  const [embedding] = await requestEmbeddings(text, config);
  return embedding || [];
};

export const createEmbeddings = async (
  texts: string[],
  config?: EmbeddingModelConfig
): Promise<number[][]> => {
  if (!texts.length) {
    return [];
  }

  const batchSize = 16;
  const results: number[][] = [];

  for (let index = 0; index < texts.length; index += batchSize) {
    const chunk = texts.slice(index, index + batchSize);
    const embeddings = await requestEmbeddings(chunk, config);
    results.push(...embeddings);
  }

  return results;
};

export const cosineSimilarity = (left: number[], right: number[]): number => {
  if (!left.length || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm <= 0 || rightNorm <= 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};

export const serializeEmbeddingVector = (vector: number[]): string =>
  JSON.stringify(vector);

export const parseEmbeddingVector = (value: unknown): number[] | null => {
  if (Array.isArray(value)) {
    const vector = value.map(Number).filter((item) => Number.isFinite(item));
    return vector.length ? vector : null;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const vector = parsed.map(Number).filter((item) => Number.isFinite(item));
      return vector.length ? vector : null;
    }
  } catch {
    const vector = value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));
    return vector.length ? vector : null;
  }

  return null;
};
