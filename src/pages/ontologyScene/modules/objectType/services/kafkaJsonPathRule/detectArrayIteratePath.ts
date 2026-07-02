import { parseJsonSample } from './evaluateJsonPath';

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Canal CDC 等场景：检测消息中用于逐条解析的数组路径 */
export function detectArrayIteratePath(sampleRaw?: string): string | undefined {
  if (!sampleRaw?.trim()) {
    return undefined;
  }

  try {
    const sample = parseJsonSample(sampleRaw);
    if (!isRecord(sample)) {
      return undefined;
    }

    const data = sample.data;
    if (Array.isArray(data) && data.length > 0 && isRecord(data[0])) {
      return '$.data';
    }
  } catch {
    return undefined;
  }

  return undefined;
}
