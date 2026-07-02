import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import type { OntologyFunctionItem } from '@/pages/ontologyScene/types/ontologyFunction';
import {
  ensureUniqueFunctionCode,
  generateLocalFunctionCode,
  isValidFunctionCode,
  isValidFunctionNamingFormat,
  sanitizeFunctionCode
} from '@/utils/generateOntologyFunctionCodeName';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { ONTOLOGY_FUNCTION_NAME_GEN_SCENARIO } from '@/services/llmScenarios/definitions/ontologyFunctionNameGen.scenario';

const SYSTEM_PROMPT = `你是本体函数命名助手。根据函数的显示名称，生成唯一的函数 id（code）。
命名格式：fn_{4位小写字母或数字}_{英文关键词}
规则：
1. 仅允许英文字母、数字、下划线，总长 2～100 字符
2. 必须以 fn_ 开头，紧跟 4 位仅含 0-9、a-z 的随机后缀，再跟下划线与英文关键词
3. 英文关键词应概括显示名称的核心含义，小写，多个词用下划线连接，避免无意义缩写
4. 不可与已有函数名称重复
5. 显示名称为中文时，关键词使用对应英文语义（如「关联推理」→ infer_relation），不要拼音
仅输出合法 JSON，不要 markdown 或其它说明。结构：{"code":"fn_a1b2_example_keyword"}`;

export type FunctionCodeNameSource = 'llm' | 'local';

export interface GenerateOntologyFunctionCodeNameResult {
  code: string;
  source: FunctionCodeNameSource;
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

const sanitizeLlmFunctionCode = (parsed: unknown): string | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const rawCode = (parsed as { code?: unknown }).code;
  if (typeof rawCode !== 'string' || !rawCode.trim()) {
    return null;
  }

  const sanitized = sanitizeFunctionCode(rawCode);
  if (
    !isValidFunctionCode(sanitized) ||
    !isValidFunctionNamingFormat(sanitized)
  ) {
    return null;
  }

  return sanitized;
};

const generateWithLlm = async (
  displayName: string,
  existingCodes: string[],
  signal?: AbortSignal
): Promise<string> => {
  const llmConfig = resolveScenarioLlmConfig(
    ONTOLOGY_FUNCTION_NAME_GEN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const existingHint =
    existingCodes.length > 0
      ? existingCodes.slice(0, 50).join('、')
      : '（暂无）';

  const userText = [
    `显示名称：${displayName.trim()}`,
    `已有函数名称（不可重复）：${existingHint}`
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
  const sanitized = sanitizeLlmFunctionCode(parsed);
  if (!sanitized) {
    throw new Error('大模型返回的函数名称格式无效');
  }

  return ensureUniqueFunctionCode(sanitized, existingCodes);
};

/** 获取场景内已有函数 code 列表 */
export const fetchSceneFunctionCodes = async (
  ontologyModelID: number
): Promise<string[]> => {
  const res = await getFunctionList({
    ontologyModelID,
    pageNum: 1,
    pageSize: -1
  }).catch(() => ({ items: [] as { code?: string }[], total: 0 }));

  const codes = ((res.items || []) as OntologyFunctionItem[])
    .map((item) => item.code?.trim())
    .filter((code): code is string => Boolean(code));

  return [...new Set(codes)];
};

/**
 * 根据显示名称生成函数名称(id)。
 * 优先调用大模型；不可用时使用本地规则回退。
 */
export const generateOntologyFunctionCodeName = async (params: {
  displayName: string;
  existingCodes?: string[];
  signal?: AbortSignal;
}): Promise<GenerateOntologyFunctionCodeNameResult> => {
  const displayName = params.displayName?.trim();
  if (!displayName) {
    throw new Error('请先填写显示名称');
  }

  const existingCodes = params.existingCodes ?? [];

  if (isScenarioLlmAvailable(ONTOLOGY_FUNCTION_NAME_GEN_SCENARIO.code)) {
    try {
      const code = await generateWithLlm(
        displayName,
        existingCodes,
        params.signal
      );
      return { code, source: 'llm' };
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn('[Function] 大模型生成函数名称失败，使用本地规则', error);
    }
  }

  return {
    code: generateLocalFunctionCode(displayName, existingCodes),
    source: 'local'
  };
};
