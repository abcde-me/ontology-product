import { getOntologyModelDetail } from '@/api/ontologySceneLibrary/ontologyScene';
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import type { DataResourceTable } from '@/pages/dataResource/types';
import {
  findDataResourceTableBySource,
  resolveDataResourcePrimaryKeyFields
} from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { ONTOLOGY_SMART_LINK_SCENARIO } from '@/services/llmScenarioDefinitions';
import { LinkType } from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

export interface InferredLinkSuggestion {
  sourceObjectTypeId: number;
  targetObjectTypeId: number;
  name: string;
  description?: string;
  type: LinkType;
  linkSourceColumnName: string;
  linkTargetColumnName: string;
}

interface ObjectTypeLinkContext {
  id: number;
  code: string;
  name: string;
  tableName: string;
  tableComment: string;
  fields: Array<{
    name: string;
    comment: string;
    type: string;
    isPrimary: boolean;
  }>;
}

interface InferSmartLinksParams {
  ontologyModelID: number;
  sceneObjectTypes: ObjectType[];
  newlyCreatedObjectTypeIds: Set<number>;
  createdTableByObjectTypeId: Map<number, DataResourceTable>;
  objectTypeDescription?: string;
}

const SYSTEM_PROMPT = `你是本体工程助手。根据场景名称、场景描述、对象类型及其数据资源表字段信息，推理应创建的链接关系。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"links":[{"sourceCode":"源对象类型code","targetCode":"目标对象类型code","name":"链接中文名称","description":"链接说明","type":2,"sourceColumn":"源端关联字段","targetColumn":"目标端关联字段"}]}
要求：
1. type 取值：1=一对一，2=一对多，3=多对多；外键/从属关系通常为 2
2. sourceCode、targetCode 必须使用输入中提供的对象类型 code
3. sourceColumn、targetColumn 必须使用对应对象类型的实际字段英文名
4. 仅推理有明确业务语义或外键依据的链接，不要臆造
5. 不要输出已有链接或重复链接
6. 优先关注新建对象类型与场景中其它对象类型之间的关联
7. 若无合适链接，返回 {"links":[]}`;

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

const resolveObjectTypeTable = (
  objectType: ObjectType,
  createdTableByObjectTypeId: Map<number, DataResourceTable>
): DataResourceTable | undefined =>
  createdTableByObjectTypeId.get(objectType.id) ||
  findDataResourceTableBySource(
    objectType.originalDbName,
    objectType.originalTableName
  );

const buildObjectTypeLinkContext = (
  objectType: ObjectType,
  table?: DataResourceTable
): ObjectTypeLinkContext | null => {
  if (!objectType.id || !objectType.code?.trim() || !table) {
    return null;
  }

  const primaryKeys = new Set(resolveDataResourcePrimaryKeyFields(table));

  const fields = table.fields.map((field) => ({
    name: field.fieldName,
    comment: field.fieldComment?.trim() || '',
    type: field.fieldType || '',
    isPrimary: primaryKeys.has(field.fieldName)
  }));

  return {
    id: objectType.id,
    code: objectType.code.trim(),
    name: objectType.name?.trim() || objectType.code.trim(),
    tableName:
      table?.tableName ||
      objectType.originalTableName ||
      objectType.code.trim(),
    tableComment: table?.tableComment?.trim() || objectType.name?.trim() || '',
    fields
  };
};

const buildObjectTypeContexts = (
  sceneObjectTypes: ObjectType[],
  createdTableByObjectTypeId: Map<number, DataResourceTable>
): ObjectTypeLinkContext[] =>
  sceneObjectTypes
    .filter((objectType) => objectType.id > 0)
    .map((objectType) =>
      buildObjectTypeLinkContext(
        objectType,
        resolveObjectTypeTable(objectType, createdTableByObjectTypeId)
      )
    )
    .filter(
      (context): context is ObjectTypeLinkContext =>
        !!context && context.fields.length > 0
    );

const formatObjectTypeContextText = (contexts: ObjectTypeLinkContext[]) =>
  contexts
    .map((context) => {
      const fieldLines = context.fields
        .map(
          (field) =>
            `  - ${field.name}${field.isPrimary ? ' [主键]' : ''}${
              field.comment ? `：${field.comment}` : ''
            }${field.type ? ` (${field.type})` : ''}`
        )
        .join('\n');

      return [
        `对象类型：${context.name}（code=${context.code}，id=${context.id}）`,
        `数据资源表：${context.tableComment || context.tableName}（${context.tableName}）`,
        '字段：',
        fieldLines
      ].join('\n');
    })
    .join('\n\n');

const formatExistingLinksText = (
  existingLinks: Array<{
    name?: string;
    sourceObjectTypeID?: number;
    targetObjectTypeID?: number;
  }>,
  contexts: ObjectTypeLinkContext[]
) => {
  if (!existingLinks.length) {
    return '（无已有链接）';
  }

  const contextById = new Map(contexts.map((context) => [context.id, context]));

  return existingLinks
    .map((link) => {
      const source = contextById.get(link.sourceObjectTypeID || 0);
      const target = contextById.get(link.targetObjectTypeID || 0);
      return `- ${link.name || '未命名链接'}：${source?.code || link.sourceObjectTypeID} -> ${
        target?.code || link.targetObjectTypeID
      }`;
    })
    .join('\n');
};

const resolveLinkType = (value: unknown): LinkType => {
  const numeric = Number(value);
  if (numeric === LinkType.ONE_TO_ONE) {
    return LinkType.ONE_TO_ONE;
  }
  if (numeric === LinkType.MANY_TO_MANY) {
    return LinkType.MANY_TO_MANY;
  }
  return LinkType.ONE_TO_MANY;
};

const hasField = (context: ObjectTypeLinkContext, fieldName: string) =>
  context.fields.some((field) => field.name === fieldName);

const resolvePrimaryField = (
  context: ObjectTypeLinkContext
): string | undefined =>
  context.fields.find((field) => field.isPrimary)?.name ||
  context.fields[0]?.name;

const parseForeignKeyTargetTable = (comment: string): string | undefined => {
  const normalized = comment.trim();
  const fkMatch = normalized.match(/外键关联\s*([A-Za-z0-9_]+)\s*表/);
  if (fkMatch?.[1]) {
    return fkMatch[1].trim();
  }

  const englishMatch = normalized.match(
    /foreign key(?:\s+to|\s+reference)?\s+([A-Za-z0-9_]+)/i
  );
  if (englishMatch?.[1]) {
    return englishMatch[1].trim();
  }

  return undefined;
};

const resolveTableAliasMatch = (
  fieldName: string,
  contexts: ObjectTypeLinkContext[]
): ObjectTypeLinkContext | undefined => {
  const normalized = fieldName.trim().toLowerCase();
  if (!normalized.endsWith('_id') && normalized !== 'id') {
    return undefined;
  }

  const candidate = normalized.endsWith('_id')
    ? normalized.slice(0, -3)
    : normalized;

  return contexts.find((context) => {
    const tableName = context.tableName.toLowerCase();
    const code = context.code.toLowerCase();
    return (
      candidate === tableName ||
      candidate === code ||
      candidate === tableName.replace(/s$/, '') ||
      candidate.replace(/_/g, '') === tableName.replace(/_/g, '')
    );
  });
};

const buildLinkSuggestionKey = (suggestion: InferredLinkSuggestion) =>
  [
    suggestion.sourceObjectTypeId,
    suggestion.targetObjectTypeId,
    suggestion.linkSourceColumnName,
    suggestion.linkTargetColumnName
  ].join('|');

const dedupeSuggestions = (suggestions: InferredLinkSuggestion[]) => {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = buildLinkSuggestionKey(suggestion);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const inferSmartLinksHeuristic = (params: {
  contexts: ObjectTypeLinkContext[];
  newlyCreatedObjectTypeIds: Set<number>;
  existingLinks: Array<{
    sourceObjectTypeID?: number;
    targetObjectTypeID?: number;
  }>;
}): InferredLinkSuggestion[] => {
  const { contexts, newlyCreatedObjectTypeIds, existingLinks } = params;
  const suggestions: InferredLinkSuggestion[] = [];

  const hasExistingLinkBetween = (sourceId: number, targetId: number) =>
    existingLinks.some(
      (link) =>
        (link.sourceObjectTypeID === sourceId &&
          link.targetObjectTypeID === targetId) ||
        (link.sourceObjectTypeID === targetId &&
          link.targetObjectTypeID === sourceId)
    );

  const contextByTableName = new Map(
    contexts.map((context) => [context.tableName.toLowerCase(), context])
  );

  for (const targetContext of contexts) {
    const involvesNewObjectType =
      newlyCreatedObjectTypeIds.has(targetContext.id) ||
      contexts.some(
        (context) =>
          newlyCreatedObjectTypeIds.has(context.id) &&
          context.id !== targetContext.id
      );

    if (!involvesNewObjectType) {
      continue;
    }

    for (const field of targetContext.fields) {
      if (field.isPrimary) {
        continue;
      }

      const referencedTableName =
        parseForeignKeyTargetTable(field.comment) ||
        resolveTableAliasMatch(field.name, contexts)?.tableName;

      const sourceContext = referencedTableName
        ? contextByTableName.get(referencedTableName.toLowerCase())
        : resolveTableAliasMatch(field.name, contexts);

      if (!sourceContext || sourceContext.id === targetContext.id) {
        continue;
      }

      const sourceColumn = resolvePrimaryField(sourceContext);
      if (!sourceColumn || !hasField(targetContext, field.name)) {
        continue;
      }

      if (hasExistingLinkBetween(sourceContext.id, targetContext.id)) {
        continue;
      }

      suggestions.push({
        sourceObjectTypeId: sourceContext.id,
        targetObjectTypeId: targetContext.id,
        name:
          field.comment.trim() ||
          `${sourceContext.name}关联${targetContext.name}`,
        description: `基于字段 ${targetContext.tableName}.${field.name} 与 ${sourceContext.tableName}.${sourceColumn} 的关联关系自动推理`,
        type: LinkType.ONE_TO_MANY,
        linkSourceColumnName: sourceColumn,
        linkTargetColumnName: field.name
      });
    }
  }

  for (let i = 0; i < contexts.length; i += 1) {
    for (let j = i + 1; j < contexts.length; j += 1) {
      const left = contexts[i];
      const right = contexts[j];

      const involvesNewObjectType =
        newlyCreatedObjectTypeIds.has(left.id) ||
        newlyCreatedObjectTypeIds.has(right.id);
      if (!involvesNewObjectType) {
        continue;
      }

      if (hasExistingLinkBetween(left.id, right.id)) {
        continue;
      }

      const sharedFields = left.fields
        .map((field) => field.name)
        .filter(
          (name) =>
            !left.fields.find((field) => field.name === name)?.isPrimary &&
            right.fields.some((field) => field.name === name)
        )
        .sort();

      const sharedField = sharedFields[0];
      if (!sharedField) {
        continue;
      }

      const leftField = left.fields.find((field) => field.name === sharedField);
      const rightField = right.fields.find(
        (field) => field.name === sharedField
      );

      suggestions.push({
        sourceObjectTypeId: left.id,
        targetObjectTypeId: right.id,
        name:
          leftField?.comment?.trim() ||
          rightField?.comment?.trim() ||
          sharedField,
        description: `基于相同字段 ${sharedField} 自动推理`,
        type: LinkType.ONE_TO_MANY,
        linkSourceColumnName: sharedField,
        linkTargetColumnName: sharedField
      });
    }
  }

  return dedupeSuggestions(suggestions).filter(
    (suggestion) =>
      !hasExistingLinkBetween(
        suggestion.sourceObjectTypeId,
        suggestion.targetObjectTypeId
      )
  );
};

const inferSmartLinksWithLlm = async (params: {
  sceneName: string;
  sceneDescription: string;
  objectTypeDescription?: string;
  contexts: ObjectTypeLinkContext[];
  newlyCreatedObjectTypeIds: Set<number>;
  existingLinks: Array<{
    name?: string;
    sourceObjectTypeID?: number;
    targetObjectTypeID?: number;
  }>;
}): Promise<InferredLinkSuggestion[]> => {
  const llmConfig = resolveScenarioLlmConfig(ONTOLOGY_SMART_LINK_SCENARIO.code);
  if (!llmConfig?.apiKey?.trim()) {
    return [];
  }

  const contextByCode = new Map(
    params.contexts.map((context) => [context.code.toLowerCase(), context])
  );

  const newlyCreatedCodes = params.contexts
    .filter((context) => params.newlyCreatedObjectTypeIds.has(context.id))
    .map((context) => context.code)
    .join('、');

  const userText = [
    `场景名称：${params.sceneName || '（未命名）'}`,
    `场景描述：${params.sceneDescription || '（未填写）'}`,
    params.objectTypeDescription
      ? `本次创建说明：${params.objectTypeDescription}`
      : '',
    newlyCreatedCodes ? `本次新建对象类型：${newlyCreatedCodes}` : '',
    '',
    '--- 已有链接 ---',
    formatExistingLinksText(params.existingLinks, params.contexts),
    '',
    '--- 场景对象类型与数据资源字段 ---',
    formatObjectTypeContextText(params.contexts)
  ]
    .filter(Boolean)
    .join('\n');

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userText }
  ];

  const response = await fetch(resolveDirectLlmRequestUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${llmConfig.apiKey}`
    },
    body: JSON.stringify({
      model: llmConfig.model,
      messages,
      stream: false,
      thinking: { type: 'disabled' }
    })
  });

  if (!response.ok) {
    throw new Error(`大模型请求失败 (${response.status})`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return [];
  }

  const parsed = extractJsonFromLlmContent(content);
  const links = (parsed as { links?: unknown[] })?.links;
  if (!Array.isArray(links)) {
    return [];
  }

  const suggestions: InferredLinkSuggestion[] = [];

  links.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const record = item as Record<string, unknown>;
    const sourceContext = contextByCode.get(
      String(record.sourceCode || '')
        .trim()
        .toLowerCase()
    );
    const targetContext = contextByCode.get(
      String(record.targetCode || '')
        .trim()
        .toLowerCase()
    );
    const sourceColumn = String(record.sourceColumn || '').trim();
    const targetColumn = String(record.targetColumn || '').trim();

    if (!sourceContext || !targetContext || !sourceColumn || !targetColumn) {
      return;
    }

    if (
      !hasField(sourceContext, sourceColumn) ||
      !hasField(targetContext, targetColumn)
    ) {
      return;
    }

    suggestions.push({
      sourceObjectTypeId: sourceContext.id,
      targetObjectTypeId: targetContext.id,
      name:
        String(record.name || '').trim() ||
        `${sourceContext.name}关联${targetContext.name}`,
      description: String(record.description || '').trim() || undefined,
      type: resolveLinkType(record.type),
      linkSourceColumnName: sourceColumn,
      linkTargetColumnName: targetColumn
    });
  });

  return dedupeSuggestions(suggestions);
};

export const inferSmartLinks = async (
  params: InferSmartLinksParams & {
    existingLinks: Array<{
      name?: string;
      sourceObjectTypeID?: number;
      targetObjectTypeID?: number;
    }>;
  }
): Promise<InferredLinkSuggestion[]> => {
  const contexts = buildObjectTypeContexts(
    params.sceneObjectTypes,
    params.createdTableByObjectTypeId
  );

  if (contexts.length < 2) {
    return [];
  }

  const sceneDetailResponse = await getOntologyModelDetail({
    id: params.ontologyModelID
  });
  const sceneDetail = isOntologyApiSuccess(sceneDetailResponse)
    ? sceneDetailResponse.data
    : undefined;

  let suggestions: InferredLinkSuggestion[] = [];

  if (isScenarioLlmAvailable(ONTOLOGY_SMART_LINK_SCENARIO.code)) {
    try {
      suggestions = await inferSmartLinksWithLlm({
        sceneName: sceneDetail?.name || '',
        sceneDescription: sceneDetail?.description || '',
        objectTypeDescription: params.objectTypeDescription,
        contexts,
        newlyCreatedObjectTypeIds: params.newlyCreatedObjectTypeIds,
        existingLinks: params.existingLinks
      });
    } catch (error) {
      console.warn('[graph] 智能创建链接 LLM 推理失败，回退规则推理', error);
    }
  }

  if (!suggestions.length) {
    suggestions = inferSmartLinksHeuristic({
      contexts,
      newlyCreatedObjectTypeIds: params.newlyCreatedObjectTypeIds,
      existingLinks: params.existingLinks
    });
  }

  return suggestions.filter(
    (suggestion) =>
      params.newlyCreatedObjectTypeIds.has(suggestion.sourceObjectTypeId) ||
      params.newlyCreatedObjectTypeIds.has(suggestion.targetObjectTypeId)
  );
};
