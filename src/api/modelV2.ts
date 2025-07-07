import UAPI from '@/api';
import { groupBy, pick, omit } from 'lodash-es';

export async function getModelList(params: any = {}) {
  return UAPI.RES.modelGet({}).get(params).inRegion().do();
}

export async function getModels(params: any = {}) {
  return UAPI.RES.models({}).get(params).inRegion().do();
}

export async function getProviders(params: any = {}) {
  return UAPI.RES.providers({}).get(params).inRegion().do();
}

export async function getModelsGroupByProvider(params: any = {}) {
  const { data: res } = await getModels();
  const modelsListMap = groupBy(res.data, 'provider_name');
  const modelsList: any[] = [];

  Object.keys(modelsListMap).forEach((providerName) => {
    modelsList.push({
      ...pick(modelsListMap[providerName][0], [
        'provider_id',
        'provider_name',
        'provider_icon_base64'
      ]),
      models: modelsListMap[providerName].map((p) =>
        omit(p, ['provider_id', 'provider_name', 'provider_icon_base64'])
      )
    });
  });

  return modelsList;
}
