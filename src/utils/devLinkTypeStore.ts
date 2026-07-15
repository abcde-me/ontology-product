import type { CreateOntologyLinkTypeReq } from '@/types/links';
import type { GetOntologyLinkTypeRes } from '@/types/links';
import type {
  ListOntologyLinkTypeReq,
  Ontologymetadataservicev1TopologyEdge
} from '@/types/graphApi';
import { SyncStatus } from '@/types/graphApi';
import { getDevObjectTypeRecord } from '@/utils/devObjectTypeStore';

const STORAGE_KEY = 'dev_ontology_link_types';

export interface DevLinkTypeRecord extends CreateOntologyLinkTypeReq {
  id: number;
  createTime: string;
  updateTime: string;
  syncStatus: SyncStatus;
}

const readLinks = (): DevLinkTypeRecord[] => {
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

const writeLinks = (records: DevLinkTypeRecord[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/** 将 API 创建/更新后的链接镜像到本地，保证图谱与链接列表数据一致 */
export const devMirrorOntologyLinkType = (
  id: number,
  params: CreateOntologyLinkTypeReq
) => {
  const records = readLinks().filter((item) => item.id !== id);
  const existing = readLinks().find((item) => item.id === id);
  const now = new Date().toISOString();

  const record: DevLinkTypeRecord = {
    ...params,
    id,
    createTime: existing?.createTime || now,
    updateTime: now,
    syncStatus: existing?.syncStatus ?? SyncStatus.NOT_SYNC
  };

  writeLinks([record, ...records]);
};

export const devCreateOntologyLinkType = (
  params: CreateOntologyLinkTypeReq
) => {
  const records = readLinks();
  const existing = records.find(
    (item) =>
      item.ontologyModelID === params.ontologyModelID &&
      item.code === params.code
  );

  if (existing) {
    return {
      status: 200,
      code: '',
      message: '',
      requestId: '',
      data: { id: existing.id }
    };
  }

  const id = Date.now() + Math.floor(Math.random() * 1000);
  const now = new Date().toISOString();
  const record: DevLinkTypeRecord = {
    ...params,
    id,
    createTime: now,
    updateTime: now,
    syncStatus: SyncStatus.NOT_SYNC
  };

  writeLinks([record, ...records]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: { id }
  };
};

export const devUpdateOntologyLinkType = (
  params: import('@/types/links').UpdateOntologyLinkTypeReq
) => {
  const records = readLinks();
  const index = records.findIndex((item) => item.id === params.id);

  if (index < 0) {
    devMirrorOntologyLinkType(params.id, params);
    return {
      status: 200,
      code: '',
      message: '',
      requestId: '',
      data: { id: params.id }
    };
  }

  const now = new Date().toISOString();
  const { id: _id, ...restParams } = params;
  const next: DevLinkTypeRecord = {
    ...records[index],
    ...restParams,
    id: params.id,
    updateTime: now
  };

  records[index] = next;
  writeLinks(records);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: { id: params.id }
  };
};

export const isDevLinkTypeId = (id: number) =>
  readLinks().some((item) => item.id === id);

export const devGetOntologyLinkTypeDetail = (id: number) => {
  const record = readLinks().find((item) => item.id === id);
  if (!record) {
    return null;
  }

  const source = getDevObjectTypeRecord(record.sourceObjectTypeID);
  const target = getDevObjectTypeRecord(record.targetObjectTypeID);

  const detail: GetOntologyLinkTypeRes = {
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    type: record.type,
    ontologyModelID: record.ontologyModelID,
    sourceObjectTypeID: record.sourceObjectTypeID,
    targetObjectTypeID: record.targetObjectTypeID,
    sourceObjectTypeName: source?.name,
    targetObjectTypeName: target?.name,
    sourceObjectTypeIcon: source?.icon,
    targetObjectTypeIcon: target?.icon,
    linkSourceColumnName: record.linkSourceColumnName,
    linkTargetColumnName: record.linkTargetColumnName,
    syncStatus: record.syncStatus,
    createTime: record.createTime,
    updateTime: record.updateTime,
    enableSyncSourceData: record.enableSyncSourceData ?? false
  };

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: detail
  };
};

export const devListOntologyLinkTypeData = () => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: {
    result: [] as Record<string, unknown>[],
    totalCount: 0
  }
});

export const devListOntologyLinkTypeColumn = () => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: {
    result: [],
    totalCount: 0
  }
});

/** 按场景库 ID 清理本地链接类型 */
export const devDeleteOntologyLinkTypesByModelId = (
  ontologyModelID: number
) => {
  const modelId = Number(ontologyModelID);
  if (!Number.isFinite(modelId)) {
    return 0;
  }

  const records = readLinks();
  const nextRecords = records.filter(
    (item) => Number(item.ontologyModelID) !== modelId
  );
  const removed = records.length - nextRecords.length;
  if (removed > 0) {
    writeLinks(nextRecords);
  }
  return removed;
};

/** 删除与对象类型相关的全部本地链接（源或目标命中） */
export const devDeleteOntologyLinkTypesByObjectTypeIds = (
  objectTypeIds: number[]
) => {
  const idSet = new Set(
    objectTypeIds.filter((id) => Number.isFinite(id) && id > 0)
  );

  if (!idSet.size) {
    return 0;
  }

  const records = readLinks();
  const nextRecords = records.filter(
    (item) =>
      !idSet.has(item.sourceObjectTypeID) && !idSet.has(item.targetObjectTypeID)
  );

  if (nextRecords.length === records.length) {
    return 0;
  }

  writeLinks(nextRecords);
  return records.length - nextRecords.length;
};

export const devDeleteOntologyLinkType = (id: number) => {
  const records = readLinks();
  const nextRecords = records.filter((item) => item.id !== id);

  if (nextRecords.length === records.length) {
    return {
      status: 404,
      code: 'NotFound',
      message: '链接不存在',
      requestId: '',
      data: ''
    };
  }

  writeLinks(nextRecords);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: ''
  };
};

const matchesObjectTypeScope = (
  record: DevLinkTypeRecord,
  params: ListOntologyLinkTypeReq
) => {
  const scopedIds = [
    ...(params.sourceObjectTypeIDList || []),
    ...(params.targetObjectTypeIDList || [])
  ];

  if (!scopedIds.length) {
    return true;
  }

  const idSet = new Set(scopedIds);
  return (
    idSet.has(record.sourceObjectTypeID) || idSet.has(record.targetObjectTypeID)
  );
};

export const devListOntologyLinkTypes = (
  params: ListOntologyLinkTypeReq = {}
) => {
  const keyword = params.filter?.trim().toLowerCase() || '';
  const items = readLinks().filter((record) => {
    if (
      params.ontologyModelID &&
      record.ontologyModelID !== params.ontologyModelID
    ) {
      return false;
    }

    if (!matchesObjectTypeScope(record, params)) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    return (
      record.code?.toLowerCase().includes(keyword) ||
      record.name?.toLowerCase().includes(keyword)
    );
  });

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result: items.map((record) => {
        const source = getDevObjectTypeRecord(record.sourceObjectTypeID);
        const target = getDevObjectTypeRecord(record.targetObjectTypeID);

        return {
          id: record.id,
          code: record.code,
          name: record.name,
          description: record.description,
          type: record.type,
          ontologyModelID: record.ontologyModelID,
          sourceObjectTypeID: record.sourceObjectTypeID,
          targetObjectTypeID: record.targetObjectTypeID,
          sourceObjectTypeName: source?.name,
          targetObjectTypeName: target?.name,
          sourceObjectTypeIcon: source?.icon,
          targetObjectTypeIcon: target?.icon,
          sourceObjectTypeSyncStatus: source?.syncStatus,
          targetObjectTypeSyncStatus: target?.syncStatus,
          sourceObjectTypeInfo: source
            ? {
                id: source.id,
                name: source.name || '',
                icon: source.icon || '',
                syncStatus: source.syncStatus
              }
            : undefined,
          targetObjectTypeInfo: target
            ? {
                id: target.id,
                name: target.name || '',
                icon: target.icon || '',
                syncStatus: target.syncStatus
              }
            : undefined,
          syncStatus: record.syncStatus,
          createTime: record.createTime,
          updateTime: record.updateTime
        };
      }),
      totalCount: items.length
    }
  };
};

export const devBuildTopologyEdges = (
  ontologyModelID: number
): Ontologymetadataservicev1TopologyEdge[] =>
  readLinks()
    .filter((record) => record.ontologyModelID === ontologyModelID)
    .map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description,
      type: record.type,
      sourceId: record.sourceObjectTypeID,
      targetId: record.targetObjectTypeID,
      syncStatus: record.syncStatus
    }));
