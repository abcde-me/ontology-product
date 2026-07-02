import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { OntologyFunctionItem } from '@/pages/ontologyScene/types/ontologyFunction';
import type { OntologScene } from '@/types/ontologySceneApi';
import { loadBehaviorQueryCache } from './behaviorQuery';
import type {
  BehaviorQueryRow,
  FunctionQueryParams,
  FunctionQueryResult,
  FunctionQueryRow
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

export const formatRelatedActionText = (
  behavior?: Pick<BehaviorQueryRow, 'name' | 'code'>
): string => {
  if (!behavior?.name && !behavior?.code) {
    return '';
  }

  if (behavior.name && behavior.code) {
    return `${behavior.name} (${behavior.code})`;
  }

  return behavior.name || behavior.code || '';
};

const buildBehaviorMap = (behaviors: BehaviorQueryRow[]) => {
  const map = new Map<string, BehaviorQueryRow>();

  behaviors.forEach((behavior) => {
    if (!behavior.functionId || !behavior.sceneId) {
      return;
    }

    map.set(`${behavior.sceneId}-${behavior.functionId}`, behavior);
  });

  return map;
};

const attachRelatedBehavior = (
  row: FunctionQueryRow,
  behaviorMap: Map<string, BehaviorQueryRow>
): FunctionQueryRow => {
  if (!row.id) {
    return row;
  }

  const behavior = behaviorMap.get(`${row.sceneId}-${row.id}`);
  if (!behavior) {
    return row;
  }

  return {
    ...row,
    relatedActionId: behavior.id,
    relatedActionName: behavior.name,
    relatedActionCode: behavior.code,
    relatedActionText: formatRelatedActionText(behavior)
  };
};

const mapFunctionRow = (
  item: OntologyFunctionItem,
  scene: OntologScene
): FunctionQueryRow => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description,
  sceneId: scene.id!,
  sceneName: scene.name || '未命名场景'
});

const fetchFunctionsByScene = async (
  scene: OntologScene
): Promise<FunctionQueryRow[]> => {
  if (!scene.id) {
    return [];
  }

  const rows: FunctionQueryRow[] = [];
  let pageNum = 1;
  let totalCount = 0;

  while (pageNum === 1 || rows.length < totalCount) {
    const res = await getFunctionList({
      ontologyModelID: scene.id,
      pageNum,
      pageSize: PAGE_SIZE
    });

    const functions = res.items || [];
    totalCount = res.total ?? functions.length;

    functions.forEach((item) => {
      rows.push(mapFunctionRow(item, scene));
    });

    if (functions.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNum += 1;
  }

  return rows;
};

const fetchAllFunctions = async (): Promise<FunctionQueryRow[]> => {
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
    scenes.map((scene) => fetchFunctionsByScene(scene))
  );

  return sceneRows.flat();
};

let cachedRows: FunctionQueryRow[] | null = null;

export const loadFunctionQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  const [functions, behaviors] = await Promise.all([
    fetchAllFunctions(),
    loadBehaviorQueryCache(force)
  ]);
  const behaviorMap = buildBehaviorMap(behaviors);

  cachedRows = functions.map((row) => attachRelatedBehavior(row, behaviorMap));
  return cachedRows;
};

const matchRelatedAction = (row: FunctionQueryRow, keyword: string) => {
  if (!keyword) {
    return true;
  }

  const candidates = [
    row.relatedActionText,
    row.relatedActionName,
    row.relatedActionCode
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());

  return candidates.some((item) => item.includes(keyword));
};

export const queryFunctions = async (
  params: FunctionQueryParams
): Promise<FunctionQueryResult> => {
  const rows = await loadFunctionQueryCache();
  const functionCode = normalizeKeyword(params.functionCode);
  const functionName = normalizeKeyword(params.functionName);
  const description = normalizeKeyword(params.description);
  const relatedAction = normalizeKeyword(params.relatedAction);
  const sceneName = params.sceneName?.trim();

  let filtered = rows.filter((row) => {
    if (!matchField(row.code, functionCode)) {
      return false;
    }

    if (!matchField(row.name, functionName)) {
      return false;
    }

    if (!matchField(row.description, description)) {
      return false;
    }

    if (!matchRelatedAction(row, relatedAction)) {
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
