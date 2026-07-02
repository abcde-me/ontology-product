import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT,
  resolveKafkaAiRulePrompt
} from '@/pages/ontologyScene/common/constants';
import { KAFKA_JSONPATH_RULE_GEN_SCENARIO } from '@/services/llmScenarios/definitions/kafkaJsonPathRuleGen.scenario';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { normalizeRuleForStorage } from './embeddedJsonPath';
import { detectArrayIteratePath } from './detectArrayIteratePath';
import { parseJsonSample } from './evaluateJsonPath';
import type { KafkaFieldMappingRule, KafkaJsonPathParseRule } from './types';

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type KafkaJsonPathRuleSource = 'llm' | 'heuristic';

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const SAMPLE_META_KEYS = new Set(['_sample_index']);

function resolveSampleObject(sample: JsonValue): Record<string, JsonValue> {
  if (isRecord(sample)) {
    return sample;
  }

  if (Array.isArray(sample)) {
    const firstObject = sample.find((item): item is Record<string, JsonValue> =>
      isRecord(item)
    );
    if (firstObject) {
      return firstObject;
    }
    throw new Error('样本数组中至少需要一条 JSON 对象');
  }

  throw new Error('样本根节点必须是 JSON 对象或对象数组');
}

function looksLikeEmbeddedJson(value: JsonValue): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function buildMappingsFromObject(
  obj: Record<string, JsonValue>,
  prefix = '$'
): Record<string, KafkaFieldMappingRule> {
  const mapping: Record<string, KafkaFieldMappingRule> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (SAMPLE_META_KEYS.has(key)) {
      return;
    }

    if (looksLikeEmbeddedJson(value)) {
      try {
        const parsed = JSON.parse(String(value).trim()) as JsonValue;
        if (isRecord(parsed)) {
          Object.entries(parsed).forEach(([innerKey]) => {
            mapping[innerKey] = {
              jsonpath: `${prefix}.${key}.${innerKey}`
            };
          });
          return;
        }
      } catch {
        // fall through
      }
    }

    mapping[key] = { jsonpath: `${prefix}.${key}` };
  });
  return mapping;
}

function generateHeuristicRule(sampleRaw: string): KafkaJsonPathParseRule {
  const sample = parseJsonSample(sampleRaw);
  const sampleObject = resolveSampleObject(sample);

  const arrayIteratePath = detectArrayIteratePath(sampleRaw);
  if (arrayIteratePath) {
    const firstItem = (sampleObject.data as JsonValue[])[0];
    if (!isRecord(firstItem)) {
      throw new Error('Canal CDC data 数组元素必须是对象');
    }
    return {
      engine: 'yaml-jsonpath',
      array_iterate_path: arrayIteratePath,
      field_mapping: buildMappingsFromObject(firstItem, '$')
    };
  }

  return {
    engine: 'yaml-jsonpath',
    field_mapping: buildMappingsFromObject(sampleObject)
  };
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

function sanitizeLlmRule(parsed: unknown): KafkaJsonPathParseRule | null {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const fieldMapping = record.field_mapping;
  if (!fieldMapping || typeof fieldMapping !== 'object') {
    return null;
  }

  const sanitizedMapping: Record<string, KafkaFieldMappingRule> = {};
  Object.entries(fieldMapping as Record<string, unknown>).forEach(
    ([fieldName, rawMapping]) => {
      const name = fieldName.trim();
      if (!name || !rawMapping || typeof rawMapping !== 'object') {
        return;
      }

      const mapping = rawMapping as Record<string, unknown>;
      const jsonpath = String(mapping.jsonpath || '').trim();
      if (!jsonpath.startsWith('$')) {
        return;
      }

      const sanitized: KafkaFieldMappingRule = { jsonpath };
      const comment = String(mapping.comment || '').trim();
      if (comment) {
        sanitized.comment = comment;
      }
      if (mapping.need_deserialize === true) {
        sanitized.need_deserialize = true;
        const innerJsonpath = String(mapping.inner_jsonpath || '').trim();
        if (innerJsonpath) {
          sanitized.inner_jsonpath = innerJsonpath;
        }
      }
      if ('default_value' in mapping) {
        sanitized.default_value = mapping.default_value;
      }
      sanitizedMapping[name] = sanitized;
    }
  );

  if (!Object.keys(sanitizedMapping).length) {
    return null;
  }

  const rule: KafkaJsonPathParseRule = {
    engine: 'yaml-jsonpath',
    field_mapping: sanitizedMapping
  };

  const arrayIteratePath = String(record.array_iterate_path || '').trim();
  if (arrayIteratePath) {
    rule.array_iterate_path = arrayIteratePath;
  }

  return rule;
}

const generateWithLlm = async (
  sampleRaw: string,
  prompt: string,
  signal?: AbortSignal
): Promise<KafkaJsonPathParseRule> => {
  const llmConfig = resolveScenarioLlmConfig(
    KAFKA_JSONPATH_RULE_GEN_SCENARIO.code
  );
  if (!llmConfig?.apiKey?.trim()) {
    throw new Error('未配置大模型 API Key');
  }

  const { apiKey, model } = llmConfig;
  const url = resolveDirectLlmRequestUrl();
  const systemPrompt = `${resolveKafkaAiRulePrompt(prompt)}

输出固定 JSON 格式，不要 markdown 或其它说明。JSONPath 使用多层级路径（如 $.payload.temperature），字符串内嵌 JSON 也直接写完整路径，不要使用 need_deserialize。结构示例：
{
  "engine": "yaml-jsonpath",
  "array_iterate_path": "$.data",
  "field_mapping": {
    "temperature": {
      "jsonpath": "$.payload.temperature",
      "comment": "温度",
      "default_value": null
    }
  }
}`;

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        '请根据以下原始 JSON 样本生成 JSONPath 解析规则：',
        sampleRaw.trim()
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
  const rule = sanitizeLlmRule(parsed);
  if (!rule) {
    throw new Error('大模型返回的规则格式无效');
  }

  return rule;
};

/**
 * 根据样本 JSON 生成 yaml-jsonpath 兼容规则（优先大模型，失败时回退启发式规则）
 */
export async function generateKafkaJsonPathRule(input: {
  sampleRaw: string;
  prompt?: string;
  signal?: AbortSignal;
}): Promise<{
  rule: KafkaJsonPathParseRule;
  source: KafkaJsonPathRuleSource;
}> {
  const sampleRaw = input.sampleRaw.trim();
  if (!sampleRaw) {
    throw new Error('原始 JSON 样本不能为空');
  }

  const prompt =
    input.prompt?.trim() || DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT;

  if (isScenarioLlmAvailable(KAFKA_JSONPATH_RULE_GEN_SCENARIO.code)) {
    try {
      const rule = normalizeRuleForStorage(
        await generateWithLlm(sampleRaw, prompt, input.signal),
        sampleRaw
      );
      return { rule, source: 'llm' };
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn(
        '[Kafka] 大模型生成 JSONPath 规则失败，使用启发式规则',
        error
      );
    }
  }

  return {
    rule: normalizeRuleForStorage(generateHeuristicRule(sampleRaw), sampleRaw),
    source: 'heuristic'
  };
}
