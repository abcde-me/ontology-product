import { resolveObjectTypeForQuery } from './objectTypeScope';
import { loadAllClientInstances } from './clientInstanceLoader';
import type {
  InstanceQueryResult,
  InstanceQueryRow,
  ObjectTypeDataFieldFilter
} from '../types';

export const INSTANCE_RESOURCE_NOT_FOUND_MESSAGE =
  '当前场景下的对象类型实例不存在或未同步，请在本体场景库中确认该对象类型已完成实例数据同步';

export const resolveRowFieldValue = (
  row: InstanceQueryRow,
  fieldName: string
): unknown => {
  if (!fieldName) {
    return undefined;
  }

  const direct = row[fieldName];
  if (direct != null && direct !== '') {
    return direct;
  }

  const normalizedFieldName = fieldName.toLowerCase();
  const matchedKey = Object.keys(row).find(
    (key) => key.toLowerCase() === normalizedFieldName
  );
  if (matchedKey && row[matchedKey] != null && row[matchedKey] !== '') {
    return row[matchedKey];
  }

  for (const nestedKey of ['data', 'properties', 'attributes', 'fields']) {
    const nested = row[nestedKey];
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
      continue;
    }

    const nestedRecord = nested as Record<string, unknown>;
    const nestedDirect = nestedRecord[fieldName];
    if (nestedDirect != null && nestedDirect !== '') {
      return nestedDirect;
    }

    const nestedMatchedKey = Object.keys(nestedRecord).find(
      (key) => key.toLowerCase() === normalizedFieldName
    );
    if (
      nestedMatchedKey &&
      nestedRecord[nestedMatchedKey] != null &&
      nestedRecord[nestedMatchedKey] !== ''
    ) {
      return nestedRecord[nestedMatchedKey];
    }
  }

  return row[fieldName];
};

export const matchFieldFilter = (
  row: InstanceQueryRow,
  filter: ObjectTypeDataFieldFilter
): boolean => {
  const fieldName = filter.fieldName || '';
  const raw = resolveRowFieldValue(row, fieldName);
  const value = raw == null ? '' : String(raw);

  if (filter.matchType === 'range') {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return false;
    }

    const min = filter.minValue
      ? Number(filter.minValue)
      : Number.NEGATIVE_INFINITY;
    const max = filter.maxValue
      ? Number(filter.maxValue)
      : Number.POSITIVE_INFINITY;
    const minOk = filter.minInclusive === false ? num > min : num >= min;
    const maxOk = filter.maxInclusive === false ? num < max : num <= max;
    return minOk && maxOk;
  }

  const target = filter.fieldValue || '';
  if (!target) {
    return true;
  }

  if (filter.matchType === 'exact') {
    return value === target;
  }

  return value.toLowerCase().includes(target.toLowerCase());
};

export const applyFieldFilters = (
  items: InstanceQueryRow[],
  fieldList: ObjectTypeDataFieldFilter[]
): InstanceQueryRow[] => {
  if (!fieldList.length) {
    return items;
  }

  const groups: ObjectTypeDataFieldFilter[][] = [];
  const groupMap = new Map<string, ObjectTypeDataFieldFilter[]>();

  fieldList.forEach((filter, index) => {
    const key = filter.orGroup || `__single_${index}`;
    if (!groupMap.has(key)) {
      const nextGroup: ObjectTypeDataFieldFilter[] = [];
      groupMap.set(key, nextGroup);
      groups.push(nextGroup);
    }
    groupMap.get(key)!.push(filter);
  });

  return items.filter((row) =>
    groups.every((group) =>
      group.length === 1
        ? matchFieldFilter(row, group[0])
        : group.some((filter) => matchFieldFilter(row, filter))
    )
  );
};

/** 纯前端查询：从本地缓存加载实例，在前端过滤与分页 */
export const queryObjectTypeInstances = async (params: {
  sceneId?: number;
  objectTypeId: number;
  page: number;
  pageSize: number;
  fieldList?: ObjectTypeDataFieldFilter[];
}): Promise<InstanceQueryResult> => {
  const fieldList = params.fieldList?.length ? params.fieldList : undefined;
  const objectType = await resolveObjectTypeForQuery(
    params.sceneId,
    params.objectTypeId
  );

  const allItems = await loadAllClientInstances({
    objectTypeId: objectType.id,
    sceneId: params.sceneId,
    code: objectType.code
  });

  const resourceNotFound = !allItems.length;
  const filteredItems = fieldList?.length
    ? applyFieldFilters(allItems, fieldList)
    : allItems;

  const start = (params.page - 1) * params.pageSize;

  return {
    items: filteredItems.slice(start, start + params.pageSize),
    total: filteredItems.length,
    page: params.page,
    pageSize: params.pageSize,
    resourceNotFound
  };
};
