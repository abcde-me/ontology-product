import {
  BindOntologyObjectTypeReq,
  CreateOntologyObjectTypeReq,
  CreateOntologyPhysicalProperty,
  GetSqlConnectorTableSchemaReq,
  GetSqlConnectorTableSchemaRes,
  GetSqlConnectorTableSchemaToTIDBReq,
  GetSqlConnectorTableSchemaToTIDBRes,
  GetOntologyObjectTypeDetailRes,
  ListConnectorsReq,
  ListConnectorsRes,
  ListMetadataIcebergDatabaseNameRes,
  ListMetadataIcebergTableReq,
  ListMetadataIcebergTableRes,
  ListMetadataIcebergTiDBTableReq,
  ListMetadataIcebergTiDBTableRes,
  ListSqlConnectorDBAndTablesReq,
  ListSqlConnectorDBAndTablesRes,
  MapOntologyObjectTypeColumnsReq,
  MapOntologyObjectTypeColumnsRes,
  ListOntologyObjectTypeReq,
  ListOntologyObjectTypeRes,
  ObjectType,
  ConnectorAnalyseFinkSqlColumnItem,
  OntologyTestFinkSQLReq,
  SourceType,
  UpdateOntologyObjectTypeReq,
  UploadOntologyCSVFileAndParseRes
} from '@/types/objectType';
import { SyncStatus } from '@/types/graphApi';
import { sleep } from '@/utils';
import UAPI from '@/api';
import {
  isOntologyApiSuccess,
  isTransientApiError,
  isTransientApiResponse
} from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { deleteRelatedLinkTypesForObjectType } from '@/api/ontologySceneLibrary/deleteObjectTypeRelatedLinks';
import {
  buildOntologyCsvTemplate,
  encodeCsvTemplateBase64,
  type OntologyCsvTemplateName
} from '@/utils/ontologyCsvTemplate';
import {
  applyDevObjectTypeVectorization,
  devBindOntologyObjectType,
  devBindOntologyObjectTypeFromDetail,
  devCreateOntologyObjectType,
  devDeleteOntologyObjectType,
  devGetOntologyObjectTypeDetail,
  devListOntologyObjectTypes,
  devMirrorOntologyObjectType,
  devSyncObjectTypeTask,
  devUpdateOntologyObjectType,
  isDevObjectTypeId,
  isPermissionRelatedError,
  resolveDevInstancesForPayload
} from '@/utils/devObjectTypeStore';
import { hasVectorizedPhysicalProperties } from '@/services/ontologyVectorization';
import { mapObjectTypeDetailToFormData } from '@/pages/ontologyScene/modules/objectType/mapObjectTypeDetailToFormData';
import { buildCreateObjectTypeRequest } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormHooks/useObjectTypeSubmit';
import type { ObjectTypeFormData } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

const paginateObjectTypeList = (
  items: ObjectType[],
  params: ListOntologyObjectTypeReq
): { result: ObjectType[]; totalCount: number } => {
  const totalCount = items.length;
  const pageNo = params.pageNo ?? 1;
  const pageSize = params.pageSize ?? 10;

  if (pageSize <= 0 || pageNo <= 0) {
    return { result: items, totalCount };
  }

  const start = (pageNo - 1) * pageSize;
  return {
    result: items.slice(start, start + pageSize),
    totalCount
  };
};

const needsDevClientPagination = (params: ListOntologyObjectTypeReq) => {
  const pageSize = params.pageSize ?? 10;
  const pageNo = params.pageNo ?? 1;
  return pageSize > 0 && pageNo > 0;
};

const mergeDevObjectTypes = (
  response: ApiRes<ListOntologyObjectTypeRes>,
  params: ListOntologyObjectTypeReq
): ApiRes<ListOntologyObjectTypeRes> => {
  if (!isDevBypassEnabled()) {
    return response;
  }

  const devResponse = devListOntologyObjectTypes({
    ...params,
    pageNo: 1,
    pageSize: -1
  });
  const devItems = devResponse.data?.result || [];
  if (!devItems.length) {
    if (needsDevClientPagination(params)) {
      const { result, totalCount } = paginateObjectTypeList(
        response.data?.result || [],
        params
      );
      return {
        ...response,
        data: {
          ...response.data,
          result,
          totalCount
        }
      };
    }
    return response;
  }

  const apiItems = response.data?.result || [];
  const merged = [
    ...devItems.filter(
      (item) => !apiItems.some((existing) => existing.id === item.id)
    ),
    ...apiItems
  ];
  const { result, totalCount } = paginateObjectTypeList(merged, params);

  return {
    ...response,
    data: {
      ...response.data,
      result,
      totalCount
    }
  };
};

const shouldUseDevObjectTypeFallback = (error?: unknown) =>
  isDevBypassEnabled() || isTransientApiError(error);
const buildDevEmptyObjectTypeList = (
  params: ListOntologyObjectTypeReq = {}
): ApiRes<ListOntologyObjectTypeRes> => devListOntologyObjectTypes(params);

const scheduleDevObjectTypeVectorization = (
  objectTypeId: number,
  params?: Pick<CreateOntologyObjectTypeReq, 'ontologyPhysicalPropertiesList'>
) => {
  if (
    !hasVectorizedPhysicalProperties(params?.ontologyPhysicalPropertiesList)
  ) {
    return;
  }

  void applyDevObjectTypeVectorization(objectTypeId);
};

export const listOntologyObjectType = async (
  params: ListOntologyObjectTypeReq
): Promise<ApiRes<ListOntologyObjectTypeRes>> => {
  const requestParams =
    isDevBypassEnabled() && needsDevClientPagination(params)
      ? { ...params, pageNo: 1, pageSize: -1 }
      : params;

  try {
    const response = await UAPI.RES.ListOntologyObjectTypeApi({})
      .post(requestParams)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return mergeDevObjectTypes(response, params);
    }

    if (shouldUseDevObjectTypeFallback() || isTransientApiResponse(response)) {
      console.warn('[dev] 对象类型列表接口失败，回退本地开发缓存');
      return buildDevEmptyObjectTypeList(params);
    }

    return response;
  } catch (error) {
    if (shouldUseDevObjectTypeFallback(error)) {
      console.warn('[dev] 对象类型列表接口异常，回退本地开发缓存');
      return buildDevEmptyObjectTypeList(params);
    }

    throw error;
  }
};

export const createOntologyObjectType = async (
  params: CreateOntologyObjectTypeReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  try {
    const response = await UAPI.RES.CreateOntologyObjectTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (
      isOntologyApiSuccess(response) &&
      (response.data?.data?.id || response.data?.id)
    ) {
      const createdId = Number(
        response.data?.data?.id || response.data?.id || 0
      );
      if (createdId > 0) {
        if (isDevBypassEnabled()) {
          devMirrorOntologyObjectType(
            createdId,
            params,
            resolveDevInstancesForPayload(params)
          );
        }
        scheduleDevObjectTypeVectorization(createdId, params);
      }
      return response;
    }

    if (shouldUseDevObjectTypeFallback()) {
      console.warn('[dev] 创建对象类型失败，写入本地开发缓存');
      const devResponse = devCreateOntologyObjectType(params);
      const devId = Number(devResponse.data?.data?.id || 0);
      if (devId > 0) {
        scheduleDevObjectTypeVectorization(devId, params);
      }
      return devResponse as ApiRes<{ data: { id: number } }>;
    }

    return response as ApiRes<{ data: { id: number } }>;
  } catch (error) {
    if (shouldUseDevObjectTypeFallback()) {
      console.warn('[dev] 创建对象类型异常，写入本地开发缓存');
      const devResponse = devCreateOntologyObjectType(params);
      const devId = Number(devResponse.data?.data?.id || 0);
      if (devId > 0) {
        scheduleDevObjectTypeVectorization(devId, params);
      }
      return devResponse as ApiRes<{ data: { id: number } }>;
    }

    throw error;
  }
};

const isObjectTypeBoundInScene = (
  detail: GetOntologyObjectTypeDetailRes,
  sceneItems: ObjectType[]
) => {
  const objectTypeCode = detail.code?.trim();
  if (!objectTypeCode) {
    return false;
  }

  return sceneItems.some((item) => item.code?.trim() === objectTypeCode);
};

const buildReuseCreatePayload = (
  detail: GetOntologyObjectTypeDetailRes,
  params: BindOntologyObjectTypeReq
): CreateOntologyObjectTypeReq => ({
  ontologyModelID: params.ontologyModelID,
  reuseObjectTypeID: params.objectTypeID,
  code: detail.code || '',
  name: detail.name || '',
  icon: detail.icon || OBJECT_TYPE_ICON_OPTIONS[0].value,
  description: detail.description,
  originalDbName: detail.originalDbName || '',
  originalTableName: detail.originalTableName || '',
  enableSyncSourceData: false,
  sourceType: detail.sourceType,
  ontologyPhysicalPropertiesList: detail.ontologyPhysicalPropertiesList
});

export const bindOntologyObjectType = async (
  params: BindOntologyObjectTypeReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  const detailRes = await getOntologyObjectTypeDetail({
    id: params.objectTypeID
  });

  if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
    return {
      status: detailRes.status ?? 400,
      code: detailRes.code || 'ResourceNotFound',
      message: detailRes.message || '对象类型不存在',
      requestId: detailRes.requestId || '',
      data: undefined
    } as unknown as ApiRes<{ data: { id: number } }>;
  }

  const detail = detailRes.data;

  const listRes = await listOntologyObjectType({
    ontologyModelID: params.ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });
  const sceneItems = isOntologyApiSuccess(listRes)
    ? listRes.data?.result || []
    : [];

  if (isObjectTypeBoundInScene(detail, sceneItems)) {
    return {
      status: 400,
      code: 'DuplicateBind',
      message: '当前场景库已绑定该对象类型',
      requestId: '',
      data: undefined
    } as unknown as ApiRes<{ data: { id: number } }>;
  }

  try {
    const bindResponse = await UAPI.RES.BindOntologyObjectTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (
      isOntologyApiSuccess(bindResponse) &&
      (bindResponse.data?.data?.id || bindResponse.data?.id)
    ) {
      return bindResponse;
    }
  } catch (error) {
    console.warn('[bind] BindOntologyObjectType 不可用，尝试复用创建', error);
  }

  const reuseCreateResponse = await createOntologyObjectType(
    buildReuseCreatePayload(detail, params)
  );

  if (isOntologyApiSuccess(reuseCreateResponse)) {
    return reuseCreateResponse;
  }

  const mappedFormData = mapObjectTypeDetailToFormData(detail);
  const fullCreateResponse = await createOntologyObjectType(
    buildCreateObjectTypeRequest({
      ...(mappedFormData as ObjectTypeFormData),
      ontologyModelID: params.ontologyModelID,
      enableSyncSourceData: false
    })
  );

  if (isOntologyApiSuccess(fullCreateResponse)) {
    return fullCreateResponse;
  }

  if (shouldUseDevObjectTypeFallback()) {
    console.warn('[dev] 绑定对象类型接口失败，写入本地开发缓存');
    const devBindFromLocal = devBindOntologyObjectType(params);
    if (devBindFromLocal.status === 200) {
      return devBindFromLocal as ApiRes<{ data: { id: number } }>;
    }

    return devBindOntologyObjectTypeFromDetail(
      detail,
      params.ontologyModelID
    ) as ApiRes<{ data: { id: number } }>;
  }

  return fullCreateResponse as ApiRes<{ data: { id: number } }>;
};

export const updateOntologyObjectType = async (
  params: UpdateOntologyObjectTypeReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  if (isDevBypassEnabled() && isDevObjectTypeId(params.id)) {
    const devResponse = devUpdateOntologyObjectType(params);
    scheduleDevObjectTypeVectorization(params.id, params);
    return devResponse as ApiRes<{ data: { id: number } }>;
  }

  try {
    const response = await UAPI.RES.UpdateOntologyObjectTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      if (isDevBypassEnabled()) {
        devMirrorOntologyObjectType(params.id, params);
        scheduleDevObjectTypeVectorization(params.id, params);
      }
      return response;
    }

    if (shouldUseDevObjectTypeFallback() && isDevObjectTypeId(params.id)) {
      const devResponse = devUpdateOntologyObjectType(params);
      scheduleDevObjectTypeVectorization(params.id, params);
      return devResponse as ApiRes<{ data: { id: number } }>;
    }

    if (
      shouldUseDevObjectTypeFallback() &&
      (response.message?.includes('资源不存在') ||
        response.code === 'ResourceNotFound')
    ) {
      devMirrorOntologyObjectType(params.id, params);
      const devResponse = devUpdateOntologyObjectType(params);
      scheduleDevObjectTypeVectorization(params.id, params);
      return devResponse as ApiRes<{ data: { id: number } }>;
    }

    return response as ApiRes<{ data: { id: number } }>;
  } catch (error) {
    if (shouldUseDevObjectTypeFallback() && isDevObjectTypeId(params.id)) {
      const devResponse = devUpdateOntologyObjectType(params);
      scheduleDevObjectTypeVectorization(params.id, params);
      return devResponse as ApiRes<{ data: { id: number } }>;
    }

    throw error;
  }
};

export const deleteOntologyObjectType = async (params: {
  id: number;
  ontologyModelID?: number;
  /** 批量删除节点时，可先统一清理关联链接再置为 true */
  skipRelatedLinkDeletion?: boolean;
}): Promise<
  ApiRes<{
    data: string;
  }>
> => {
  if (!params.skipRelatedLinkDeletion) {
    try {
      await deleteRelatedLinkTypesForObjectType(
        params.id,
        params.ontologyModelID
      );
    } catch (error) {
      if (!shouldUseDevObjectTypeFallback(error)) {
        throw error;
      }
      console.warn('[dev] 清理关联链接失败，继续删除对象类型', error);
    }
  }

  try {
    const response = await UAPI.RES.DeleteOntologyObjectTypeApi({})
      .post({ id: params.id })
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      if (isDevBypassEnabled() && isDevObjectTypeId(params.id)) {
        devDeleteOntologyObjectType(params.id);
      }
      return response;
    }

    if (isDevBypassEnabled() && isDevObjectTypeId(params.id)) {
      console.warn('[dev] 后端删除对象类型失败，从本地开发缓存删除');
      return devDeleteOntologyObjectType(params.id);
    }

    return response;
  } catch (error) {
    if (shouldUseDevObjectTypeFallback(error) && isDevObjectTypeId(params.id)) {
      console.warn('[dev] 删除对象类型异常，从本地开发缓存删除');
      return devDeleteOntologyObjectType(params.id);
    }

    throw error;
  }
};

export const getOntologyObjectTypeDetail = async (params: {
  id?: number;
  code?: string;
}): Promise<ApiRes<GetOntologyObjectTypeDetailRes>> => {
  if (isDevBypassEnabled() && params.id && isDevObjectTypeId(params.id)) {
    const devDetail = devGetOntologyObjectTypeDetail(params.id);
    if (devDetail) {
      return devDetail;
    }
  }

  try {
    const response = await UAPI.RES.GetOntologyObjectTypeApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (isDevBypassEnabled() && params.id) {
      const devDetail = devGetOntologyObjectTypeDetail(params.id);
      if (devDetail) {
        return devDetail;
      }
    }

    return response;
  } catch (error) {
    if (isDevBypassEnabled() && params.id) {
      const devDetail = devGetOntologyObjectTypeDetail(params.id);
      if (devDetail) {
        return devDetail;
      }
    }

    throw error;
  }
};

export const uploadOntologyCSVFileAndParse = async (params: {
  file: File;
  projectID?: string;
}): Promise<ApiRes<UploadOntologyCSVFileAndParseRes>> => {
  const payload: Record<string, unknown> = { file: params.file };
  if (params.projectID) {
    payload.projectID = params.projectID;
  }

  return await UAPI.RES.UploadOntologyEntityDataFileApi({})
    .post(payload)
    .inRegion()
    // @ts-ignore
    .withConfig({
      transformRequest: (data, headers) => {
        if (data instanceof FormData) {
          return data;
        }

        const formData = new FormData();
        const body = data || {};

        Object.keys(body).forEach((key) => {
          const value = body[key];
          if (value === undefined || value === null) {
            return;
          }
          if (value instanceof Blob) {
            formData.append(key, value);
            return;
          }
          formData.append(key, String(value));
        });

        if (headers) {
          delete headers['Content-Type'];
          delete headers['content-type'];
        }

        return formData;
      }
    })
    .do();
};

export const extractUploadedSchemaFilePath = (
  response: ApiRes<UploadOntologyCSVFileAndParseRes>
): string | undefined => {
  const data =
    response.data as unknown as UploadOntologyCSVFileAndParseRes['data'] & {
      data?: { path?: string };
      path?: string;
    };

  return data?.path ?? data?.data?.path;
};

export const listOntologyConnectors = async (
  params: ListConnectorsReq
): Promise<ApiRes<ListConnectorsRes>> => {
  return await UAPI.RES.ListOntologyConnectorsApi({})
    .post(params)
    .inRegion()
    .do();
};

export const listSqlConnectorDBAndTables = async (
  params: ListSqlConnectorDBAndTablesReq
): Promise<ApiRes<ListSqlConnectorDBAndTablesRes>> => {
  return await UAPI.RES.ListSqlConnectorDBAndTablesApi({})
    .post(params)
    .inRegion()
    .do();
};

export const getSqlConnectorTableSchema = async (
  params: GetSqlConnectorTableSchemaReq
): Promise<ApiRes<GetSqlConnectorTableSchemaRes>> => {
  return await UAPI.RES.GetSqlConnectorTableSchemaApi({})
    .post(params)
    .inRegion()
    .do();
};

export const getSqlConnectorTableSchemaToTIDB = async (
  params: GetSqlConnectorTableSchemaToTIDBReq
): Promise<ApiRes<GetSqlConnectorTableSchemaToTIDBRes>> => {
  return await UAPI.RES.GetSqlConnectorTableSchemaToTIDBApi({})
    .post(params)
    .inRegion()
    .do();
};

export const connectorAnalyseFinkSQLColumns = async (params: {
  id: number;
  sql: string;
}): Promise<
  ApiRes<{
    columns: ConnectorAnalyseFinkSqlColumnItem[];
  }>
> => {
  return await UAPI.RES.ConnectorAnalyseFinkSQLColumnsApi({})
    .post(params)
    .inRegion()
    .do();
};

export const connectorTestFinkSQL = async (
  params: OntologyTestFinkSQLReq
): Promise<
  ApiRes<{
    status: string;
    message?: string;
    columns?: unknown[];
    columnList?: unknown[];
    fields?: unknown[];
  }>
> => {
  return await UAPI.RES.ConnectorTestFinkSQLApi({})
    .post(params)
    .inRegion()
    .do();
};

export const mapOntologyObjectTypeColumns = async (
  params: MapOntologyObjectTypeColumnsReq
): Promise<ApiRes<MapOntologyObjectTypeColumnsRes>> => {
  return await UAPI.RES.MapOntologyObjectTypeColumnsApi({})
    .post(params)
    .inRegion()
    .do();
};

// 创建iceberg表时-数据库下拉列表
export const listMetadataIcebergDatabaseName = async (params: {
  instanceId: number;
}): Promise<ApiRes<ListMetadataIcebergDatabaseNameRes>> => {
  return await UAPI.RES.listMetadataIcebergDatabaseNameApi({})
    .post(params)
    .inRegion()
    .do();
};

// 查询iceberg的所有表
export const listMetadataIcebergTable = async (
  params: ListMetadataIcebergTableReq
): Promise<ApiRes<ListMetadataIcebergTableRes>> => {
  return await UAPI.RES.listMetadataIcebergTableApi({})
    .post(params)
    .inRegion()
    .do();
};

// 本体查询iceberg表的字段信息
export const listMetadataIcebergTiDBTable = async (
  params: ListMetadataIcebergTiDBTableReq
): Promise<ApiRes<ListMetadataIcebergTiDBTableRes>> => {
  return await UAPI.RES.ListMetadataIcebergTiDBTableApi({})
    .post(params)
    .inRegion()
    .do();
};

// 下载标准模版
const buildDevTemplateFileResponse = (
  fileName: OntologyCsvTemplateName
): ApiRes<string> => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: encodeCsvTemplateBase64(buildOntologyCsvTemplate(fileName))
});

export const getTemplateFile = async (params: {
  file_name: OntologyCsvTemplateName;
}): Promise<ApiRes<string>> => {
  if (isDevBypassEnabled()) {
    return buildDevTemplateFileResponse(params.file_name);
  }

  try {
    const response = await UAPI.RES.GetTemplateFileApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response) && response.data) {
      return response;
    }

    console.warn('[dev] 模板下载接口失败，回退标准导入模板');
    return buildDevTemplateFileResponse(params.file_name);
  } catch (error) {
    console.warn('[dev] 模板下载接口异常，回退标准导入模板');
    return buildDevTemplateFileResponse(params.file_name);
  }
};

/** 探测运行时 ontology-metadata-service 是否已有该对象类型 */
export const getRuntimeOntologyObjectTypeMetadata = async (params: {
  code: string;
  ontologyModelID?: number;
}): Promise<ApiRes<Record<string, unknown>>> => {
  return await UAPI.RES.GetRuntimeOntologyObjectTypeMetadataApi({})
    .post(params)
    .inRegion()
    .do();
};

/** 将场景库对象类型补注册到运行时元数据服务 */
export const registerOntologyObjectTypeMetadata = async (params: {
  id: number;
  ontologyModelID: number;
  code?: string;
}): Promise<ApiRes<{ data?: { id?: number } }>> => {
  return await UAPI.RES.RegisterOntologyObjectTypeMetadataApi({})
    .post(params)
    .inRegion()
    .do();
};

// 获取对象类型同步日志
export const getObjectTypeSyncLog = async (
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
  return await UAPI.RES.GetObjectTypeSyncTaskLogApi({})
    .post(params)
    .inRegion()
    .do();
};

// 同步对象类型任务
export const syncObjectTypeTask = async (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  if (isDevBypassEnabled() && isDevObjectTypeId(params.id)) {
    return devSyncObjectTypeTask(params.id) as ApiRes<string>;
  }

  try {
    const response = await UAPI.RES.SyncObjectTypeTaskApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      if (isDevBypassEnabled() && isDevObjectTypeId(params.id)) {
        devSyncObjectTypeTask(params.id);
      }
      return response as ApiRes<string>;
    }

    if (
      shouldUseDevObjectTypeFallback() &&
      (isDevObjectTypeId(params.id) ||
        response.message?.includes('资源不存在') ||
        response.code === 'ResourceNotFound')
    ) {
      const devResponse = devSyncObjectTypeTask(params.id);
      if (devResponse.status === 200) {
        return devResponse as ApiRes<string>;
      }
    }

    return response as ApiRes<string>;
  } catch (error) {
    if (shouldUseDevObjectTypeFallback()) {
      const devResponse = devSyncObjectTypeTask(params.id);
      if (devResponse.status === 200) {
        return devResponse as ApiRes<string>;
      }
    }

    throw error;
  }
};

// 启动对象类型同步任务
export const startSyncObjectTypeTask = async (params: {
  id: number;
  funnel_task_id: number;
}): Promise<
  ApiRes<{
    succeed: string;
  }>
> => {
  return await UAPI.RES.StartSyncObjectTypeTaskApi({})
    .post(params)
    .inRegion()
    .do();
};

// 暂停对象类型同步任务
export const pauseSyncObjectTypeTask = async (params: {
  id: number;
  funnel_task_id: number;
}): Promise<
  ApiRes<{
    succeed: string;
  }>
> => {
  return await UAPI.RES.PauseSyncObjectTypeTaskApi({})
    .post(params)
    .inRegion()
    .do();
};
