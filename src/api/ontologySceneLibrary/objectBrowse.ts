import UAPI from '@/api';

import { type EmbeddingModelConfig } from '@/config/embeddingDefaults';
import { resolveEmbeddingModelConfig } from '@/services/llmScenarioStorage';

import type {
  InstanceQueryRow,
  VectorSearchRow
} from '@/pages/exploreAnalysis/objectBrowse/types';

import { clientVectorSearchOntologyObjectTypeData } from '@/services/vectorSimilaritySearch';

import { isOntologyApiSuccess } from '@/utils/apiResponse';

import { isDevBypassEnabled } from '@/utils/devFallback';

import {
  getDevObjectTypeRecord,
  hasDevObjectTypeInstances,
  isDevObjectTypeId
} from '@/utils/devObjectTypeStore';

export interface VectorSearchOntologyObjectTypeDataReq {
  ontologyModelID: number;

  objectTypeId: number;

  vectorFieldName: string;

  query: string;

  topK: number;

  scoreThreshold: number;

  embeddingModel?: EmbeddingModelConfig;
}

export interface VectorSearchOntologyObjectTypeDataRes {
  result?: VectorSearchRow[];

  totalCount?: number;
}

const shouldUseClientVectorSearchFallback = () => isDevBypassEnabled();

const resolveDevInstances = (
  objectTypeId: number
): Record<string, unknown>[] | undefined => {
  if (
    !isDevObjectTypeId(objectTypeId) &&
    !hasDevObjectTypeInstances(objectTypeId) &&
    !getDevObjectTypeRecord(objectTypeId)
  ) {
    return undefined;
  }

  const record = getDevObjectTypeRecord(objectTypeId);

  const instances = record?.devInstances;

  return instances?.length ? instances : undefined;
};

const runClientVectorSearchFallback = async (
  params: VectorSearchOntologyObjectTypeDataReq
): Promise<ApiRes<VectorSearchOntologyObjectTypeDataRes>> => {
  const devInstances = resolveDevInstances(params.objectTypeId);

  const data = await clientVectorSearchOntologyObjectTypeData({
    ontologyModelID: params.ontologyModelID,

    objectTypeId: params.objectTypeId,

    vectorFieldName: params.vectorFieldName,

    query: params.query,

    topK: params.topK,

    scoreThreshold: params.scoreThreshold,

    instances: devInstances,

    embeddingConfig: params.embeddingModel || resolveEmbeddingModelConfig()
  });

  return {
    status: 200,

    code: '',

    message: '',

    requestId: '',

    data
  };
};

const isVectorSearchBackendUnavailable = (
  response?: ApiRes<VectorSearchOntologyObjectTypeDataRes>
) => {
  if (!response) {
    return true;
  }

  if (response.status === 404 || response.status === 501) {
    return true;
  }

  const message = String(response.message || '').toLowerCase();

  return (
    message.includes('not found') ||
    message.includes('未实现') ||
    message.includes('不存在')
  );
};

export async function vectorSearchOntologyObjectTypeData(
  params: VectorSearchOntologyObjectTypeDataReq
): Promise<ApiRes<VectorSearchOntologyObjectTypeDataRes>> {
  const requestPayload = {
    ...params,

    embeddingModel: params.embeddingModel || resolveEmbeddingModelConfig()
  };

  try {
    const response = await UAPI.RES.VectorSearchOntologyObjectTypeDataApi({})

      .post(requestPayload)

      .inRegion()

      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (
      shouldUseClientVectorSearchFallback() &&
      isVectorSearchBackendUnavailable(response)
    ) {
      console.warn('[dev] 向量检索接口不可用，回退客户端语义相似性检索');

      return runClientVectorSearchFallback(params);
    }

    return response;
  } catch (error) {
    if (shouldUseClientVectorSearchFallback()) {
      console.warn('[dev] 向量检索接口异常，回退客户端语义相似性检索', error);

      return runClientVectorSearchFallback(params);
    }

    throw error;
  }
}

export interface SemanticSearchOntologyObjectTypeDataReq {
  ontologyModelID: number;

  objectTypeId: number;

  query?: string;

  sql?: string;

  page?: number;

  pageSize?: number;

  parseOnly?: boolean;
}

export interface SemanticSearchOntologyObjectTypeDataRes {
  result?: InstanceQueryRow[];

  totalCount?: number;

  parseIntent?: string;

  sql?: string;
}

export async function semanticSearchOntologyObjectTypeData(
  params: SemanticSearchOntologyObjectTypeDataReq
): Promise<ApiRes<SemanticSearchOntologyObjectTypeDataRes>> {
  return await UAPI.RES.SemanticSearchOntologyObjectTypeDataApi({})

    .post(params)

    .inRegion()

    .do({ preCheck: false });
}
