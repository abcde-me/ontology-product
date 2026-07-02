import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { fetchSceneOntologyRefs } from '@/pages/ontologyScene/modules/functionDetail/services/fetchSceneOntologyContext';
import {
  buildSceneQueryStrategyHints,
  ONTOLOGY_RUNTIME_API_GUIDE,
  QUERY_STRATEGY_GUIDE,
  SCENE_CODEGEN_GUIDE,
  truncateSceneContext
} from '@/pages/ontologyScene/modules/functionDetail/services/sceneFunctionCodegenGuide';
import { fetchSceneObjectTypeQueryProfiles } from '@/pages/ontologyScene/modules/functionDetail/services/fetchSceneOntologyContext';
import { sanitizeOntologyFunctionRuntimeApi } from '@/pages/ontologyScene/modules/functionDetail/services/sanitizeOntologyFunctionRuntimeApi';
import type { SceneObjectTypeQueryProfiles } from '@/pages/ontologyScene/modules/functionDetail/services/sceneObjectTypeQueryProfiles';
import {
  buildFunctionContentFromBody,
  buildPythonFunctionScript
} from '@/pages/ontologyScene/modules/functionDetail/utils';
import {
  OntologyFunctionParam,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { ONTOLOGY_FUNCTION_CODEGEN_SCENARIO } from '@/services/llmScenarios/definitions/ontologyFunctionCodegen.scenario';

const PARAM_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const VALID_PARAM_TYPES = new Set<string>(Object.values(ParamType));

const PARAM_TYPE_TO_UI: Record<string, UiType> = {
  [ParamType.String]: UiType.Input,
  [ParamType.Integer]: UiType.InputNumber,
  [ParamType.Float]: UiType.InputNumberFloat,
  [ParamType.Boolean]: UiType.Switch,
  [ParamType.Date]: UiType.Date,
  [ParamType.Timestamp]: UiType.Timestamp,
  [ParamType.Geopoint]: UiType.Geopoint,
  [ParamType.ObjectOne]: UiType.ObjectOne,
  [ParamType.ObjectSet]: UiType.ObjectSet,
  [ParamType.Attachment]: UiType.Uploader
};

const SYSTEM_PROMPT = `你是本体函数开发助手。根据函数描述说明与当前本体场景库结构生成 Python 函数实现。不要参考任何 SDK 开发文档。
生成前必须先根据场景库中的对象类型、属性、链接关系，选择最优查询方式（见查询策略约定），再编写代码。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"input":[{"name":"参数名","type":"String"}],"output":[{"name":"变量名","type":"Float"}],"body":"函数体 Python 代码（不含 def 与 return）"}
要求：
1. input/output 的 name 仅字母、数字、下划线，且不以数字开头
2. type 取值：String、Integer、Float、Boolean、Date、Timestamp、Geopoint、ObjectRef、ObjectSet、Attachment
3. body 为函数体逻辑，不含 def 签名与 return 语句；使用相对缩进（顶层语句从第 0 列开始，for/if/while 块内语句比块头多缩进 4 空格），平台会自动添加函数级 4 空格缩进
4. output 变量须在 body 中赋值，return 由平台根据 output 自动生成
5. 入参类型与业务语义匹配；出参覆盖描述中需要返回的结果
6. 代码简洁可运行，添加必要注释说明所选查询策略与关键步骤
7. 查询、遍历对象或链接时，必须且只能引用场景库中已有的对象类型 code、属性名与链接类型
8. ObjectRef/ObjectSet 类型入参应对应场景中真实的对象类型 code
9. for/if/while 等块语句后必须有正确缩进的代码块，不可留空块
10. 查询/列表/统计必须使用 client.service.query_objects，payload 含 ontology_object_type_code 与 select（场景库属性英文名），禁止 ObjectRef.Type（会触发 metadata 报错）
11. 遍历查询结果用 row.get("propertyName")，propertyName 来自场景库属性英文名，且须在 select 中声明
12. where 仅用 op/left/right 结构；模糊/LIKE/多字段 OR 禁止写入 where，须在 Python 中对 rows 行字典过滤
13. 仅处理「给定/传入」实例时，才生成 ObjectRef/ObjectSet 入参；禁止 ObjectSet.Type`;

export interface GeneratedOntologyFunctionCode {
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  content: string;
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

const normalizeParamType = (raw: unknown): ParamType | null => {
  const value = String(raw ?? '').trim();
  if (!VALID_PARAM_TYPES.has(value)) {
    return null;
  }
  return value as ParamType;
};

const toInputParam = (
  raw: unknown,
  index: number
): OntologyFunctionParam | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = String(record.name ?? `arg${index + 1}`).trim();
  const type = normalizeParamType(record.type) ?? ParamType.String;
  if (!PARAM_NAME_PATTERN.test(name)) {
    return null;
  }
  const uiType = PARAM_TYPE_TO_UI[type] ?? UiType.Input;
  return {
    name,
    uiTypeAndValue: {
      uiType: `${type}_${uiType}`
    }
  };
};

const toOutputParam = (
  raw: unknown,
  index: number
): OntologyFunctionParam | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = String(record.name ?? `var_${index + 1}`).trim();
  const type = normalizeParamType(record.type) ?? ParamType.String;
  if (!PARAM_NAME_PATTERN.test(name)) {
    return null;
  }
  return { name, type };
};

const sanitizeGeneratedFunction = (
  raw: unknown
): {
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  body: string;
} | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const inputRaw = record.input;
  const outputRaw = record.output;
  const body = String(record.body ?? '').trim();

  if (!body) {
    return null;
  }

  const input = Array.isArray(inputRaw)
    ? (inputRaw
        .map((item, index) => toInputParam(item, index))
        .filter(Boolean) as OntologyFunctionParam[])
    : [];

  const output = Array.isArray(outputRaw)
    ? (outputRaw
        .map((item, index) => toOutputParam(item, index))
        .filter(Boolean) as OntologyFunctionParam[])
    : [];

  if (!input.length || !output.length) {
    return null;
  }

  return { input, output, body };
};

const generateWithLlm = async (params: {
  name: string;
  code: string;
  description: string;
  sceneContext: string;
  queryStrategyHints: string;
  queryProfiles: SceneObjectTypeQueryProfiles;
  signal?: AbortSignal;
}): Promise<GeneratedOntologyFunctionCode> => {
  const llmConfig = resolveScenarioLlmConfig(
    ONTOLOGY_FUNCTION_CODEGEN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const userText = [
    `函数显示名称：${params.name.trim() || '（未填写）'}`,
    `函数名称(id)：${params.code.trim()}`,
    `描述说明（要实现的能力）：${params.description.trim()}`,
    '',
    ONTOLOGY_RUNTIME_API_GUIDE,
    '',
    QUERY_STRATEGY_GUIDE,
    '',
    params.queryStrategyHints,
    '',
    SCENE_CODEGEN_GUIDE,
    '',
    '--- 当前场景库本体结构（对象类型、属性、链接，代码生成的唯一本体依据） ---',
    truncateSceneContext(params.sceneContext)
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

  const parsed = extractJsonFromLlmContent(content);
  const sanitized = sanitizeGeneratedFunction(parsed);
  if (!sanitized) {
    throw new Error('大模型返回的函数结构无效');
  }

  const draftContent = buildFunctionContentFromBody({
    code: params.code,
    input: sanitized.input,
    output: sanitized.output,
    body: sanitized.body
  });

  let finalContent = buildPythonFunctionScript({
    code: params.code,
    input: sanitized.input,
    output: sanitized.output,
    content: draftContent
  });

  const runtimeSanitized = sanitizeOntologyFunctionRuntimeApi(finalContent, {
    queryProfiles: params.queryProfiles
  });
  finalContent = runtimeSanitized.content;

  return {
    input: sanitized.input,
    output: sanitized.output,
    content: finalContent
  };
};

/**
 * 根据描述说明与当前场景库本体结构智能生成函数代码（入参、出参与 Python 脚本）。
 * 按场景库对象类型、属性与链接关系选择最优查询方式，不依赖 SDK 文档。
 */
export const generateOntologyFunctionCode = async (params: {
  name?: string;
  code: string;
  description: string;
  sceneId: number;
  signal?: AbortSignal;
}): Promise<GeneratedOntologyFunctionCode> => {
  const code = params.code?.trim();
  const description = params.description?.trim();

  if (!code) {
    throw new Error('请先填写函数名称(id)');
  }
  if (!description) {
    throw new Error('请先填写描述说明');
  }

  if (!isScenarioLlmAvailable(ONTOLOGY_FUNCTION_CODEGEN_SCENARIO.code)) {
    throw new Error('请先在模型管理中配置并启用「函数代码智能生成」大模型环节');
  }

  const [sceneRefs, queryProfiles] = await Promise.all([
    fetchSceneOntologyRefs(params.sceneId),
    fetchSceneObjectTypeQueryProfiles(params.sceneId)
  ]);

  return generateWithLlm({
    name: params.name ?? '',
    code,
    description,
    sceneContext: sceneRefs.contextText,
    queryStrategyHints: buildSceneQueryStrategyHints(sceneRefs, description),
    queryProfiles,
    signal: params.signal
  });
};
