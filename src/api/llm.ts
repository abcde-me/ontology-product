import UAPI from '@/api';
import { ModelParameterRule } from '@/utils/type';

export function getLLMList() {
  return UAPI.RES.llmList({})
    .get()
    .inRegion()
    .do()
    .then((res) => res.data || []);
}
export function getLLMParams(
  provider: string,
  modelName: string
): Promise<ModelParameterRule[]> {
  return UAPI.RES.llmParams({ provider })
    .get({ model: modelName })
    .inRegion()
    .do()
    .then((res) => res.data || []);
}
