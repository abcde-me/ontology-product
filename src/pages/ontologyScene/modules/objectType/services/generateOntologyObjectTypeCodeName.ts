import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { fetchSceneObjectTypeCodes } from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';
import {
  ensureUniqueObjectTypeCode,
  generateLocalObjectTypeCode,
  isValidObjectTypeCode,
  isValidObjectTypeNamingFormat,
  sanitizeObjectTypeCode
} from '@/utils/generateOntologyObjectTypeCodeName';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { OBJECT_TYPE_ID_GEN_SCENARIO } from '@/services/llmScenarios/definitions/objectTypeIdGen.scenario';

const SYSTEM_PROMPT = `你是本体对象类型命名助手。根据对象类型名称，生成唯一的对象类型 id（code）。
命名格式：ob_{英文关键词}_{4位随机字符}
规则：
1. 必须以 ob_ 开头，中间为英文关键词，末尾为 4 位仅含 0-9、a-z 的随机后缀，三段之间用下划线连接
2. 英文关键词应概括对象类型名称的核心含义，小写，多个词用下划线连接，避免无意义缩写
3. 名称为中文时，关键词使用对应英文语义（如「传感器」→ sensor，「温度传感器」→ temp_sensor），不要拼音
4. 仅允许英文字母、数字、下划线，总长 2～100 字符
5. 不可与已有对象类型 id 重复
仅输出合法 JSON，不要 markdown 或其它说明。结构：{"code":"ob_sensor_a1b2"}`;

export type ObjectTypeCodeNameSource = 'llm' | 'local';

export interface GenerateOntologyObjectTypeCodeNameResult {
  code: string;
  source: ObjectTypeCodeNameSource;
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

const sanitizeLlmObjectTypeCode = (parsed: unknown): string | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const rawCode = (parsed as { code?: unknown }).code;
  if (typeof rawCode !== 'string' || !rawCode.trim()) {
    return null;
  }

  const sanitized = sanitizeObjectTypeCode(rawCode);
  if (
    !isValidObjectTypeCode(sanitized) ||
    !isValidObjectTypeNamingFormat(sanitized)
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
  const llmConfig = resolveScenarioLlmConfig(OBJECT_TYPE_ID_GEN_SCENARIO.code);
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const existingHint =
    existingCodes.length > 0
      ? existingCodes.slice(0, 50).join('、')
      : '（暂无）';

  const userText = [
    `对象类型名称：${displayName.trim()}`,
    `已有对象类型 id（不可重复）：${existingHint}`
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
  const sanitized = sanitizeLlmObjectTypeCode(parsed);
  if (!sanitized) {
    throw new Error('大模型返回的对象类型 id 格式无效');
  }

  return ensureUniqueObjectTypeCode(sanitized, existingCodes);
};

/**
 * 根据对象类型名称生成对象类型 id。
 * 优先调用大模型；不可用时使用本地规则回退。
 */
export const generateOntologyObjectTypeCodeName = async (params: {
  displayName: string;
  existingCodes?: string[];
  signal?: AbortSignal;
}): Promise<GenerateOntologyObjectTypeCodeNameResult> => {
  const displayName = params.displayName?.trim();
  if (!displayName) {
    throw new Error('请先填写对象类型名称');
  }

  const existingCodes = params.existingCodes ?? [];

  if (isScenarioLlmAvailable(OBJECT_TYPE_ID_GEN_SCENARIO.code)) {
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
      console.warn(
        '[ObjectType] 大模型生成对象类型 id 失败，使用本地规则',
        error
      );
    }
  }

  return {
    code: generateLocalObjectTypeCode(displayName, existingCodes),
    source: 'local'
  };
};

export { fetchSceneObjectTypeCodes };
