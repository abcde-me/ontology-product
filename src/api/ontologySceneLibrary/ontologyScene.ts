import UAPI from '@/api';
import {
  CreateOntologyModelReq,
  ListOntologyModelReq,
  ListOntologyModelRes,
  UpdateOntologyModelReq,
  OntologScene
} from '@/types/ontologySceneApi';
import {
  isOntologyApiSuccess,
  isResourceNotFoundResponse,
  isTransientApiError,
  isTransientApiResponse
} from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  devCreateOntologyModel,
  devDeleteOntologyModel,
  purgeOntologySceneCache,
  buildDevListResponse,
  buildDevOntologyModelDetailStub,
  devGetOntologyModelDetail,
  getCachedOntologySceneDetailSnapshot,
  cacheOntologySceneDetailSnapshot,
  persistDevOntologyScene,
  patchOntologySceneCache,
  devUpdateOntologyModel,
  resolveDevOntologySceneList,
  isDevOntologyScene,
  isPermissionRelatedError
} from '@/utils/devOntologyStore';
import { enrichOntologySceneCounts } from '@/utils/enrichOntologySceneCounts';
import { sortOntologyScenesByCreateTimeDesc } from '@/utils/sortOntologyScenes';

const normalizeSceneId = (id: unknown): number | null => {
  const sceneId = Number(id);
  if (!Number.isFinite(sceneId) || sceneId <= 0) {
    return null;
  }
  return sceneId;
};

const getDevDetailFallback = (id: number): ApiRes<OntologScene> | null => {
  if (!isDevBypassEnabled()) {
    return null;
  }

  const fromDevStore = devGetOntologyModelDetail(id);
  if (fromDevStore) {
    return fromDevStore;
  }

  const cached = getCachedOntologySceneDetailSnapshot(id);
  if (cached) {
    return {
      status: 200,
      code: '',
      message: '',
      requestId: '',
      data: cached
    };
  }

  return buildDevOntologyModelDetailStub(id);
};

const shouldUseDevDetailFallback = (
  response?: ApiRes<OntologScene>,
  error?: unknown
) => {
  if (!isDevBypassEnabled()) {
    return false;
  }

  if (response && isResourceNotFoundResponse(response)) {
    return true;
  }

  if (response && isPermissionRelatedError(response.message)) {
    return true;
  }

  const message = typeof error === 'string' ? error : '';
  return isPermissionRelatedError(message);
};

const shouldUseDevListFallback = (_error?: unknown) => isDevBypassEnabled();

const buildDevListFallbackResponse = async (filter = '') => {
  const fallback = buildDevListResponse(filter);
  const enriched = await enrichOntologySceneCounts(fallback.data?.result || []);
  return {
    ...fallback,
    data: {
      ...fallback.data,
      result: sortOntologyScenesByCreateTimeDesc(enriched)
    }
  };
};

const mergeDevScenes = async (
  response: ApiRes<ListOntologyModelRes>
): Promise<ApiRes<ListOntologyModelRes>> => {
  let apiScenes = response.data?.result || [];

  if (isDevBypassEnabled()) {
    const devScenes = resolveDevOntologySceneList();
    if (devScenes.length) {
      apiScenes = [
        ...devScenes.filter(
          (scene) => !apiScenes.some((item) => item.id === scene.id)
        ),
        ...apiScenes
      ];
    }
  }

  const enrichedScenes = await enrichOntologySceneCounts(apiScenes);

  if (isDevBypassEnabled()) {
    enrichedScenes.forEach((scene) => {
      cacheOntologySceneDetailSnapshot(scene);
      persistDevOntologyScene(scene);
    });
  }

  const sortedScenes = sortOntologyScenesByCreateTimeDesc(enrichedScenes);

  return {
    ...response,
    data: {
      ...response.data,
      result: sortedScenes,
      totalCount: response.data?.totalCount ?? sortedScenes.length
    }
  };
};

export const listOntologyModel = async (
  params: ListOntologyModelReq
): Promise<ApiRes<ListOntologyModelRes>> => {
  try {
    const response = await UAPI.RES.ListOntologyModelApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      const merged = await mergeDevScenes(response);
      if (!merged.data?.result?.length && shouldUseDevListFallback()) {
        console.warn('[dev] 列表接口无数据，回退到本地/会话缓存');
        return buildDevListFallbackResponse(params.filter);
      }
      return merged;
    }

    if (
      shouldUseDevListFallback() ||
      (isDevBypassEnabled() && isTransientApiResponse(response))
    ) {
      console.warn('[dev] 列表接口失败，回退到本地/会话缓存');
      return buildDevListFallbackResponse(params.filter);
    }

    return response;
  } catch (error) {
    if (shouldUseDevListFallback(error)) {
      console.warn('[dev] 列表接口异常，回退到本地/会话缓存');
      return buildDevListFallbackResponse(params.filter);
    }

    throw error;
  }
};

export const createOntologyModel = async (
  params: CreateOntologyModelReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  try {
    const response = await UAPI.RES.CreateOntologyModelApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response) && response.data?.id) {
      return response;
    }

    if (isDevBypassEnabled() && isPermissionRelatedError(response?.message)) {
      console.warn('[dev] 创建场景权限失败，写入本地开发缓存');
      return devCreateOntologyModel(params);
    }

    return response;
  } catch (error) {
    const message = typeof error === 'string' ? error : '';

    if (isDevBypassEnabled() && isPermissionRelatedError(message)) {
      console.warn('[dev] 创建场景权限失败，写入本地开发缓存');
      return devCreateOntologyModel(params);
    }

    throw error;
  }
};

export const updateOntologyModel = async (
  params: UpdateOntologyModelReq
): Promise<ApiRes<string>> => {
  try {
    const response = await UAPI.RES.UpdateOntologyModelApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      patchOntologySceneCache(params.id, {
        name: params.name,
        description: params.description,
        icon: params.icon
      });
      return response;
    }

    if (isDevBypassEnabled() && isPermissionRelatedError(response?.message)) {
      console.warn('[dev] 更新场景权限失败，写入本地开发缓存');
      return devUpdateOntologyModel(params);
    }

    return response;
  } catch (error) {
    const message = typeof error === 'string' ? error : '';

    if (isDevBypassEnabled() && isPermissionRelatedError(message)) {
      console.warn('[dev] 更新场景权限失败，写入本地开发缓存');
      return devUpdateOntologyModel(params);
    }

    throw error;
  }
};

export const deleteOntologyModel = async (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  try {
    const response = await UAPI.RES.DeleteOntologyModelApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      if (isDevBypassEnabled()) {
        purgeOntologySceneCache(params.id);
      }
      return response;
    }

    if (
      isDevBypassEnabled() &&
      (isResourceNotFoundResponse(response) ||
        isPermissionRelatedError(response?.message)) &&
      isDevOntologyScene(params.id)
    ) {
      console.warn('[dev] 后端删除失败，从本地开发缓存删除');
      return devDeleteOntologyModel(params.id);
    }

    return response;
  } catch (error) {
    const message = typeof error === 'string' ? error : '';

    if (
      isDevBypassEnabled() &&
      isPermissionRelatedError(message) &&
      isDevOntologyScene(params.id)
    ) {
      console.warn('[dev] 删除场景权限失败，从本地开发缓存删除');
      return devDeleteOntologyModel(params.id);
    }

    throw error;
  }
};

export const getOntologyModelDetail = async (params: {
  id: number;
}): Promise<ApiRes<OntologScene>> => {
  const sceneId = normalizeSceneId(params.id);
  if (sceneId == null) {
    return {
      status: 400,
      code: 'InvalidArgument',
      message: '场景 ID 无效',
      requestId: '',
      data: undefined as unknown as OntologScene
    };
  }

  try {
    const response = await UAPI.RES.GetOntologyModelDetailApi({})
      .post({ id: sceneId })
      .inRegion()
      .do({ preCheck: false });

    if (isOntologyApiSuccess(response) && response.data) {
      cacheOntologySceneDetailSnapshot(response.data);
      return response;
    }

    const devFallback = getDevDetailFallback(sceneId);
    if (
      devFallback &&
      (isDevBypassEnabled() || shouldUseDevDetailFallback(response))
    ) {
      console.warn('[dev] 场景详情接口失败，回退到本地开发缓存');
      return devFallback;
    }

    return response;
  } catch (error) {
    const devFallback = getDevDetailFallback(sceneId);
    if (
      devFallback &&
      (isDevBypassEnabled() || shouldUseDevDetailFallback(undefined, error))
    ) {
      console.warn('[dev] 场景详情接口异常，回退到本地开发缓存');
      return devFallback;
    }

    throw error;
  }
};
