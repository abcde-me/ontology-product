import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { devListOntologyPhysicalProperties } from '@/utils/devObjectTypeStore';
import { queryObjectTypeInstances } from './instanceQuery';
import { resolveClientObjectTypeId } from './clientInstanceLoader';
import type { PhysicalProperties } from '@/types/graphApi';
import { resolveFieldQueryType } from '../utils/fieldQueryType';
import { buildFieldCommentMap } from '../utils/fieldDisplayLabel';
import type {
  ConditionQueryParams,
  InstanceQueryResult,
  ObjectTypeDataFieldFilter,
  QueryableProperty,
  RangeFieldValue
} from '../types';

const DEFAULT_PAGE_SIZE = 10;

const isVectorProperty = (property: PhysicalProperties) => {
  const columnType = String(property.columnType || '').toLowerCase();
  return columnType === 'vector' || columnType.includes('vector');
};

const fetchPropertiesFromClient = (
  sceneId: number,
  objectTypeId: number
): PhysicalProperties[] => {
  const resolvedId = resolveClientObjectTypeId({
    objectTypeId,
    sceneId
  });
  const res = devListOntologyPhysicalProperties({
    ontologyModelID: sceneId,
    objectTypeIdList: [resolvedId],
    pageNo: 1,
    pageSize: 10_000,
    isUse: 1,
    order: 'desc'
  });

  if (res.status !== 200 || res.code !== '') {
    return [];
  }

  return res.data?.result || [];
};

const fetchProperties = async (
  sceneId: number,
  objectTypeId: number
): Promise<PhysicalProperties[]> => {
  const rows: PhysicalProperties[] = [];
  let pageNo = 1;
  let totalCount = 0;
  const pageSize = 100;

  try {
    while (pageNo === 1 || rows.length < totalCount) {
      const res = await listOntologyPhysicalProperties({
        ontologyModelID: sceneId,
        objectTypeIdList: [objectTypeId],
        pageNo,
        pageSize,
        isUse: 1,
        order: 'desc'
      });

      if (res.status !== 200 || res.code !== '') {
        break;
      }

      const properties = res.data?.result || [];
      totalCount = res.data?.totalCount ?? properties.length;
      rows.push(...properties);

      if (properties.length < pageSize || rows.length >= totalCount) {
        break;
      }

      pageNo += 1;
    }
  } catch {
    // 后端不可用时走本地属性缓存
  }

  if (rows.length) {
    return rows;
  }

  return fetchPropertiesFromClient(sceneId, objectTypeId);
};

export const buildVectorFieldNameSet = (
  properties: PhysicalProperties[]
): Set<string> =>
  new Set(
    properties
      .filter((item) => item.name && isVectorProperty(item))
      .map((item) => String(item.name).trim())
  );

export const fetchFieldCommentMap = async (
  sceneId: number,
  objectTypeId: number
) => {
  const properties = await fetchProperties(sceneId, objectTypeId);
  return buildFieldCommentMap(properties);
};

export const fetchObjectBrowseFieldMeta = async (
  sceneId: number,
  objectTypeId: number
) => {
  const properties = await fetchProperties(sceneId, objectTypeId);

  return {
    commentMap: buildFieldCommentMap(properties),
    vectorFieldNames: buildVectorFieldNameSet(properties)
  };
};

export const fetchQueryableProperties = async (
  sceneId: number,
  objectTypeId: number
): Promise<QueryableProperty[]> => {
  const properties = await fetchProperties(sceneId, objectTypeId);

  return properties
    .filter((item) => item.name && !isVectorProperty(item))
    .map((item) => ({
      fieldName: String(item.name),
      label: item.comment || item.name || '',
      columnType: item.columnType,
      queryType: resolveFieldQueryType(item)
    }));
};

export const formatRangeExpression = (range: RangeFieldValue): string => {
  const min = range.min?.trim() ?? '';
  const max = range.max?.trim() ?? '';
  const leftBracket = range.minInclusive === false ? '(' : '[';
  const rightBracket = range.maxInclusive === false ? ')' : ']';
  return `${leftBracket}${min},${max}${rightBracket}`;
};

const isEmptyRange = (range?: RangeFieldValue) => {
  if (!range) {
    return true;
  }

  return !range.min?.trim() && !range.max?.trim();
};

export const buildFieldList = (
  properties: QueryableProperty[],
  attributeValues: Record<string, string | RangeFieldValue>
): ObjectTypeDataFieldFilter[] => {
  const fieldList: ObjectTypeDataFieldFilter[] = [];

  properties.forEach((property) => {
    const rawValue = attributeValues[property.fieldName];

    if (property.queryType === 'range') {
      const range = (rawValue || {}) as RangeFieldValue;
      if (isEmptyRange(range)) {
        return;
      }

      fieldList.push({
        fieldName: property.fieldName,
        matchType: 'range',
        minValue: range.min?.trim() || undefined,
        maxValue: range.max?.trim() || undefined,
        minInclusive: range.minInclusive !== false,
        maxInclusive: range.maxInclusive !== false,
        rangeExpression: formatRangeExpression(range)
      });
      return;
    }

    const text = String(rawValue ?? '').trim();
    if (!text) {
      return;
    }

    fieldList.push({
      fieldName: property.fieldName,
      fieldValue: text,
      matchType: property.queryType === 'id' ? 'exact' : 'fuzzy'
    });
  });

  return fieldList;
};

export const queryInstancesByCondition = async (
  params: ConditionQueryParams
): Promise<InstanceQueryResult> =>
  queryObjectTypeInstances({
    sceneId: params.sceneId,
    objectTypeId: params.objectTypeId,
    page: params.page,
    pageSize: params.pageSize,
    fieldList: params.fieldList
  });

export const DEFAULT_CONDITION_PAGE_SIZE = DEFAULT_PAGE_SIZE;
