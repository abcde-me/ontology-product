import {
  createOntologyObjectType,
  extractUploadedSchemaFilePath,
  listOntologyObjectType,
  uploadOntologyCSVFileAndParse
} from '@/api/ontologySceneLibrary/objectType';
import {
  flattenOntologyPhysicalPropertiesForSubmit,
  objectTypeAttributeToLegacyField,
  sourceFieldToObjectTypeAttribute
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import { COLUMN_TYPE_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { useUserInfoStore } from '@/store/userInfoStore';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  cacheDevCsvInstances,
  devMirrorOntologyObjectType,
  resolveDevInstancesForPayload
} from '@/utils/devObjectTypeStore';
import {
  generateLocalObjectTypeCode,
  isValidObjectTypeNamingFormat
} from '@/utils/generateOntologyObjectTypeCodeName';
import { fetchSceneObjectTypeCodes } from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';
import {
  buildOntologySchemaCsvFromParsed,
  createObjectTypeSchemaFile,
  isDevSchemaFilePath,
  type ParsedOntologySchemaCsv
} from '@/utils/ontologyCsvTemplate';
import { SourceType, type ObjectType } from '@/types/objectType';
import type {
  OntologyModelObjectType,
  OntologyModelSchema
} from '../types/fileExtract';

export interface SaveOntologyExtractToSceneResult {
  created: Array<{ name: string; code: string; id: number }>;
  failed: Array<{ name: string; message: string }>;
}

const normalizeExtractedCode = async (
  code: string,
  name: string,
  ontologyModelID: number,
  reservedCodes: string[]
): Promise<string> => {
  const normalized = code.trim().toLowerCase();
  if (
    isValidObjectTypeNamingFormat(normalized) &&
    !reservedCodes.map((item) => item.toLowerCase()).includes(normalized)
  ) {
    return normalized;
  }

  const existingCodes =
    reservedCodes.length > 0
      ? reservedCodes
      : await fetchSceneObjectTypeCodes(ontologyModelID);

  return generateLocalObjectTypeCode(name, existingCodes);
};

const schemaToParsed = (
  schema: OntologyModelSchema,
  code: string
): ParsedOntologySchemaCsv => ({
  columnList: schema.columnList,
  typeList: schema.typeList,
  commentList: schema.commentList,
  instances: schema.instances,
  path: `dev://ontology-schema/extract/${code}/${Date.now()}.csv`
});

const resolveSchemaFilePath = async (
  parsed: ParsedOntologySchemaCsv,
  displayFileName: string
): Promise<string> => {
  const projectID = useUserInfoStore.getState().getEffectiveProjectId();
  if (!projectID) {
    if (parsed.instances.length) {
      cacheDevCsvInstances(parsed.path, parsed.instances);
    }
    return parsed.path;
  }

  try {
    const csvContent = buildOntologySchemaCsvFromParsed(parsed);
    const file = createObjectTypeSchemaFile(displayFileName, csvContent);
    const uploadResponse = await uploadOntologyCSVFileAndParse({
      file,
      projectID
    });

    if (isOntologyApiSuccess(uploadResponse)) {
      const uploadedPath = extractUploadedSchemaFilePath(uploadResponse);
      if (uploadedPath && !isDevSchemaFilePath(uploadedPath)) {
        if (parsed.instances.length) {
          cacheDevCsvInstances(uploadedPath, parsed.instances);
        }
        return uploadedPath;
      }
    }
  } catch (error) {
    console.warn('[extract] 上传 Schema 失败，使用本地路径', error);
  }

  if (parsed.instances.length) {
    cacheDevCsvInstances(parsed.path, parsed.instances);
  }
  return parsed.path;
};

const schemaToPhysicalProperties = (schema: OntologyModelSchema) => {
  const attributes = schema.columnList.map((column, index) =>
    sourceFieldToObjectTypeAttribute(
      {
        fieldId: column,
        fieldComment: schema.commentList[index] || column,
        fieldType: schema.typeList[index] || COLUMN_TYPE_OPTIONS[0].value
      },
      index
    )
  );

  return flattenOntologyPhysicalPropertiesForSubmit(
    attributes.map(objectTypeAttributeToLegacyField)
  );
};

const extractCreatedObjectTypeId = (response: {
  data?: { data?: { id?: number }; id?: number };
}) => response.data?.data?.id ?? response.data?.id;

/** 校验目标场景库中是否已存在同名对象类型（含本次批量内的重名） */
export const findDuplicateObjectTypeNames = (
  objectTypes: OntologyModelObjectType[],
  existingObjectTypes: ObjectType[]
): string[] => {
  const existingNames = new Set(
    existingObjectTypes
      .map((item) => item.name?.trim())
      .filter((name): name is string => Boolean(name))
  );
  const duplicates: string[] = [];
  const batchNames = new Set<string>();

  objectTypes.forEach((item) => {
    const name = item.name.trim();
    if (!name) {
      return;
    }
    if (existingNames.has(name) || batchNames.has(name)) {
      duplicates.push(name);
    }
    batchNames.add(name);
  });

  return [...new Set(duplicates)];
};

export const saveOntologyExtractToScene = async (params: {
  ontologyModelID: number;
  objectTypes: OntologyModelObjectType[];
}): Promise<SaveOntologyExtractToSceneResult> => {
  const { ontologyModelID, objectTypes } = params;

  if (!objectTypes.length) {
    throw new Error('没有可保存的对象类型');
  }

  const listRes = await listOntologyObjectType({
    ontologyModelID,
    pageNo: -1,
    pageSize: -1
  });

  const existingObjectTypes = isOntologyApiSuccess(listRes)
    ? listRes.data?.result || []
    : [];

  const duplicateNames = findDuplicateObjectTypeNames(
    objectTypes,
    existingObjectTypes
  );

  if (duplicateNames.length) {
    throw new Error(
      `以下对象类型名称已存在，请修改后重试：${duplicateNames.join('、')}`
    );
  }

  const reservedCodes = await fetchSceneObjectTypeCodes(ontologyModelID);
  const created: SaveOntologyExtractToSceneResult['created'] = [];
  const failed: SaveOntologyExtractToSceneResult['failed'] = [];

  for (const objectType of objectTypes) {
    const name = objectType.name.trim();
    const code = await normalizeExtractedCode(
      objectType.code,
      name,
      ontologyModelID,
      reservedCodes
    );
    reservedCodes.push(code);

    try {
      const parsed = schemaToParsed(objectType.schema, code);
      const filePath = await resolveSchemaFilePath(
        parsed,
        `${code}_schema.csv`
      );
      const ontologyPhysicalPropertiesList = schemaToPhysicalProperties(
        objectType.schema
      );

      const createPayload = {
        code,
        name,
        description:
          objectType.description?.trim() || `从数据资源信息提取导入：${name}`,
        icon: 'object-type-1',
        ontologyModelID,
        originalDbName: '',
        originalTableName: '',
        sourceType: SourceType.FILE_UPLOAD,
        enableSyncSourceData: false,
        filePath,
        ontologyPhysicalPropertiesList
      };

      const response = await createOntologyObjectType(createPayload);

      if (!isOntologyApiSuccess(response)) {
        failed.push({
          name,
          message: response.message || '创建失败'
        });
        continue;
      }

      const createdId = Number(extractCreatedObjectTypeId(response) || 0);

      if (createdId > 0 && isDevBypassEnabled()) {
        devMirrorOntologyObjectType(
          createdId,
          createPayload,
          resolveDevInstancesForPayload(createPayload)
        );
      }

      created.push({ name, code, id: createdId });
    } catch (error) {
      failed.push({
        name,
        message: error instanceof Error ? error.message : '创建失败'
      });
    }
  }

  return { created, failed };
};
