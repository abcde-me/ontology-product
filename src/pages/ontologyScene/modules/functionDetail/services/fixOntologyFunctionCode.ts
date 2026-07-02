import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  diagnoseFunctionRunError,
  rewriteInvalidObjectTypeCodes
} from '@/pages/ontologyScene/modules/functionDetail/services/diagnoseFunctionRunError';
import { sanitizeOntologyFunctionRuntimeApi } from '@/pages/ontologyScene/modules/functionDetail/services/sanitizeOntologyFunctionRuntimeApi';
import {
  fetchSceneObjectTypeQueryProfiles,
  fetchSceneOntologyRefs
} from '@/pages/ontologyScene/modules/functionDetail/services/fetchSceneOntologyContext';
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
import {
  ONTOLOGY_RUNTIME_API_GUIDE,
  SCENE_CODEGEN_GUIDE,
  truncateSceneContext
} from '@/pages/ontologyScene/modules/functionDetail/services/sceneFunctionCodegenGuide';

const PARAM_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MAX_CONTENT_CHARS = 12000;
const MAX_ERROR_CHARS = 8000;

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

const SYSTEM_PROMPT = `你是本体函数调试助手。根据函数运行报错信息、当前函数代码与当前本体场景库结构，修复 Python 函数实现。不要参考任何 SDK 开发文档，仅以场景库本体信息与报错诊断为准。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"input":[{"name":"参数名","type":"String"}],"output":[{"name":"变量名","type":"Float"}],"body":"修复后的函数体 Python 代码（不含 def 与 return）","changeSummary":"一句话概括修改内容","changeDetails":"逐条说明修改了什么、为什么这样改"}
要求：
1. 针对报错信息进行最小必要修改，保持与原函数业务意图一致
2. input/output 须输出完整列表；若某参数无需修改，保持与当前一致
3. body 为函数体逻辑，不含 def 签名与 return 语句；使用相对缩进（顶层语句从第 0 列开始，for/if/while 块内语句比块头多缩进 4 空格），平台会自动添加函数级 4 空格缩进
4. output 变量须在 body 中赋值
5. changeSummary 用中文一句话说明修复要点
6. changeDetails 用中文编号列表，逐条说明：改了什么、为何这样改、与报错的对应关系
7. 查询、遍历对象或链接时，必须且只能引用场景库中已有的对象类型 code、属性名与链接类型
8. for/if/while 等块语句后必须有正确缩进的代码块，不可留空块
9. 若报错含「Failed to resolve metadata」「资源不存在」，说明 ObjectRef.Type("xxx") 的 xxx 无效；必须改用报错诊断中的白名单 code 或建议映射，禁止保留原无效 code
10. 若入参已是 ObjectRef/ObjectSet 类型，直接使用入参变量，不要 ObjectRef.Type() 重复声明对象类型
11. ObjectRef.Type("xxx") 的 xxx 必须与场景白名单中的 code 完全一致，禁止擅自替换或编造 code
12. metadata 报错（Failed to resolve metadata）：将 ObjectRef.Type 改为 client.service.query_objects；禁止 ObjectRef.Type；禁止 ObjectSet.Type 与 .query()
13. SQL 语法报错（near "FROM" / Error 1064）：query_objects payload 缺少 select，须补全 select 列表，name 为场景库属性英文名
14. dataset Query HTTP 500 且 where 含 type/or/conditions/operator：删除非法 where，改为 Python 行字典过滤；合法 where 仅 op/left/right
15. Error 1064 且 near ""（FROM 后表名为空）：对象类型实例未同步到 dataset，代码无需改 where/select，提示用户先实例同步`;

export interface FixedOntologyFunctionCode {
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  content: string;
  changeSummary: string;
  changeDetails: string;
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

const mergeInputParams = (
  fixed: OntologyFunctionParam[],
  original: OntologyFunctionParam[]
): OntologyFunctionParam[] => {
  return fixed.map((param, index) => {
    const originalParam =
      original.find((item) => item.name === param.name) ?? original[index];
    return {
      ...param,
      uiTypeAndValue: {
        ...param.uiTypeAndValue,
        paramValue: originalParam?.uiTypeAndValue?.paramValue,
        uiType:
          param.uiTypeAndValue?.uiType ?? originalParam?.uiTypeAndValue?.uiType
      }
    };
  });
};

const sanitizeFixedFunction = (
  raw: unknown,
  functionCode: string,
  original: {
    input: OntologyFunctionParam[];
    output: OntologyFunctionParam[];
  }
): {
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  body: string;
  changeSummary: string;
  changeDetails: string;
} | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const inputRaw = record.input;
  const outputRaw = record.output;
  const body = String(record.body ?? '').trim();
  const changeSummary = String(record.changeSummary ?? '').trim();
  const changeDetails = String(record.changeDetails ?? '').trim();

  if (!body || !changeSummary || !changeDetails) {
    return null;
  }

  const input = Array.isArray(inputRaw)
    ? (inputRaw
        .map((item, index) => toInputParam(item, index))
        .filter(Boolean) as OntologyFunctionParam[])
    : original.input;

  const output = Array.isArray(outputRaw)
    ? (outputRaw
        .map((item, index) => toOutputParam(item, index))
        .filter(Boolean) as OntologyFunctionParam[])
    : original.output;

  if (!input.length || !output.length) {
    return null;
  }

  return {
    input: mergeInputParams(input, original.input),
    output,
    body,
    changeSummary,
    changeDetails
  };
};

const truncateText = (text: string, maxChars: number, hint: string): string => {
  const normalized = text.trim() || '（无）';
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}\n\n...(${hint})`;
};

const formatParamsForPrompt = (params: OntologyFunctionParam[]): string => {
  if (!params.length) {
    return '（无）';
  }

  return params
    .map((param) => {
      const type =
        param.type ||
        String(param.uiTypeAndValue?.uiType || '').split('_')[0] ||
        'String';
      const objectTypeData = param.uiTypeAndValue?.paramValue?.objectTypeData;
      if (objectTypeData?.code) {
        return `- ${param.name}（type: ${type}，绑定对象类型 code: ${objectTypeData.code}，名称: ${objectTypeData.name || objectTypeData.code}）`;
      }
      return `- ${param.name}（type: ${type}）`;
    })
    .join('\n');
};

const fixWithLlm = async (params: {
  name: string;
  code: string;
  description: string;
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  content: string;
  errorLog: string;
  sceneContext: string;
  errorDiagnosis: string;
  codeSuggestions: ReturnType<typeof diagnoseFunctionRunError>['suggestions'];
  queryProfiles: SceneObjectTypeQueryProfiles;
  signal?: AbortSignal;
}): Promise<FixedOntologyFunctionCode> => {
  const llmConfig = resolveScenarioLlmConfig(
    ONTOLOGY_FUNCTION_CODEGEN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const userText = [
    `函数显示名称：${params.name.trim() || '（未填写）'}`,
    `函数名称(id)：${params.code.trim()}`,
    `描述说明：${params.description.trim() || '（未填写）'}`,
    '',
    '--- 当前入参 ---',
    formatParamsForPrompt(params.input),
    '',
    '--- 当前出参 ---',
    formatParamsForPrompt(params.output),
    '',
    '--- 当前函数代码 ---',
    truncateText(params.content, MAX_CONTENT_CHARS, '代码已截断'),
    '',
    '--- 运行报错信息 ---',
    truncateText(params.errorLog, MAX_ERROR_CHARS, '报错信息已截断'),
    '',
    params.errorDiagnosis,
    '',
    ONTOLOGY_RUNTIME_API_GUIDE,
    '',
    SCENE_CODEGEN_GUIDE,
    '',
    '--- 当前场景库本体结构（对象类型、属性、链接，代码修复的唯一本体依据） ---',
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
  const sanitized = sanitizeFixedFunction(parsed, params.code, {
    input: params.input,
    output: params.output
  });
  if (!sanitized) {
    throw new Error('大模型返回的修复结果无效');
  }

  const { content: rewrittenBody, replacements: bodyReplacements } =
    rewriteInvalidObjectTypeCodes(sanitized.body, params.codeSuggestions);

  const draftContent = buildFunctionContentFromBody({
    code: params.code,
    input: sanitized.input,
    output: sanitized.output,
    body: rewrittenBody
  });

  let finalContent = buildPythonFunctionScript({
    code: params.code,
    input: sanitized.input,
    output: sanitized.output,
    content: draftContent
  });

  const { content: rewrittenContent, replacements: contentReplacements } =
    rewriteInvalidObjectTypeCodes(finalContent, params.codeSuggestions);
  finalContent = rewrittenContent;

  const runtimeSanitized = sanitizeOntologyFunctionRuntimeApi(finalContent, {
    queryProfiles: params.queryProfiles
  });
  finalContent = runtimeSanitized.content;

  const autoFixNotes = [
    ...bodyReplacements,
    ...contentReplacements,
    ...runtimeSanitized.notes
  ];
  const changeDetails = autoFixNotes.length
    ? `${sanitized.changeDetails}\n\n【系统自动校正】\n${autoFixNotes.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
    : sanitized.changeDetails;

  return {
    input: sanitized.input,
    output: sanitized.output,
    content: finalContent,
    changeSummary: sanitized.changeSummary,
    changeDetails
  };
};

/**
 * 根据运行报错信息智能修复函数代码，并返回修改说明。
 */
export const fixOntologyFunctionCode = async (params: {
  name?: string;
  code: string;
  description?: string;
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
  content: string;
  errorLog: string;
  sceneId: number;
  signal?: AbortSignal;
}): Promise<FixedOntologyFunctionCode> => {
  const code = params.code?.trim();
  const errorLog = params.errorLog?.trim();
  const content = params.content?.trim();

  if (!code) {
    throw new Error('请先填写函数名称(id)');
  }
  if (!content) {
    throw new Error('函数代码为空，无法修复');
  }
  if (!errorLog) {
    throw new Error('暂无运行报错信息');
  }
  if (!params.input?.length || !params.output?.length) {
    throw new Error('请先配置函数的入参与出参');
  }

  if (!isScenarioLlmAvailable(ONTOLOGY_FUNCTION_CODEGEN_SCENARIO.code)) {
    throw new Error('请先在模型管理中配置并启用「函数代码智能生成」大模型环节');
  }

  const [sceneRefs, queryProfiles] = await Promise.all([
    fetchSceneOntologyRefs(params.sceneId),
    fetchSceneObjectTypeQueryProfiles(params.sceneId)
  ]);
  const diagnosis = diagnoseFunctionRunError({
    errorLog,
    content,
    input: params.input,
    objectTypes: sceneRefs.objectTypes,
    links: sceneRefs.links
  });

  const fixed = await fixWithLlm({
    name: params.name ?? '',
    code,
    description: params.description ?? '',
    input: params.input,
    output: params.output,
    content,
    errorLog,
    sceneContext: sceneRefs.contextText,
    errorDiagnosis: diagnosis.text,
    codeSuggestions: diagnosis.suggestions,
    queryProfiles,
    signal: params.signal
  });

  return fixed;
};
