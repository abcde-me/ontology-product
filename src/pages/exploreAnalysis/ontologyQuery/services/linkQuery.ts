import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { LinkType } from '@/types/graphApi';
import type { OntologScene } from '@/types/ontologySceneApi';
import type {
  LinkQueryParams,
  LinkQueryResult,
  LinkQueryRow,
  LinkTypeFilter
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

const getEndpointText = (
  objectTypeName?: string,
  attributeName?: string
): string => {
  const typeName = objectTypeName?.trim() || '';
  const attr = attributeName?.trim() || '';

  if (typeName && attr) {
    return `${typeName}-${attr}`;
  }

  return typeName || attr;
};

const matchEndpoint = (
  objectTypeName: string | undefined,
  attributeName: string | undefined,
  keyword: string
) => {
  if (!keyword) {
    return true;
  }

  const candidates = [
    objectTypeName,
    attributeName,
    getEndpointText(objectTypeName, attributeName)
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());

  return candidates.some((item) => item.includes(keyword));
};

const matchLinkType = (
  row: LinkQueryRow,
  filter: LinkTypeFilter | undefined
) => {
  if (!filter || filter === 'all') {
    return true;
  }

  const typeMap: Record<Exclude<LinkTypeFilter, 'all'>, LinkType> = {
    '1:1': LinkType.ONE_TO_ONE,
    '1:N': LinkType.ONE_TO_MANY,
    'N:N': LinkType.MANY_TO_MANY
  };

  return row.type === typeMap[filter];
};

const mapLinkRow = (item: LinkQueryRow, scene: OntologScene): LinkQueryRow => ({
  ...item,
  sceneId: scene.id!,
  sceneName: scene.name || '未命名场景',
  linkSourceColumnName: item.linkSourceColumnName,
  linkTargetColumnName: item.linkTargetColumnName
});

const fetchLinksByScene = async (
  scene: OntologScene
): Promise<LinkQueryRow[]> => {
  if (!scene.id) {
    return [];
  }

  const rows: LinkQueryRow[] = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo === 1 || rows.length < totalCount) {
    const linkRes = await listOntologyLinkType({
      ontologyModelID: scene.id,
      pageNo,
      pageSize: PAGE_SIZE,
      order: 'desc'
    });

    if (linkRes.status !== 200 || linkRes.code !== '') {
      break;
    }

    const links = (linkRes.data?.result || []) as LinkQueryRow[];
    totalCount = linkRes.data?.totalCount ?? links.length;

    links.forEach((item) => {
      rows.push(mapLinkRow(item, scene));
    });

    if (links.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  return rows;
};

const fetchAllLinks = async (): Promise<LinkQueryRow[]> => {
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
    scenes.map((scene) => fetchLinksByScene(scene))
  );

  return sceneRows.flat();
};

let cachedRows: LinkQueryRow[] | null = null;

export const loadLinkQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  cachedRows = await fetchAllLinks();
  return cachedRows;
};

export const queryLinks = async (
  params: LinkQueryParams
): Promise<LinkQueryResult> => {
  const rows = await loadLinkQueryCache();
  const linkName = normalizeKeyword(params.linkName);
  const sceneName = params.sceneName?.trim();
  const sourceEndpoint = normalizeKeyword(params.sourceEndpoint);
  const targetEndpoint = normalizeKeyword(params.targetEndpoint);
  const linkId = params.linkId?.trim();

  let filtered = rows.filter((row) => {
    if (linkId) {
      const code = (row.code || '').trim();
      if (code !== linkId) {
        return false;
      }
    }

    if (!matchField(row.name, linkName)) {
      return false;
    }

    if (!matchSceneName(row.sceneName, sceneName)) {
      return false;
    }

    if (
      !matchEndpoint(
        row.sourceObjectTypeName,
        row.linkSourceColumnName,
        sourceEndpoint
      )
    ) {
      return false;
    }

    if (
      !matchEndpoint(
        row.targetObjectTypeName,
        row.linkTargetColumnName,
        targetEndpoint
      )
    ) {
      return false;
    }

    return matchLinkType(row, params.linkType);
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

export const formatLinkEndpoint = (
  objectTypeName?: string,
  attributeName?: string
) => {
  const text = getEndpointText(objectTypeName, attributeName);
  return text || '-';
};
