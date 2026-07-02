/** DeepSeek Embedding 环境变量默认配置 */
import { LLM_ENV_DEFAULTS } from './llmDefaults';

export const EMBEDDING_ENV_DEFAULTS = {
  /** 平台 API 名称（与 API Key 管理中的名称对应） */
  apiName: process.env.REACT_APP_EMBEDDING_API_NAME || 'embedding',
  apiKey: process.env.REACT_APP_EMBEDDING_API_KEY || '',
  provider: 'deepseek',
  /** DeepSeek OpenAI 兼容 Embedding 模型 ID */
  model: process.env.REACT_APP_EMBEDDING_MODEL || 'embedding',
  baseUrl:
    process.env.REACT_APP_EMBEDDING_BASE_URL ||
    (process.env.NODE_ENV === 'development'
      ? '/deepseek-api'
      : '/deepseek-api'),
  /** 向量维度（DeepSeek embedding 响应为准，此处为默认值） */
  dimension: Number(process.env.REACT_APP_EMBEDDING_DIMENSION) || 1536
};

export interface EmbeddingModelConfig {
  apiName: string;
  apiKey?: string;
  provider: string;
  model: string;
  baseUrl: string;
  dimension?: number;
}

export const buildEmbeddingModelConfig = (): EmbeddingModelConfig => ({
  apiName: EMBEDDING_ENV_DEFAULTS.apiName,
  apiKey: resolveEmbeddingApiKey(),
  provider: EMBEDDING_ENV_DEFAULTS.provider,
  model: EMBEDDING_ENV_DEFAULTS.model,
  baseUrl: EMBEDDING_ENV_DEFAULTS.baseUrl,
  dimension: EMBEDDING_ENV_DEFAULTS.dimension
});

/** 解析 Embedding 可用的 API Key（优先专用 Key，回退到 LLM Key） */
export const resolveEmbeddingApiKey = (): string =>
  EMBEDDING_ENV_DEFAULTS.apiKey?.trim() ||
  LLM_ENV_DEFAULTS.apiKey?.trim() ||
  '';

export const isEmbeddingConfigured = () => !!resolveEmbeddingApiKey();
