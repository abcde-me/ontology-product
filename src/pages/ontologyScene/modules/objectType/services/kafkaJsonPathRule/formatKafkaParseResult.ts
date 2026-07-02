import type { InstanceSyncMappingField } from '../../components/ObjectTypeFormUtils/types';
import type { KafkaFieldMappingRule } from './types';

export interface FormattedParseResultRow {
  key: string;
  recordIndex: number;
  name: string;
  comment: string;
  fieldType: string;
  value: unknown;
  valueText: string;
}

function inferFieldType(value: unknown): string {
  if (value === null || value === undefined) {
    return 'STRING';
  }
  if (typeof value === 'number') {
    return 'NUMBER';
  }
  if (typeof value === 'boolean') {
    return 'BOOLEAN';
  }
  if (Array.isArray(value)) {
    return 'ARRAY';
  }
  if (typeof value === 'object') {
    return 'JSON';
  }
  return 'STRING';
}

function formatValueText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function expandNestedRecordValues(
  record: Record<string, unknown>
): Record<string, unknown> {
  const expanded: Record<string, unknown> = { ...record };

  Object.values(record).forEach((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return;
    }
    Object.entries(value as Record<string, unknown>).forEach(
      ([innerKey, innerValue]) => {
        if (!(innerKey in expanded)) {
          expanded[innerKey] = innerValue;
        }
      }
    );
  });

  return expanded;
}

function buildMappingFieldIndex(
  mappingFields: InstanceSyncMappingField[]
): Map<string, InstanceSyncMappingField> {
  const index = new Map<string, InstanceSyncMappingField>();

  mappingFields.forEach((field) => {
    [field.propertyID, field.sourceColumnName, field.sourceCoumnOriginName]
      .map((item) => item?.trim())
      .filter(Boolean)
      .forEach((key) => {
        index.set(key!, field);
        index.set(key!.toLowerCase(), field);
      });
  });

  return index;
}

function findMappingField(
  index: Map<string, InstanceSyncMappingField>,
  ruleKey: string,
  position: number,
  mappingFields: InstanceSyncMappingField[]
): InstanceSyncMappingField | undefined {
  return (
    index.get(ruleKey) ||
    index.get(ruleKey.toLowerCase()) ||
    mappingFields[position]
  );
}

function resolveRecordValue(
  record: Record<string, unknown>,
  field: InstanceSyncMappingField
): unknown {
  const expandedRecord = expandNestedRecordValues(record);
  const candidates = [
    field.sourceColumnName,
    field.sourceCoumnOriginName,
    field.propertyID
  ]
    .map((item) => item?.trim())
    .filter(Boolean) as string[];

  for (const key of candidates) {
    if (key in expandedRecord) {
      return expandedRecord[key];
    }
    const matchedKey = Object.keys(expandedRecord).find(
      (recordKey) => recordKey.toLowerCase() === key.toLowerCase()
    );
    if (matchedKey) {
      return expandedRecord[matchedKey];
    }
  }
  return undefined;
}

function resolveFieldType(
  field: InstanceSyncMappingField,
  value: unknown
): string {
  const explicitType =
    field.propertyType?.trim() || field.sourceColumnType?.trim();
  if (explicitType) {
    return explicitType;
  }
  const inferred = inferFieldType(value);
  return inferred === 'STRING' && (value === undefined || value === null)
    ? '-'
    : inferred;
}

function buildRowsFromRuleMapping(
  records: Record<string, unknown>[],
  mappingFields: InstanceSyncMappingField[],
  ruleFieldMapping: Record<string, KafkaFieldMappingRule>
): FormattedParseResultRow[] {
  const mappingIndex = buildMappingFieldIndex(mappingFields);
  const ruleFieldNames = Object.keys(ruleFieldMapping);

  return records.flatMap((record, recordIndex) => {
    const expandedRecord = expandNestedRecordValues(record);

    return ruleFieldNames.map((fieldName, fieldIndex) => {
      const value = expandedRecord[fieldName];
      const mappingField = findMappingField(
        mappingIndex,
        fieldName,
        fieldIndex,
        mappingFields
      );
      const ruleComment = ruleFieldMapping[fieldName]?.comment?.trim();

      return {
        key: `${recordIndex}-${fieldName}`,
        recordIndex: recordIndex + 1,
        name: fieldName,
        comment: ruleComment || mappingField?.propertyComment || fieldName,
        fieldType: mappingField
          ? resolveFieldType(mappingField, value)
          : inferFieldType(value),
        value,
        valueText: formatValueText(value)
      };
    });
  });
}

function buildRowsFromMapping(
  records: Record<string, unknown>[],
  mappingFields: InstanceSyncMappingField[],
  ruleFieldNames: string[] = []
): FormattedParseResultRow[] {
  return records.flatMap((record, recordIndex) => {
    const expandedRecord = expandNestedRecordValues(record);

    return mappingFields.map((field, fieldIndex) => {
      let value = resolveRecordValue(record, field);

      if (value === undefined && ruleFieldNames[fieldIndex]) {
        value = expandedRecord[ruleFieldNames[fieldIndex]];
      }

      const ruleFieldName = ruleFieldNames[fieldIndex];
      return {
        key: `${recordIndex}-${ruleFieldName || field.propertyID || fieldIndex}`,
        recordIndex: recordIndex + 1,
        name: ruleFieldName || field.propertyID || '-',
        comment:
          field.propertyComment || ruleFieldName || field.propertyID || '-',
        fieldType: resolveFieldType(field, value),
        value,
        valueText: formatValueText(value)
      };
    });
  });
}

function buildRowsFromRecordKeys(
  records: Record<string, unknown>[]
): FormattedParseResultRow[] {
  return records.flatMap((record, recordIndex) =>
    Object.entries(record).map(([name, value], fieldIndex) => ({
      key: `${recordIndex}-${name}-${fieldIndex}`,
      recordIndex: recordIndex + 1,
      name,
      comment: name,
      fieldType: inferFieldType(value),
      value,
      valueText: formatValueText(value)
    }))
  );
}

export function buildFormattedParseResultRows(
  records: Record<string, unknown>[],
  mappingFields: InstanceSyncMappingField[] = [],
  options?: {
    ruleFieldMapping?: Record<string, KafkaFieldMappingRule>;
  }
): FormattedParseResultRow[] {
  if (!records.length) {
    return [];
  }

  const ruleFieldNames = options?.ruleFieldMapping
    ? Object.keys(options.ruleFieldMapping)
    : [];

  if (ruleFieldNames.length) {
    return buildRowsFromRuleMapping(
      records,
      mappingFields,
      options!.ruleFieldMapping!
    );
  }

  if (mappingFields.length) {
    return buildRowsFromMapping(records, mappingFields);
  }

  return buildRowsFromRecordKeys(records);
}
