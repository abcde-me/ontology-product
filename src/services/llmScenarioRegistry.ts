import {
  BUILTIN_LLM_SCENARIOS,
  sortLlmScenarioDefinitions,
  type LlmScenarioDefinition
} from '@/services/llmScenarioDefinitions';

export type { LlmScenarioDefinition };

const registry = new Map<string, LlmScenarioDefinition>();

const syncBuiltinScenarios = () => {
  BUILTIN_LLM_SCENARIOS.forEach((definition) => {
    if (!registry.has(definition.code)) {
      registry.set(definition.code, definition);
    }
  });
};

/** 注册大模型环节，新增 LLM 能力时调用即可自动出现在模型管理列表 */
export const registerLlmScenario = (
  definition: LlmScenarioDefinition
): LlmScenarioDefinition => {
  if (registry.has(definition.code)) {
    console.warn(
      `[LlmScenario] 环节 "${definition.code}" 已注册，将覆盖原有定义`
    );
  }

  registry.set(definition.code, definition);
  return definition;
};

/** 获取所有已注册环节（按 order、code 排序） */
export const getRegisteredLlmScenarios = (): LlmScenarioDefinition[] => {
  syncBuiltinScenarios();
  return sortLlmScenarioDefinitions(Array.from(registry.values()));
};

export const getRegisteredLlmScenario = (
  code: string
): LlmScenarioDefinition | undefined => {
  syncBuiltinScenarios();
  return registry.get(code);
};

export const isLlmScenarioRegistered = (code: string): boolean => {
  syncBuiltinScenarios();
  return registry.has(code);
};
