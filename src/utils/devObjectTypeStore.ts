import type {
  CreateOntologyObjectTypeReq,
  GetOntologyObjectTypeDetailRes,
  ListOntologyObjectTypeReq,
  ObjectType,
  OntologyPhysicalPropertiesList,
  SourceDataInfo,
  SyncSourceDataStrategy,
  UpdateOntologyObjectTypeReq
} from '@/types/objectType';
import {
  SyncStatus,
  type ListOntologyPhysicalPropertiesReq,
  type Ontologymetadataservicev1TopologyNode,
  type PhysicalProperties
} from '@/types/graphApi';
import { isPermissionRelatedError } from '@/utils/devOntologyStore';
import { formatOntologyObjectTypeDataSourceName } from '@/utils/ontologyObjectTypeDisplay';
import {
  collectVectorFieldMappingsFromRecord,
  enrichInstancesWithEmbeddings
} from '@/services/ontologyVectorization';
import { clientVectorSearchOntologyObjectTypeData } from '@/services/vectorSimilaritySearch';
import type { VectorSearchRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import {
  isDataResourceBackedObjectType,
  buildDataResourceObjectTypeDescription,
  findDataResourceTableBySource,
  needsPhysicalPropertyRepair,
  resolveExpectedPhysicalPropertiesForObjectType,
  resolveDataResourceSampleInstancesFromSource
} from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';

const STORAGE_KEY = 'dev_ontology_object_types';
const INSTANCE_CACHE_KEY = 'dev_ontology_csv_instances';

export interface DevObjectTypeRecord extends CreateOntologyObjectTypeReq {
  id: number;
  createTime: string;
  updateTime: string;
  syncStatus: SyncStatus;
  devInstances?: Record<string, unknown>[];
  funnel_task_id?: number;
  syncEnabled?: boolean;
  ontologyTableName?: string;
}

const readObjectTypes = (): DevObjectTypeRecord[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeObjectTypes = (records: DevObjectTypeRecord[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const readInstanceCache = (): Record<string, Record<string, unknown>[]> => {
  try {
    const raw = window.localStorage.getItem(INSTANCE_CACHE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeInstanceCache = (
  cache: Record<string, Record<string, unknown>[]>
) => {
  window.localStorage.setItem(INSTANCE_CACHE_KEY, JSON.stringify(cache));
};

export const cacheDevCsvInstances = (
  filePath: string,
  instances: Record<string, unknown>[]
) => {
  if (!filePath || !instances.length) {
    return;
  }

  const cache = readInstanceCache();
  cache[filePath] = instances;
  writeInstanceCache(cache);
};

export const getDevCsvInstances = (filePath?: string) => {
  if (!filePath) {
    return [];
  }

  return readInstanceCache()[filePath] || [];
};

const isPlaceholderDevInstances = (
  instances: Record<string, unknown>[]
): boolean => {
  if (!instances.length) {
    return false;
  }

  return instances.every((item) => {
    const keys = Object.keys(item).filter((key) => key !== 'id');
    return keys.length === 0;
  });
};

export const resolveDevInstancesForPayload = (
  params: CreateOntologyObjectTypeReq,
  existingInstances?: Record<string, unknown>[]
): Record<string, unknown>[] => {
  const csvInstances = getDevCsvInstances(params.filePath);
  if (csvInstances.length) {
    return csvInstances;
  }

  if (isDataResourceBackedObjectType(params)) {
    const sampleInstances = resolveDataResourceSampleInstancesFromSource(
      params.originalDbName,
      params.originalTableName,
      params.ontologyPhysicalPropertiesList
    );
    if (sampleInstances.length) {
      return sampleInstances;
    }
  }

  if (
    existingInstances?.length &&
    !isPlaceholderDevInstances(existingInstances)
  ) {
    return existingInstances;
  }

  return [];
};

const toListItem = (record: DevObjectTypeRecord): ObjectType => ({
  id: record.id,
  code: record.code,
  name: record.name,
  description: record.description,
  icon: record.icon,
  filePath: record.filePath,
  ontologyModelID: record.ontologyModelID,
  originalDbName: record.originalDbName,
  originalTableName: record.originalTableName,
  sourceType: record.sourceType,
  syncStatus: record.syncStatus,
  enableSyncSourceData: record.enableSyncSourceData,
  funnel_task_id: record.funnel_task_id,
  syncEnabled: record.syncEnabled,
  ontologyTableName: record.ontologyTableName,
  createTime: record.createTime,
  updateTime: record.updateTime
});

export const devSyncObjectTypeTask = (id: number) => {
  const records = readObjectTypes();
  const existing = records.find((item) => item.id === id);

  if (!existing) {
    return {
      status: 400,
      code: 'ResourceNotFound',
      message: '资源不存在',
      requestId: '',
      data: ''
    };
  }

  const now = new Date().toISOString();
  const funnelTaskId = existing.funnel_task_id || Date.now();
  const ontologyTableName =
    existing.ontologyTableName ||
    `dev_${String(existing.code || existing.id).replace(/[^a-zA-Z0-9_]/g, '_')}`;

  const record: DevObjectTypeRecord = {
    ...existing,
    enableSyncSourceData: true,
    syncStatus: SyncStatus.SUCCESS,
    syncEnabled: true,
    funnel_task_id: funnelTaskId,
    ontologyTableName,
    updateTime: now
  };

  writeObjectTypes([record, ...records.filter((item) => item.id !== id)]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: 'ok'
  };
};

export const getDevObjectTypeRecord = (id: number) =>
  readObjectTypes().find((item) => item.id === id);

export const hasDevObjectTypeInstances = (id: number) =>
  (getDevObjectTypeRecord(id)?.devInstances?.length ?? 0) > 0;

export const isDevObjectTypeId = (id: number) =>
  readObjectTypes().some((item) => item.id === id);

const buildBoundDevRecord = (
  source: Omit<GetOntologyObjectTypeDetailRes, 'id' | 'syncStatus'> & {
    id?: number;
    syncStatus?: SyncStatus;
  },
  targetOntologyModelID: number
): DevObjectTypeRecord => {
  const id = Date.now();
  const now = new Date().toISOString();

  return {
    code: source.code || '',
    name: source.name || '',
    description: source.description,
    filePath: source.filePath,
    enableSyncSourceData: source.enableSyncSourceData,
    icon: source.icon || 'object-type-1',
    ontologyModelID: targetOntologyModelID,
    ontologyPhysicalPropertiesList: source.ontologyPhysicalPropertiesList,
    originalDbName: source.originalDbName || '',
    originalTableName: source.originalTableName || '',
    sourceType: source.sourceType,
    sourceDataInfo: source.sourceDataInfo as SourceDataInfo | undefined,
    syncSourceDataStrategy: source.syncSourceDataStrategy as
      | SyncSourceDataStrategy
      | undefined,
    id,
    createTime: now,
    updateTime: now,
    syncStatus: SyncStatus.NOT_SYNC
  };
};

export const devBindOntologyObjectTypeFromDetail = (
  detail: GetOntologyObjectTypeDetailRes,
  targetOntologyModelID: number
) => {
  const records = readObjectTypes();
  const objectTypeCode = detail.code?.trim();

  if (
    objectTypeCode &&
    records.some(
      (item) =>
        item.ontologyModelID === targetOntologyModelID &&
        item.code === objectTypeCode
    )
  ) {
    return {
      status: 400,
      code: 'DuplicateBind',
      message: '当前场景库已绑定该对象类型',
      requestId: '',
      data: undefined
    };
  }

  const record = buildBoundDevRecord(detail, targetOntologyModelID);
  writeObjectTypes([record, ...records]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      data: {
        id: record.id
      }
    }
  };
};

export const devBindOntologyObjectType = (params: {
  ontologyModelID: number;
  objectTypeID: number;
}) => {
  const records = readObjectTypes();
  const source = records.find((item) => item.id === params.objectTypeID);

  if (!source) {
    return {
      status: 400,
      code: 'ResourceNotFound',
      message: '对象类型不存在',
      requestId: '',
      data: undefined
    };
  }

  return devBindOntologyObjectTypeFromDetail(source, params.ontologyModelID);
};

/** 将 API 创建/更新后的对象类型镜像到本地（便于开发环境展示实例与属性） */
export const devMirrorOntologyObjectType = (
  id: number,
  params: CreateOntologyObjectTypeReq,
  devInstances?: Record<string, unknown>[]
) => {
  const records = readObjectTypes().filter((item) => item.id !== id);
  const existing = readObjectTypes().find((item) => item.id === id);
  const now = new Date().toISOString();
  const instances =
    devInstances ??
    resolveDevInstancesForPayload(params, existing?.devInstances);

  const record: DevObjectTypeRecord = {
    ...params,
    id,
    createTime: existing?.createTime || now,
    updateTime: now,
    syncStatus: existing?.syncStatus ?? SyncStatus.NOT_SYNC,
    ontologyPhysicalPropertiesList: normalizeCreatePhysicalProperties(
      params.ontologyPhysicalPropertiesList
    ),
    devInstances: instances
  };

  writeObjectTypes([record, ...records]);
};

export const devUpdateOntologyObjectType = (
  params: UpdateOntologyObjectTypeReq
) => {
  const records = readObjectTypes();
  const existing = records.find((item) => item.id === params.id);

  if (!existing) {
    return {
      status: 400,
      code: 'ResourceNotFound',
      message: '资源不存在',
      requestId: '',
      data: undefined
    };
  }

  const now = new Date().toISOString();
  const { id, ...rest } = params;
  const devInstances = resolveDevInstancesForPayload(
    params,
    existing.devInstances
  );

  const record: DevObjectTypeRecord = {
    ...existing,
    ...rest,
    id,
    updateTime: now,
    ontologyPhysicalPropertiesList: normalizeCreatePhysicalProperties(
      params.ontologyPhysicalPropertiesList
    ),
    devInstances
  };

  writeObjectTypes([
    record,
    ...records.filter((item) => item.id !== params.id)
  ]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      data: {
        id: params.id
      }
    }
  };
};

export const devCreateOntologyObjectType = (
  params: CreateOntologyObjectTypeReq
) => {
  if (params.reuseObjectTypeID) {
    const source = readObjectTypes().find(
      (item) => item.id === params.reuseObjectTypeID
    );

    if (source) {
      return devBindOntologyObjectTypeFromDetail(
        source,
        params.ontologyModelID
      );
    }
  }

  const records = readObjectTypes();
  const id = Date.now();
  const now = new Date().toISOString();
  const devInstances = resolveDevInstancesForPayload(params);

  const record: DevObjectTypeRecord = {
    ...params,
    id,
    createTime: now,
    updateTime: now,
    syncStatus: SyncStatus.NOT_SYNC,
    ontologyPhysicalPropertiesList: normalizeCreatePhysicalProperties(
      params.ontologyPhysicalPropertiesList
    ),
    devInstances
  };

  writeObjectTypes([record, ...records]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      data: {
        id
      }
    }
  };
};

export const devListOntologyObjectTypes = (
  params: ListOntologyObjectTypeReq = {}
) => {
  repairDataResourceBackedObjectTypeDescriptions();
  repairDataResourceBackedObjectTypeProperties();

  const keyword = params.filter?.trim().toLowerCase() || '';
  const items = readObjectTypes()
    .filter((record) => {
      if (
        params.ontologyModelID &&
        record.ontologyModelID !== params.ontologyModelID
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        record.name?.toLowerCase().includes(keyword) ||
        record.code?.toLowerCase().includes(keyword)
      );
    })
    .map(toListItem);

  const totalCount = items.length;
  const pageNo = params.pageNo ?? 1;
  const pageSize = params.pageSize ?? 10;
  let result = items;

  if (pageSize > 0 && pageNo > 0) {
    const start = (pageNo - 1) * pageSize;
    result = items.slice(start, start + pageSize);
  }

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result,
      totalCount
    }
  };
};

export const devGetOntologyObjectTypeDetail = (id: number) => {
  repairDataResourceBackedObjectTypeDescriptions();
  repairDataResourceBackedObjectTypeProperties();

  const record = readObjectTypes().find((item) => item.id === id);
  if (!record) {
    return null;
  }

  const { syncStatus, createTime, updateTime, ...detail } = record;
  const normalizedProperties = normalizePhysicalProperties(record);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      ...detail,
      id,
      syncStatus,
      createTime,
      updateTime,
      ontologyPhysicalPropertiesList: normalizedProperties
    }
  };
};

export const devDeleteOntologyObjectType = (id: number) => {
  writeObjectTypes(readObjectTypes().filter((item) => item.id !== id));

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      data: ''
    }
  };
};

/** 按场景库 ID 清理本地对象类型（含实例） */
export const devDeleteOntologyObjectTypesByModelId = (
  ontologyModelID: number
) => {
  const modelId = Number(ontologyModelID);
  if (!Number.isFinite(modelId)) {
    return 0;
  }

  const records = readObjectTypes();
  const nextRecords = records.filter(
    (item) => Number(item.ontologyModelID) !== modelId
  );
  const removed = records.length - nextRecords.length;
  if (removed > 0) {
    writeObjectTypes(nextRecords);
  }
  return removed;
};

/** pageNo/pageSize 为 -1 时表示不分页，返回全部结果 */
const paginateDevList = <T>(
  items: T[],
  params: { pageNo?: number; pageSize?: number }
): T[] => {
  if (params.pageNo === -1 || params.pageSize === -1) {
    return items;
  }

  const pageNo = params.pageNo && params.pageNo > 0 ? params.pageNo : 1;
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
  const start = (pageNo - 1) * pageSize;

  return items.slice(start, start + pageSize);
};

/** 兼容 CreateOntologyPhysicalProperty（name/comment）与列表结构（propertyName/propertyComment） */
export const coerceOntologyPhysicalProperty = (
  property: Record<string, unknown>,
  index: number
): OntologyPhysicalPropertiesList => {
  const propertyName = String(
    property.propertyName ?? property.name ?? `field_${index + 1}`
  );
  const propertyComment = String(
    property.propertyComment ?? property.comment ?? propertyName
  );
  const propertyType = String(
    property.propertyType ?? property.columnType ?? 'varchar(255)'
  );
  const propertyID = Number(property.propertyID ?? property.id ?? index + 1);

  return {
    propertyID: Number.isFinite(propertyID) ? propertyID : index + 1,
    propertyName,
    propertyComment,
    propertyType,
    isPrimary: Number(property.isPrimary ?? 0) === 1 ? 1 : 0,
    isVector: Number(property.isVector ?? 0) === 1 ? 1 : 0,
    publicPropertyID: Number(property.publicPropertyID ?? 0),
    sourceColumnName: String(property.sourceColumnName ?? propertyName),
    sourceColumnComment: String(
      property.sourceColumnComment ?? propertyComment
    ),
    sourceColumnType: String(property.sourceColumnType ?? propertyType)
  };
};

const normalizePhysicalProperties = (
  record: DevObjectTypeRecord
): OntologyPhysicalPropertiesList[] => {
  const properties = record.ontologyPhysicalPropertiesList;
  if (!Array.isArray(properties)) {
    return [];
  }

  return properties.map((property, index) =>
    coerceOntologyPhysicalProperty(property as Record<string, unknown>, index)
  );
};

const normalizeCreatePhysicalProperties = (
  properties?: CreateOntologyObjectTypeReq['ontologyPhysicalPropertiesList']
): OntologyPhysicalPropertiesList[] => {
  if (!Array.isArray(properties)) {
    return [];
  }

  return properties.map((property, index) =>
    coerceOntologyPhysicalProperty(property as Record<string, unknown>, index)
  );
};

/** 修复本地缓存中数据资源对象类型的属性（从数据资源目录补全空壳/缺失字段） */
export const repairDataResourceBackedObjectTypeProperties = () => {
  const now = new Date().toISOString();
  let changed = false;

  const records = readObjectTypes().map((record) => {
    if (!isDataResourceBackedObjectType(record)) {
      return record;
    }

    const expected = resolveExpectedPhysicalPropertiesForObjectType(record);
    if (!expected?.length) {
      return record;
    }

    const current = normalizePhysicalProperties(record);
    if (!needsPhysicalPropertyRepair(current, expected.length)) {
      return record;
    }

    changed = true;
    return {
      ...record,
      ontologyPhysicalPropertiesList: expected,
      updateTime: now
    };
  });

  if (changed) {
    writeObjectTypes(records);
  }
};

/** 修复本地缓存中数据资源对象类型的描述（字段注释顿号拼接） */
export const repairDataResourceBackedObjectTypeDescriptions = () => {
  const now = new Date().toISOString();
  let changed = false;

  const records = readObjectTypes().map((record) => {
    if (!isDataResourceBackedObjectType(record)) {
      return record;
    }

    const table = findDataResourceTableBySource(
      record.originalDbName,
      record.originalTableName
    );
    if (!table) {
      return record;
    }

    const nextDescription = buildDataResourceObjectTypeDescription(table);
    if (!nextDescription || record.description === nextDescription) {
      return record;
    }

    changed = true;
    return {
      ...record,
      description: nextDescription,
      updateTime: now
    };
  });

  if (changed) {
    writeObjectTypes(records);
  }
};

/** 修复本地缓存中属性/实例字段（联合作战一键生成后刷新详情用） */
export const repairDevObjectTypesForModel = (
  ontologyModelID: number,
  instancesByCode?: Record<string, Record<string, unknown>[]>
) => {
  const records = readObjectTypes().map((record) => {
    if (record.ontologyModelID !== ontologyModelID) {
      return record;
    }

    const instances =
      instancesByCode?.[record.code || ''] ?? record.devInstances ?? [];

    return {
      ...record,
      ontologyPhysicalPropertiesList: normalizePhysicalProperties(record),
      devInstances: instances
    };
  });

  writeObjectTypes(records);
};

const toTopologyProperty = (
  property: OntologyPhysicalPropertiesList,
  index: number
) => ({
  id: property.propertyID || index + 1,
  name: property.propertyName || '',
  type: property.propertyType || ''
});

const toPhysicalProperty = (
  property: OntologyPhysicalPropertiesList,
  record: DevObjectTypeRecord,
  index: number
): PhysicalProperties => ({
  id: property.propertyID || index + 1,
  name: property.propertyName,
  comment: property.propertyComment,
  columnType: property.propertyType,
  isPrimary: property.isPrimary === 1 ? 1 : 0,
  isVectorSourceField: property.isVector === 1 ? 1 : 0,
  objectTypeID: record.id,
  ontologyObjectTypeId: record.id,
  ontologyObjectTypeName: record.name,
  ontologyObjectTypeIcon: record.icon,
  ontologyModelID: record.ontologyModelID,
  dataSourceName: formatOntologyObjectTypeDataSourceName(record),
  isDeleted: 0
});

export const enrichPhysicalPropertiesWithObjectType = (
  properties: PhysicalProperties[]
): PhysicalProperties[] => {
  const recordMap = new Map(
    readObjectTypes().map((record) => [record.id, record])
  );

  return properties.map((property) => {
    const objectTypeId = property.ontologyObjectTypeId ?? property.objectTypeID;
    if (!objectTypeId) {
      return property;
    }

    const record = recordMap.get(objectTypeId);
    if (!record) {
      return property;
    }

    return {
      ...property,
      ontologyObjectTypeName: property.ontologyObjectTypeName || record.name,
      ontologyObjectTypeIcon: property.ontologyObjectTypeIcon || record.icon,
      dataSourceName:
        property.dataSourceName ||
        formatOntologyObjectTypeDataSourceName(record)
    };
  });
};

export const devBuildTopologyNodes = (
  ontologyModelID: number
): Ontologymetadataservicev1TopologyNode[] =>
  readObjectTypes()
    .filter((record) => record.ontologyModelID === ontologyModelID)
    .map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description,
      icon: record.icon,
      syncStatus: record.syncStatus,
      type: 'objectType',
      ontologyPhysicalPropertiesList:
        normalizePhysicalProperties(record).map(toTopologyProperty)
    }));

export const devListOntologyPhysicalProperties = (
  params: ListOntologyPhysicalPropertiesReq = {}
) => {
  const objectTypeIds = params.objectTypeIdList || [];
  const keyword = params.filter?.trim().toLowerCase() || '';

  let properties = readObjectTypes()
    .filter((record) => {
      if (
        params.ontologyModelID &&
        record.ontologyModelID !== params.ontologyModelID
      ) {
        return false;
      }

      if (!objectTypeIds.length) {
        return true;
      }

      return objectTypeIds.includes(record.id);
    })
    .flatMap((record) =>
      normalizePhysicalProperties(record).map((property, index) =>
        toPhysicalProperty(property, record, index)
      )
    );

  if (params.isPrimary === 0 || params.isPrimary === 1) {
    properties = properties.filter(
      (property) => property.isPrimary === params.isPrimary
    );
  }

  // 本地开发数据无 isUse 字段；查询未使用属性时返回空，isUse=1 时保留全部
  if (params.isUse === 0) {
    properties = [];
  }

  if (keyword) {
    properties = properties.filter(
      (property) =>
        property.name?.toLowerCase().includes(keyword) ||
        property.comment?.toLowerCase().includes(keyword)
    );
  }

  const result = enrichPhysicalPropertiesWithObjectType(
    paginateDevList(properties, params)
  );

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result,
      totalCount: properties.length
    }
  };
};

export const applyDevObjectTypeVectorization = async (objectTypeId: number) => {
  const records = readObjectTypes();
  const record = records.find((item) => item.id === objectTypeId);
  if (!record?.devInstances?.length) {
    return;
  }

  const mappings = collectVectorFieldMappingsFromRecord(
    (record.ontologyPhysicalPropertiesList || []) as unknown as Array<
      Record<string, unknown>
    >
  );
  if (!mappings.length) {
    return;
  }

  try {
    const enrichedInstances = await enrichInstancesWithEmbeddings(
      record.devInstances,
      mappings
    );
    writeObjectTypes(
      records.map((item) =>
        item.id === objectTypeId
          ? {
              ...item,
              devInstances: enrichedInstances,
              updateTime: new Date().toISOString()
            }
          : item
      )
    );
  } catch (error) {
    console.warn('[dev] 对象类型实例向量化失败:', error);
  }
};

export const devVectorSearchOntologyObjectTypeData = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  vectorFieldName: string;
  query: string;
  topK: number;
  scoreThreshold: number;
}): Promise<{ result: VectorSearchRow[]; totalCount: number }> => {
  const record = readObjectTypes().find(
    (item) => item.id === params.objectTypeId
  );
  const instances = record?.devInstances || [];

  return clientVectorSearchOntologyObjectTypeData({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    vectorFieldName: params.vectorFieldName,
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    instances
  });
};

export const devListOntologyObjectTypeData = (params: {
  id: number;
  page: number;
  pageSize: number;
}) => {
  const records = readObjectTypes();
  const record = records.find((item) => item.id === params.id);
  let allInstances = record?.devInstances || [];

  if (record) {
    const shouldRefreshFromSample =
      isDataResourceBackedObjectType(record) ||
      !allInstances.length ||
      isPlaceholderDevInstances(allInstances);

    if (shouldRefreshFromSample) {
      const resolved = resolveDevInstancesForPayload(record, allInstances);
      if (resolved.length) {
        allInstances = resolved;
        writeObjectTypes(
          records.map((item) =>
            item.id === params.id
              ? {
                  ...item,
                  devInstances: resolved,
                  updateTime: new Date().toISOString()
                }
              : item
          )
        );
      }
    }
  }

  const start = (params.page - 1) * params.pageSize;
  const result = allInstances.slice(start, start + params.pageSize);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result,
      totalCount: allInstances.length
    }
  };
};

if (typeof window !== 'undefined') {
  repairDataResourceBackedObjectTypeDescriptions();
  repairDataResourceBackedObjectTypeProperties();
}

export { isPermissionRelatedError };
