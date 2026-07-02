import {
  normalizeNodeForPropertyAccess,
  tryParseEmbeddedJson
} from './embeddedJsonPath';

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

function readIdentifier(
  path: string,
  start: number
): { name: string; end: number } {
  const match = path.slice(start).match(/^@?([a-zA-Z_][\w$]*)/);
  if (!match) {
    throw new Error(`JSONPath 标识符解析失败: ${path}`);
  }
  return { name: match[1], end: start + match[0].length };
}

function readBracket(
  path: string,
  start: number
): {
  type: 'index' | 'wildcard' | 'key';
  index?: number;
  key?: string;
  end: number;
} {
  if (path[start] !== '[') {
    throw new Error(`JSONPath 括号解析失败: ${path}`);
  }

  if (path[start + 1] === '*') {
    if (path[start + 2] !== ']') {
      throw new Error(`JSONPath 通配符解析失败: ${path}`);
    }
    return { type: 'wildcard', end: start + 3 };
  }

  const quote = path[start + 1];
  if (quote === "'" || quote === '"') {
    let cursor = start + 2;
    let key = '';
    while (cursor < path.length) {
      const ch = path[cursor];
      if (ch === '\\' && cursor + 1 < path.length) {
        key += path[cursor + 1];
        cursor += 2;
        continue;
      }
      if (ch === quote) {
        if (path[cursor + 1] !== ']') {
          throw new Error(`JSONPath 字符串下标解析失败: ${path}`);
        }
        return { type: 'key', key, end: cursor + 2 };
      }
      key += ch;
      cursor += 1;
    }
    throw new Error(`JSONPath 字符串下标未闭合: ${path}`);
  }

  const closeIndex = path.indexOf(']', start + 1);
  if (closeIndex < 0) {
    throw new Error(`JSONPath 下标未闭合: ${path}`);
  }
  const raw = path.slice(start + 1, closeIndex).trim();
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`JSONPath 下标非法: ${raw}`);
  }
  return { type: 'index', index, end: closeIndex + 1 };
}

function getChild(nodes: JsonValue[], key: string): JsonValue[] {
  const result: JsonValue[] = [];
  nodes.forEach((node) => {
    const normalized = normalizeNodeForPropertyAccess(node) ?? node;
    if (isRecord(normalized) && key in normalized) {
      result.push(normalized[key]);
    }
  });
  return result;
}

function getIndex(nodes: JsonValue[], index: number): JsonValue[] {
  const result: JsonValue[] = [];
  nodes.forEach((node) => {
    const normalized = normalizeNodeForPropertyAccess(node) ?? node;
    if (Array.isArray(normalized) && index < normalized.length) {
      result.push(normalized[index]);
    }
  });
  return result;
}

function getWildcard(nodes: JsonValue[]): JsonValue[] {
  const result: JsonValue[] = [];
  nodes.forEach((node) => {
    if (Array.isArray(node)) {
      result.push(...node);
    }
  });
  return result;
}

/**
 * 评估 JSONPath（子集，对齐 yaml-jsonpath 常用语法：$.a.b、a[0]、a[*]、['a']）
 */
export function evaluateJsonPath(
  root: JsonValue,
  expression: string
): JsonValue[] {
  const path = expression.trim();
  if (!path.startsWith('$')) {
    throw new Error(`JSONPath 必须以 $ 开头: ${expression}`);
  }

  let nodes: JsonValue[] = [root];
  let cursor = 1;

  while (cursor < path.length) {
    const current = path[cursor];

    if (current === '.') {
      cursor += 1;
      if (path[cursor] === '.') {
        throw new Error(`暂不支持递归下降 JSONPath: ${expression}`);
      }
      const { name, end } = readIdentifier(path, cursor);
      nodes = getChild(nodes, name);
      cursor = end;
      continue;
    }

    if (current === '[') {
      const bracket = readBracket(path, cursor);
      if (bracket.type === 'index') {
        nodes = getIndex(nodes, bracket.index!);
      } else if (bracket.type === 'wildcard') {
        nodes = getWildcard(nodes);
      } else {
        nodes = getChild(nodes, bracket.key!);
      }
      cursor = bracket.end;
      continue;
    }

    throw new Error(`无法解析 JSONPath: ${expression}`);
  }

  return nodes.map((node) => {
    const parsed = tryParseEmbeddedJson(node);
    return parsed === undefined ? node : parsed;
  });
}

export function evaluateJsonPathFirst(
  root: JsonValue,
  expression: string
): JsonValue | undefined {
  const matches = evaluateJsonPath(root, expression);
  return matches.length > 0 ? matches[0] : undefined;
}

export function parseJsonSample(raw: string): JsonValue {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('测试样本不能为空');
  }
  return JSON.parse(trimmed) as JsonValue;
}
