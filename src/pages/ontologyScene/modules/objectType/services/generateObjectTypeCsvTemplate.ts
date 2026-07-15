import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { OBJECT_TYPE_TEMPLATE_SCENARIO } from '@/services/llmScenarios/definitions/objectTypeTemplate.scenario';
import {
  extractUploadedSchemaFilePath,
  uploadOntologyCSVFileAndParse
} from '@/api/ontologySceneLibrary/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  buildOntologyCsvTemplateFromDefinition,
  createObjectTypeSchemaFile,
  getOntologyCsvTemplateDefinition,
  isDevSchemaFilePath,
  templateDefinitionToParsedSchema,
  type OntologyCsvTemplateDefinition,
  type OntologyCsvTemplateColumn,
  type OntologyCsvTemplateSampleRow,
  type ParsedOntologySchemaCsv
} from '@/utils/ontologyCsvTemplate';
import { cacheDevCsvInstances } from '@/utils/devObjectTypeStore';

const FIELD_NAME_PATTERN = /^[A-Za-z_][\w]*$/;

/** 智能生成 CSV 模板时的默认生成要求 */
export const DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT = '无';

const FIXED_OBJECT_TYPE_TEMPLATE =
  getOntologyCsvTemplateDefinition('object_type');

const SYSTEM_PROMPT = `你是本体工程助手。根据对象类型名称、描述与生成要求，生成对象类型 CSV 标准导入模板的字段与示例数据。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"columns":[{"name":"英文字段名","type":"字段类型","comment":"中文注释"}],"samples":[{"values":["列1","列2"]}]}
要求：
1. columns 3-8 列；第一列为主键，name 固定为 id，type 为 int，comment 为「主键」或贴合业务的 id 说明
2. 英文字段名仅字母、数字、下划线，且不以数字开头
3. samples 2-4 行，values 数量与 columns 一致，内容为贴合业务的示例实例
4. 字段类型使用常见 MySQL 风格（int、varchar(50)、datetime(6) 等）
5. 「生成要求」为最高优先级约束：字段选择、命名、注释与示例数据必须明显体现生成要求中的业务意图；禁止忽略生成要求、输出与要求无关的通用人员/用户模板
6. 仅当生成要求为「无」时，才可按名称与描述自由推断合理业务字段
7. 模板为横向 CSV：第1行英文名称、第2行类型、第3行注释、第4行起为数据，你只需输出 columns 与 samples`;

export type ObjectTypeCsvTemplateSource = 'llm' | 'fixed';

export interface GenerateObjectTypeCsvTemplateResult {
  definition: OntologyCsvTemplateDefinition;
  source: ObjectTypeCsvTemplateSource;
}

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

const sanitizeLlmTemplateDefinition = (
  raw: unknown
): OntologyCsvTemplateDefinition | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const columnsRaw = record.columns;
  const samplesRaw = record.samples;

  if (
    !Array.isArray(columnsRaw) ||
    columnsRaw.length < 2 ||
    columnsRaw.length > 10
  ) {
    return null;
  }

  const columns: OntologyCsvTemplateColumn[] = [];

  for (let index = 0; index < columnsRaw.length; index += 1) {
    const item = columnsRaw[index];
    if (!item || typeof item !== 'object') {
      return null;
    }
    const col = item as Record<string, unknown>;
    const name =
      index === 0
        ? 'id'
        : String(col.name ?? '')
            .trim()
            .replace(/\s+/g, '_');
    const type = String(col.type ?? 'varchar(50)').trim() || 'varchar(50)';
    const comment = String(col.comment ?? col.name ?? name).trim() || name;

    if (!FIELD_NAME_PATTERN.test(name) || !comment) {
      return null;
    }

    columns.push({
      name,
      type: index === 0 ? 'int' : type,
      comment: index === 0 ? comment || '主键' : comment
    });
  }

  if (columns.length < 2 || columns[0]?.name !== 'id') {
    return null;
  }

  const samples: OntologyCsvTemplateSampleRow[] = [];

  if (Array.isArray(samplesRaw)) {
    samplesRaw.slice(0, 5).forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }
      const valuesRaw = (item as { values?: unknown }).values;
      if (!Array.isArray(valuesRaw)) {
        return;
      }
      const values = columns.map((_, colIndex) =>
        String(valuesRaw[colIndex] ?? '').trim()
      );
      if (values.some((cell) => cell !== '')) {
        samples.push({ values });
      }
    });
  }

  if (!samples.length) {
    samples.push({
      values: columns.map((column, index) =>
        index === 0 ? '1' : `${column.comment}示例`
      )
    });
  }

  return { columns, samples };
};

const normalizeGenerateRequirement = (requirements?: string) => {
  const trimmed = requirements?.trim();
  return trimmed || DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT;
};

const hasCustomGenerateRequirement = (requirements?: string) =>
  normalizeGenerateRequirement(requirements) !==
  DEFAULT_OBJECT_TYPE_CSV_GENERATE_REQUIREMENT;

const generateWithLlm = async (
  name: string,
  description: string,
  requirements: string,
  signal?: AbortSignal
): Promise<OntologyCsvTemplateDefinition> => {
  const llmConfig = resolveScenarioLlmConfig(
    OBJECT_TYPE_TEMPLATE_SCENARIO.code
  );
  if (!llmConfig?.apiKey || !llmConfig.model) {
    throw new Error('请先在模型管理中配置并启用「对象类型模板生成」大模型环节');
  }
  const { apiKey, model } = llmConfig;
  const url = resolveDirectLlmRequestUrl();
  const trimmedRequirement = normalizeGenerateRequirement(requirements);
  const customRequirement = hasCustomGenerateRequirement(trimmedRequirement);
  const userText = [
    `对象类型名称：${name.trim()}`,
    description.trim()
      ? `描述说明：${description.trim()}`
      : '描述说明：（未填写，请根据名称推断合理业务字段）',
    customRequirement
      ? [
          `生成要求（必须遵守）：${trimmedRequirement}`,
          '请围绕以上生成要求设计字段与示例，不要输出与要求无关的通用模板。'
        ].join('\n')
      : '生成要求：无（请按名称与描述推断合理业务字段）'
  ].join('\n');

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userText }
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
  const definition = sanitizeLlmTemplateDefinition(parsed);
  if (!definition) {
    throw new Error('大模型返回的模板结构无效');
  }

  return definition;
};

/**
 * 根据对象类型名称、描述与生成要求生成标准 CSV 模板数据。
 * 生成要求为「无」且大模型不可用时，回退固定标准模板；
 * 填写了自定义生成要求时，必须走大模型，失败则抛错（不允许静默回退）。
 */
export const generateObjectTypeCsvTemplate = async (params: {
  name: string;
  description?: string;
  /** 生成要求，默认「无」 */
  requirements?: string;
  signal?: AbortSignal;
}): Promise<GenerateObjectTypeCsvTemplateResult> => {
  const name = params.name?.trim();
  const requirements = normalizeGenerateRequirement(params.requirements);
  const customRequirement = hasCustomGenerateRequirement(requirements);

  if (!name) {
    return { definition: FIXED_OBJECT_TYPE_TEMPLATE, source: 'fixed' };
  }

  if (!isScenarioLlmAvailable(OBJECT_TYPE_TEMPLATE_SCENARIO.code)) {
    if (customRequirement) {
      throw new Error(
        '请先在模型管理中启用「对象类型模板生成」大模型环节，才能按生成要求智能生成'
      );
    }
    return { definition: FIXED_OBJECT_TYPE_TEMPLATE, source: 'fixed' };
  }

  try {
    const definition = await generateWithLlm(
      name,
      params.description ?? '',
      requirements,
      params.signal
    );
    return { definition, source: 'llm' };
  } catch (error) {
    if (customRequirement) {
      throw error instanceof Error
        ? error
        : new Error('按生成要求生成模板失败，请稍后重试');
    }
    console.warn('[ObjectType] 大模型生成模板失败，使用固定标准模板', error);
    return { definition: FIXED_OBJECT_TYPE_TEMPLATE, source: 'fixed' };
  }
};

/** 将生成的模板转为可建模的 Schema（优先上传至后端以获取真实 filePath） */
export const resolveGeneratedObjectTypeParsedSchema = async (
  definition: OntologyCsvTemplateDefinition,
  displayFileName: string
): Promise<ParsedOntologySchemaCsv> => {
  const parsed = templateDefinitionToParsedSchema(definition, 'object_type');
  const projectID = useUserInfoStore.getState().getEffectiveProjectId();

  if (!projectID) {
    return parsed;
  }

  try {
    const csvContent = buildOntologyCsvTemplateFromDefinition(definition);
    const file = createObjectTypeSchemaFile(displayFileName, csvContent);
    const uploadResponse = await uploadOntologyCSVFileAndParse({
      file,
      projectID
    });

    if (isOntologyApiSuccess(uploadResponse)) {
      const uploadedPath = extractUploadedSchemaFilePath(uploadResponse);
      if (uploadedPath && !isDevSchemaFilePath(uploadedPath)) {
        if (parsed.instances.length) {
          cacheDevCsvInstances(uploadedPath, parsed.instances);
        }
        return {
          ...parsed,
          path: uploadedPath
        };
      }
    }
  } catch (error) {
    console.warn('[ObjectType] 上传生成的 Schema 失败，使用本地路径', error);
  }

  return parsed;
};
