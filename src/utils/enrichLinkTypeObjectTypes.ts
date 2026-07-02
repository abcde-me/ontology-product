import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';

import {
  buildObjectTypeLookupMaps,
  resolveLinkEndpointObjectType
} from '@/pages/ontologyScene/modules/graph/utils/resolveLinkEndpointObjectType';

import type { LinkInfo, ListOntologyLinkTypeReq } from '@/types/graphApi';

import type { ObjectType } from '@/types/objectType';

import { isOntologyApiSuccess } from '@/utils/apiResponse';

const sceneObjectTypesInflight = new Map<number, Promise<ObjectType[]>>();

/** 同一场景的对象类型列表请求去重，避免链接页重复拉取 */

export const fetchSceneObjectTypes = async (
  ontologyModelID: number
): Promise<ObjectType[]> => {
  const inflight = sceneObjectTypesInflight.get(ontologyModelID);

  if (inflight) {
    return inflight;
  }

  const task = listOntologyObjectType({
    ontologyModelID,

    pageNo: 1,

    pageSize: -1
  })
    .then((response) =>
      isOntologyApiSuccess(response) ? response.data?.result || [] : []
    )

    .finally(() => {
      sceneObjectTypesInflight.delete(ontologyModelID);
    });

  sceneObjectTypesInflight.set(ontologyModelID, task);

  return task;
};

const enrichLinkEndpoints = (
  link: LinkInfo,

  maps: ReturnType<typeof buildObjectTypeLookupMaps>
): LinkInfo => {
  const source = resolveLinkEndpointObjectType(
    link.sourceObjectTypeID,

    link.sourceObjectTypeName,

    link.sourceObjectTypeInfo,

    maps
  );

  const target = resolveLinkEndpointObjectType(
    link.targetObjectTypeID,

    link.targetObjectTypeName,

    link.targetObjectTypeInfo,

    maps
  );

  return {
    ...link,

    sourceObjectTypeName:
      link.sourceObjectTypeName ||
      source?.name ||
      link.sourceObjectTypeInfo?.name,

    sourceObjectTypeIcon:
      link.sourceObjectTypeIcon ||
      source?.icon ||
      link.sourceObjectTypeInfo?.icon,

    sourceObjectTypeSyncStatus:
      link.sourceObjectTypeSyncStatus ??
      source?.syncStatus ??
      link.sourceObjectTypeInfo?.syncStatus,

    targetObjectTypeName:
      link.targetObjectTypeName ||
      target?.name ||
      link.targetObjectTypeInfo?.name,

    targetObjectTypeIcon:
      link.targetObjectTypeIcon ||
      target?.icon ||
      link.targetObjectTypeInfo?.icon,

    targetObjectTypeSyncStatus:
      link.targetObjectTypeSyncStatus ??
      target?.syncStatus ??
      link.targetObjectTypeInfo?.syncStatus,

    sourceObjectTypeID: source?.id ?? link.sourceObjectTypeID,

    targetObjectTypeID: target?.id ?? link.targetObjectTypeID,

    sourceObjectTypeInfo: source
      ? {
          id: source.id,

          name: source.name || '',

          icon: source.icon || '',

          syncStatus: source.syncStatus
        }
      : link.sourceObjectTypeInfo,

    targetObjectTypeInfo: target
      ? {
          id: target.id,

          name: target.name || '',

          icon: target.icon || '',

          syncStatus: target.syncStatus
        }
      : link.targetObjectTypeInfo
  };
};

/** 根据场景内对象类型列表，补全链接的源/目标对象类型名称与图标 */

export const enrichLinkTypesWithObjectTypes = (
  links: LinkInfo[],

  objectTypes: ObjectType[]
): LinkInfo[] => {
  if (!links.length || !objectTypes.length) {
    return links;
  }

  const maps = buildObjectTypeLookupMaps(objectTypes);

  return links.map((link) => enrichLinkEndpoints(link, maps));
};

export const fetchAndEnrichLinkTypes = async (
  links: LinkInfo[],

  ontologyModelID?: number
): Promise<LinkInfo[]> => {
  if (!links.length || !ontologyModelID) {
    return links;
  }

  try {
    const objectTypes = await fetchSceneObjectTypes(ontologyModelID);

    return enrichLinkTypesWithObjectTypes(links, objectTypes);
  } catch {
    return links;
  }
};

/** 保留与指定对象类型相关的链接（源或目标命中即可） */

export const filterLinksByObjectTypeIds = (
  links: LinkInfo[],

  objectTypeIds: number[]
): LinkInfo[] => {
  if (!objectTypeIds.length) {
    return links;
  }

  const idSet = new Set(objectTypeIds);

  return links.filter(
    (link) =>
      (link.sourceObjectTypeID != null && idSet.has(link.sourceObjectTypeID)) ||
      (link.targetObjectTypeID != null && idSet.has(link.targetObjectTypeID))
  );
};

export const resolveScopedObjectTypeIds = (
  params: Pick<
    ListOntologyLinkTypeReq,
    'sourceObjectTypeIDList' | 'targetObjectTypeIDList'
  >
) => [
  ...new Set([
    ...(params.sourceObjectTypeIDList || []),

    ...(params.targetObjectTypeIDList || [])
  ])
];
