import { SEMANTIC_QUERY_EMPTY_INTENT } from '../constants';
import type {
  ObjectTypeDataFieldFilter,
  SemanticParseResult,
  SemanticSearchParams,
  SemanticSearchResult
} from '../types';
import { tryParsePlateSemanticQuery } from '../utils/plateSemanticMapping';
import {
  buildSqlFromFieldList,
  tryParseSqlToFieldList,
  tryParseKeywordSemanticQuery
} from '../utils/semanticFieldMapping';
import { fetchQueryableProperties } from './conditionQuery';
import { queryObjectTypeInstances } from './instanceQuery';

const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_SEMANTIC_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export const getEmptyQueryIntent = () => SEMANTIC_QUERY_EMPTY_INTENT;

const queryInstances = (params: {
  sceneId?: number;
  objectTypeId: number;
  page: number;
  pageSize: number;
  fieldList?: ObjectTypeDataFieldFilter[];
}): Promise<SemanticSearchResult> =>
  queryObjectTypeInstances({
    sceneId: params.sceneId,
    objectTypeId: params.objectTypeId,
    page: params.page,
    pageSize: params.pageSize,
    fieldList: params.fieldList
  });

const toParseResult = (result: {
  parseIntent: string;
  sql: string;
  fieldList: ObjectTypeDataFieldFilter[];
}): SemanticParseResult => ({
  parseIntent: result.parseIntent,
  sql: result.sql,
  fieldList: result.fieldList
});

const tryRuleBasedSemanticParse = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  query: string;
}): Promise<SemanticParseResult | null> => {
  const properties = await fetchQueryableProperties(
    params.ontologyModelID,
    params.objectTypeId
  );
  const plateResult = tryParsePlateSemanticQuery(params.query, properties);
  if (plateResult?.fieldList.length) {
    return toParseResult(plateResult);
  }

  const keywordResult = tryParseKeywordSemanticQuery(params.query, properties);
  if (keywordResult?.fieldList.length) {
    return toParseResult(keywordResult);
  }

  return null;
};

const resolveFieldListFromParseResult = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  parseResult: SemanticParseResult;
}): Promise<ObjectTypeDataFieldFilter[] | undefined> => {
  if (params.parseResult.fieldList?.length) {
    return params.parseResult.fieldList;
  }

  const sql = params.parseResult.sql?.trim();
  if (!sql) {
    return undefined;
  }

  const properties = await fetchQueryableProperties(
    params.ontologyModelID,
    params.objectTypeId
  );
  const allowedFieldNames = properties.map((item) => item.fieldName);
  return tryParseSqlToFieldList(sql, allowedFieldNames) ?? undefined;
};

export const searchByFieldList = async (params: {
  sceneId?: number;
  objectTypeId: number;
  page: number;
  pageSize: number;
  fieldList: ObjectTypeDataFieldFilter[];
  parseIntent?: string;
}): Promise<SemanticSearchResult> => {
  const result = await queryInstances({
    sceneId: params.sceneId,
    objectTypeId: params.objectTypeId,
    page: params.page,
    pageSize: params.pageSize,
    fieldList: params.fieldList
  });

  return {
    ...result,
    parseIntent: params.parseIntent,
    sql: buildSqlFromFieldList(params.fieldList)
  };
};

/** 纯前端语义解析：规则匹配 + 关键字 OR 检索，不调用后端语义 API / LLM */
export const parseSemanticQuery = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  query: string;
}): Promise<SemanticParseResult> => {
  const query = params.query.trim();
  if (!query) {
    return {
      parseIntent: getEmptyQueryIntent()
    };
  }

  const ruleResult = await tryRuleBasedSemanticParse({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    query
  });
  if (ruleResult) {
    return ruleResult;
  }

  return {
    parseIntent: `未识别语义条件：${query}`
  };
};

/** 纯前端语义检索：解析条件后在本地实例中过滤 */
export const searchBySemanticQuery = async (
  params: SemanticSearchParams
): Promise<SemanticSearchResult> => {
  const query = params.query?.trim();

  if (params.fieldList?.length) {
    return searchByFieldList({
      sceneId: params.ontologyModelID,
      objectTypeId: params.objectTypeId,
      page: params.page,
      pageSize: params.pageSize,
      fieldList: params.fieldList,
      parseIntent: query ? `按语义检索：${query}` : undefined
    });
  }

  if (!query) {
    const result = await queryInstances({
      sceneId: params.ontologyModelID,
      objectTypeId: params.objectTypeId,
      page: params.page,
      pageSize: params.pageSize
    });

    return {
      ...result,
      parseIntent: getEmptyQueryIntent()
    };
  }

  const parseResult = await parseSemanticQuery({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    query
  });
  const resolvedFieldList = await resolveFieldListFromParseResult({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    parseResult
  });

  if (resolvedFieldList?.length) {
    return searchByFieldList({
      sceneId: params.ontologyModelID,
      objectTypeId: params.objectTypeId,
      page: params.page,
      pageSize: params.pageSize,
      fieldList: resolvedFieldList,
      parseIntent: parseResult.parseIntent
    });
  }

  const keywordFallback = await tryRuleBasedSemanticParse({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    query
  });
  if (keywordFallback?.fieldList?.length) {
    return searchByFieldList({
      sceneId: params.ontologyModelID,
      objectTypeId: params.objectTypeId,
      page: params.page,
      pageSize: params.pageSize,
      fieldList: keywordFallback.fieldList,
      parseIntent: keywordFallback.parseIntent
    });
  }

  return {
    items: [],
    total: 0,
    page: params.page,
    pageSize: params.pageSize,
    parseIntent: parseResult.parseIntent || `未找到与「${query}」匹配的结果`,
    sql: parseResult.sql
  };
};

/** 纯前端 SQL 执行：解析 SQL 为 fieldList 后在本地实例中过滤 */
export const executeSemanticSql = async (
  params: Omit<SemanticSearchParams, 'query'> & { sql: string }
): Promise<SemanticSearchResult> => {
  const sql = params.sql.trim();
  if (!sql) {
    throw new Error('SQL 不能为空');
  }

  if (params.fieldList?.length) {
    return searchByFieldList({
      sceneId: params.ontologyModelID,
      objectTypeId: params.objectTypeId,
      page: params.page,
      pageSize: params.pageSize,
      fieldList: params.fieldList,
      parseIntent: `按 SQL 检索：${sql}`
    });
  }

  const properties = await fetchQueryableProperties(
    params.ontologyModelID,
    params.objectTypeId
  );
  const allowedFieldNames = properties.map((item) => item.fieldName);
  const parsedFieldList = tryParseSqlToFieldList(sql, allowedFieldNames);

  if (!parsedFieldList?.length) {
    throw new Error('无法解析 SQL 条件，请检查字段名与语法');
  }

  return searchByFieldList({
    sceneId: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    page: params.page,
    pageSize: params.pageSize,
    fieldList: parsedFieldList,
    parseIntent: `按 SQL 检索：${sql}`
  });
};
