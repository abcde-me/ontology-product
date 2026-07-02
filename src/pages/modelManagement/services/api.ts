import type {
  LlmScenarioConfig,
  ListLlmScenarioRes,
  UpdateLlmScenarioReq
} from '@/types/llmScenario';
import {
  listLlmScenariosFromStorage,
  updateLlmScenarioInStorage
} from '@/services/llmScenarioStorage';

export const fetchLlmScenarioList = (): Promise<ListLlmScenarioRes> => {
  return Promise.resolve(listLlmScenariosFromStorage());
};

export const updateLlmScenario = (
  params: UpdateLlmScenarioReq
): Promise<LlmScenarioConfig> => {
  return Promise.resolve(updateLlmScenarioInStorage(params));
};
