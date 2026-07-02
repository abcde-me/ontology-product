import type { PhysicalProperties } from '@/types/graphApi';
import type { FieldQueryType } from '../types';

const RANGE_TYPE_KEYWORDS = [
  'int',
  'integer',
  'float',
  'double',
  'decimal',
  'number',
  'bigint',
  'numeric',
  'date',
  'time',
  'timestamp',
  'datetime'
];

const isIdField = (property: PhysicalProperties): boolean => {
  const name = property.name || '';
  const comment = property.comment || '';

  if (property.isPrimary === 1) {
    return true;
  }

  return /id/i.test(name) || /id/i.test(comment);
};

const isRangeField = (property: PhysicalProperties): boolean => {
  const columnType = String(property.columnType || '').toLowerCase();
  return RANGE_TYPE_KEYWORDS.some((keyword) => columnType.includes(keyword));
};

export const resolveFieldQueryType = (
  property: PhysicalProperties
): FieldQueryType => {
  if (isIdField(property)) {
    return 'id';
  }

  if (isRangeField(property)) {
    return 'range';
  }

  return 'string';
};

export const getFieldQueryPlaceholder = (
  label: string,
  queryType: FieldQueryType
): string => {
  if (queryType === 'id') {
    return `精准匹配 ${label}`;
  }

  if (queryType === 'range') {
    return '区间查询，留空表示不限制';
  }

  return `包含匹配 ${label}`;
};
