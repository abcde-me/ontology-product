import type { ObjectTypeDataFieldFilter, QueryableProperty } from '../types';

/** 作战环境 / 部署场景类关键词（通常出现在平台/适用字段，而非类型字段） */
const SCENARIO_KEYWORD_REG =
  /水下|潜艇|空中|航空|陆地|地面|海上|海基|陆基|空基|两栖|空间|近海|远海|岸基|舰载|机载|空降/;

const PLATFORM_FIELD_REG = /平台|适用|载体|场景|环境|作战域|部署|域|platform/i;

const CATEGORY_TYPE_FIELD_REG = /类型|类别|分类|种类|type/i;

const NAME_FIELD_REG = /名称|name|title/i;

const PLATE_FIELD_REG = /plate|车牌|牌照|号牌|牌号|license/i;

export const inferFieldSemanticHint = (property: QueryableProperty): string => {
  const text = `${property.fieldName} ${property.label}`;

  if (PLATFORM_FIELD_REG.test(text)) {
    return '语义：部署平台/作战环境/适用场景';
  }

  if (CATEGORY_TYPE_FIELD_REG.test(text) && !PLATFORM_FIELD_REG.test(text)) {
    return '语义：实体分类（如导弹/鱼雷/榴弹炮，非作战环境）';
  }

  if (NAME_FIELD_REG.test(text)) {
    return '语义：名称';
  }

  if (PLATE_FIELD_REG.test(text)) {
    return '语义：车牌号码（地域词需映射为简称，如上海→沪）';
  }

  return '';
};

export const isPlatformLikeField = (property: QueryableProperty): boolean =>
  PLATFORM_FIELD_REG.test(`${property.fieldName} ${property.label}`);

export const isCategoryTypeField = (property: QueryableProperty): boolean =>
  CATEGORY_TYPE_FIELD_REG.test(`${property.fieldName} ${property.label}`) &&
  !isPlatformLikeField(property);

export const isScenarioKeyword = (value: string): boolean =>
  SCENARIO_KEYWORD_REG.test(value.trim());

const escapeSqlValue = (value: string) => value.replace(/'/g, "''");

export const formatFieldFilterSql = (
  filter: ObjectTypeDataFieldFilter
): string => {
  const fieldName = filter.fieldName || 'unknown_field';

  if (filter.matchType === 'range') {
    const parts: string[] = [];
    if (filter.minValue) {
      parts.push(
        `${fieldName} ${filter.minInclusive === false ? '>' : '>='} '${escapeSqlValue(filter.minValue)}'`
      );
    }
    if (filter.maxValue) {
      parts.push(
        `${fieldName} ${filter.maxInclusive === false ? '<' : '<='} '${escapeSqlValue(filter.maxValue)}'`
      );
    }
    return parts.join(' AND ') || `${fieldName} IS NOT NULL`;
  }

  const fieldValue = String(filter.fieldValue ?? '').trim();
  if (!fieldValue) {
    return `${fieldName} IS NOT NULL`;
  }

  if (filter.matchType === 'exact') {
    return `${fieldName} = '${escapeSqlValue(fieldValue)}'`;
  }

  return `${fieldName} LIKE '%${escapeSqlValue(fieldValue)}%'`;
};

export const buildSqlFromFieldList = (
  fieldList: ObjectTypeDataFieldFilter[]
): string => {
  if (!fieldList.length) {
    return 'SELECT * FROM object_type_data';
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

  const whereParts = groups.map((group) => {
    if (group.length === 1) {
      return formatFieldFilterSql(group[0]);
    }

    return `(${group.map((filter) => formatFieldFilterSql(filter)).join(' OR ')})`;
  });

  return `SELECT * FROM object_type_data WHERE ${whereParts.join(' AND ')}`;
};

const parseLikeClause = (
  clause: string,
  allowedFields: Set<string>
): ObjectTypeDataFieldFilter | null => {
  const match = clause.trim().match(/^([A-Za-z_][\w]*)\s+LIKE\s+'%([^']*)%'$/i);
  if (!match) {
    return null;
  }

  const fieldName = match[1];
  if (!allowedFields.has(fieldName)) {
    return null;
  }

  return {
    fieldName,
    fieldValue: match[2],
    matchType: 'fuzzy'
  };
};

/** 从常见 SELECT ... WHERE ... LIKE 语句解析 fieldList，保证与展示 SQL 一致 */
export const tryParseSqlToFieldList = (
  sql: string,
  allowedFieldNames: string[]
): ObjectTypeDataFieldFilter[] | null => {
  const allowedFields = new Set(allowedFieldNames);
  const whereMatch = sql.trim().match(/\bwhere\b([\s\S]+)/i);
  if (!whereMatch) {
    return null;
  }

  const clause = whereMatch[1].replace(/;\s*$/, '').trim();
  const orGroupMatch = clause.match(/^\(\s*([\s\S]+?)\s*\)$/);
  if (orGroupMatch && /\sOR\s/i.test(orGroupMatch[1])) {
    const parts = orGroupMatch[1].split(/\s+OR\s+/i);
    const orGroup = 'sql_parsed_or';
    const filters: ObjectTypeDataFieldFilter[] = [];

    for (const part of parts) {
      const parsed = parseLikeClause(part.trim(), allowedFields);
      if (!parsed) {
        return null;
      }
      filters.push({ ...parsed, orGroup });
    }

    return filters.length ? filters : null;
  }

  const single = parseLikeClause(clause, allowedFields);
  return single ? [single] : null;
};

/** 规则解析：短关键字直接映射为名称类字段的模糊匹配，不依赖大模型 */
export const tryParseKeywordSemanticQuery = (
  query: string,
  properties: QueryableProperty[]
): {
  parseIntent: string;
  sql: string;
  fieldList: ObjectTypeDataFieldFilter[];
} | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const nameLikeFields = properties.filter(
    (property) =>
      property.queryType === 'string' &&
      NAME_FIELD_REG.test(`${property.fieldName} ${property.label}`)
  );
  const textFields =
    nameLikeFields.length > 0
      ? nameLikeFields
      : properties.filter((property) => property.queryType === 'string');

  if (!textFields.length) {
    return null;
  }

  const orGroup = 'keyword_search';
  const fieldList: ObjectTypeDataFieldFilter[] = textFields.map((field) => ({
    fieldName: field.fieldName,
    fieldValue: trimmed,
    matchType: 'fuzzy',
    orGroup
  }));

  return {
    parseIntent: `按关键字检索：${trimmed}`,
    sql: buildSqlFromFieldList(fieldList),
    fieldList
  };
};

/**
 * 当环境类关键词被误映射到「类型」字段时，自动扩展到平台/适用类字段做 OR 匹配。
 */
export const enhanceSemanticFieldList = (
  fieldList: ObjectTypeDataFieldFilter[],
  properties: QueryableProperty[]
): ObjectTypeDataFieldFilter[] => {
  if (!fieldList.length) {
    return fieldList;
  }

  const propertyMap = new Map(
    properties.map((property) => [property.fieldName, property])
  );
  const platformFieldNames = properties
    .filter(
      (property) =>
        property.queryType === 'string' && isPlatformLikeField(property)
    )
    .map((property) => property.fieldName);
  const stringFieldNames = properties
    .filter((property) => property.queryType === 'string')
    .map((property) => property.fieldName);

  const enhanced: ObjectTypeDataFieldFilter[] = [];

  fieldList.forEach((filter) => {
    const fieldName = String(filter.fieldName || '').trim();
    const fieldValue = String(filter.fieldValue ?? '').trim();
    const property = fieldName ? propertyMap.get(fieldName) : undefined;

    const shouldExpandScenarioKeyword =
      filter.matchType !== 'range' &&
      fieldValue &&
      isScenarioKeyword(fieldValue) &&
      property &&
      isCategoryTypeField(property) &&
      !filter.orGroup;

    if (shouldExpandScenarioKeyword) {
      const orGroup = `scenario_${fieldValue}`;
      const targetFieldNames = [
        ...new Set([
          fieldName,
          ...(platformFieldNames.length ? platformFieldNames : stringFieldNames)
        ])
      ];

      targetFieldNames.forEach((targetFieldName) => {
        enhanced.push({
          ...filter,
          fieldName: targetFieldName,
          orGroup
        });
      });
      return;
    }

    enhanced.push(filter);
  });

  return enhanced;
};
