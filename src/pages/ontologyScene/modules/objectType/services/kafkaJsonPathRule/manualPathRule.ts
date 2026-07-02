import {
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from './applyKafkaJsonPathRule';
import { detectArrayIteratePath } from './detectArrayIteratePath';
import {
  compileUiPathToStorageMapping,
  expandMappingToUiPath,
  resolveRuleCompileSource
} from './embeddedJsonPath';
import type { KafkaFieldMappingRule, KafkaJsonPathParseRule } from './types';

export interface ManualPathMappingRow {
  key: string;
  fieldName: string;
  jsonpath: string;
  comment?: string;
  defaultValue?: string;
}

function createRowKey(): string {
  return `path-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyManualPathRow(
  partial?: Partial<ManualPathMappingRow>
): ManualPathMappingRow {
  return {
    key: partial?.key || createRowKey(),
    fieldName: partial?.fieldName || '',
    jsonpath: partial?.jsonpath || '',
    comment: partial?.comment || '',
    defaultValue: partial?.defaultValue || ''
  };
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

function buildFieldMappingRule(
  row: ManualPathMappingRow,
  options?: { sampleRaw?: string; arrayIteratePath?: string }
): KafkaFieldMappingRule | null {
  const fieldName = row.fieldName.trim();
  const jsonpath = row.jsonpath.trim();
  if (!fieldName || !jsonpath) {
    return null;
  }

  const compileSource = resolveRuleCompileSource(
    options?.sampleRaw || '',
    options?.arrayIteratePath
  );
  const compiled = compileSource
    ? compileUiPathToStorageMapping(jsonpath, compileSource)
    : { jsonpath };

  const mapping: KafkaFieldMappingRule = { ...compiled };
  const comment = row.comment?.trim();
  if (comment) {
    mapping.comment = comment;
  }
  const defaultValue = parseDefaultValue(row.defaultValue);
  if (defaultValue !== undefined) {
    mapping.default_value = defaultValue;
  }
  return mapping;
}

export function manualPathRowsToRule(
  rows: ManualPathMappingRow[],
  options?: { arrayIteratePath?: string; sampleRaw?: string }
): KafkaJsonPathParseRule {
  const fieldMapping: Record<string, KafkaFieldMappingRule> = {};

  rows.forEach((row) => {
    const mapping = buildFieldMappingRule(row, options);
    if (mapping) {
      fieldMapping[row.fieldName.trim()] = mapping;
    }
  });

  if (!Object.keys(fieldMapping).length) {
    throw new Error('请至少填写一条有效的字段路径映射');
  }

  const rule: KafkaJsonPathParseRule = { field_mapping: fieldMapping };
  const iteratePath =
    options?.arrayIteratePath?.trim() ||
    detectArrayIteratePath(options?.sampleRaw);
  if (iteratePath) {
    rule.array_iterate_path = iteratePath;
  }
  return rule;
}

export function manualPathRowsToRuleJson(
  rows: ManualPathMappingRow[],
  options?: { arrayIteratePath?: string; sampleRaw?: string }
): string {
  return formatKafkaJsonPathRule(manualPathRowsToRule(rows, options));
}

export function ruleToManualPathRows(ruleRaw?: string): {
  rows: ManualPathMappingRow[];
  arrayIteratePath: string;
} {
  if (!ruleRaw?.trim()) {
    return {
      rows: [createEmptyManualPathRow()],
      arrayIteratePath: ''
    };
  }

  try {
    const rule = parseKafkaJsonPathRule(ruleRaw);
    const rows = Object.entries(rule.field_mapping).map(
      ([fieldName, mapping]) =>
        createEmptyManualPathRow({
          fieldName,
          jsonpath: expandMappingToUiPath(mapping),
          comment: mapping.comment || '',
          defaultValue:
            mapping.default_value === undefined ||
            mapping.default_value === null
              ? ''
              : typeof mapping.default_value === 'string'
                ? mapping.default_value
                : JSON.stringify(mapping.default_value)
        })
    );

    return {
      rows: rows.length ? rows : [createEmptyManualPathRow()],
      arrayIteratePath: rule.array_iterate_path || ''
    };
  } catch {
    return {
      rows: [createEmptyManualPathRow()],
      arrayIteratePath: ''
    };
  }
}

export function validateManualPathRows(
  rows: ManualPathMappingRow[]
): string | null {
  const validRows = rows.filter(
    (row) => row.fieldName.trim() && row.jsonpath.trim()
  );
  if (!validRows.length) {
    return '请至少填写一条字段名与 JSONPath';
  }

  const fieldNames = new Set<string>();
  for (const row of validRows) {
    const fieldName = row.fieldName.trim();
    if (fieldNames.has(fieldName)) {
      return `字段名重复：${fieldName}`;
    }
    fieldNames.add(fieldName);
  }

  return null;
}
