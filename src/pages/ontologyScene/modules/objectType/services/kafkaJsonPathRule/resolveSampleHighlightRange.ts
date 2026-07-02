import type { FormattedParseResultRow } from './formatKafkaParseResult';
import type { KafkaFieldMappingRule } from './types';

export interface SampleHighlightRange {
  start: number;
  end: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findTrimmedBounds(raw: string): { start: number; end: number } {
  const start = raw.search(/\S/);
  if (start === -1) {
    return { start: 0, end: 0 };
  }
  let end = raw.length;
  while (end > start && /\s/.test(raw[end - 1])) {
    end -= 1;
  }
  return { start, end };
}

function findJsonValueEnd(text: string, valueStart: number): number {
  const rest = text.slice(valueStart).trimStart();
  const offset = text.slice(valueStart).length - rest.length;
  const start = valueStart + offset;
  const first = rest[0];

  if (first === '"') {
    let index = 1;
    while (index < rest.length) {
      if (rest[index] === '\\') {
        index += 2;
        continue;
      }
      if (rest[index] === '"') {
        return start + index + 1;
      }
      index += 1;
    }
    return start + rest.length;
  }

  if (first === '{' || first === '[') {
    let depth = 0;
    let inString = false;
    for (let index = 0; index < rest.length; index += 1) {
      const char = rest[index];
      if (inString) {
        if (char === '\\') {
          index += 1;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === '{' || char === '[') {
        depth += 1;
      } else if (char === '}' || char === ']') {
        depth -= 1;
        if (depth === 0) {
          return start + index + 1;
        }
      }
    }
    return start + rest.length;
  }

  const terminator = rest.search(/[,}\]\n]/);
  if (terminator === -1) {
    return start + rest.length;
  }
  return start + terminator;
}

function findFieldRangeInText(
  text: string,
  fieldKeys: string[]
): SampleHighlightRange | null {
  for (const key of fieldKeys) {
    if (!key?.trim()) {
      continue;
    }
    const pattern = new RegExp(`"${escapeRegExp(key)}"\\s*:\\s*`);
    const match = pattern.exec(text);
    if (!match) {
      continue;
    }
    const start = match.index;
    const end = findJsonValueEnd(text, start + match[0].length);
    return { start, end };
  }
  return null;
}

function findValueRangeInText(
  text: string,
  valueText?: string
): SampleHighlightRange | null {
  if (!valueText?.trim() || valueText === '-') {
    return null;
  }

  const candidates = [valueText.trim()];
  try {
    const parsed = JSON.parse(valueText);
    candidates.push(JSON.stringify(parsed));
    candidates.push(JSON.stringify(parsed, null, 2));
  } catch {
    // ignore
  }

  for (const candidate of candidates) {
    const index = text.indexOf(candidate);
    if (index !== -1) {
      return { start: index, end: index + candidate.length };
    }
  }

  return null;
}

function collectFieldKeys(
  row: FormattedParseResultRow,
  ruleFieldMapping?: Record<string, KafkaFieldMappingRule>
): string[] {
  const keys = new Set<string>();
  keys.add(row.name);

  const mappingRule = ruleFieldMapping?.[row.name];
  if (mappingRule?.jsonpath) {
    const segments = mappingRule.jsonpath
      .replace(/^\$\.?/, '')
      .split('.')
      .filter(Boolean);
    segments.forEach((segment) => keys.add(segment));
  }

  if (ruleFieldMapping) {
    Object.entries(ruleFieldMapping).forEach(([fieldName, rule]) => {
      if (fieldName === row.name && rule.jsonpath) {
        const segments = rule.jsonpath
          .replace(/^\$\.?/, '')
          .split('.')
          .filter(Boolean);
        segments.forEach((segment) => keys.add(segment));
      }
    });
  }

  return Array.from(keys);
}

function locateSampleBlock(
  sampleText: string,
  recordIndex: number
): { start: number; end: number; content: string } | null {
  const { start: trimStart, end: trimEnd } = findTrimmedBounds(sampleText);
  const trimmed = sampleText.slice(trimStart, trimEnd);
  if (!trimmed) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      start: trimStart,
      end: trimEnd,
      content: trimmed
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      start: trimStart,
      end: trimEnd,
      content: trimmed
    };
  }

  const sampleIndex = recordIndex - 1;
  if (sampleIndex < 0 || sampleIndex >= parsed.length) {
    return null;
  }

  const target = parsed[sampleIndex];
  const formatCandidates = [
    JSON.stringify(target, null, 2),
    JSON.stringify(target)
  ];

  for (const formatted of formatCandidates) {
    const relativeIndex = trimmed.indexOf(formatted);
    if (relativeIndex !== -1) {
      return {
        start: trimStart + relativeIndex,
        end: trimStart + relativeIndex + formatted.length,
        content: formatted
      };
    }
  }

  const fallbackKeys = ['_sample_index', 'device_id', 'event_id', 'id'];
  for (const key of fallbackKeys) {
    const value = (target as Record<string, unknown>)?.[key];
    if (value === undefined || value === null) {
      continue;
    }
    const token = `"${key}": ${JSON.stringify(value)}`;
    const relativeIndex = trimmed.indexOf(token);
    if (relativeIndex !== -1) {
      const blockStart = trimmed.lastIndexOf('{', relativeIndex);
      const blockEnd = trimmed.indexOf('}', relativeIndex);
      if (blockStart !== -1 && blockEnd !== -1) {
        return {
          start: trimStart + blockStart,
          end: trimStart + blockEnd + 1,
          content: trimmed.slice(blockStart, blockEnd + 1)
        };
      }
    }
  }

  return {
    start: trimStart,
    end: trimEnd,
    content: trimmed
  };
}

function extractJsonPathSegments(jsonpath: string): string[] {
  return jsonpath
    .trim()
    .replace(/^\$\.?/, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\['([^']+)'\]/g, '.$1')
    .replace(/\["([^"]+)"\]/g, '.$1')
    .split('.')
    .map((segment) => segment.replace(/\[.*$/, '').trim())
    .filter(Boolean);
}

/** 根据 JSONPath 在样本文本中定位高亮区域，用于路径配置时辅助对照 */
export function resolveJsonPathHighlightRange(
  sampleText: string,
  jsonpath: string
): SampleHighlightRange | null {
  if (!sampleText.trim() || !jsonpath.trim()) {
    return null;
  }

  const segments = extractJsonPathSegments(jsonpath);
  if (!segments.length) {
    return null;
  }

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const range = findFieldRangeInText(sampleText, [segments[index]]);
    if (range) {
      return range;
    }
  }

  return null;
}

export function resolveSampleHighlightRange(
  sampleText: string,
  row: FormattedParseResultRow,
  ruleFieldMapping?: Record<string, KafkaFieldMappingRule>
): SampleHighlightRange | null {
  if (!sampleText.trim()) {
    return null;
  }

  const sampleBlock = locateSampleBlock(sampleText, row.recordIndex);
  if (!sampleBlock) {
    return null;
  }

  const fieldKeys = collectFieldKeys(row, ruleFieldMapping);
  const fieldRange = findFieldRangeInText(sampleBlock.content, fieldKeys);
  if (fieldRange) {
    return {
      start: sampleBlock.start + fieldRange.start,
      end: sampleBlock.start + fieldRange.end
    };
  }

  const valueRange = findValueRangeInText(sampleBlock.content, row.valueText);
  if (valueRange) {
    return {
      start: sampleBlock.start + valueRange.start,
      end: sampleBlock.start + valueRange.end
    };
  }

  return {
    start: sampleBlock.start,
    end: sampleBlock.end
  };
}
