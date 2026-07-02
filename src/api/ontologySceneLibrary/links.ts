import {
  ListOntologyLinkTypeColumnReq,
  ListOntologyLinkTypeColumnRes,
  ListOntologyLinkTypeDataReq,
  ListOntologyLinkTypeDataRes,
  LinkTypeAttributeInfo,
  GetOntologyLinkTypeRes,
  CreateOntologyLinkTypeReq,
  UpdateOntologyLinkTypeReq
} from '@/types/links';
import UAPI from '@/api';
import {
  isOntologyApiSuccess,
  isResourceNotFoundError,
  isResourceNotFoundResponse
} from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  devCreateOntologyLinkType,
  devDeleteOntologyLinkType,
  devGetOntologyLinkTypeDetail,
  devListOntologyLinkTypeColumn,
  devListOntologyLinkTypeData,
  devMirrorOntologyLinkType,
  devUpdateOntologyLinkType,
  isDevLinkTypeId
} from '@/utils/devLinkTypeStore';

const isResourceNotFoundErrorMessage = (message?: string) =>
  !!message?.includes('资源不存在') || !!message?.includes('不存在');

const extractCreatedLinkTypeId = (response: { data?: { id?: number } }) => {
  const createdId = Number(response.data?.id ?? 0);
  return Number.isFinite(createdId) && createdId > 0 ? createdId : null;
};

const shouldUseDevLinkTypeFallback = (
  response?: ApiRes<{ id?: number }>,
  error?: unknown
) => {
  if (isDevBypassEnabled()) {
    return true;
  }

  if (response && isResourceNotFoundResponse(response)) {
    return true;
  }

  return isResourceNotFoundError(error);
};

const resolveDevLinkTypeDetail = (id: number) => {
  if (!isDevBypassEnabled()) {
    return null;
  }
  return devGetOntologyLinkTypeDetail(id);
};

const shouldUseDevLinkTypeReadFallback = (
  linkTypeId: number,
  response?: ApiRes<unknown>,
  error?: unknown
) => {
  if (isDevBypassEnabled() && isDevLinkTypeId(linkTypeId)) {
    return true;
  }

  if (response && isResourceNotFoundResponse(response)) {
    return true;
  }

  return isResourceNotFoundError(error);
};

// 获取链接的属性列表
export const listOntologyLinkTypeColumn = async (
  params: ListOntologyLinkTypeColumnReq
): Promise<ApiRes<ListOntologyLinkTypeColumnRes>> => {
  const linkTypeId = Number(params.linkTypeID);
  if (isDevBypassEnabled() && isDevLinkTypeId(linkTypeId)) {
    return devListOntologyLinkTypeColumn();
  }

  try {
    const response = await UAPI.RES.ListOntologyLinkTypeColumnApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (shouldUseDevLinkTypeReadFallback(linkTypeId, response)) {
      return devListOntologyLinkTypeColumn();
    }

    return response;
  } catch (error) {
    if (shouldUseDevLinkTypeReadFallback(linkTypeId, undefined, error)) {
      return devListOntologyLinkTypeColumn();
    }

    throw error;
  }
};

// 获取链接的实例列表
export const listOntologyLinkTypeData = async (
  params: ListOntologyLinkTypeDataReq
): Promise<ApiRes<ListOntologyLinkTypeDataRes>> => {
  const linkTypeId = Number(params.id);
  if (isDevBypassEnabled() && isDevLinkTypeId(linkTypeId)) {
    return devListOntologyLinkTypeData();
  }

  try {
    const response = await UAPI.RES.ListOntologyLinkTypeDataApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (shouldUseDevLinkTypeReadFallback(linkTypeId, response)) {
      return devListOntologyLinkTypeData();
    }

    return response;
  } catch (error) {
    if (shouldUseDevLinkTypeReadFallback(linkTypeId, undefined, error)) {
      return devListOntologyLinkTypeData();
    }

    throw error;
  }
};

// 获取链接类型详细信息
export const getOntologyLinkType = async (params: {
  id: number;
}): Promise<ApiRes<GetOntologyLinkTypeRes>> => {
  if (isDevBypassEnabled() && isDevLinkTypeId(params.id)) {
    const devDetail = resolveDevLinkTypeDetail(params.id);
    if (devDetail) {
      return devDetail;
    }
  }

  try {
    const response = await UAPI.RES.GetOntologyLinkTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    const devDetail = resolveDevLinkTypeDetail(params.id);
    if (devDetail) {
      return devDetail;
    }

    return response;
  } catch (error) {
    const devDetail = resolveDevLinkTypeDetail(params.id);
    if (devDetail) {
      return devDetail;
    }

    throw error;
  }
};

// 创建链接类型
export const createOntologyLinkType = async (
  params: CreateOntologyLinkTypeReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  const requestPayload = {
    ...params,
    ...(params.ontologyModelID != null ? { id: params.ontologyModelID } : {})
  };

  try {
    const response = await UAPI.RES.CreateOntologyLinkTypeApi({})
      .post(requestPayload)
      .inRegion()
      .do({ preCheck: false });

    const createdId = extractCreatedLinkTypeId(response);
    if (isOntologyApiSuccess(response) && createdId != null) {
      if (isDevBypassEnabled()) {
        devMirrorOntologyLinkType(createdId, params);
      }
      return response;
    }

    if (shouldUseDevLinkTypeFallback(response)) {
      console.warn('[dev] 创建链接类型失败，写入本地开发缓存');
      return devCreateOntologyLinkType(params);
    }

    return response;
  } catch (error) {
    if (shouldUseDevLinkTypeFallback(undefined, error)) {
      console.warn('[dev] 创建链接类型异常，写入本地开发缓存');
      return devCreateOntologyLinkType(params);
    }

    throw error;
  }
};

// 更新链接类型
export const updateOntologyLinkType = async (
  params: UpdateOntologyLinkTypeReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  if (isDevBypassEnabled() && isDevLinkTypeId(params.id)) {
    return devUpdateOntologyLinkType(params);
  }

  try {
    const response = await UAPI.RES.UpdateOntologyLinkTypeApi({})
      .post(params)
      .inRegion()
      .do({ preCheck: false });

    if (isOntologyApiSuccess(response)) {
      if (isDevBypassEnabled()) {
        devMirrorOntologyLinkType(params.id, params);
      }
      return response;
    }

    if (
      shouldUseDevLinkTypeFallback(response) ||
      isResourceNotFoundResponse(response)
    ) {
      console.warn('[dev] 更新链接类型失败，回退本地开发缓存');
      return devUpdateOntologyLinkType(params);
    }

    return response;
  } catch (error) {
    if (
      shouldUseDevLinkTypeFallback(undefined, error) ||
      isResourceNotFoundError(error)
    ) {
      console.warn('[dev] 更新链接类型异常，回退本地开发缓存');
      return devUpdateOntologyLinkType(params);
    }

    throw error;
  }
};

// 删除链接类型
export const deleteOntologyLinkType = async (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  if (isDevBypassEnabled() && isDevLinkTypeId(params.id)) {
    return devDeleteOntologyLinkType(params.id);
  }

  try {
    const response = await UAPI.RES.DeleteOntologyLinkTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (
      isDevBypassEnabled() &&
      isDevLinkTypeId(params.id) &&
      isResourceNotFoundErrorMessage(response?.message)
    ) {
      return devDeleteOntologyLinkType(params.id);
    }

    return response;
  } catch (error) {
    const message = typeof error === 'string' ? error : '';

    if (
      isDevBypassEnabled() &&
      isDevLinkTypeId(params.id) &&
      isResourceNotFoundErrorMessage(message)
    ) {
      return devDeleteOntologyLinkType(params.id);
    }

    throw error;
  }
};

// 获取链接类型同步日志
export const getLinkTypeSyncTaskLog = async (
  params: {
    id: number;
    pageNo: number;
    pageSize: number;
  } & Record<string, any>
): Promise<
  ApiRes<{
    message: string;
  }>
> => {
  return await UAPI.RES.GetLinkTypeSyncTaskLogApi({})
    .post(params)
    .inRegion()
    .do();
};

// 同步链接类型任务
export const syncLinkTypeTask = async (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  return await UAPI.RES.SyncLinkTypeTaskApi({}).post(params).inRegion().do();
};
