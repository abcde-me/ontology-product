import {
  extractUploadedSchemaFilePath,
  uploadOntologyCSVFileAndParse
} from '@/api/ontologySceneLibrary/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  buildOntologySchemaCsvFromParsed,
  createObjectTypeSchemaFile
} from '@/utils/ontologyCsvTemplate';
import type { ObjectTypeAttributeField } from '../components/ObjectTypeFormUtils/types';

function buildSampleValueForType(
  propertyType: string,
  isPrimary: boolean
): string {
  const base = propertyType.split('(')[0]?.trim().toLowerCase() || 'varchar';
  if (isPrimary && ['int', 'bigint', 'tinyint'].includes(base)) {
    return '1';
  }
  if (
    ['int', 'bigint', 'tinyint', 'float', 'double', 'decimal'].includes(base)
  ) {
    return '0';
  }
  if (base === 'date') {
    return '2024-01-01';
  }
  if (base.startsWith('datetime') || base.startsWith('timestamp')) {
    return '2024-01-01 00:00:00';
  }
  return 'sample';
}

export function buildSchemaCsvFromObjectTypeAttributes(
  attributes: ObjectTypeAttributeField[]
): string {
  const columnList = attributes.map((field) => field.propertyID);
  const typeList = attributes.map((field) => field.propertyType);
  const commentList = attributes.map(
    (field) => field.propertyComment || field.propertyID
  );
  const sampleValues = attributes.map((field) =>
    buildSampleValueForType(field.propertyType, field.isPrimary === 1)
  );

  return buildOntologySchemaCsvFromParsed({
    columnList,
    typeList,
    commentList,
    instances: [
      Object.fromEntries(
        columnList.map((column, index) => [column, sampleValues[index]])
      )
    ]
  });
}

export async function resolveManualObjectTypeSchemaFilePath(
  code: string,
  attributes: ObjectTypeAttributeField[]
): Promise<string | undefined> {
  const content = buildSchemaCsvFromObjectTypeAttributes(attributes);
  const fileName = `${code.trim() || 'object_type'}_schema.csv`;
  const file = createObjectTypeSchemaFile(fileName, content);
  const projectID = useUserInfoStore.getState().getEffectiveProjectId();

  if (!projectID) {
    return undefined;
  }

  const uploadResponse = await uploadOntologyCSVFileAndParse({
    file,
    projectID
  });

  if (!isOntologyApiSuccess(uploadResponse)) {
    return undefined;
  }

  return extractUploadedSchemaFilePath(uploadResponse);
}
