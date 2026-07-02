import { DATA_RESOURCE_CATALOG } from '@/pages/dataResource/data/catalog';
import { findDataResourceTableBySource } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import type { ObjectType } from '@/types/objectType';
import { getDevObjectTypeRecord } from '@/utils/devObjectTypeStore';

export interface ObjectTypeLookupMaps {
  byId: Map<number, ObjectType>;
  byName: Map<string, ObjectType>;
  byCode: Map<string, ObjectType>;
  byTableName: Map<string, ObjectType>;
  byTableComment: Map<string, ObjectType>;
}

export const buildObjectTypeLookupMaps = (
  objectTypes: ObjectType[]
): ObjectTypeLookupMaps => {
  const byId = new Map<number, ObjectType>();
  const byName = new Map<string, ObjectType>();
  const byCode = new Map<string, ObjectType>();
  const byTableName = new Map<string, ObjectType>();
  const byTableComment = new Map<string, ObjectType>();

  objectTypes.forEach((item) => {
    if (item.id != null) {
      byId.set(item.id, item);
    }

    const name = item.name?.trim();
    if (name) {
      byName.set(name, item);
    }

    const code = item.code?.trim();
    if (code) {
      byCode.set(code, item);
    }

    const tableName = item.originalTableName?.trim();
    if (tableName) {
      byTableName.set(tableName, item);
    }

    const catalogTable = findDataResourceTableBySource(
      item.originalDbName,
      item.originalTableName
    );
    if (catalogTable?.tableComment?.trim()) {
      byTableComment.set(catalogTable.tableComment.trim(), item);
    }
  });

  DATA_RESOURCE_CATALOG.forEach((table) => {
    const comment = table.tableComment?.trim();
    if (!comment || byTableComment.has(comment)) {
      return;
    }

    const matched = objectTypes.find(
      (objectType) =>
        objectType.originalTableName === table.tableName &&
        (!objectType.originalDbName ||
          objectType.originalDbName === table.databaseType)
    );

    if (matched?.id != null) {
      byTableComment.set(comment, matched);
    }
  });

  return { byId, byName, byCode, byTableName, byTableComment };
};

const matchByNameHint = (
  nameHint: string | undefined,
  maps: ObjectTypeLookupMaps
): ObjectType | undefined => {
  const hint = nameHint?.trim();
  if (!hint) {
    return undefined;
  }

  if (maps.byName.has(hint)) {
    return maps.byName.get(hint);
  }

  if (maps.byTableComment.has(hint)) {
    return maps.byTableComment.get(hint);
  }

  for (const [name, objectType] of maps.byName.entries()) {
    if (name.startsWith(hint) || hint.startsWith(name)) {
      return objectType;
    }
  }

  for (const [comment, objectType] of maps.byTableComment.entries()) {
    if (comment.startsWith(hint) || hint.startsWith(comment)) {
      return objectType;
    }
  }

  return undefined;
};

const matchDevRecordToObjectType = (
  devRecord: ReturnType<typeof getDevObjectTypeRecord>,
  maps: ObjectTypeLookupMaps
): ObjectType | undefined => {
  if (!devRecord) {
    return undefined;
  }

  const tableName = devRecord.originalTableName?.trim();
  if (tableName && maps.byTableName.has(tableName)) {
    return maps.byTableName.get(tableName);
  }

  const code = devRecord.code?.trim();
  if (code && maps.byCode.has(code)) {
    return maps.byCode.get(code);
  }

  return matchByNameHint(devRecord.name, maps);
};

/** 将链接端点解析为场景内对象类型（兼容 dev 缓存 id 与 API id 不一致） */
export const resolveLinkEndpointObjectType = (
  endpointId: number | undefined,
  endpointName: string | undefined,
  endpointInfo: { id?: number; name?: string } | undefined,
  maps: ObjectTypeLookupMaps
): ObjectType | undefined => {
  const candidateIds = [endpointId, endpointInfo?.id].filter(
    (id): id is number => id != null
  );

  for (const candidateId of candidateIds) {
    const matched = maps.byId.get(candidateId);
    if (matched) {
      return matched;
    }
  }

  const nameMatched =
    matchByNameHint(endpointName, maps) ??
    matchByNameHint(endpointInfo?.name, maps);
  if (nameMatched) {
    return nameMatched;
  }

  for (const candidateId of candidateIds) {
    const devMatched = matchDevRecordToObjectType(
      getDevObjectTypeRecord(candidateId),
      maps
    );
    if (devMatched) {
      return devMatched;
    }
  }

  return undefined;
};

export const resolveLinkEndpointObjectTypeId = (
  endpointId: number | undefined,
  endpointName: string | undefined,
  endpointInfo: { id?: number; name?: string } | undefined,
  maps: ObjectTypeLookupMaps
): number | undefined =>
  resolveLinkEndpointObjectType(endpointId, endpointName, endpointInfo, maps)
    ?.id;
