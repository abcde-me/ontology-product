import { OntologyLinkTypeColumn } from '@/types/links';
import { ObjectTypeAttributeField } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { normalizeFieldTypeForPrimary } from './linkFormUtils';
import { AttributeField, LinkFormData } from '../types';

export function objectTypeAttributeToLinkAttribute(
  attr: ObjectTypeAttributeField
): AttributeField {
  return {
    tableField: attr.propertyID,
    isUse: 1,
    attributeName: attr.propertyComment,
    fieldType: normalizeFieldTypeForPrimary(
      attr.propertyType,
      attr.isPrimary === 1
    ),
    isPrimary: attr.isPrimary === 1,
    sourceColumnName: attr.sourceColumnName,
    sourceColumnComment: attr.sourceColumnComment,
    sourceColumnType: attr.sourceColumnType,
    ...(attr.sourceCoumnOriginName
      ? { sourceCoumnOriginName: attr.sourceCoumnOriginName }
      : {}),
    ...(attr.sourceTableName?.trim()
      ? { sourceTableName: attr.sourceTableName.trim() }
      : {})
  };
}

export function buildOntologyLinkTypeColumnList(
  data: Pick<
    LinkFormData,
    'attributeFields' | 'intermediateTable' | 'syncSourceDataStrategy'
  >,
  linkTypeID = 0
): OntologyLinkTypeColumn[] {
  const tableName =
    data.intermediateTable?.table?.trim() ||
    data.syncSourceDataStrategy?.sourceDataInfo?.tableName?.trim() ||
    '';
  const isSql =
    data.intermediateTable?.queryMode === 'sql' ||
    data.syncSourceDataStrategy?.sourceDataInfo?.queryMode === 'sql';

  const sourcePrimaryKey = data.attributeFields
    .filter((field) => field.isPrimary)
    .map((field) => field.sourceColumnName || field.tableField)
    .filter(Boolean);

  return data.attributeFields.map((field) => {
    const sourceColumnName = field.sourceColumnName || field.tableField;
    const sourceColumnComment =
      field.sourceColumnComment || field.attributeName;
    const sourceColumnType = field.sourceColumnType || field.fieldType;
    const sourceCoumnOriginName =
      field.sourceCoumnOriginName || sourceColumnName;
    const fromField = field.sourceTableName?.trim();
    const sourceTableName = fromField || (!isSql && tableName ? tableName : '');

    return {
      name: field.tableField,
      comment: field.attributeName,
      columnType: field.fieldType,
      isPrimary: field.isPrimary ? 1 : 0,
      isUse: field.isUse ? 1 : 0,
      linkTypeID,
      sourceColumnName,
      sourceColumnComment,
      sourceColumnType,
      sourceCoumnOriginName,
      sourceTableName,
      sourcePrimaryKey
    };
  });
}

export function linkColumnToAttributeField(column: {
  name?: string;
  comment?: string;
  columnType?: string;
  isPrimary?: number;
  isUse?: number;
  sourceColumnName?: string;
  sourceColumnComment?: string;
  sourceColumnType?: string;
  sourceCoumnOriginName?: string;
  sourceTableName?: string;
}): AttributeField {
  const tableField = column.name || column.sourceColumnName || '';
  return {
    tableField,
    isUse: column.isUse === 1 ? 1 : 0,
    attributeName: column.comment || column.sourceColumnComment || tableField,
    fieldType: column.columnType || column.sourceColumnType || 'STRING',
    isPrimary: column.isPrimary === 1,
    sourceColumnName: column.sourceColumnName ?? tableField,
    sourceColumnComment:
      column.sourceColumnComment ?? column.comment ?? tableField,
    sourceColumnType: column.sourceColumnType ?? column.columnType,
    ...(column.sourceCoumnOriginName
      ? { sourceCoumnOriginName: column.sourceCoumnOriginName }
      : {}),
    ...(column.sourceTableName?.trim()
      ? { sourceTableName: column.sourceTableName.trim() }
      : {})
  };
}
