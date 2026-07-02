export interface StripQueryObjectsWhereResult {
  content: string;
  changed: boolean;
  notes: string[];
}

/**
 * 在测试路径下，彻底移除所有 query_objects 相关的 where 条件。
 * 因为 dataset where 支持不可用（即使合法 op/left/right 也会 1064），
 * 测试必须完全靠前端 Python 代码实现过滤。
 *
 * 这个函数使用状态机 + 括号计数，正确处理嵌套对象和字符串中的 {}。
 */
export const stripQueryObjectsWhere = (
  source: string
): StripQueryObjectsWhereResult => {
  if (!source?.trim()) {
    return { content: source, changed: false, notes: [] };
  }

  // 只要函数里用到了 query_objects，就激进地移除所有 "where" 键
  if (!/query_objects/i.test(source)) {
    return { content: source, changed: false, notes: [] };
  }

  const notes: string[] = [];
  let changed = false;

  const result: string[] = [];
  let i = 0;
  const len = source.length;

  const isIdentifierChar = (ch: string) => /[a-zA-Z0-9_$]/.test(ch);

  while (i < len) {
    // 寻找下一个 "where" 或 'where'
    const doubleQuoteIdx = source.indexOf('"where"', i);
    const singleQuoteIdx = source.indexOf("'where'", i);
    let whereIdx = -1;
    let quote = '';

    if (
      doubleQuoteIdx !== -1 &&
      (singleQuoteIdx === -1 || doubleQuoteIdx < singleQuoteIdx)
    ) {
      whereIdx = doubleQuoteIdx;
      quote = '"';
    } else if (singleQuoteIdx !== -1) {
      whereIdx = singleQuoteIdx;
      quote = "'";
    }

    if (whereIdx === -1) {
      result.push(source.slice(i));
      break;
    }

    // 检查前面是否是独立的 key（前面是 { 或 , 或 空白）
    const before = source.slice(Math.max(0, whereIdx - 20), whereIdx);
    if (!/[{,\s]$/.test(before) && before.trim() !== '') {
      // 可能是字符串里的 "where"，跳过
      result.push(source.slice(i, whereIdx + 7));
      i = whereIdx + 7;
      continue;
    }

    // 找到 : 的位置
    let j = whereIdx + 7; // 跳过 where
    while (j < len && /\s/.test(source[j])) j++;
    if (source[j] !== ':') {
      result.push(source.slice(i, whereIdx + 7));
      i = whereIdx + 7;
      continue;
    }
    j++; // 跳过 :
    while (j < len && /\s/.test(source[j])) j++;

    // 必须是 { 开始
    if (source[j] !== '{') {
      result.push(source.slice(i, j));
      i = j;
      continue;
    }

    // 用括号计数找到匹配的 }
    let depth = 0;
    let k = j;
    let inString = false;
    let stringChar = '';
    let escape = false;

    while (k < len) {
      const ch = source[k];
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (inString) {
        if (ch === stringChar) {
          inString = false;
        }
      } else if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          break;
        }
      }
      k++;
    }

    if (depth !== 0) {
      // 没找到匹配的 }，放弃
      result.push(source.slice(i, j));
      i = j;
      continue;
    }

    // 删除从 "where" 到匹配的 }（包含可能的尾随逗号）
    let end = k + 1;
    while (end < len && /[\s,]/.test(source[end])) end++;

    result.push(source.slice(i, whereIdx));
    changed = true;
    i = end;
  }

  if (!changed) {
    return { content: source, changed: false, notes };
  }

  let finalContent = result.join('');
  finalContent = finalContent
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\}/g, '}')
    .replace(/\{\s*,/g, '{')
    .replace(/\[\s*,/g, '[')
    .replace(/,\s*\]/g, ']');

  notes.push(
    '测试路径：已彻底移除 query_objects 中的 where（后端 where 不可用），改用 Python 行过滤'
  );

  return { content: finalContent, changed: true, notes };
};
