import { LLM_ENV_DEFAULTS } from '@/config/llmDefaults';
import { AI_WORKBENCH_CHAT_SCENARIO } from '@/services/llmScenarios/definitions/aiWorkbenchChat.scenario';
import { ONTOLOGY_AGENT_CREATE_SCENARIO } from '@/services/llmScenarios/definitions/ontologyAgentCreate.scenario';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';

/**
 * AI 本体工作台 - DeepSeek Pro 大模型配置
 *
 * 通过 CreateOntologyAgent 创建 Agent 时注入，供后端调用 DeepSeek OpenAI 兼容接口。
 * @see https://api-docs.deepseek.com/zh-cn/
 *
 * 环境变量（见 .env.development）：
 * - REACT_APP_AI_WORKBENCH_LLM_API_NAME
 * - REACT_APP_AI_WORKBENCH_LLM_API_KEY
 * - REACT_APP_AI_WORKBENCH_LLM_MODEL
 * - REACT_APP_AI_WORKBENCH_LLM_BASE_URL
 */
export interface AIWorkbenchLlmConfig {
  /** API 名称（平台侧标识） */
  apiName: string;
  /** DeepSeek API Key */
  apiKey: string;
  /** 模型提供商 */
  provider: string;
  /** 模型 ID，Pro 大模型为 deepseek-v4-pro */
  model: string;
  /** OpenAI 兼容 Base URL */
  baseUrl: string;
}

export const AI_WORKBENCH_LLM_CONFIG: AIWorkbenchLlmConfig = {
  apiName: LLM_ENV_DEFAULTS.apiName,
  apiKey: LLM_ENV_DEFAULTS.apiKey,
  provider: LLM_ENV_DEFAULTS.provider,
  model: LLM_ENV_DEFAULTS.model,
  baseUrl: LLM_ENV_DEFAULTS.baseUrl
};

/** AI 工作台直连 DeepSeek 对话（已配置 API Key 且环节已启用） */
export const shouldUseDirectLlmChat = () =>
  isScenarioLlmAvailable(AI_WORKBENCH_CHAT_SCENARIO.code);

/** 是否已配置可用的大模型 Key */
export const isAIWorkbenchLlmConfigured = shouldUseDirectLlmChat;

/** 创建本体 Agent 时附带的 LLM 参数 */
export const buildCreateOntologyAgentLlmPayload = () => {
  const config =
    resolveScenarioLlmConfig(ONTOLOGY_AGENT_CREATE_SCENARIO.code) ||
    AI_WORKBENCH_LLM_CONFIG;
  const { apiName, apiKey, provider, model, baseUrl } = config;

  if (!apiKey) {
    console.warn(
      '[AIWorkbench] 未配置 REACT_APP_AI_WORKBENCH_LLM_API_KEY，CreateOntologyAgent 可能失败'
    );
  }

  return {
    apiName,
    apiKey,
    provider,
    model,
    baseUrl
  };
};
