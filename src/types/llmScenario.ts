/** 单个大模型环节配置 */
export interface LlmScenarioConfig {
  /** 环节唯一编码 */
  code: string;
  /** 环节名称 */
  name: string;
  /** 所属模块 */
  module: string;
  /** 环节说明 */
  description: string;
  /** 是否启用大模型 */
  enabled: boolean;
  /** 模型提供商 */
  provider: string;
  /** 模型 ID */
  model: string;
  /** 平台 API Key 名称（关联 API Key 管理） */
  apiName: string;
  /** OpenAI 兼容 Base URL */
  baseUrl: string;
  /** 最后更新时间 */
  updatedAt?: string;
}

export interface UpdateLlmScenarioReq {
  code: string;
  enabled: boolean;
  provider: string;
  model: string;
  apiName: string;
  baseUrl: string;
}

export interface ListLlmScenarioRes {
  items: LlmScenarioConfig[];
  total: number;
}
