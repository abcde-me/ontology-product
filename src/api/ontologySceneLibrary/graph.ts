import type {
  GetOntologyTopologyResponse,
  ListOntologyLinkTypeReq,
  ListOntologyLinkTypeRes,
  ListOntologyObjectTypeDataRes,
  ListOntologyPhysicalPropertiesReq,
  ListOntologyPhysicalPropertiesRes,
  PhysicalProperties
} from '@/types/graphApi';
import type { ObjectTypeDataFieldFilter } from '@/pages/exploreAnalysis/objectBrowse/types';
import UAPI from '@/api';
import {
  isOntologyApiSuccess,
  isResourceNotFoundError,
  isResourceNotFoundResponse,
  isTransientApiError,
  isTransientApiResponse
} from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  devBuildTopologyNodes,
  devListOntologyObjectTypeData,
  devListOntologyObjectTypes,
  devListOntologyPhysicalProperties,
  enrichPhysicalPropertiesWithObjectType,
  getDevObjectTypeRecord,
  hasDevObjectTypeInstances,
  isDevObjectTypeId
} from '@/utils/devObjectTypeStore';
import { devListOntologyLinkTypes } from '@/utils/devLinkTypeStore';
import type { LinkInfo } from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import {
  enrichLinkTypesWithObjectTypes,
  fetchAndEnrichLinkTypes,
  filterLinksByObjectTypeIds,
  resolveScopedObjectTypeIds
} from '@/utils/enrichLinkTypeObjectTypes';
import { normalizeOntologyTopology } from '@/pages/ontologyScene/modules/graph/utils/normalizeOntologyTopology';
import { buildSceneGraphTopology } from '@/pages/ontologyScene/modules/graph/utils/buildSceneGraphTopology';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { enrichPhysicalPropertiesFromDataResource } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';

const SCENE_LIST_PAGE = { pageNo: 1, pageSize: -1 } as const;

const mergeDevTopology = (
  response: ApiRes<GetOntologyTopologyResponse>,
  sceneId: number
): ApiRes<GetOntologyTopologyResponse> => {
  if (!isDevBypassEnabled()) {
    return response;
  }

  const devNodes = devBuildTopologyNodes(sceneId);
  if (!devNodes.length) {
    return response;
  }

  const apiNodes = response.data?.nodes || [];
  const mergedNodes = [
    ...devNodes.filter(
      (node) => !apiNodes.some((existing) => existing.id === node.id)
    ),
    ...apiNodes
  ];

  return {
    ...response,
    data: {
      ...(response.data ?? {}),
      nodes: mergedNodes
    }
  };
};

const hasTopologyContent = (data?: GetOntologyTopologyResponse | null) =>
  Boolean(data?.nodes?.length || data?.edges?.length);

const topologyMatchesSceneObjectTypes = async (
  sceneId: number,
  topology: GetOntologyTopologyResponse
): Promise<boolean> => {
  const topologyNodeIds = (topology.nodes || [])
    .map((node) => node.id)
    .filter((id): id is number => id != null);

  if (!topologyNodeIds.length) {
    return true;
  }

  try {
    const objectTypeRes = await listOntologyObjectType({
      ontologyModelID: sceneId,
      ...SCENE_LIST_PAGE
    });

    if (!isOntologyApiSuccess(objectTypeRes)) {
      return true;
    }

    const objectTypeIds = new Set(
      (objectTypeRes.data?.result || [])
        .map((item) => item.id)
        .filter((id): id is number => id != null)
    );

    if (!objectTypeIds.size) {
      return true;
    }

    return topologyNodeIds.some((id) => objectTypeIds.has(id));
  } catch {
    return true;
  }
};

/** 兼容后端不同字段命名的拓扑响应 */
const normalizeTopologyApiResponse = (
  response: ApiRes<GetOntologyTopologyResponse>
): ApiRes<GetOntologyTopologyResponse> => {
  const raw = response?.data as
    | GetOntologyTopologyResponse
    | {
        nodes?: GetOntologyTopologyResponse['nodes'];
        edges?: GetOntologyTopologyResponse['edges'];
        result?: GetOntologyTopologyResponse;
        topology?: GetOntologyTopologyResponse;
      }
    | null
    | undefined;

  if (!raw) {
    return response;
  }

  const nested =
    ('result' in raw ? raw.result : undefined) ||
    ('topology' in raw ? raw.topology : undefined);
  const nodes = raw.nodes ?? nested?.nodes;
  const edges = raw.edges ?? nested?.edges;

  if (!nodes && !edges) {
    return response;
  }

  return {
    ...response,
    data: normalizeOntologyTopology({
      nodes: nodes ?? [],
      edges: edges ?? []
    })
  };
};

const buildTopologyRequestBody = (sceneId: number) => ({
  id: sceneId,
  ontologyModelID: sceneId
});

const normalizeLinkTypeListRequest = (params: ListOntologyLinkTypeReq) => {
  const sceneId = params.ontologyModelID;
  if (sceneId == null) {
    return params;
  }

  return {
    ...params,
    ontologyModelID: sceneId,
    id: sceneId
  };
};

const shouldUseDevLinkTypeListFallback = (
  response?: ApiRes<ListOntologyLinkTypeRes>,
  error?: unknown
) => {
  if (isDevBypassEnabled()) {
    return true;
  }

  if (response && isResourceNotFoundResponse(response)) {
    return true;
  }

  if (response && isTransientApiResponse(response)) {
    return true;
  }

  return isResourceNotFoundError(error) || isTransientApiError(error);
};

const getDevSceneObjectTypes = (sceneId: number): ObjectType[] =>
  devListOntologyObjectTypes({
    ontologyModelID: sceneId,
    ...SCENE_LIST_PAGE
  }).data?.result || [];

const getDevSceneLinks = (
  sceneId: number,
  objectTypes: ObjectType[]
): LinkInfo[] =>
  enrichLinkTypesWithObjectTypes(
    devListOntologyLinkTypes({
      ontologyModelID: sceneId,
      ...SCENE_LIST_PAGE
    }).data?.result || [],
    objectTypes
  );

const fetchSceneObjectTypesSafe = async (
  sceneId: number
): Promise<ObjectType[]> => {
  try {
    const response = await listOntologyObjectType({
      ontologyModelID: sceneId,
      ...SCENE_LIST_PAGE
    });

    if (isOntologyApiSuccess(response)) {
      return response.data?.result || [];
    }
  } catch (error) {
    console.warn('[topology] 对象类型列表不可用，尝试本地缓存', error);
  }

  if (isDevBypassEnabled()) {
    return getDevSceneObjectTypes(sceneId);
  }

  return [];
};

const fetchSceneLinksSafe = async (
  sceneId: number,
  objectTypes: ObjectType[]
): Promise<LinkInfo[]> => {
  try {
    const response = await listOntologyLinkType({
      ontologyModelID: sceneId,
      ...SCENE_LIST_PAGE
    });

    if (isOntologyApiSuccess(response)) {
      return response.data?.result || [];
    }
  } catch (error) {
    console.warn('[topology] 链接列表不可用，尝试本地缓存', error);
  }

  if (isDevBypassEnabled()) {
    return getDevSceneLinks(sceneId, objectTypes);
  }

  return [];
};

const buildTopologyFromSceneData = (
  sceneId: number,
  objectTypes: ObjectType[],
  links: LinkInfo[],
  topologyNodes: GetOntologyTopologyResponse['nodes'] = []
): GetOntologyTopologyResponse => {
  const fallbackNodes =
    topologyNodes?.length && topologyNodes.length > 0
      ? topologyNodes
      : devBuildTopologyNodes(sceneId);

  return buildSceneGraphTopology(objectTypes, links, fallbackNodes);
};

/** 以对象类型/链接列表为准重建画布拓扑（节点 id、边端点均对齐列表） */
const syncTopologyWithLinkList = async (
  sceneId: number,
  topology: GetOntologyTopologyResponse
): Promise<GetOntologyTopologyResponse> => {
  try {
    const objectTypes = await fetchSceneObjectTypesSafe(sceneId);
    const links = await fetchSceneLinksSafe(sceneId, objectTypes);

    const synced = buildTopologyFromSceneData(
      sceneId,
      objectTypes,
      links,
      topology.nodes ?? []
    );

    if (
      isDevBypassEnabled() &&
      (!synced.edges?.length || !synced.nodes?.length) &&
      (objectTypes.length || links.length)
    ) {
      const devSynced = buildTopologyFromSceneData(
        sceneId,
        objectTypes.length ? objectTypes : getDevSceneObjectTypes(sceneId),
        links.length
          ? links
          : getDevSceneLinks(
              sceneId,
              objectTypes.length ? objectTypes : getDevSceneObjectTypes(sceneId)
            ),
        devBuildTopologyNodes(sceneId)
      );

      if (
        (devSynced.edges?.length ?? 0) > (synced.edges?.length ?? 0) ||
        (devSynced.nodes?.length ?? 0) > (synced.nodes?.length ?? 0)
      ) {
        return devSynced;
      }
    }

    return synced;
  } catch (error) {
    console.warn('[topology] 列表同步异常，回退本地缓存', error);

    if (isDevBypassEnabled()) {
      const objectTypes = getDevSceneObjectTypes(sceneId);
      const links = getDevSceneLinks(sceneId, objectTypes);
      return buildTopologyFromSceneData(
        sceneId,
        objectTypes,
        links,
        devBuildTopologyNodes(sceneId)
      );
    }

    return normalizeOntologyTopology({
      nodes: topology.nodes ?? [],
      edges: []
    });
  }
};

/** 拓扑接口无数据时，尝试用对象类型 + 链接列表拼装图谱 */
const buildTopologyFromSceneLists = async (
  sceneId: number
): Promise<GetOntologyTopologyResponse> => {
  return syncTopologyWithLinkList(sceneId, { nodes: [], edges: [] });
};

const finalizeTopologyResponse = async (
  sceneId: number,
  response: ApiRes<GetOntologyTopologyResponse>
): Promise<ApiRes<GetOntologyTopologyResponse>> => {
  const topology = response.data ?? { nodes: [], edges: [] };
  const synced = await syncTopologyWithLinkList(sceneId, topology);

  return {
    ...response,
    data: synced
  };
};

const buildDevTopologyResponse = async (
  sceneId: number
): Promise<ApiRes<GetOntologyTopologyResponse>> => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: await syncTopologyWithLinkList(sceneId, {
    nodes: devBuildTopologyNodes(sceneId),
    edges: []
  })
});

const resolveTopologyWithListFallback = async (
  sceneId: number,
  reason: string,
  response?: ApiRes<GetOntologyTopologyResponse>
): Promise<ApiRes<GetOntologyTopologyResponse>> => {
  const fromLists = await buildTopologyFromSceneLists(sceneId);
  if (hasTopologyContent(fromLists)) {
    console.warn(
      `[topology] ${reason}，已从对象类型/链接列表拼装：${fromLists.nodes?.length ?? 0} 个节点，${fromLists.edges?.length ?? 0} 条边`
    );
    return {
      status: 200,
      code: '',
      message: '',
      requestId: '',
      data: fromLists
    };
  }

  if (isDevBypassEnabled()) {
    console.warn('[dev] 拓扑接口失败，回退本地开发缓存');
    const devTopology = await buildDevTopologyResponse(sceneId);
    if (hasTopologyContent(devTopology.data)) {
      return devTopology;
    }
  }

  if (response && isOntologyApiSuccess(response)) {
    return finalizeTopologyResponse(
      sceneId,
      mergeDevTopology(response, sceneId)
    );
  }

  return (
    response ?? {
      status: 500,
      code: 'TopologyUnavailable',
      message: '获取本体拓扑失败',
      requestId: '',
      data: { nodes: [], edges: [] }
    }
  );
};

const resolveTopologyResponse = async (
  sceneId: number,
  response: ApiRes<GetOntologyTopologyResponse>
): Promise<ApiRes<GetOntologyTopologyResponse>> => {
  if (isOntologyApiSuccess(response) && hasTopologyContent(response.data)) {
    const merged = mergeDevTopology(response, sceneId);
    const topologyData = merged.data ?? { nodes: [], edges: [] };
    const matches = await topologyMatchesSceneObjectTypes(
      sceneId,
      topologyData
    );

    if (!matches) {
      return resolveTopologyWithListFallback(
        sceneId,
        '拓扑接口数据与当前场景对象类型不一致',
        merged
      );
    }

    return finalizeTopologyResponse(sceneId, merged);
  }

  if (isOntologyApiSuccess(response)) {
    return resolveTopologyWithListFallback(sceneId, '拓扑接口无数据', response);
  }

  return resolveTopologyWithListFallback(sceneId, '拓扑接口失败', response);
};

const shouldUseDevPhysicalProperties = (
  params: ListOntologyPhysicalPropertiesReq
) => {
  if (!isDevBypassEnabled()) {
    return false;
  }

  const objectTypeIds = params.objectTypeIdList || [];
  if (!objectTypeIds.length) {
    return true;
  }

  return objectTypeIds.some(
    (id) =>
      isDevObjectTypeId(id) ||
      hasDevObjectTypeInstances(id) ||
      !!getDevObjectTypeRecord(id)
  );
};

const enrichScenePhysicalProperties = async (
  properties: PhysicalProperties[],
  ontologyModelID?: number
): Promise<PhysicalProperties[]> => {
  if (!properties.length || !ontologyModelID) {
    return properties;
  }

  const objectTypeRes = await listOntologyObjectType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  if (!isOntologyApiSuccess(objectTypeRes)) {
    return properties;
  }

  const objectTypes = objectTypeRes.data?.result || [];
  return enrichPhysicalPropertiesFromDataResource(properties, objectTypes);
};

const mergeDevPhysicalProperties = async (
  response: ApiRes<ListOntologyPhysicalPropertiesRes>,
  params: ListOntologyPhysicalPropertiesReq
): Promise<ApiRes<ListOntologyPhysicalPropertiesRes>> => {
  const devResponse = devListOntologyPhysicalProperties(params);
  const devItems = devResponse.data?.result || [];

  const apiItems = response.data?.result || [];
  const merged = enrichPhysicalPropertiesWithObjectType([
    ...devItems,
    ...apiItems.filter(
      (item) =>
        !devItems.some(
          (devItem) =>
            devItem.objectTypeID === item.objectTypeID &&
            devItem.name === item.name
        )
    )
  ]);
  const enriched = await enrichScenePhysicalProperties(
    merged,
    params.ontologyModelID
  );

  return {
    ...response,
    data: {
      ...response.data,
      result: enriched,
      totalCount: enriched.length
    }
  };
};

// 获取本体拓扑
export async function getOntologyTopology(params: {
  id: number;
}): Promise<ApiRes<GetOntologyTopologyResponse>> {
  try {
    const response = normalizeTopologyApiResponse(
      await UAPI.RES.GetOntologyTopologyApi({})
        .post(buildTopologyRequestBody(params.id))
        .inRegion()
        .do()
    );

    return resolveTopologyResponse(params.id, response);
  } catch (error) {
    console.warn('[topology] GetOntologyTopology 请求异常', error);
    return resolveTopologyWithListFallback(params.id, '拓扑接口异常');
  }
}

// 分页查询对象类型实例数据
const createEmptyObjectTypeDataResponse =
  (): ApiRes<ListOntologyObjectTypeDataRes> => ({
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result: [],
      totalCount: 0
    }
  });

export async function listOntologyObjectTypeData(params: {
  id: number;
  page: number;
  pageSize: number;
  fieldList?: ObjectTypeDataFieldFilter[];
  ontologyModelID?: number;
  objectTypeId?: number;
}): Promise<ApiRes<ListOntologyObjectTypeDataRes>> {
  const useDevInstances =
    isDevBypassEnabled() &&
    (isDevObjectTypeId(params.id) ||
      hasDevObjectTypeInstances(params.id) ||
      !!getDevObjectTypeRecord(params.id));

  const requestPayload: {
    id: number;
    page: number;
    pageSize: number;
    fieldList?: ObjectTypeDataFieldFilter[];
    ontologyModelID?: number;
    objectTypeId?: number;
  } = {
    id: params.id,
    page: params.page,
    pageSize: params.pageSize
  };

  if (params.ontologyModelID != null) {
    requestPayload.ontologyModelID = params.ontologyModelID;
  }

  if (params.objectTypeId != null) {
    requestPayload.objectTypeId = params.objectTypeId;
  }

  if (params.fieldList?.length) {
    requestPayload.fieldList = params.fieldList;
  }

  const normalizeResponse = (
    response: ApiRes<ListOntologyObjectTypeDataRes>
  ): ApiRes<ListOntologyObjectTypeDataRes> => {
    if (isOntologyApiSuccess(response)) {
      return response;
    }

    if (isResourceNotFoundResponse(response)) {
      return createEmptyObjectTypeDataResponse();
    }

    return response;
  };

  try {
    const rawResponse = await UAPI.RES.ListOntologyObjectTypeDataApi({})
      .post(requestPayload)
      .inRegion()
      .do({ preCheck: false });
    const resourceNotFound = isResourceNotFoundResponse(rawResponse);
    const response = normalizeResponse(rawResponse);

    if (isOntologyApiSuccess(response)) {
      const apiItems = response.data?.result || [];
      if (isDevBypassEnabled() && !apiItems.length) {
        const devResponse = devListOntologyObjectTypeData(params);
        const devItems = devResponse.data?.result || [];
        if (devItems.length) {
          return devResponse;
        }
      }
      if (useDevInstances) {
        const devResponse = devListOntologyObjectTypeData(params);
        const devItems = devResponse.data?.result || [];
        if (devItems.length) {
          return devResponse;
        }
      }
      return resourceNotFound
        ? { ...response, resourceNotFound: true }
        : response;
    }

    if (useDevInstances) {
      console.warn('[dev] 实例列表接口失败，回退本地开发缓存');
      return devListOntologyObjectTypeData(params);
    }

    return response;
  } catch (error) {
    if (useDevInstances) {
      console.warn('[dev] 实例列表接口异常，回退本地开发缓存');
      return devListOntologyObjectTypeData(params);
    }

    throw error;
  }
}

// 获取物理属性列表
export async function listOntologyPhysicalProperties(
  params: ListOntologyPhysicalPropertiesReq
): Promise<ApiRes<ListOntologyPhysicalPropertiesRes>> {
  try {
    const response = await UAPI.RES.ListOntologyPhysicalPropertiesApi({})
      .post(params)
      .inRegion()
      .do();

    if (isOntologyApiSuccess(response)) {
      if (shouldUseDevPhysicalProperties(params)) {
        return await mergeDevPhysicalProperties(response, params);
      }

      const apiItems = response.data?.result || [];
      if (apiItems.length) {
        const enriched = await enrichScenePhysicalProperties(
          enrichPhysicalPropertiesWithObjectType(apiItems),
          params.ontologyModelID
        );

        return {
          ...response,
          data: {
            ...response.data,
            result: enriched,
            totalCount: response.data?.totalCount ?? enriched.length
          }
        };
      }

      return response;
    }

    if (shouldUseDevPhysicalProperties(params)) {
      console.warn('[dev] 属性列表接口失败，回退本地开发缓存');
      return devListOntologyPhysicalProperties(params);
    }

    return response;
  } catch (error) {
    if (shouldUseDevPhysicalProperties(params)) {
      console.warn('[dev] 属性列表接口异常，回退本地开发缓存');
      return devListOntologyPhysicalProperties(params);
    }

    throw error;
  }
}

const mergeDevLinkTypes = (
  response: ApiRes<ListOntologyLinkTypeRes>,
  params: ListOntologyLinkTypeReq
): ApiRes<ListOntologyLinkTypeRes> => {
  let apiItems = response.data?.result || [];

  if (isDevBypassEnabled()) {
    const devResponse = devListOntologyLinkTypes(params);
    const devItems = devResponse.data?.result || [];
    if (devItems.length) {
      apiItems = [
        ...devItems.filter(
          (item) => !apiItems.some((existing) => existing.id === item.id)
        ),
        ...apiItems
      ];
    }
  }

  return {
    ...response,
    data: {
      ...response.data,
      result: apiItems,
      totalCount: response.data?.totalCount ?? apiItems.length
    }
  };
};

const buildEnrichedLinkTypeListResponse = async (
  response: ApiRes<ListOntologyLinkTypeRes>,
  params: ListOntologyLinkTypeReq
): Promise<ApiRes<ListOntologyLinkTypeRes>> => {
  const merged = mergeDevLinkTypes(response, params);
  const scopedObjectTypeIds = resolveScopedObjectTypeIds(params);
  let enriched = await fetchAndEnrichLinkTypes(
    merged.data?.result || [],
    params.ontologyModelID
  );

  if (scopedObjectTypeIds.length) {
    enriched = filterLinksByObjectTypeIds(enriched, scopedObjectTypeIds);
  }

  return {
    ...merged,
    data: {
      ...merged.data,
      result: enriched,
      totalCount: scopedObjectTypeIds.length
        ? enriched.length
        : (merged.data?.totalCount ?? enriched.length)
    }
  };
};

const getDevLinkTypeListFallback = (params: ListOntologyLinkTypeReq) => {
  console.warn('[dev] 链接类型列表接口不可用，回退本地开发缓存');
  return devListOntologyLinkTypes(params);
};

export async function listOntologyLinkType(
  params: ListOntologyLinkTypeReq
): Promise<ApiRes<ListOntologyLinkTypeRes>> {
  const requestPayload = normalizeLinkTypeListRequest(params);

  try {
    const response = await UAPI.RES.ListOntologyLinkTypeApi({})
      .post(requestPayload)
      .inRegion()
      .do({ preCheck: false });

    if (isOntologyApiSuccess(response)) {
      return buildEnrichedLinkTypeListResponse(response, params);
    }

    if (shouldUseDevLinkTypeListFallback(response)) {
      return buildEnrichedLinkTypeListResponse(
        getDevLinkTypeListFallback(params),
        params
      );
    }

    return response;
  } catch (error) {
    if (shouldUseDevLinkTypeListFallback(undefined, error)) {
      return buildEnrichedLinkTypeListResponse(
        getDevLinkTypeListFallback(params),
        params
      );
    }

    throw error;
  }
}
