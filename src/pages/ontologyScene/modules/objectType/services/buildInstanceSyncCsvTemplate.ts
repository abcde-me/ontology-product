import { ObjectTypeAttributeField } from '../components/ObjectTypeFormUtils/types';
import {
  buildOntologySchemaCsvFromParsed,
  downloadCsvTemplate
} from '@/utils/ontologyCsvTemplate';

export function buildInstanceSyncCsvTemplate(
  attributes: ObjectTypeAttributeField[]
): string {
  return buildOntologySchemaCsvFromParsed({
    columnList: attributes.map((attribute) => attribute.propertyID),
    typeList: attributes.map(
      (attribute) => attribute.propertyType || 'varchar(255)'
    ),
    commentList: attributes.map(
      (attribute) => attribute.propertyComment || attribute.propertyID
    ),
    instances: []
  });
}

export function getInstanceSyncCsvTemplateFileName(objectTypeName?: string) {
  const base = String(objectTypeName ?? '').trim() || 'object_type';
  return `${base}_instance_sync_template.csv`;
}

export function downloadInstanceSyncCsvTemplate(
  attributes: ObjectTypeAttributeField[],
  objectTypeName?: string
) {
  downloadCsvTemplate(
    buildInstanceSyncCsvTemplate(attributes),
    getInstanceSyncCsvTemplateFileName(objectTypeName)
  );
}
