import type {
  CreateLlmModelReq,
  LlmModelConfig,
  ListLlmModelRes,
  UpdateLlmModelReq
} from '@/types/llmModel';
import {
  createLlmModelInStorage,
  deleteLlmModelInStorage,
  listLlmModelsFromStorage,
  updateLlmModelInStorage
} from '@/services/llmModelStorage';

export const fetchLlmModelList = (): Promise<ListLlmModelRes> => {
  return Promise.resolve(listLlmModelsFromStorage());
};

export const createLlmModel = (
  params: CreateLlmModelReq
): Promise<LlmModelConfig> => {
  return Promise.resolve(createLlmModelInStorage(params));
};

export const updateLlmModel = (
  params: UpdateLlmModelReq
): Promise<LlmModelConfig> => {
  return Promise.resolve(updateLlmModelInStorage(params));
};

export const deleteLlmModel = (id: string): Promise<void> => {
  return Promise.resolve(deleteLlmModelInStorage(id));
};
