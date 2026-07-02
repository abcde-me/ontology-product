import type { DataResourceTable } from '../types';
import type { ObjectTypeAttributeField } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { resolveDataResourcePrimaryKeyFields } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';

export interface InstanceExtractTargetField {
  fieldName: string;
  fieldType: string;
  fieldComment: string;
  isPrimary?: boolean;
}

export interface InstanceExtractTargetSchema {
  targetLabel: string;
  targetCode?: string;
  fields: InstanceExtractTargetField[];
}

export const dataResourceTableToInstanceExtractTarget = (
  table: DataResourceTable
): InstanceExtractTargetSchema => {
  const primaryKeyFields = new Set(resolveDataResourcePrimaryKeyFields(table));

  return {
    targetLabel: table.tableComment || table.tableName,
    targetCode: table.tableName,
    fields: table.fields.map((field) => ({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      fieldComment: field.fieldComment || field.fieldName,
      isPrimary: field.isPrimary || primaryKeyFields.has(field.fieldName)
    }))
  };
};

export const objectTypeAttributesToInstanceExtractTarget = (
  attributes: ObjectTypeAttributeField[],
  objectTypeName?: string
): InstanceExtractTargetSchema => ({
  targetLabel: objectTypeName?.trim() || '当前对象类型',
  fields: attributes.map((attribute) => ({
    fieldName: attribute.propertyID,
    fieldType: attribute.propertyType,
    fieldComment: attribute.propertyComment || attribute.propertyID,
    isPrimary: attribute.isPrimary === 1
  }))
});

export const resolveInstanceExtractPrimaryKeyFields = (
  schema: InstanceExtractTargetSchema
): string[] => {
  const primaryFields = schema.fields
    .filter((field) => field.isPrimary)
    .map((field) => field.fieldName);
  if (primaryFields.length) {
    return primaryFields;
  }

  const idField = schema.fields.find((field) => field.fieldName === 'id');
  if (idField) {
    return [idField.fieldName];
  }

  const firstField = schema.fields[0]?.fieldName;
  return firstField ? [firstField] : [];
};
