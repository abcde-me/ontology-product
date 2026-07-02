import {
  PLATE_QUERY_PATTERN,
  resolveMatchedRegions,
  resolvePlatePrefixForRegion,
  resolvePlatePrefixTokens
} from '@/utils/regionPlateAliases';
import type { ObjectTypeDataFieldFilter, QueryableProperty } from '../types';
import { buildSqlFromFieldList } from './semanticFieldMapping';

const PLATE_FIELD_PATTERN = /plate|车牌|牌照|号牌|牌号|license/i;

export const isPlateField = (property: QueryableProperty): boolean =>
  PLATE_FIELD_PATTERN.test(`${property.fieldName} ${property.label}`);

const findPlateFields = (
  properties: QueryableProperty[]
): QueryableProperty[] =>
  properties.filter(
    (property) => property.queryType === 'string' && isPlateField(property)
  );

/** 避免单独地域名（如「上海」）误匹配车牌字段 */
const hasPlateQueryContext = (query: string): boolean =>
  PLATE_QUERY_PATTERN.test(query) || /车辆|车|car|vehicle/i.test(query);

const buildPlateFieldList = (
  prefixes: string[],
  plateFields: QueryableProperty[]
): ObjectTypeDataFieldFilter[] => {
  const fieldList: ObjectTypeDataFieldFilter[] = [];

  prefixes.forEach((prefix) => {
    const orGroup = `plate_${prefix}`;
    plateFields.forEach((field) => {
      fieldList.push({
        fieldName: field.fieldName,
        fieldValue: prefix,
        matchType: 'fuzzy',
        orGroup
      });
    });
  });

  return fieldList;
};

const buildPlateParseIntent = (query: string, prefixes: string[]): string => {
  const regionNames = resolveMatchedRegions(query);

  if (regionNames.length) {
    return `检索${regionNames.join('、')}牌照（车牌简称：${prefixes.join('、')}）`;
  }

  if (PLATE_QUERY_PATTERN.test(query)) {
    return `按车牌简称检索：${prefixes.join('、')}`;
  }

  return `按语义检索：${query}`;
};

export interface PlateSemanticParseResult {
  parseIntent: string;
  sql: string;
  fieldList: ObjectTypeDataFieldFilter[];
}

/** 规则解析：地域/牌照类问题直接映射为车牌简称过滤，不依赖大模型 */
export const tryParsePlateSemanticQuery = (
  query: string,
  properties: QueryableProperty[]
): PlateSemanticParseResult | null => {
  const trimmed = query.trim();
  if (!trimmed || !hasPlateQueryContext(trimmed)) {
    return null;
  }

  const plateFields = findPlateFields(properties);
  if (!plateFields.length) {
    return null;
  }

  const prefixes = resolvePlatePrefixTokens(trimmed);
  if (!prefixes.length) {
    return null;
  }

  const fieldList = buildPlateFieldList(prefixes, plateFields);

  return {
    parseIntent: buildPlateParseIntent(trimmed, prefixes),
    sql: buildSqlFromFieldList(fieldList),
    fieldList
  };
};

const normalizePlateFieldValue = (value: string): string => {
  const prefix = resolvePlatePrefixForRegion(value);
  return prefix || value;
};

/** 修正大模型或后端返回的 fieldList：地域名 → 车牌简称，并补全缺失的车牌过滤 */
export const enhancePlateSemanticFieldList = (
  fieldList: ObjectTypeDataFieldFilter[],
  properties: QueryableProperty[],
  query: string
): ObjectTypeDataFieldFilter[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return fieldList;
  }

  const plateFieldNames = new Set(
    findPlateFields(properties).map((property) => property.fieldName)
  );

  if (!plateFieldNames.size) {
    return fieldList;
  }

  const enhanced = fieldList.map((filter) => {
    const fieldName = String(filter.fieldName || '').trim();
    if (
      !fieldName ||
      !plateFieldNames.has(fieldName) ||
      filter.matchType === 'range'
    ) {
      return filter;
    }

    const fieldValue = String(filter.fieldValue ?? '').trim();
    if (!fieldValue) {
      return filter;
    }

    const normalized = normalizePlateFieldValue(fieldValue);
    if (normalized === fieldValue) {
      return filter;
    }

    return {
      ...filter,
      fieldValue: normalized
    };
  });

  const hasPlateFilter = enhanced.some((filter) =>
    plateFieldNames.has(String(filter.fieldName || '').trim())
  );

  if (!hasPlateFilter && hasPlateQueryContext(trimmed)) {
    const ruleResult = tryParsePlateSemanticQuery(trimmed, properties);
    if (ruleResult?.fieldList.length) {
      return ruleResult.fieldList;
    }
  }

  return enhanced;
};
