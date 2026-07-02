import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { PhysicalProperties } from '@/types/graphApi';
import type { OntologScene } from '@/types/ontologySceneApi';
import type {
  AttributeQueryParams,
  AttributeQueryResult,
  AttributeQueryRow
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

const mapAttributeRow = (
  item: PhysicalProperties,
  scene: OntologScene
): AttributeQueryRow => ({
  id: item.id,
  name: item.name,
  comment: item.comment,
  columnType: item.columnType,
  ontologyObjectTypeId: item.ontologyObjectTypeId ?? item.objectTypeID,
  ontologyObjectTypeName: item.ontologyObjectTypeName,
  ontologyObjectTypeIcon: item.ontologyObjectTypeIcon,
  sceneId: scene.id!,
  sceneName: scene.name || '未命名场景'
});

const fetchPropertiesByScene = async (
  scene: OntologScene
): Promise<AttributeQueryRow[]> => {
  if (!scene.id) {
    return [];
  }

  const rows: AttributeQueryRow[] = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo === 1 || rows.length < totalCount) {
    const propertyRes = await listOntologyPhysicalProperties({
      ontologyModelID: scene.id,
      pageNo,
      pageSize: PAGE_SIZE,
      order: 'desc'
    });

    if (propertyRes.status !== 200 || propertyRes.code !== '') {
      break;
    }

    const properties = propertyRes.data?.result || [];
    totalCount = propertyRes.data?.totalCount ?? properties.length;

    properties.forEach((item) => {
      rows.push(mapAttributeRow(item, scene));
    });

    if (properties.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  return rows;
};

const fetchAllProperties = async (): Promise<AttributeQueryRow[]> => {
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
    scenes.map((scene) => fetchPropertiesByScene(scene))
  );

  return sceneRows.flat();
};

let cachedRows: AttributeQueryRow[] | null = null;

export const loadAttributeQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  cachedRows = await fetchAllProperties();
  return cachedRows;
};

export const queryAttributes = async (
  params: AttributeQueryParams
): Promise<AttributeQueryResult> => {
  const rows = await loadAttributeQueryCache();
  const attributeName = normalizeKeyword(params.attributeName);
  const attributeType = normalizeKeyword(params.attributeType);
  const objectTypeName = normalizeKeyword(params.objectTypeName);
  const sceneName = params.sceneName?.trim();
  const attributeId = params.attributeId?.trim();

  let filtered = rows.filter((row) => {
    if (attributeId) {
      const code = (row.name || '').trim();
      if (code !== attributeId) {
        return false;
      }
    }

    if (!matchField(row.comment, attributeName)) {
      return false;
    }

    if (!matchField(row.columnType, attributeType)) {
      return false;
    }

    if (!matchField(row.ontologyObjectTypeName, objectTypeName)) {
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
