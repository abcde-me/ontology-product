import { evaluateJsonPath, parseJsonSample } from './evaluateJsonPath';
import type { KafkaFieldMappingRule, KafkaJsonPathParseRule } from './types';

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export function tryParseEmbeddedJson(value: unknown): JsonValue | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return undefined;
  }
  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch {
    return undefined;
  }
}

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeNodeForPropertyAccess(
  node: JsonValue
): JsonValue | undefined {
  if (isRecord(node) || Array.isArray(node)) {
    return node;
  }
  if (typeof node === 'string') {
    return tryParseEmbeddedJson(node);
  }
  return undefined;
}

export type JsonPathSegment =
  | { type: 'key'; name: string }
  | { type: 'index'; index: number };

export function parseJsonPathSegments(expression: string): JsonPathSegment[] {
  const path = expression.trim();
  if (!path.startsWith('$')) {
    throw new Error(`JSONPath 必须以 $ 开头: ${expression}`);
  }

  const segments: JsonPathSegment[] = [];
  let cursor = 1;

  while (cursor < path.length) {
    const current = path[cursor];

    if (current === '.') {
      cursor += 1;
      if (path[cursor] === '.') {
        throw new Error(`暂不支持递归下降 JSONPath: ${expression}`);
      }
      const match = path.slice(cursor).match(/^@?([a-zA-Z_][\w$]*)/);
      if (!match) {
        throw new Error(`JSONPath 标识符解析失败: ${path}`);
      }
      segments.push({ type: 'key', name: match[1] });
      cursor += match[0].length;
      continue;
    }

    if (current === '[') {
      if (path[cursor + 1] === '*') {
        throw new Error(`暂不支持 JSONPath 通配符: ${expression}`);
      }

      const quote = path[cursor + 1];
      if (quote === "'" || quote === '"') {
        let innerCursor = cursor + 2;
        let key = '';
        while (innerCursor < path.length) {
          const ch = path[innerCursor];
          if (ch === '\\' && innerCursor + 1 < path.length) {
            key += path[innerCursor + 1];
            innerCursor += 2;
            continue;
          }
          if (ch === quote) {
            if (path[innerCursor + 1] !== ']') {
              throw new Error(`JSONPath 字符串下标解析失败: ${path}`);
            }
            segments.push({ type: 'key', name: key });
            cursor = innerCursor + 2;
            break;
          }
          key += ch;
          innerCursor += 1;
        }
        continue;
      }

      const closeIndex = path.indexOf(']', cursor + 1);
      if (closeIndex < 0) {
        throw new Error(`JSONPath 下标未闭合: ${path}`);
      }
      const raw = path.slice(cursor + 1, closeIndex).trim();
      const index = Number(raw);
      if (!Number.isInteger(index) || index < 0) {
        throw new Error(`JSONPath 下标非法: ${raw}`);
      }
      segments.push({ type: 'index', index });
      cursor = closeIndex + 1;
      continue;
    }

    throw new Error(`无法解析 JSONPath: ${expression}`);
  }

  return segments;
}

function getSegmentValue(
  node: JsonValue,
  segment: JsonPathSegment
): JsonValue | undefined {
  const normalized = normalizeNodeForPropertyAccess(node) ?? node;

  if (segment.type === 'key') {
    if (isRecord(normalized) && segment.name in normalized) {
      return normalized[segment.name];
    }
    return undefined;
  }

  if (Array.isArray(normalized) && segment.index < normalized.length) {
    return normalized[segment.index];
  }

  return undefined;
}

function buildPathFromSegments(
  segments: JsonPathSegment[],
  withRoot = true
): string {
  let path = withRoot ? '$' : '';
  segments.forEach((segment) => {
    if (segment.type === 'key') {
      path += `.${segment.name}`;
    } else {
      path += `[${segment.index}]`;
    }
  });
  return path;
}

export function expandMappingToUiPath(mapping: {
  jsonpath: string;
  need_deserialize?: boolean;
  inner_jsonpath?: string;
}): string {
  const base = mapping.jsonpath.trim();
  if (!mapping.need_deserialize) {
    return base;
  }

  const inner = mapping.inner_jsonpath?.trim();
  if (!inner || inner === '$') {
    return base;
  }

  if (inner.startsWith('$.')) {
    return `${base}${inner.slice(1)}`;
  }
  if (inner.startsWith('$[')) {
    return `${base}${inner.slice(1)}`;
  }
  if (inner.startsWith('$')) {
    return `${base}.${inner.slice(1)}`;
  }
  return `${base}.${inner}`;
}

export function compileUiPathToStorageMapping(
  uiPath: string,
  source: JsonValue
): {
  jsonpath: string;
  need_deserialize?: boolean;
  inner_jsonpath?: string;
} {
  const path = uiPath.trim();
  if (!path.startsWith('$')) {
    return { jsonpath: path };
  }

  let segments: JsonPathSegment[];
  try {
    segments = parseJsonPathSegments(path);
  } catch {
    return { jsonpath: path };
  }

  if (!segments.length) {
    return { jsonpath: path };
  }

  let current: JsonValue = source;
  const walkedSegments: JsonPathSegment[] = [];

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const value = getSegmentValue(current, segment);
    if (value === undefined) {
      return { jsonpath: path };
    }

    walkedSegments.push(segment);
    const hasMore = index < segments.length - 1;
    const embedded = tryParseEmbeddedJson(value);

    if (embedded !== undefined && typeof value === 'string') {
      if (hasMore) {
        return {
          jsonpath: buildPathFromSegments(walkedSegments),
          need_deserialize: true,
          inner_jsonpath: buildPathFromSegments(segments.slice(index + 1))
        };
      }
      return {
        jsonpath: buildPathFromSegments(walkedSegments),
        need_deserialize: true
      };
    }

    current = value;
  }

  return { jsonpath: path };
}

export function resolveRuleCompileSource(
  sampleRaw: string,
  arrayIteratePath?: string
): JsonValue | undefined {
  if (!sampleRaw.trim()) {
    return undefined;
  }

  try {
    const sample = parseJsonSample(sampleRaw);
    if (arrayIteratePath?.trim()) {
      const matches = evaluateJsonPath(sample, arrayIteratePath.trim());
      return matches[0];
    }

    if (Array.isArray(sample)) {
      const firstObject = sample.find(
        (item): item is Record<string, JsonValue> => isRecord(item)
      );
      return firstObject ?? sample;
    }

    return sample;
  } catch {
    return undefined;
  }
}

export function normalizeRuleForStorage(
  rule: KafkaJsonPathParseRule,
  sampleRaw: string
): KafkaJsonPathParseRule {
  const compileSource = resolveRuleCompileSource(
    sampleRaw,
    rule.array_iterate_path
  );
  if (!compileSource) {
    return rule;
  }

  const fieldMapping: Record<string, KafkaFieldMappingRule> = {};
  Object.entries(rule.field_mapping).forEach(([fieldName, mapping]) => {
    const uiPath = expandMappingToUiPath(mapping);
    const compiled = compileUiPathToStorageMapping(uiPath, compileSource);
    fieldMapping[fieldName] = {
      ...compiled,
      ...(mapping.comment ? { comment: mapping.comment } : {}),
      ...('default_value' in mapping
        ? { default_value: mapping.default_value }
        : {})
    };
  });

  return {
    ...rule,
    field_mapping: fieldMapping
  };
}
