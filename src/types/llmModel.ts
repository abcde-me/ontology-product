/** 系统大模型配置 */
export interface LlmModelConfig {
  id: string;
  /** 展示名称 */
  name: string;
  /** 模型类型 */
  modelType: 'chat' | 'embedding';
  /** 模型提供商 */
  provider: string;
  /** 模型 ID */
  model: string;
  /** 平台 API Key 名称 */
  apiName: string;
  /** OpenAI 兼容 Base URL */
  baseUrl: string;
  /** 说明 */
  description?: string;
  /** 是否为系统预置模型 */
  isBuiltin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLlmModelReq {
  name: string;
  modelType: 'chat' | 'embedding';
  provider: string;
  model: string;
  apiName: string;
  baseUrl: string;
  description?: string;
}

export interface UpdateLlmModelReq extends CreateLlmModelReq {
  id: string;
}

export interface ListLlmModelRes {
  items: LlmModelConfig[];
  total: number;
}
