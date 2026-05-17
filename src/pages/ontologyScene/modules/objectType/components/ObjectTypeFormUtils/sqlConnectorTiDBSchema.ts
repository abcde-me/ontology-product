import type {
  GetSqlConnectorTableSchemaToTIDBRes,
  SqlConnectorTiDBSchemaColumn
} from '@/types/objectType';
import type { SourceTableField } from './types';

/** 兼容后端 columnTypeTiDB / colunmTypeTiDB 两种字段名 */
export function getSqlConnectorColumnTypeTiDB(
  column: SqlConnectorTiDBSchemaColumn
): string | undefined {
  const tidbType = column.columnTypeTiDB ?? column.colunmTypeTiDB;
  if (typeof tidbType === 'string' && tidbType.trim()) {
    return tidbType.trim();
  }
  return undefined;
}

export function isOntologyApiSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.status === 0) &&
    (response.code === '' || response.code === 0 || response.code === undefined)
  );
}

export interface NormalizeSourceFieldsFromTiDBSchemaOptions {
  /** 建模第二步：属性类型仅使用 columnTypeTiDB，不回退 columnType */
  fieldTypeFromTiDBOnly?: boolean;
}

export function normalizeSourceFieldsFromTiDBSchema(
  data?: GetSqlConnectorTableSchemaToTIDBRes | null,
  options?: NormalizeSourceFieldsFromTiDBSchemaOptions
): SourceTableField[] {
  const rawColumns = data?.columns;
  const columns = Array.isArray(rawColumns)
    ? rawColumns
    : rawColumns
      ? [rawColumns]
      : [];

  const fieldTypeFromTiDBOnly = options?.fieldTypeFromTiDBOnly === true;

  return columns
    .map((column) => {
      const columnTypeTiDB = getSqlConnectorColumnTypeTiDB(column);
      const fieldType = fieldTypeFromTiDBOnly
        ? (columnTypeTiDB ?? column.columnType)
        : columnTypeTiDB || column.columnType;

      return {
        fieldId: column.columnName,
        fieldComment: column.columnComment || column.columnName,
        fieldType: fieldType ?? ''
      };
    })
    .filter((field) => !!field.fieldId);
}

export function getPrimaryKeyListFromTiDBSchema(
  data?: GetSqlConnectorTableSchemaToTIDBRes | null
): string[] {
  if (!Array.isArray(data?.primaryKey)) {
    return [];
  }
  return data.primaryKey.filter(
    (item): item is string => typeof item === 'string' && item.length > 0
  );
}

export function resolvePrimaryColumnIndex(
  sourceFields: SourceTableField[],
  primaryKeyList: string[]
): number {
  if (!primaryKeyList.length) {
    return 0;
  }
  const matchedIndex = sourceFields.findIndex((field) =>
    primaryKeyList.includes(field.fieldId)
  );
  return matchedIndex >= 0 ? matchedIndex : 0;
}
