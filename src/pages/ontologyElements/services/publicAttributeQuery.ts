import { listOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { PublicProperty } from '@/types/attributes';
import type { AttributeQueryFormValues } from '@/pages/exploreAnalysis/ontologyQuery/types';

const PAGE_SIZE = 100;

export interface PublicAttributeQueryParams extends AttributeQueryFormValues {
  pageNo: number;
  pageSize: number;
  forceRefresh?: boolean;
}

export interface PublicAttributeQueryResult {
  items: PublicProperty[];
  total: number;
  pageNo: number;
  pageSize: number;
}

const normalizeKeyword = (value?: string) => value?.trim().toLowerCase() || '';

const matchField = (source: string | undefined, keyword: string) => {
  if (!keyword) {
    return true;
  }

  return String(source || '')
    .toLowerCase()
    .includes(keyword);
};

const matchObjectTypeName = (item: PublicProperty, keyword: string) => {
  if (!keyword) {
    return true;
  }

  const names =
    item.ontologyObjectTypeList?.map((entry) => entry.name || '') || [];

  return names.some((name) => matchField(name, keyword));
};

const fetchAllPublicProperties = async (): Promise<PublicProperty[]> => {
  const rows: PublicProperty[] = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo === 1 || rows.length < totalCount) {
    const response = await listOntologyPublicProperties({
      pageNo,
      pageSize: PAGE_SIZE,
      order: 'desc'
    });

    if (!isOntologyApiSuccess(response) || !response.data) {
      break;
    }

    const items = response.data.result || [];
    totalCount = response.data.totalCount ?? items.length;
    rows.push(...items);

    if (items.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  return rows;
};

let cachedRows: PublicProperty[] | null = null;

export const loadPublicAttributeQueryCache = async (force = false) => {
  if (!force && cachedRows) {
    return cachedRows;
  }

  cachedRows = await fetchAllPublicProperties();
  return cachedRows;
};

export const queryPublicAttributes = async (
  params: PublicAttributeQueryParams
): Promise<PublicAttributeQueryResult> => {
  const rows = await loadPublicAttributeQueryCache(params.forceRefresh);
  const attributeName = normalizeKeyword(params.attributeName);
  const attributeType = normalizeKeyword(params.attributeType);
  const objectTypeName = normalizeKeyword(params.objectTypeName);
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

    if (!matchObjectTypeName(row, objectTypeName)) {
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

export const invalidatePublicAttributeQueryCache = () => {
  cachedRows = null;
};
