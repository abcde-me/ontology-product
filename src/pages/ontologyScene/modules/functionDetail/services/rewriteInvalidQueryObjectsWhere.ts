export interface RewriteInvalidQueryObjectsWhereResult {
  content: string;
  changed: boolean;
  notes: string[];
}

interface ParsedCondition {
  column: string;
  operator: string;
  value: string;
}

/** LLM 易生成的非法 where（dataset Query 会 500） */
const INVALID_WHERE_BLOCK =
  /"where"\s*:\s*\{\s*"type"\s*:\s*"(or|and)"\s*,\s*"conditions"\s*:\s*\[([\s\S]*?)\]\s*\}\s*,?/gi;

const CONDITION_ITEM =
  /\{\s*"type"\s*:\s*"condition"\s*,\s*"column"\s*:\s*"([^"]+)"\s*,\s*"operator"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,\}\s]+)/gi;

const ROWS_FROM_QUERY_DATA = /^(\s*)(\w+)\s*=\s*_query_data\.get\([^\n]+/m;

const unquotePythonString = (raw: string): string => {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseConditions = (conditionsSource: string): ParsedCondition[] => {
  const conditions: ParsedCondition[] = [];
  let match: RegExpExecArray | null;
  const pattern = new RegExp(CONDITION_ITEM.source, CONDITION_ITEM.flags);
  while ((match = pattern.exec(conditionsSource)) !== null) {
    conditions.push({
      column: match[1],
      operator: match[2],
      value: unquotePythonString(match[3])
    });
  }
  return conditions;
};

const buildRowPredicate = (condition: ParsedCondition): string => {
  const column = condition.column;
  const value = condition.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  if (condition.operator === '=' || condition.operator === 'eq') {
    return `str(row.get("${column}") or "") == "${value}"`;
  }
  return `"${value}" in str(row.get("${column}") or "")`;
};

const buildRowsFilterBlock = (
  indent: string,
  rowsVar: string,
  combinator: 'or' | 'and',
  conditions: ParsedCondition[]
): string => {
  const predicates = conditions.map(buildRowPredicate);
  const joiner = combinator === 'or' ? ' or ' : ' and ';
  const predicate =
    predicates.length === 1
      ? predicates[0]
      : predicates.map((item) => `(${item})`).join(joiner);

  return [
    `${indent}${rowsVar} = [`,
    `${indent}    row for row in ${rowsVar}`,
    `${indent}    if ${predicate}`,
    `${indent}]`
  ].join('\n');
};

const findRowsVarAfterQuery = (
  content: string
): { indent: string; rowsVar: string } | null => {
  const match = content.match(ROWS_FROM_QUERY_DATA);
  if (!match) {
    return null;
  }
  return { indent: match[1], rowsVar: match[2] };
};

/**
 * 移除 query_objects payload 中非法 where，并改为 Python 行字典过滤。
 * 合法 where 须为 {"op":"=","left":{"type":"column","name":"..."},"right":{"type":"value","value":...}}。
 */
export const rewriteInvalidQueryObjectsWhere = (
  source: string
): RewriteInvalidQueryObjectsWhereResult => {
  if (!source?.trim()) {
    return { content: source, changed: false, notes: [] };
  }

  if (!INVALID_WHERE_BLOCK.test(source)) {
    return { content: source, changed: false, notes: [] };
  }

  INVALID_WHERE_BLOCK.lastIndex = 0;

  const notes: string[] = [];
  let content = source;
  let changed = false;
  let lastCombinator: 'or' | 'and' = 'or';
  let lastConditions: ParsedCondition[] = [];

  content = content.replace(
    INVALID_WHERE_BLOCK,
    (_match, combinator: 'or' | 'and', conditionsSource: string) => {
      lastCombinator = combinator;
      lastConditions = parseConditions(conditionsSource);
      changed = true;
      notes.push(
        `移除非法 where（type/${combinator}/conditions），dataset 仅支持 op/left/right 结构`
      );
      return '';
    }
  );

  if (!changed) {
    return { content: source, changed: false, notes: [] };
  }

  content = content
    .replace(/\{\s*,/g, '{')
    .replace(/,\s*\}/g, '}')
    .replace(/,\s*,/g, ',');

  if (lastConditions.length) {
    const rowsTarget = findRowsVarAfterQuery(content);
    if (rowsTarget) {
      const filterBlock = buildRowsFilterBlock(
        rowsTarget.indent,
        rowsTarget.rowsVar,
        lastCombinator,
        lastConditions
      );
      const rowsLinePattern = new RegExp(
        `^${escapeRegExp(rowsTarget.indent)}${escapeRegExp(rowsTarget.rowsVar)}\\s*=\\s*_query_data\\.get\\([^\\n]+`,
        'm'
      );
      content = content.replace(
        rowsLinePattern,
        (line) => `${line}\n${filterBlock}`
      );
      notes.push(
        `已在 Python 中对 ${rowsTarget.rowsVar} 应用原 where 筛选条件`
      );
    } else {
      notes.push(
        '已移除非法 where，请在 query_objects 结果行列表上自行用 Python 筛选'
      );
    }
  }

  return { content, changed, notes };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const containsInvalidQueryObjectsWhere = (source: string): boolean => {
  const pattern = new RegExp(
    INVALID_WHERE_BLOCK.source,
    INVALID_WHERE_BLOCK.flags
  );
  return pattern.test(source);
};
