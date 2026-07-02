/** 环境变量中的大模型默认配置 */
export const LLM_ENV_DEFAULTS = {
  apiName: process.env.REACT_APP_AI_WORKBENCH_LLM_API_NAME || 'aiontosys',
  apiKey:
    process.env.REACT_APP_AI_WORKBENCH_LLM_API_KEY ||
    (process.env.NODE_ENV === 'development'
      ? 'sk-173071e14f4f42309994f204a1955183'
      : ''),
  provider: 'deepseek',
  model: process.env.REACT_APP_AI_WORKBENCH_LLM_MODEL || 'deepseek-v4-pro',
  baseUrl:
    process.env.REACT_APP_AI_WORKBENCH_LLM_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? '/deepseek-api' : '/deepseek-api')
};
