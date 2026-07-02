import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { ObjectType } from '@/types/objectType';
import type {
  ObjectTypeQueryParams,
  ObjectTypeQueryResult,
  ObjectTypeQueryRow
} from '../types';
import { matchSceneName } from './queryFilters';

const getSceneBusinessDomain = (scene: OntologScene): string => {
  const tag = scene.tagList?.[0];
  if (!tag) {
    return '';
  }
  if (typeof tag === 'string') {
    return tag;
  }
  return tag.name || tag.tagName || tag.label || '';
};

const normalizeKeyword = (value?: string) => value?.trim().toLowerCase() || '';

const matchField = (source: string | undefined, keyword: string) => {
  if (!keyword) {
    return true;
  }

  return String(source || '')
    .toLowerCase()
    .includes(keyword);
};

const matchInstanceSyncConfig = (
  row: ObjectTypeQueryRow,
  filter: ObjectTypeQueryParams['instanceSyncConfig']
) => {
  if (!filter || filter === 'all') {
    return true;
  }

  if (filter === 'yes') {
    return row.enableSyncSourceData === true;
  }

  return row.enableSyncSourceData !== true;
};

const fetchAllObjectTypes = async (): Promise<ObjectTypeQueryRow[]> => {
  const sceneRes = await listOntologyModel({
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });
  const scenes = sceneRes.data?.result || [];
  const rows: ObjectTypeQueryRow[] = [];

  await Promise.all(
    scenes.map(async (scene) => {
      if (!scene.id) {
        return;
      }

      const businessDomain = getSceneBusinessDomain(scene);

      try {
        const typeRes = await listOntologyObjectType({
          ontologyModelID: scene.id,
          pageNo: -1,
          pageSize: -1,
          order: 'desc'
        });
        const objectTypes = typeRes.data?.result || [];

        objectTypes.forEach((item: ObjectType) => {
          rows.push({
            ...item,
            sceneId: scene.id!,
            sceneName: scene.name || '未命名场景',
            businessDomain
          });
        });
      } catch (error) {
        console.error(`获取场景 ${scene.id} 对象类型失败:`, error);
      }
    })
  );

  return rows;
};

let cachedRows: ObjectTypeQueryRow[] | null = null;

export const invalidateObjectTypeQueryCache = () => {
  cachedRows = null;
};

export const loadObjectTypeQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  cachedRows = await fetchAllObjectTypes();
  return cachedRows;
};

export const queryObjectTypes = async (
  params: ObjectTypeQueryParams
): Promise<ObjectTypeQueryResult> => {
  const rows = await loadObjectTypeQueryCache(params.forceRefresh);
  const objectTypeName = normalizeKeyword(params.objectTypeName);
  const sceneName = params.sceneName?.trim();
  const description = normalizeKeyword(params.description);
  const objectTypeId = params.objectTypeId?.trim();
  const sceneId = params.sceneId;

  let filtered = rows.filter((row) => {
    if (objectTypeId) {
      const code = (row.code || '').trim();
      if (code !== objectTypeId) {
        return false;
      }
    }

    if (!matchField(row.name, objectTypeName)) {
      return false;
    }

    if (sceneId != null) {
      if (row.sceneId !== sceneId) {
        return false;
      }
    } else if (!matchSceneName(row.sceneName, sceneName)) {
      return false;
    }

    if (!matchField(row.description, description)) {
      return false;
    }

    return matchInstanceSyncConfig(row, params.instanceSyncConfig);
  });

  const total = filtered.length;
  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;

  if (pageSize > 0) {
    const start = (pageNo - 1) * pageSize;
    filtered = filtered.slice(start, start + pageSize);
  }

  return {
    items: filtered,
    total,
    pageNo,
    pageSize
  };
};
