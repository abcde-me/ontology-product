import {
  SourceType,
  type OntologyObjectTypeDetailSourceDataInfo,
  type SourceDataInfo
} from '@/types/objectType';

export interface ObjectTypeDataSourceDisplayInput {
  sourceType?: SourceType | number;
  filePath?: string;
  originalDbName?: string;
  originalTableName?: string;
  sourceDataInfo?:
    | (SourceDataInfo & OntologyObjectTypeDetailSourceDataInfo)
    | null;
}

/**
 * 属性列表「数据源」列展示文案
 * - CSV 导入：本地csv
 * - 数据库： [mysql] table_name
 */
export const formatOntologyObjectTypeDataSourceName = (
  input: ObjectTypeDataSourceDisplayInput
): string => {
  const isCsv =
    input.sourceType === SourceType.FILE_UPLOAD ||
    input.sourceType === 2 ||
    Boolean(input.filePath?.trim());

  if (isCsv) {
    return '本地csv';
  }

  const dbType = (
    input.sourceDataInfo?.connectorSubtype ||
    input.sourceDataInfo?.connectorType ||
    input.originalDbName ||
    ''
  )
    .replace(/^\[|\]$/g, '')
    .trim();

  const tableName = (
    input.sourceDataInfo?.tableName ||
    input.originalTableName ||
    ''
  ).trim();

  if (dbType && tableName) {
    return `[${dbType}] ${tableName}`;
  }

  if (tableName) {
    return tableName;
  }

  return '';
};
