import {
  KAFKA_ARRAY_HANDLE_MODE,
  KafkaArrayHandleMode
} from '@/pages/ontologyScene/common/constants';
import {
  evaluateJsonPath,
  evaluateJsonPathFirst,
  parseJsonSample
} from './evaluateJsonPath';
import { tryParseEmbeddedJson } from './embeddedJsonPath';
import type {
  ApplyKafkaJsonPathRuleOptions,
  ApplyKafkaJsonPathRuleResult,
  KafkaFieldMappingRule,
  KafkaJsonPathParseRule
} from './types';

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function tryParseEmbeddedJsonValue(value: unknown): JsonValue | undefined {
  return tryParseEmbeddedJson(value);
}

function resolveFieldValue(
  source: JsonValue,
  mapping: KafkaFieldMappingRule
): unknown {
  if (mapping.need_deserialize) {
    const matched = evaluateJsonPathFirst(source, mapping.jsonpath);
    if (matched === undefined) {
      return mapping.default_value ?? null;
    }

    const parsed = tryParseEmbeddedJsonValue(matched);
    if (parsed === undefined) {
      return matched;
    }
    if (mapping.inner_jsonpath?.trim()) {
      const inner = evaluateJsonPathFirst(
        parsed,
        mapping.inner_jsonpath.trim()
      );
      return inner === undefined ? (mapping.default_value ?? null) : inner;
    }
    return parsed;
  }

  const matched = evaluateJsonPathFirst(source, mapping.jsonpath);
  if (matched === undefined) {
    return mapping.default_value ?? null;
  }
  return matched;
}

export function resolveKafkaFieldValue(
  source: JsonValue,
  mapping: KafkaFieldMappingRule
): unknown {
  return resolveFieldValue(source, mapping);
}

function applyMappingToSource(
  source: JsonValue,
  rule: KafkaJsonPathParseRule
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  Object.entries(rule.field_mapping).forEach(([fieldName, mapping]) => {
    record[fieldName] = resolveFieldValue(source, mapping);
  });
  return record;
}

function flattenArrayField(
  fieldName: string,
  value: unknown
): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};
  if (!Array.isArray(value)) {
    flattened[fieldName] = value;
    return flattened;
  }
  value.forEach((item, index) => {
    flattened[`${fieldName}_${index}`] = item;
  });
  return flattened;
}

function applyArrayHandleMode(
  record: Record<string, unknown>,
  arrayHandleMode?: KafkaArrayHandleMode
): Record<string, unknown> {
  if (arrayHandleMode !== KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN) {
    return record;
  }

  return Object.entries(record).reduce<Record<string, unknown>>(
    (acc, [fieldName, value]) => {
      Object.assign(acc, flattenArrayField(fieldName, value));
      return acc;
    },
    {}
  );
}

export function parseKafkaJsonPathRule(raw: string): KafkaJsonPathParseRule {
  const parsed = JSON.parse(raw.trim()) as KafkaJsonPathParseRule;
  if (!parsed?.field_mapping || typeof parsed.field_mapping !== 'object') {
    throw new Error('规则缺少 field_mapping');
  }
  return parsed;
}

export function formatKafkaJsonPathRule(rule: KafkaJsonPathParseRule): string {
  return JSON.stringify(
    {
      engine: 'yaml-jsonpath',
      ...rule
    },
    null,
    2
  );
}

export function applyKafkaJsonPathRule(
  sampleRaw: string,
  ruleRaw: string,
  options: ApplyKafkaJsonPathRuleOptions = {}
): ApplyKafkaJsonPathRuleResult {
  const errors: string[] = [];

  try {
    const sample = parseJsonSample(sampleRaw);
    const rule = parseKafkaJsonPathRule(ruleRaw);
    const arrayHandleMode = options.arrayHandleMode as
      | KafkaArrayHandleMode
      | undefined;

    if (rule.array_iterate_path?.trim()) {
      const iterateMatches = evaluateJsonPath(
        sample,
        rule.array_iterate_path.trim()
      );
      if (!iterateMatches.length) {
        return {
          records: [],
          errors: [`未匹配到数组路径: ${rule.array_iterate_path}`]
        };
      }

      const records = iterateMatches.flatMap((item, index) => {
        try {
          return [
            applyArrayHandleMode(
              applyMappingToSource(item, rule),
              arrayHandleMode
            )
          ];
        } catch (error) {
          errors.push(
            `第 ${index + 1} 条记录解析失败: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          return [];
        }
      });

      return { records, errors };
    }

    const record = applyArrayHandleMode(
      applyMappingToSource(sample, rule),
      arrayHandleMode
    );
    return { records: [record], errors };
  } catch (error) {
    return {
      records: [],
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}
