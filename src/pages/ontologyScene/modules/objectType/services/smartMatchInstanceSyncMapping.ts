import { mapOntologyObjectTypeColumns } from '@/api/ontologySceneLibrary/attributes';
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import type {
  ObjectTypeAttributeField,
  SourceTableField
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { INSTANCE_SYNC_COLUMN_MAPPING_SCENARIO } from '@/services/llmScenarios/definitions/instanceSyncColumnMapping.scenario';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

export interface InstanceSyncColumnRelation {
  objectTypeColumnName: string;
  sourceTableColumnName: string;
}

export type InstanceSyncMappingMatchSource = 'llm' | 'api' | 'none';

const SYSTEM_PROMPT = `你是本体实例同步字段映射助手。根据对象类型属性与数据源表字段的注释、名称及类型，建立一一对应的映射关系。

仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"mapRelations":[{"objectTypeColumnName":"属性id","sourceTableColumnName":"源表字段名"}]}

要求：
1. objectTypeColumnName 必须来自提供的对象属性 propertyID，不可编造
2. sourceTableColumnName 必须来自提供的源表字段 fieldId，不可编造
3. 优先依据属性名称（propertyComment）与字段注释（fieldComment）的语义匹配（同义、近义、中英文对应、业务含义一致）
4. 注释缺失或为空时，可参考 propertyID 与 fieldId 的字面相似度
5. 主键属性（isPrimary=1）应优先映射到 id、编号、主键、唯一标识类源字段
6. 类型语义相近的字段优先匹配（如日期配日期、数值配数值、文本配文本）
7. 每个源表字段最多映射一次；语义不确定时不输出该条关系
8. 不要强行匹配含义明显不符的字段`;

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

const buildObjectTypeFieldsDescription = (
  attributes: ObjectTypeAttributeField[]
): string =>
  attributes
    .map((item) => {
      const primaryHint = item.isPrimary === 1 ? '，主键' : '';
      return `- ${item.propertyID}（属性名称：${item.propertyComment || item.propertyID}，类型：${item.propertyType || 'string'}${primaryHint}）`;
    })
    .join('\n');

const buildSourceFieldsDescription = (fields: SourceTableField[]): string =>
  fields
    .map(
      (item) =>
        `- ${item.fieldId}（字段注释：${item.fieldComment || item.fieldId}，类型：${item.fieldType || 'string'}）`
    )
    .join('\n');

const sanitizeLlmRelations = (
  parsed: unknown,
  attributes: ObjectTypeAttributeField[],
  sourceFields: SourceTableField[]
): InstanceSyncColumnRelation[] => {
  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const rawRelations = (parsed as { mapRelations?: unknown }).mapRelations;
  if (!Array.isArray(rawRelations)) {
    return [];
  }

  const allowedPropertyIds = new Set(
    attributes.map((item) => item.propertyID).filter(Boolean)
  );
  const allowedSourceIds = new Set(
    sourceFields.map((item) => item.fieldId).filter(Boolean)
  );
  const usedSourceIds = new Set<string>();
  const relations: InstanceSyncColumnRelation[] = [];

  rawRelations.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const record = item as Record<string, unknown>;
    const objectTypeColumnName = String(
      record.objectTypeColumnName || ''
    ).trim();
    const sourceTableColumnName = String(
      record.sourceTableColumnName || ''
    ).trim();

    if (
      !objectTypeColumnName ||
      !sourceTableColumnName ||
      !allowedPropertyIds.has(objectTypeColumnName) ||
      !allowedSourceIds.has(sourceTableColumnName) ||
      usedSourceIds.has(sourceTableColumnName)
    ) {
      return;
    }

    usedSourceIds.add(sourceTableColumnName);
    relations.push({ objectTypeColumnName, sourceTableColumnName });
  });

  return relations;
};

const matchWithLlm = async (
  attributes: ObjectTypeAttributeField[],
  sourceFields: SourceTableField[],
  signal?: AbortSignal
): Promise<InstanceSyncColumnRelation[]> => {
  const llmConfig = resolveScenarioLlmConfig(
    INSTANCE_SYNC_COLUMN_MAPPING_SCENARIO.code
  );
  if (!llmConfig?.apiKey?.trim()) {
    throw new Error('未配置大模型 API Key');
  }

  const { apiKey, model } = llmConfig;
  const url = resolveDirectLlmRequestUrl();
  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        '对象类型属性：',
        buildObjectTypeFieldsDescription(attributes),
        '',
        '数据源表字段：',
        buildSourceFieldsDescription(sourceFields)
      ].join('\n')
    }
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

  const parsed = extractJsonFromLlmContent(content);
  return sanitizeLlmRelations(parsed, attributes, sourceFields);
};

const matchWithNameApi = async (
  attributes: ObjectTypeAttributeField[],
  sourceFields: SourceTableField[]
): Promise<InstanceSyncColumnRelation[]> => {
  const objectTypeColumns = attributes
    .map((attribute) => attribute.propertyID)
    .filter((propertyID): propertyID is string => !!propertyID);
  const sourceTableColumns = sourceFields
    .map((field) => field.fieldId)
    .filter((fieldId): fieldId is string => !!fieldId);

  if (!objectTypeColumns.length || !sourceTableColumns.length) {
    return [];
  }

  const response = await mapOntologyObjectTypeColumns({
    objectTypeColumns,
    sourceTableColumns
  });

  if (
    !isOntologyApiSuccess(response) ||
    !Array.isArray(response.data?.mapRelations)
  ) {
    throw new Error(response?.message || '字段名自动匹配失败');
  }

  return response.data.mapRelations
    .map((relation) => ({
      objectTypeColumnName: String(relation?.objectTypeColumnName || '').trim(),
      sourceTableColumnName: String(
        relation?.sourceTableColumnName || ''
      ).trim()
    }))
    .filter(
      (relation) =>
        relation.objectTypeColumnName && relation.sourceTableColumnName
    );
};

/**
 * 实例同步映射智能匹配：优先调用大模型根据字段注释语义匹配，失败时回退字段名 API。
 */
export const smartMatchInstanceSyncColumns = async (params: {
  attributes: ObjectTypeAttributeField[];
  sourceFields: SourceTableField[];
  signal?: AbortSignal;
}): Promise<{
  relations: InstanceSyncColumnRelation[];
  source: InstanceSyncMappingMatchSource;
}> => {
  const { attributes, sourceFields, signal } = params;

  if (!attributes.length || !sourceFields.length) {
    return { relations: [], source: 'none' };
  }

  if (isScenarioLlmAvailable(INSTANCE_SYNC_COLUMN_MAPPING_SCENARIO.code)) {
    try {
      const relations = await matchWithLlm(attributes, sourceFields, signal);
      if (relations.length) {
        return { relations, source: 'llm' };
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn('[InstanceSync] 大模型智能匹配失败，回退字段名匹配', error);
    }
  }

  try {
    const relations = await matchWithNameApi(attributes, sourceFields);
    return { relations, source: relations.length ? 'api' : 'none' };
  } catch (error) {
    console.error('[InstanceSync] 字段名自动匹配失败', error);
    throw error;
  }
};
