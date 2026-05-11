import React from 'react';
import { Popover } from '@arco-design/web-react';

export function databaseTableCascaderFilterOption(
  input: string,
  option: { label?: unknown; value?: unknown }
): boolean {
  const q = String(input ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;

  const labelStr =
    option?.label != null && option.label !== ''
      ? String(option.label).toLowerCase()
      : '';
  const valueStr =
    option?.value != null && option.value !== ''
      ? String(option.value).toLowerCase()
      : '';

  return labelStr.includes(q) || valueStr.includes(q);
}

export function wrapDisabledFieldPopover(
  node: React.ReactNode,
  disabled: boolean,
  popoverContent: React.ReactNode = '请先勾选字段'
): React.ReactNode {
  if (!disabled) return node;
  return (
    <Popover content={popoverContent} trigger="hover">
      <span className="inline-flex max-w-full flex-1 cursor-not-allowed items-center align-middle">
        {node}
      </span>
    </Popover>
  );
}

export function normalizeFieldTypeForPrimary(
  fieldType: string,
  isPrimary?: boolean
) {
  const lowerType = fieldType.toString().toLowerCase();
  if (
    lowerType === 'varchar(5000)' ||
    lowerType === 'char(36)' ||
    lowerType === 'varchar(500)'
  ) {
    return isPrimary ? 'varchar(500)' : 'varchar(5000)';
  }

  return fieldType;
}
