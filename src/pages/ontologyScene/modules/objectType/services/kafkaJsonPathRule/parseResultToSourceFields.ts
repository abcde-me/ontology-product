import { parseKafkaJsonPathRule } from './applyKafkaJsonPathRule';
import type { FormattedParseResultRow } from './formatKafkaParseResult';
import type { SourceTableField } from '../../components/ObjectTypeFormUtils/types';

export function parseResultRowsToSourceFields(
  rows: FormattedParseResultRow[]
): SourceTableField[] {
  const fieldMap = new Map<string, SourceTableField>();

  rows.forEach((row) => {
    const fieldId = row.name?.trim();
    if (!fieldId || fieldId === '-') {
      return;
    }
    if (fieldMap.has(fieldId)) {
      return;
    }
    fieldMap.set(fieldId, {
      fieldId,
      fieldComment: row.comment?.trim() || fieldId,
      fieldType: row.fieldType?.trim() || 'varchar'
    });
  });

  return Array.from(fieldMap.values());
}

export function extractSourceFieldsFromKafkaRule(
  ruleRaw?: string
): SourceTableField[] {
  if (!ruleRaw?.trim()) {
    return [];
  }

  try {
    const rule = parseKafkaJsonPathRule(ruleRaw);
    return Object.entries(rule.field_mapping).map(([fieldId, mapping]) => ({
      fieldId,
      fieldComment: mapping.comment?.trim() || fieldId,
      fieldType: 'varchar'
    }));
  } catch {
    return [];
  }
}

export function mergeKafkaSourceFields(
  primary: SourceTableField[],
  fallback: SourceTableField[]
): SourceTableField[] {
  const fieldMap = new Map<string, SourceTableField>();

  fallback.forEach((field) => {
    if (field.fieldId?.trim()) {
      fieldMap.set(field.fieldId.trim(), field);
    }
  });

  primary.forEach((field) => {
    const fieldId = field.fieldId?.trim();
    if (!fieldId) {
      return;
    }
    const existing = fieldMap.get(fieldId);
    fieldMap.set(fieldId, {
      fieldId,
      fieldComment:
        field.fieldComment?.trim() || existing?.fieldComment || fieldId,
      fieldType: field.fieldType?.trim() || existing?.fieldType || 'varchar'
    });
  });

  return Array.from(fieldMap.values());
}
