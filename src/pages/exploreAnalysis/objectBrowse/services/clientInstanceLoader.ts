import {
  devListOntologyObjectTypeData,
  devListOntologyObjectTypes,
  getDevObjectTypeRecord
} from '@/utils/devObjectTypeStore';
import type { InstanceQueryRow } from '../types';

const CLIENT_PAGE_SIZE = 1_000_000;

const dedupeInstanceRows = (items: InstanceQueryRow[]): InstanceQueryRow[] => {
  const seen = new Set<string>();
  const result: InstanceQueryRow[] = [];

  items.forEach((row) => {
    const key = String(
      row.id ??
        row._id ??
        row.instanceId ??
        row.instance_id ??
        JSON.stringify(row)
    );
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(row);
  });

  return result;
};

/** 将 UI 中的对象类型 ID 解析为本地 dev 存储中的 ID（按 id / code / 场景对齐） */
export const resolveClientObjectTypeId = (params: {
  objectTypeId: number;
  sceneId?: number;
  code?: string;
}): number => {
  if (getDevObjectTypeRecord(params.objectTypeId)) {
    return params.objectTypeId;
  }

  const allRecords =
    devListOntologyObjectTypes({ pageNo: -1, pageSize: -1 }).data?.result || [];

  if (params.code) {
    const matchedByCode = params.sceneId
      ? allRecords.find(
          (item) =>
            item.code === params.code && item.ontologyModelID === params.sceneId
        )
      : allRecords.find((item) => item.code === params.code);

    if (matchedByCode?.id && getDevObjectTypeRecord(matchedByCode.id)) {
      return matchedByCode.id;
    }
  }

  if (params.sceneId) {
    const matchedInScene = allRecords.find(
      (item) =>
        item.ontologyModelID === params.sceneId &&
        item.id === params.objectTypeId
    );
    if (matchedInScene?.id && getDevObjectTypeRecord(matchedInScene.id)) {
      return matchedInScene.id;
    }
  }

  return params.objectTypeId;
};

/** 从本地 dev 缓存加载对象类型全部实例（不请求后端） */
export const loadAllClientInstances = (params: {
  objectTypeId: number;
  sceneId?: number;
  code?: string;
}): Promise<InstanceQueryRow[]> => {
  const resolvedId = resolveClientObjectTypeId(params);

  const response = devListOntologyObjectTypeData({
    id: resolvedId,
    page: 1,
    pageSize: CLIENT_PAGE_SIZE
  });

  return Promise.resolve(
    dedupeInstanceRows((response.data?.result || []) as InstanceQueryRow[])
  );
};

export const hasClientInstances = (params: {
  objectTypeId: number;
  sceneId?: number;
  code?: string;
}): boolean => {
  const resolvedId = resolveClientObjectTypeId(params);
  const record = getDevObjectTypeRecord(resolvedId);
  return Boolean(record?.devInstances?.length);
};
