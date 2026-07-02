import { resolveKafkaFieldValue } from './applyKafkaJsonPathRule';
import {
  evaluateJsonPath,
  evaluateJsonPathFirst,
  parseJsonSample
} from './evaluateJsonPath';
import type { ManualPathMappingRow } from './manualPathRule';
import type { KafkaFieldMappingRule } from './types';

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ManualPathPreviewStatus =
  | 'empty'
  | 'success'
  | 'default'
  | 'no_match'
  | 'error';

export interface ManualPathFieldPreview {
  status: ManualPathPreviewStatus;
  display: string;
  fullDisplay: string;
  fullValue?: unknown;
  error?: string;
}

function parseDefaultValue(raw?: string): unknown {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function resolvePreviewSource(
  sample: JsonValue,
  arrayIteratePath?: string
): JsonValue {
  if (arrayIteratePath?.trim()) {
    const matches = evaluateJsonPath(sample, arrayIteratePath.trim());
    if (!matches.length) {
      throw new Error(`数组遍历路径未匹配: ${arrayIteratePath}`);
    }
    return matches[0];
  }

  if (Array.isArray(sample)) {
    const firstObject = sample.find(
      (item) =>
        typeof item === 'object' && item !== null && !Array.isArray(item)
    );
    if (firstObject) {
      return firstObject;
    }
    throw new Error('样本数组中至少需要一条 JSON 对象');
  }

  return sample;
}

function formatPreviewValue(value: unknown): string {
  if (value === undefined) {
    return '—';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function truncatePreview(text: string, maxLength = 48): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}

export function previewManualPathFieldValue(
  sampleRaw: string,
  row: ManualPathMappingRow,
  arrayIteratePath?: string
): ManualPathFieldPreview {
  const jsonpath = row.jsonpath.trim();
  if (!jsonpath) {
    return {
      status: 'empty',
      display: '—',
      fullDisplay: '—'
    };
  }

  if (!sampleRaw.trim()) {
    return {
      status: 'empty',
      display: '需样本',
      fullDisplay: '请先读取或粘贴原始数据样本'
    };
  }

  try {
    const sample = parseJsonSample(sampleRaw);
    const source = resolvePreviewSource(sample, arrayIteratePath);
    const mapping: KafkaFieldMappingRule = {
      jsonpath,
      default_value: parseDefaultValue(row.defaultValue)
    };

    const matches = evaluateJsonPath(source, jsonpath);
    const value = resolveKafkaFieldValue(source, mapping);
    const fullDisplay = formatPreviewValue(value);

    if (!matches.length) {
      if (mapping.default_value !== undefined) {
        return {
          status: 'default',
          display: truncatePreview(fullDisplay),
          fullDisplay: `未匹配，使用默认值：${fullDisplay}`,
          fullValue: value
        };
      }
      return {
        status: 'no_match',
        display: '未匹配',
        fullDisplay: '路径未匹配到样本数据',
        fullValue: undefined
      };
    }

    return {
      status: 'success',
      display: truncatePreview(fullDisplay),
      fullDisplay,
      fullValue: value
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      display: '解析失败',
      fullDisplay: message,
      error: message
    };
  }
}

export function previewArrayIteratePath(
  sampleRaw: string,
  arrayIteratePath?: string
): ManualPathFieldPreview {
  const path = arrayIteratePath?.trim();
  if (!path) {
    return {
      status: 'empty',
      display: '—',
      fullDisplay: '—'
    };
  }

  if (!sampleRaw.trim()) {
    return {
      status: 'empty',
      display: '需样本',
      fullDisplay: '请先读取或粘贴原始数据样本'
    };
  }

  try {
    const sample = parseJsonSample(sampleRaw);
    const matches = evaluateJsonPath(sample, path);
    if (!matches.length) {
      return {
        status: 'no_match',
        display: '未匹配',
        fullDisplay: '路径未匹配到样本数据'
      };
    }
    return {
      status: 'success',
      display: `匹配 ${matches.length} 条`,
      fullDisplay: `匹配 ${matches.length} 条记录，预览使用第 1 条`,
      fullValue: matches[0]
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      display: '解析失败',
      fullDisplay: message,
      error: message
    };
  }
}
