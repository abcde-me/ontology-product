import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { OBJECT_BROWSE_SEMANTIC_QUERY_SCENARIO } from '@/services/llmScenarios/definitions/objectBrowseSemanticQuery.scenario';
import type { ObjectTypeDataFieldFilter, QueryableProperty } from '../types';
import { fetchQueryableProperties } from './conditionQuery';
import {
  enhancePlateSemanticFieldList,
  tryParsePlateSemanticQuery
} from '../utils/plateSemanticMapping';
import {
  buildSqlFromFieldList,
  enhanceSemanticFieldList,
  inferFieldSemanticHint
} from '../utils/semanticFieldMapping';

export interface SemanticLlmParseResult {
  parseIntent: string;
  sql: string;
  fieldList: ObjectTypeDataFieldFilter[];
}

const SYSTEM_PROMPT = `你是本体数据查询助手。根据对象类型的字段 schema 与用户自然语言问题，解析查询意图并生成 SQL 与结构化过滤条件。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"parseIntent":"中文意图说明","sql":"SELECT * FROM table_name WHERE ...","fieldList":[{"fieldName":"字段英文名","fieldValue":"值","matchType":"exact|fuzzy|range","orGroup":"可选，同组OR"}]}
要求：
1. fieldName 必须来自提供的 schema，不可编造字段
2. 必须依据字段中文注释/语义选择字段，禁止仅因用户词与字段英文名相似就匹配（例如「水下」是作战环境词，应匹配「平台/适用/场景」类字段，而非「武器类型」）
3. 作战环境/部署场景词（水下、空中、陆地、海上、潜艇等）→ 优先 platform/适用/场景/环境/载体 类字段
4. 实体分类词（导弹、鱼雷、榴弹炮等）→ 类型/类别 类字段；名称词 → 名称 类字段
5. 不确定关键词落在哪个文本字段时，对多个合理字段使用相同 orGroup 做 OR 匹配，SQL 写 (field_a LIKE ... OR field_b LIKE ...)
6. matchType：主键/id 用 exact；文本模糊匹配用 fuzzy；数值/日期区间用 range（需 minValue、maxValue、minInclusive、maxInclusive、rangeExpression）
7. sql 为 MySQL 风格只读 SELECT，表名可用 object_type_data 占位
8. parseIntent 用简洁中文说明查询条件
9. 车牌/牌照类：用户说「上海牌照」「北京车牌」等时，fieldValue 用车牌简称（沪、京、粤等），禁止用地名「上海」「北京」做 LIKE
10. 地域与车牌简称：北京→京、上海→沪、广东/广州→粤、江苏/南京→苏、浙江/杭州→浙 等
11. 无法解析时 fieldList 为空数组，parseIntent 说明原因`;

const extractJsonFromLlmContent = (content: string): unknown => {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
};

const buildSchemaDescription = (properties: QueryableProperty[]): string => {
  return properties
    .map((item) => {
      const typeHint =
        item.queryType === 'id'
          ? '主键/精确'
          : item.queryType === 'range'
            ? '区间'
            : '模糊';
      const semanticHint = inferFieldSemanticHint(item);
      return `- ${item.fieldName}（${item.label || item.fieldName}，${item.columnType || 'string'}，${typeHint}${semanticHint ? `，${semanticHint}` : ''}）`;
    })
    .join('\n');
};

const sanitizeFieldList = (
  raw: unknown,
  properties: QueryableProperty[]
): ObjectTypeDataFieldFilter[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const allowedFields = new Set(properties.map((item) => item.fieldName));
  const fieldTypeMap = new Map(
    properties.map((item) => [item.fieldName, item.queryType])
  );

  const fieldList: ObjectTypeDataFieldFilter[] = [];

  raw.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const record = item as Record<string, unknown>;
    const fieldName = String(record.fieldName || '').trim();
    if (!fieldName || !allowedFields.has(fieldName)) {
      return;
    }

    const queryType = fieldTypeMap.get(fieldName);
    const matchType = record.matchType;

    if (queryType === 'range' || matchType === 'range') {
      const minValue = String(record.minValue ?? '').trim();
      const maxValue = String(record.maxValue ?? '').trim();
      if (!minValue && !maxValue) {
        return;
      }

      const minInclusive = record.minInclusive !== false;
      const maxInclusive = record.maxInclusive !== false;
      const leftBracket = minInclusive ? '[' : '(';
      const rightBracket = maxInclusive ? ']' : ')';

      fieldList.push({
        fieldName,
        matchType: 'range',
        minValue: minValue || undefined,
        maxValue: maxValue || undefined,
        minInclusive,
        maxInclusive,
        rangeExpression: `${leftBracket}${minValue},${maxValue}${rightBracket}`
      });
      return;
    }

    const fieldValue = String(record.fieldValue ?? '').trim();
    if (!fieldValue) {
      return;
    }

    fieldList.push({
      fieldName,
      fieldValue,
      matchType:
        matchType === 'exact' || queryType === 'id' ? 'exact' : 'fuzzy',
      orGroup: String(record.orGroup || '').trim() || undefined
    });
  });

  return fieldList;
};

const finalizeSemanticParseResult = (
  result: SemanticLlmParseResult,
  properties: QueryableProperty[],
  query = ''
): SemanticLlmParseResult => {
  const fieldList = enhancePlateSemanticFieldList(
    enhanceSemanticFieldList(result.fieldList, properties),
    properties,
    query
  );
  const sql =
    fieldList.length > 0 ? buildSqlFromFieldList(fieldList) : result.sql;

  const isFallbackIntent =
    !result.parseIntent ||
    (query && result.parseIntent === `按语义检索：${query}`);
  const plateIntent =
    isFallbackIntent && query
      ? tryParsePlateSemanticQuery(query, properties)?.parseIntent
      : undefined;

  return {
    ...result,
    parseIntent: plateIntent || result.parseIntent,
    fieldList,
    sql
  };
};

const sanitizeLlmParseResult = (
  parsed: unknown,
  properties: QueryableProperty[],
  fallbackQuery: string
): SemanticLlmParseResult => {
  const record =
    parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};

  const parseIntent =
    String(record.parseIntent || '').trim() ||
    (fallbackQuery ? `按语义检索：${fallbackQuery}` : '未解析出有效查询条件');

  const sql = String(record.sql || '').trim();
  const fieldList = sanitizeFieldList(record.fieldList, properties);

  return { parseIntent, sql, fieldList };
};

const callSemanticLlm = async (
  userContent: string,
  signal?: AbortSignal
): Promise<string> => {
  if (!isScenarioLlmAvailable(OBJECT_BROWSE_SEMANTIC_QUERY_SCENARIO.code)) {
    throw new Error(
      '未配置大模型或该环节已关闭。请在模型管理中启用「对象浏览语义查询」并配置 API Key'
    );
  }

  const llmConfig = resolveScenarioLlmConfig(
    OBJECT_BROWSE_SEMANTIC_QUERY_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();
  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      thinking: { type: 'disabled' }
    }),
    signal
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      errText?.slice(0, 200) || `大模型请求失败 (${response.status})`
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('大模型未返回有效内容');
  }

  return content;
};

export const parseSemanticQueryWithLlm = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  query: string;
  signal?: AbortSignal;
}): Promise<SemanticLlmParseResult> => {
  const query = params.query.trim();
  const properties = await fetchQueryableProperties(
    params.ontologyModelID,
    params.objectTypeId
  );

  if (!query) {
    return {
      parseIntent: '未输入语义，返回当前类型全部实例',
      sql: '',
      fieldList: []
    };
  }

  const userContent = [
    '对象类型字段 schema：',
    buildSchemaDescription(properties),
    '',
    `用户问题：${query}`
  ].join('\n');

  const content = await callSemanticLlm(userContent, params.signal);
  const parsed = extractJsonFromLlmContent(content);
  return finalizeSemanticParseResult(
    sanitizeLlmParseResult(parsed, properties, query),
    properties,
    query
  );
};

export const parseSqlWithLlm = async (params: {
  ontologyModelID: number;
  objectTypeId: number;
  sql: string;
  signal?: AbortSignal;
}): Promise<SemanticLlmParseResult> => {
  const sql = params.sql.trim();
  const properties = await fetchQueryableProperties(
    params.ontologyModelID,
    params.objectTypeId
  );

  if (!sql) {
    throw new Error('SQL 不能为空');
  }

  const userContent = [
    '对象类型字段 schema：',
    buildSchemaDescription(properties),
    '',
    '请将以下 SQL 转换为 fieldList 过滤条件，并输出 parseIntent 与 sql（sql 保持原样或规范化）：',
    sql
  ].join('\n');

  const content = await callSemanticLlm(userContent, params.signal);
  const parsed = extractJsonFromLlmContent(content);
  const result = finalizeSemanticParseResult(
    sanitizeLlmParseResult(parsed, properties, sql),
    properties,
    sql
  );

  return result;
};
