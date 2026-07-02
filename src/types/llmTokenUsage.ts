/** 单模型 Token 使用统计 */
export interface LlmModelTokenUsage {
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requestCount: number;
  lastUsedAt?: string;
}

export interface LlmTokenUsageSnapshot {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface RecordLlmTokenUsageParams {
  modelId?: string;
  provider?: string;
  model?: string;
  usage: Partial<LlmTokenUsageSnapshot>;
}

export type LlmModelTokenUsageMap = Record<string, LlmModelTokenUsage>;
