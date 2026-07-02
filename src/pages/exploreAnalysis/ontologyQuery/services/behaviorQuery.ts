import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import type { OntologScene } from '@/types/ontologySceneApi';
import type {
  BehaviorQueryParams,
  BehaviorQueryResult,
  BehaviorQueryRow
} from '../types';
import { matchSceneName } from './queryFilters';

const PAGE_SIZE = 100;

const normalizeKeyword = (value?: string) => value?.trim().toLowerCase() || '';

const matchField = (source: string | undefined, keyword: string) => {
  if (!keyword) {
    return true;
  }

  return String(source || '')
    .toLowerCase()
    .includes(keyword);
};

const GLOBAL_BEHAVIOR_LABEL = '全局行为';

const resolveObjectTypeName = (item: BehaviorActionItem): string => {
  return item.objectTypeName || item.objectType || GLOBAL_BEHAVIOR_LABEL;
};

const mapBehaviorRow = (
  item: BehaviorActionItem,
  scene: OntologScene
): BehaviorQueryRow => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description,
  objectTypeId: item.objectTypeId,
  objectTypeName: resolveObjectTypeName(item),
  objectType: item.objectType,
  objectTypeIcon: item.objectTypeIcon,
  ontologyObjectTypeId: item.ontologyObjectTypeId,
  functionId: item.functionId,
  functionName: item.functionName,
  sceneId: scene.id!,
  sceneName: scene.name || '未命名场景'
});

const fetchBehaviorsByScene = async (
  scene: OntologScene
): Promise<BehaviorQueryRow[]> => {
  if (!scene.id) {
    return [];
  }

  const rows: BehaviorQueryRow[] = [];
  let pageNum = 1;
  let totalCount = 0;

  while (pageNum === 1 || rows.length < totalCount) {
    const res = await getActionList({
      ontologyModelID: scene.id,
      pageNum,
      pageSize: PAGE_SIZE
    });

    const behaviors = res.items || [];
    totalCount = res.total ?? behaviors.length;

    behaviors.forEach((item) => {
      rows.push(mapBehaviorRow(item, scene));
    });

    if (behaviors.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNum += 1;
  }

  return rows;
};

const fetchAllBehaviors = async (): Promise<BehaviorQueryRow[]> => {
  const sceneRes = await listOntologyModel({
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  if (sceneRes.status !== 200 || sceneRes.code !== '') {
    return [];
  }

  const scenes = sceneRes.data?.result || [];
  const sceneRows = await Promise.all(
    scenes.map((scene) => fetchBehaviorsByScene(scene))
  );

  return sceneRows.flat();
};

let cachedRows: BehaviorQueryRow[] | null = null;

export const loadBehaviorQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  cachedRows = await fetchAllBehaviors();
  return cachedRows;
};

export const queryBehaviors = async (
  params: BehaviorQueryParams
): Promise<BehaviorQueryResult> => {
  const rows = await loadBehaviorQueryCache();
  const behaviorName = normalizeKeyword(params.behaviorName);
  const description = normalizeKeyword(params.description);
  const objectTypeName = normalizeKeyword(params.objectTypeName);
  const functionName = normalizeKeyword(params.functionName);
  const sceneName = params.sceneName?.trim();
  const behaviorId = params.behaviorId?.trim();

  let filtered = rows.filter((row) => {
    if (behaviorId) {
      const code = (row.code || '').trim();
      if (code !== behaviorId) {
        return false;
      }
    }

    if (!matchField(row.name, behaviorName)) {
      return false;
    }

    if (!matchField(row.description, description)) {
      return false;
    }

    if (!matchField(row.objectTypeName, objectTypeName)) {
      return false;
    }

    if (!matchField(row.functionName, functionName)) {
      return false;
    }

    if (!matchSceneName(row.sceneName, sceneName)) {
      return false;
    }

    return true;
  });

  const total = filtered.length;
  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;

  filtered = filtered.slice(start, start + pageSize);

  return {
    items: filtered,
    total,
    pageNo,
    pageSize
  };
};
