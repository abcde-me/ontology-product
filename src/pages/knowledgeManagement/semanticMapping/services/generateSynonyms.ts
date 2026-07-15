/**
 * 根据标准术语、映射描述智能生成同义词/别名。
 * 优先大模型；不可用或失败时使用本地规则回退。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { SEMANTIC_MAPPING_SYNONYM_GEN_SCENARIO } from '@/services/llmScenarios/definitions/semanticMappingSynonymGen.scenario';

export type SynonymGenerateSource = 'llm' | 'local';

export interface GenerateSynonymsInput {
  standardTerm: string;
  description?: string;
  /** 已有同义词，生成结果会与之合并去重 */
  existingSynonyms?: string[];
  signal?: AbortSignal;
}

export interface GenerateSynonymsResult {
  synonyms: string[];
  source: SynonymGenerateSource;
}

const MAX_SYNONYMS = 12;

const SYSTEM_PROMPT = `你是本体语义映射助手。根据标准术语与映射描述，生成同义词与别名。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"synonyms":["别名1","别名2"]}
规则：
1. 生成 3～8 个同义词/别名，简明、贴合业务，可用于检索与语义对齐
2. 不要重复标准术语本身；不要生成无意义缩写或过长短语（一般 2～12 字）
3. 优先提取描述中的别称、惯用说法、简称、全称及领域内常见叫法
4. 结合术语本身的业务语境补充惯用别名，避免无关词
5. 全部使用中文或业界通用中英文缩写，去重后输出`;

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

const normalizeCandidate = (
  value: string,
  standardTerm: string
): string | null => {
  const trimmed = value
    .trim()
    .replace(
      /^[\s"'「」『』【】（()）\[\]]+|[\s"'「」『』【】（()）\[\]]+$/g,
      ''
    )
    .replace(/\s+/g, '');
  if (!trimmed) {
    return null;
  }
  if (trimmed === standardTerm) {
    return null;
  }
  if (trimmed.length < 2 || trimmed.length > 24) {
    return null;
  }
  return trimmed;
};

const uniqSynonyms = (candidates: string[], standardTerm: string): string[] => {
  const seen = new Set<string>();
  const normalizedTerm = standardTerm.trim();
  if (normalizedTerm) {
    seen.add(normalizedTerm);
  }
  const result: string[] = [];

  candidates.forEach((item) => {
    const normalized = normalizeCandidate(item, standardTerm);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  });

  return result.slice(0, MAX_SYNONYMS);
};

const extractMarkedAliases = (description: string): string[] => {
  const patterns = [
    /(?:又称|也叫|亦称|别称|别名|俗称|简称|全称|也称|又名)[为是:：\s]*([^\s，,；;。、/|]+)/g,
    /[（(](?:又称|也叫|别名|简称)[为是:：\s]*([^）)]+)[）)]/g
  ];
  const result: string[] = [];

  patterns.forEach((pattern) => {
    let match = pattern.exec(description);
    while (match) {
      const chunk = match[1] || '';
      chunk
        .split(/[、,/|及和与]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => result.push(item));
      match = pattern.exec(description);
    }
  });

  return result;
};

const extractDescriptionPhrases = (description: string): string[] => {
  return description
    .split(/[，,；;。！？!?\n/|、]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 16)
    .filter(
      (item) => !/^(用于|用于描述|说明|本映射|该术语|是指|指的是)/.test(item)
    );
};

const QUALIFIER_PREFIXES = [
  '主战',
  '新型',
  '轻型',
  '重型',
  '大型',
  '小型',
  '标准',
  '通用',
  '专用',
  '主要',
  '核心',
  '关键',
  '应急'
];

const generateLocalSynonyms = (input: {
  standardTerm: string;
  description?: string;
}): string[] => {
  const term = input.standardTerm.trim();
  const description = input.description?.trim() || '';
  const candidates: string[] = [];

  if (description) {
    candidates.push(...extractMarkedAliases(description));
    candidates.push(...extractDescriptionPhrases(description));
  }

  QUALIFIER_PREFIXES.forEach((prefix) => {
    if (term.startsWith(prefix) && term.length > prefix.length + 1) {
      candidates.push(term.slice(prefix.length));
    }
  });

  // 中英夹杂时提取英文片段
  const latinChunks = term.match(/[A-Za-z][A-Za-z0-9\-_/]{1,20}/g);
  if (latinChunks) {
    candidates.push(...latinChunks);
  }

  if (description) {
    const latinInDesc = description.match(/[A-Za-z][A-Za-z0-9\-_/]{1,20}/g);
    if (latinInDesc) {
      candidates.push(...latinInDesc);
    }
  }

  return uniqSynonyms(candidates, term);
};

const sanitizeLlmSynonyms = (
  parsed: unknown,
  standardTerm: string
): string[] | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const synonyms = (parsed as { synonyms?: unknown }).synonyms;
  if (!Array.isArray(synonyms)) {
    return null;
  }
  const values = synonyms
    .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
    .filter(Boolean);
  const normalized = uniqSynonyms(values, standardTerm);
  return normalized.length ? normalized : null;
};

const generateWithLlm = async (
  input: GenerateSynonymsInput
): Promise<string[]> => {
  const llmConfig = resolveScenarioLlmConfig(
    SEMANTIC_MAPPING_SYNONYM_GEN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const userText = [
    `标准术语：${input.standardTerm.trim()}`,
    `映射描述：${input.description?.trim() || '（未填写）'}`
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
    signal: input.signal
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
  const sanitized = sanitizeLlmSynonyms(parsed, input.standardTerm.trim());
  if (!sanitized?.length) {
    throw new Error('大模型返回的同义词格式无效');
  }

  return sanitized;
};

export const generateSemanticMappingSynonyms = async (
  input: GenerateSynonymsInput
): Promise<GenerateSynonymsResult> => {
  const standardTerm = input.standardTerm.trim();
  if (!standardTerm) {
    throw new Error('请先填写标准术语');
  }

  const existing = input.existingSynonyms || [];

  if (isScenarioLlmAvailable(SEMANTIC_MAPPING_SYNONYM_GEN_SCENARIO.code)) {
    try {
      const llmSynonyms = await generateWithLlm(input);
      return {
        synonyms: uniqSynonyms([...existing, ...llmSynonyms], standardTerm),
        source: 'llm'
      };
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn(
        '[SemanticMapping] 大模型生成同义词失败，使用本地规则',
        error
      );
    }
  }

  const localSynonyms = generateLocalSynonyms({
    standardTerm,
    description: input.description
  });

  const merged = uniqSynonyms([...existing, ...localSynonyms], standardTerm);
  if (!merged.length) {
    throw new Error('未能根据现有信息生成同义词，请补充映射描述后重试');
  }

  return { synonyms: merged, source: 'local' };
};
