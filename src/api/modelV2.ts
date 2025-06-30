import UAPI from '@/api';
import { groupBy, pick, omit } from 'lodash-es';

export async function getModelList(params: any = {}) {
  // return UAPI.RES.modelGet({}).get(params).inRegion().do();
  return Promise.resolve({
    code: '',
    message: 'ok',
    data: [
      {
        type: 'audio_model',
        model_data: [
          {
            type: 'sentence',
            id: 6
          }
        ]
      },
      {
        type: 'enha_model',
        model_data: [
          {
            type: 'Qwen2.5-1.5B-Instruct',
            id: 5
          },
          {
            type: 'Llama-3.1-8B-Instruct',
            id: 14
          },
          {
            type: 'OpenAI o3',
            id: 15
          }
        ]
      },
      {
        type: 'pic_emb_model',
        model_data: [
          {
            type: 'sentence',
            id: 8
          }
        ]
      },
      {
        type: 'pic_model',
        model_data: [
          {
            type: 'sentence',
            id: 7
          }
        ]
      },
      {
        type: 'text_emb_model',
        model_data: [
          {
            type: 'sentence1',
            id: 11
          },
          {
            type: 'sentence2',
            id: 12
          },
          {
            type: 'sentence3',
            id: 13
          }
        ]
      },
      {
        type: 'text_ocr_model',
        model_data: [
          {
            type: 'sentence',
            id: 9
          }
        ]
      },
      {
        type: 'text_pic_model',
        model_data: [
          {
            type: 'sentence',
            id: 10
          }
        ]
      }
    ],
    requestId: 'AIMDP-2d9a2067-70b3-4706-a157-7f57c5a86d42',
    status: 200
  });
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
