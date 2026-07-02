import { AI_WORKBENCH_LLM_CONFIG } from '@/pages/aiOntologyWorkbench/config/llm';
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import type { DataResourceTable } from '../types';
import {
  dataResourceTableToInstanceExtractTarget,
  type InstanceExtractTargetSchema,
  resolveInstanceExtractPrimaryKeyFields
} from './instanceExtractTarget';
import type { FileResourceExtractSource } from '../types';
import type {
  EntityRelationExtractResult,
  FileExtractResultPayload,
  FileExtractType,
  InstanceExtractResult,
  OntologyModelExtractResult,
  OntologyModelSchema
} from '../types/fileExtract';

const FIELD_NAME_PATTERN = /^[A-Za-z_][\w]*$/;

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

const createId = (prefix: string, index: number) =>
  `${prefix}-${index + 1}-${Date.now().toString(36)}`;

const resolveInstanceExtractTarget = (
  targetTable?: DataResourceTable,
  targetSchema?: InstanceExtractTargetSchema
): InstanceExtractTargetSchema | undefined => {
  if (targetSchema) {
    return targetSchema;
  }
  if (targetTable) {
    return dataResourceTableToInstanceExtractTarget(targetTable);
  }
  return undefined;
};

const buildUserPrompt = (
  source: FileResourceExtractSource,
  requirement: string,
  extractType: FileExtractType,
  targetSchema?: InstanceExtractTargetSchema
): string => {
  const metaLines = [
    `文件名称：${source.fileName}`,
    `文件格式：${source.fileFormat}`,
    `文件大小：${source.fileSize} 字节`,
    `内容类型：${source.contentType === 'text' ? '文本' : '二进制/未解析'}`
  ];

  if (source.note) {
    metaLines.push(`说明：${source.note}`);
  }

  const typeInstruction: Record<FileExtractType, string> = {
    entity_relation:
      '请提取文档中的实体与实体间关系，严格输出 JSON，不要输出 Markdown 包裹以外的说明文字。',
    ontology_model:
      '请提取文档中的本体模型要素（对象类型、属性、链接），严格输出 JSON，不要输出 Markdown 包裹以外的说明文字。',
    instance:
      '请提取文档中的业务实例及其属性，严格输出 JSON，不要输出 Markdown 包裹以外的说明文字。'
  };

  const sections = [
    '【文件信息】',
    metaLines.join('\n'),
    '',
    '【提取类型】',
    extractType,
    '',
    '【提取要求】',
    requirement,
    '',
    '【输出要求】',
    typeInstruction[extractType]
  ];

  if (source.text) {
    sections.push('', '【文件正文】', source.text);
  }

  if (extractType === 'instance' && targetSchema) {
    const primaryKeyFields =
      resolveInstanceExtractPrimaryKeyFields(targetSchema);
    const fieldLines = targetSchema.fields.map(
      (field) =>
        `- ${field.fieldName} (${field.fieldType})：${field.fieldComment || field.fieldName}`
    );

    sections.push(
      '',
      '【目标结构】',
      targetSchema.targetCode
        ? `名称：${targetSchema.targetLabel}（${targetSchema.targetCode}）`
        : `名称：${targetSchema.targetLabel}`,
      `主键字段：${primaryKeyFields.join('、') || '未配置'}`,
      '字段结构：',
      fieldLines.join('\n'),
      '',
      '【结构化输出要求】',
      '请按上述字段结构输出 rows 数组，每条记录键名必须与字段名完全一致。'
    );
  }

  return sections.join('\n');
};

const SYSTEM_PROMPTS: Record<FileExtractType, string> = {
  entity_relation: `你是实体关系提取助手。根据文件内容与用户要求，提取实体和关系。
必须返回 JSON，格式如下：
{
  "entities": [
    { "id": "e1", "name": "实体名称", "type": "实体类型", "description": "说明" }
  ],
  "relations": [
    { "id": "r1", "sourceEntityId": "e1", "targetEntityId": "e2", "relationType": "关系类型", "description": "说明" }
  ],
  "summary": "提取摘要"
}
要求：
- id 唯一且 relations 中的 sourceEntityId/targetEntityId 必须引用 entities.id
- 不要编造正文中不存在的内容
- 使用简体中文`,
  ontology_model: `你是本体模型提取助手。根据文件内容与用户要求，提取对象类型、属性、实例与链接。
必须返回 JSON，格式如下：
{
  "objectTypes": [
    {
      "id": "ot1",
      "name": "对象类型名称",
      "code": "object_code",
      "description": "说明",
      "columns": [
        { "name": "id", "type": "int", "comment": "主键" },
        { "name": "username", "type": "varchar(50)", "comment": "用户名" }
      ],
      "samples": [
        { "values": ["1", "张三"] }
      ]
    }
  ],
  "links": [
    {
      "id": "lk1",
      "name": "链接名称",
      "sourceObjectTypeId": "ot1",
      "targetObjectTypeId": "ot2",
      "description": "说明"
    }
  ],
  "summary": "提取摘要"
}
要求：
- 每个对象类型的 columns 对应标准 CSV 导入模板：第 1 行英文名称、第 2 行字段类型、第 3 行中文注释
- columns 第一列主键 name 固定为 id，type 为 int
- 英文字段名仅字母、数字、下划线，且不以数字开头；字段类型使用 MySQL 风格（int、varchar(50)、datetime(6) 等）
- samples 为从文档中提取的实例数据行，values 数量与 columns 一致；若无实例可输出空数组
- code 使用 snake_case
- links 中的 sourceObjectTypeId/targetObjectTypeId 必须引用 objectTypes.id
- 不要编造正文中不存在的内容
- 使用简体中文`,
  instance: `你是实例提取助手。根据文件内容与用户要求，提取业务实例。
必须返回 JSON，格式如下：
{
  "instances": [
    {
      "id": "ins1",
      "objectType": "对象类型",
      "name": "实例名称",
      "attributes": { "字段名": "字段值" }
    }
  ],
  "summary": "提取摘要"
}
要求：
- 不要编造正文中不存在的内容
- 使用简体中文`
};

const buildInstanceTargetSystemPrompt = (
  targetSchema: InstanceExtractTargetSchema
): string => {
  const primaryKeyFields = resolveInstanceExtractPrimaryKeyFields(targetSchema);
  const fieldLines = targetSchema.fields
    .map(
      (field) =>
        `- ${field.fieldName} (${field.fieldType})：${field.fieldComment || field.fieldName}`
    )
    .join('\n');

  const targetLabel = targetSchema.targetCode
    ? `${targetSchema.targetLabel}（${targetSchema.targetCode}）`
    : targetSchema.targetLabel;

  return `你是实例提取助手。根据文件内容与用户要求，按指定目标结构提取实例数据行。
目标：${targetLabel}
主键字段：${primaryKeyFields.join('、') || '未配置'}

字段结构：
${fieldLines}

必须返回 JSON，格式如下：
{
  "rows": [
    { "字段名1": "字段值1", "字段名2": "字段值2" }
  ],
  "summary": "提取摘要"
}
要求：
- rows 中每条记录的键必须严格使用上述字段名
- 主键字段必须有值，且在同一批 rows 内不重复
- 仅提取正文中存在或可合理推断的字段值，缺失字段可省略或留空字符串
- 不要编造正文中不存在的内容
- 使用简体中文`;
};

const sanitizeEntityRelationResult = (
  parsed: unknown,
  fallbackMarkdown: string
): EntityRelationExtractResult => {
  const record = (parsed || {}) as Record<string, unknown>;
  const entities = Array.isArray(record.entities)
    ? record.entities.map((item, index) => {
        const entity = (item || {}) as Record<string, unknown>;
        return {
          id: String(entity.id || createId('entity', index)),
          name: String(entity.name || '').trim() || `实体${index + 1}`,
          type: String(entity.type || '').trim() || '未知类型',
          description: String(entity.description || '').trim() || undefined
        };
      })
    : [];

  const relations = Array.isArray(record.relations)
    ? record.relations.map((item, index) => {
        const relation = (item || {}) as Record<string, unknown>;
        return {
          id: String(relation.id || createId('relation', index)),
          sourceEntityId: String(relation.sourceEntityId || '').trim(),
          targetEntityId: String(relation.targetEntityId || '').trim(),
          relationType:
            String(relation.relationType || relation.type || '').trim() ||
            '关联',
          description: String(relation.description || '').trim() || undefined
        };
      })
    : [];

  return {
    entities,
    relations,
    summary: String(record.summary || '').trim() || undefined,
    markdown: fallbackMarkdown
  };
};

const buildSchemaFromColumnsAndSamples = (
  columnsRaw: unknown,
  samplesRaw: unknown
): OntologyModelSchema | null => {
  if (!Array.isArray(columnsRaw) || columnsRaw.length < 1) {
    return null;
  }

  const columnList: string[] = [];
  const typeList: string[] = [];
  const commentList: string[] = [];

  columnsRaw.forEach((item, index) => {
    const column = (item || {}) as Record<string, unknown>;
    const name =
      index === 0
        ? 'id'
        : String(column.name || '')
            .trim()
            .replace(/\s+/g, '_') || `field_${index + 1}`;
    const type = String(column.type || 'varchar(50)').trim() || 'varchar(50)';
    const comment =
      String(
        column.comment || column.description || column.name || name
      ).trim() || name;

    if (!FIELD_NAME_PATTERN.test(name)) {
      return;
    }

    columnList.push(name);
    typeList.push(index === 0 ? 'int' : type);
    commentList.push(comment);
  });

  if (!columnList.length || columnList[0] !== 'id') {
    return null;
  }

  const instances: Record<string, string>[] = [];

  if (Array.isArray(samplesRaw)) {
    samplesRaw.forEach((item) => {
      const sample = (item || {}) as Record<string, unknown>;
      const valuesRaw = sample.values;
      if (!Array.isArray(valuesRaw)) {
        return;
      }

      const record: Record<string, string> = {};
      columnList.forEach((columnName, colIndex) => {
        record[columnName] = String(valuesRaw[colIndex] ?? '').trim();
      });

      if (Object.values(record).some((value) => value !== '')) {
        instances.push(record);
      }
    });
  }

  return { columnList, typeList, commentList, instances };
};

const buildSchemaFromLegacyAttributes = (
  attributesRaw: unknown
): OntologyModelSchema => {
  const columnList: string[] = ['id'];
  const typeList: string[] = ['int'];
  const commentList: string[] = ['主键'];

  if (Array.isArray(attributesRaw)) {
    attributesRaw.forEach((item, index) => {
      const attribute = (item || {}) as Record<string, unknown>;
      const name =
        String(attribute.name || '')
          .trim()
          .replace(/\s+/g, '_') || `field_${index + 1}`;

      if (name === 'id' || !FIELD_NAME_PATTERN.test(name)) {
        return;
      }

      columnList.push(name);
      typeList.push(
        String(attribute.type || 'varchar(50)').trim() || 'varchar(50)'
      );
      commentList.push(
        String(attribute.description || attribute.name || name).trim() || name
      );
    });
  }

  return { columnList, typeList, commentList, instances: [] };
};

const sanitizeOntologyModelResult = (
  parsed: unknown,
  fallbackMarkdown: string
): OntologyModelExtractResult => {
  const record = (parsed || {}) as Record<string, unknown>;
  const objectTypes = Array.isArray(record.objectTypes)
    ? record.objectTypes.map((item, index) => {
        const objectType = (item || {}) as Record<string, unknown>;
        const schema =
          buildSchemaFromColumnsAndSamples(
            objectType.columns,
            objectType.samples
          ) || buildSchemaFromLegacyAttributes(objectType.attributes);

        return {
          id: String(objectType.id || createId('ot', index)),
          name: String(objectType.name || '').trim() || `对象类型${index + 1}`,
          code:
            String(objectType.code || '').trim() || `object_type_${index + 1}`,
          description: String(objectType.description || '').trim() || undefined,
          schema
        };
      })
    : [];

  const links = Array.isArray(record.links)
    ? record.links.map((item, index) => {
        const link = (item || {}) as Record<string, unknown>;
        return {
          id: String(link.id || createId('link', index)),
          name: String(link.name || '').trim() || `链接${index + 1}`,
          sourceObjectTypeId: String(link.sourceObjectTypeId || '').trim(),
          targetObjectTypeId: String(link.targetObjectTypeId || '').trim(),
          description: String(link.description || '').trim() || undefined
        };
      })
    : [];

  return {
    objectTypes,
    links,
    summary: String(record.summary || '').trim() || undefined,
    markdown: fallbackMarkdown
  };
};

const sanitizeInstanceResult = (
  parsed: unknown,
  fallbackMarkdown: string,
  targetSchema?: InstanceExtractTargetSchema,
  targetTableMeta?: Pick<DataResourceTable, 'id' | 'tableName'>
): InstanceExtractResult => {
  const record = (parsed || {}) as Record<string, unknown>;

  if (targetSchema) {
    const fieldNames = targetSchema.fields.map((field) => field.fieldName);
    const rows = Array.isArray(record.rows)
      ? record.rows
          .map((item) => {
            const row = (item || {}) as Record<string, unknown>;
            const normalized: Record<string, string> = {};
            fieldNames.forEach((fieldName) => {
              normalized[fieldName] = String(row[fieldName] ?? '').trim();
            });
            return normalized;
          })
          .filter((row) => Object.values(row).some((value) => value !== ''))
      : [];

    return {
      instances: [],
      rows,
      targetTableId: targetTableMeta?.id,
      targetTableName: targetTableMeta?.tableName || targetSchema.targetCode,
      summary: String(record.summary || '').trim() || undefined,
      markdown: fallbackMarkdown
    };
  }

  const instances = Array.isArray(record.instances)
    ? record.instances.map((item, index) => {
        const instance = (item || {}) as Record<string, unknown>;
        const attributes =
          instance.attributes && typeof instance.attributes === 'object'
            ? Object.fromEntries(
                Object.entries(
                  instance.attributes as Record<string, unknown>
                ).map(([key, value]) => [key, String(value ?? '')])
              )
            : {};

        return {
          id: String(instance.id || createId('instance', index)),
          objectType: String(instance.objectType || '').trim() || '未知类型',
          name: String(instance.name || '').trim() || `实例${index + 1}`,
          attributes
        };
      })
    : [];

  return {
    instances,
    summary: String(record.summary || '').trim() || undefined,
    markdown: fallbackMarkdown
  };
};

const callLlm = async (params: {
  extractType: FileExtractType;
  source: FileResourceExtractSource;
  requirement: string;
  targetTable?: DataResourceTable;
  targetSchema?: InstanceExtractTargetSchema;
  signal?: AbortSignal;
}): Promise<string> => {
  const requirement = params.requirement.trim();
  if (!requirement) {
    throw new Error('请填写提取要求');
  }

  if (!AI_WORKBENCH_LLM_CONFIG.apiKey?.trim()) {
    throw new Error(
      '未配置大模型 API Key。请在环境变量中配置 REACT_APP_AI_WORKBENCH_LLM_API_KEY'
    );
  }

  const { apiKey, model } = AI_WORKBENCH_LLM_CONFIG;
  const resolvedTargetSchema = resolveInstanceExtractTarget(
    params.targetTable,
    params.targetSchema
  );
  const systemPrompt =
    params.extractType === 'instance' && resolvedTargetSchema
      ? buildInstanceTargetSystemPrompt(resolvedTargetSchema)
      : SYSTEM_PROMPTS[params.extractType];

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: buildUserPrompt(
        params.source,
        requirement,
        params.extractType,
        resolvedTargetSchema
      )
    }
  ];

  const response = await fetch(resolveDirectLlmRequestUrl(), {
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
    signal: params.signal
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

export const extractFileResourceWithLlm = async (params: {
  extractType: FileExtractType;
  source: FileResourceExtractSource;
  requirement: string;
  targetTable?: DataResourceTable;
  targetSchema?: InstanceExtractTargetSchema;
  signal?: AbortSignal;
}): Promise<FileExtractResultPayload> => {
  const resolvedTargetSchema = resolveInstanceExtractTarget(
    params.targetTable,
    params.targetSchema
  );
  const content = await callLlm(params);
  const parsed = extractJsonFromLlmContent(content);

  switch (params.extractType) {
    case 'entity_relation':
      return sanitizeEntityRelationResult(parsed, content);
    case 'ontology_model':
      return sanitizeOntologyModelResult(parsed, content);
    case 'instance':
      return sanitizeInstanceResult(
        parsed,
        content,
        resolvedTargetSchema,
        params.targetTable
          ? {
              id: params.targetTable.id,
              tableName: params.targetTable.tableName
            }
          : undefined
      );
    default:
      throw new Error('不支持的提取类型');
  }
};
