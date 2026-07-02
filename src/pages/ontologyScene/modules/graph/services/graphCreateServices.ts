import {
  createOntologyObjectType,
  extractUploadedSchemaFilePath,
  uploadOntologyCSVFileAndParse
} from '@/api/ontologySceneLibrary/objectType';

import { createOntologyLinkType } from '@/api/ontologySceneLibrary/links';

import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';

import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';

import { LinkType, SyncStatus } from '@/types/graphApi';

import type { ObjectType } from '@/types/objectType';
import { SourceType } from '@/types/objectType';
import type { DataResourceTable } from '@/pages/dataResource/types';
import {
  buildDataResourceObjectTypeDescription,
  dataResourceFieldsToPhysicalProperties,
  objectTypeUsesDataResourceTable,
  resolveDataResourceSampleInstances
} from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import { inferSmartLinks } from './inferSmartLinks';

import { isOntologyApiSuccess } from '@/utils/apiResponse';

import { isDevBypassEnabled } from '@/utils/devFallback';

import {
  cacheDevCsvInstances,
  devMirrorOntologyObjectType,
  resolveDevInstancesForPayload
} from '@/utils/devObjectTypeStore';

import { devMirrorOntologyLinkType } from '@/utils/devLinkTypeStore';

import { generateLocalObjectTypeCode } from '@/utils/generateOntologyObjectTypeCodeName';
import { generateOntologyIdentifier } from '@/utils/generateOntologyIdentifier';

import { fetchSceneAllOntologyIdentifiers } from '@/utils/ontologyIdentifier';

import {
  createObjectTypeSchemaFile,
  isDevSchemaFilePath
} from '@/utils/ontologyCsvTemplate';

import { useUserInfoStore } from '@/store/userInfoStore';

export const fetchSceneObjectTypeCodes = async (ontologyModelID: number) => {
  const objectTypes = await fetchSceneObjectTypes(ontologyModelID);

  return objectTypes.map((item) => item.code).filter(Boolean) as string[];
};

export const fetchSceneObjectTypes = async (
  ontologyModelID: number
): Promise<ObjectType[]> => {
  const response = await listOntologyObjectType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  if (!isOntologyApiSuccess(response)) {
    return [];
  }

  return response.data?.result || [];
};

export const fetchSceneLinkCodes = async (ontologyModelID: number) => {
  const response = await listOntologyLinkType({
    ontologyModelID,

    pageNo: 1,

    pageSize: -1
  });

  if (!isOntologyApiSuccess(response)) {
    return [];
  }

  return (response.data?.result || [])

    .map((item) => item.code)

    .filter(Boolean) as string[];
};

const buildGraphObjectTypeDevFilePath = (code: string) =>
  `dev://graph-object-type/${code}.csv`;

const resolveGraphObjectTypeFilePath = async (code: string) => {
  const devPath = buildGraphObjectTypeDevFilePath(code);

  cacheDevCsvInstances(devPath, [{ id: 1 }]);

  const projectID = useUserInfoStore.getState().getEffectiveProjectId();

  if (!projectID) {
    return devPath;
  }

  try {
    const file = createObjectTypeSchemaFile(`${code}_schema.csv`);

    const uploadResponse = await uploadOntologyCSVFileAndParse({
      file,

      projectID
    });

    if (isOntologyApiSuccess(uploadResponse)) {
      const uploadedPath = extractUploadedSchemaFilePath(uploadResponse);

      if (uploadedPath && !isDevSchemaFilePath(uploadedPath)) {
        return uploadedPath;
      }
    }
  } catch (error) {
    console.warn('[graph] 上传对象类型 Schema 失败，回退占位路径', error);
  }

  return devPath;
};

const extractCreatedObjectTypeId = (response: {
  data?: { data?: { id?: number }; id?: number };
}) => response.data?.data?.id ?? response.data?.id;

export const createObjectTypeOnGraph = async (params: {
  name: string;

  code?: string;

  ontologyModelID: number;

  description?: string;

  dataResourceTable?: DataResourceTable | null;

  /** 批量创建时传入已占用 code，避免重复请求 */
  reservedCodes?: string[];
}) => {
  const {
    name,
    ontologyModelID,
    description,
    dataResourceTable,
    reservedCodes
  } = params;

  const existingCodes =
    reservedCodes ?? (await fetchSceneObjectTypeCodes(ontologyModelID));

  const code =
    params.code?.trim() || generateLocalObjectTypeCode(name, existingCodes);

  const fromDataResource = !!dataResourceTable;

  const filePath = fromDataResource
    ? undefined
    : await resolveGraphObjectTypeFilePath(code);

  const createPayload = fromDataResource
    ? {
        code,
        name: name.trim(),
        description:
          description?.trim() ||
          buildDataResourceObjectTypeDescription(dataResourceTable),
        icon: 'object-type-1',
        ontologyModelID,
        originalDbName: dataResourceTable.databaseType,
        originalTableName: dataResourceTable.tableName,
        sourceType: SourceType.ICEBERG,
        enableSyncSourceData: false,
        ontologyPhysicalPropertiesList:
          dataResourceFieldsToPhysicalProperties(dataResourceTable)
      }
    : {
        code,
        name: name.trim(),
        description: description?.trim() || `在图谱中创建：${name.trim()}`,
        icon: 'object-type-1',
        ontologyModelID,
        originalDbName: '',
        originalTableName: '',
        sourceType: SourceType.FILE_UPLOAD,
        enableSyncSourceData: false,
        filePath,
        ontologyPhysicalPropertiesList: [
          {
            name: 'id',
            comment: '主键',
            columnType: 'int',
            isPrimary: 1 as 0 | 1,
            publicPropertyID: 0,
            isUse: 1 as 0 | 1,
            isStoreAsPublic: 0 as 0 | 1,
            isVector: 0 as 0 | 1
          }
        ]
      };

  const response = await createOntologyObjectType(createPayload);

  if (isOntologyApiSuccess(response) && isDevBypassEnabled()) {
    const createdId = extractCreatedObjectTypeId(response);

    if (createdId) {
      const devInstances = fromDataResource
        ? resolveDataResourceSampleInstances(
            dataResourceTable,
            createPayload.ontologyPhysicalPropertiesList
          )
        : resolveDevInstancesForPayload(createPayload);

      devMirrorOntologyObjectType(createdId, createPayload, devInstances);
    }
  }

  return { response, code };
};

export interface CreateObjectTypesOnGraphResult {
  created: Array<{
    name: string;
    code: string;
    tableName: string;
    id: number;
  }>;
  skipped: Array<{ tableName: string; tableComment: string }>;
  failed: Array<{ tableName: string; message: string }>;
  linksCreated: number;
  linksFailed: number;
}

function hasExistingLinkBetween(
  existingLinks: Array<{
    sourceObjectTypeID?: number;
    targetObjectTypeID?: number;
  }>,
  sourceId: number,
  targetId: number
): boolean {
  return existingLinks.some(
    (link) =>
      (link.sourceObjectTypeID === sourceId &&
        link.targetObjectTypeID === targetId) ||
      (link.sourceObjectTypeID === targetId &&
        link.targetObjectTypeID === sourceId)
  );
}

export const createObjectTypesOnGraphFromTables = async (params: {
  ontologyModelID: number;
  tables: DataResourceTable[];
  description?: string;
  smartCreateLinks?: boolean;
}): Promise<CreateObjectTypesOnGraphResult> => {
  const {
    ontologyModelID,
    tables,
    description,
    smartCreateLinks = false
  } = params;
  const [existingObjectTypes, existingCodes] = await Promise.all([
    fetchSceneObjectTypes(ontologyModelID),
    fetchSceneObjectTypeCodes(ontologyModelID)
  ]);

  const usedCodes = [...existingCodes];
  const sceneObjectTypes = [...existingObjectTypes];
  const created: CreateObjectTypesOnGraphResult['created'] = [];
  const skipped: CreateObjectTypesOnGraphResult['skipped'] = [];
  const failed: CreateObjectTypesOnGraphResult['failed'] = [];
  const createdTableByObjectTypeId = new Map<number, DataResourceTable>();

  for (const table of tables) {
    if (
      sceneObjectTypes.some((item) =>
        objectTypeUsesDataResourceTable(item, table)
      )
    ) {
      skipped.push({
        tableName: table.tableName,
        tableComment: table.tableComment || table.tableName
      });
      continue;
    }

    const name = table.tableComment?.trim() || table.tableName;
    const tableDescription =
      description?.trim() || buildDataResourceObjectTypeDescription(table);

    const { response, code } = await createObjectTypeOnGraph({
      name,
      ontologyModelID,
      description: tableDescription,
      dataResourceTable: table,
      reservedCodes: usedCodes
    });

    if (isOntologyApiSuccess(response)) {
      const createdId = extractCreatedObjectTypeId(response) ?? -Date.now();
      usedCodes.push(code);
      created.push({ name, code, tableName: table.tableName, id: createdId });
      createdTableByObjectTypeId.set(createdId, table);
      sceneObjectTypes.push({
        id: createdId,
        code,
        name,
        originalDbName: table.databaseType,
        originalTableName: table.tableName,
        syncStatus: SyncStatus.NOT_SYNC
      });
      continue;
    }

    failed.push({
      tableName: table.tableName,
      message: response.message || '创建失败'
    });
  }

  let linksCreated = 0;
  let linksFailed = 0;

  if (smartCreateLinks && created.length > 0) {
    const linkResult = await autoCreateSmartLinks({
      ontologyModelID,
      sceneObjectTypes,
      newlyCreatedObjectTypeIds: new Set(created.map((item) => item.id)),
      createdTableByObjectTypeId,
      objectTypeDescription: description,
      reservedCodes: usedCodes
    });
    linksCreated = linkResult.created;
    linksFailed = linkResult.failed;
  }

  return { created, skipped, failed, linksCreated, linksFailed };
};

export const autoCreateSmartLinks = async (params: {
  ontologyModelID: number;
  sceneObjectTypes: ObjectType[];
  newlyCreatedObjectTypeIds: Set<number>;
  createdTableByObjectTypeId: Map<number, DataResourceTable>;
  objectTypeDescription?: string;
  reservedCodes?: string[];
}): Promise<{ created: number; failed: number }> => {
  const {
    ontologyModelID,
    sceneObjectTypes,
    newlyCreatedObjectTypeIds,
    createdTableByObjectTypeId,
    objectTypeDescription,
    reservedCodes
  } = params;

  const linkListResponse = await listOntologyLinkType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });
  const existingLinks = isOntologyApiSuccess(linkListResponse)
    ? linkListResponse.data?.result || []
    : [];

  const suggestions = await inferSmartLinks({
    ontologyModelID,
    sceneObjectTypes,
    newlyCreatedObjectTypeIds,
    createdTableByObjectTypeId,
    objectTypeDescription,
    existingLinks
  });

  if (!suggestions.length) {
    return { created: 0, failed: 0 };
  }

  const usedCodes = [...(reservedCodes || [])];
  let created = 0;
  let failed = 0;

  for (const suggestion of suggestions) {
    if (
      hasExistingLinkBetween(
        existingLinks,
        suggestion.sourceObjectTypeId,
        suggestion.targetObjectTypeId
      )
    ) {
      continue;
    }

    const { response, code: createdLinkCode } = await createLinkOnGraph({
      name: suggestion.name,
      description: suggestion.description,
      ontologyModelID,
      sourceObjectTypeID: suggestion.sourceObjectTypeId,
      targetObjectTypeID: suggestion.targetObjectTypeId,
      type: suggestion.type,
      linkSourceColumnName: suggestion.linkSourceColumnName,
      linkTargetColumnName: suggestion.linkTargetColumnName,
      reservedCodes: usedCodes
    });

    if (isOntologyApiSuccess(response)) {
      created += 1;
      usedCodes.push(createdLinkCode);
      existingLinks.push({
        sourceObjectTypeID: suggestion.sourceObjectTypeId,
        targetObjectTypeID: suggestion.targetObjectTypeId
      });
      continue;
    }

    failed += 1;
  }

  return { created, failed };
};

const extractCreatedLinkTypeId = (response: { data?: { id?: number } }) => {
  const createdId = Number(response.data?.id ?? 0);

  return Number.isFinite(createdId) && createdId > 0 ? createdId : null;
};

export const createLinkOnGraph = async (params: {
  name: string;

  code?: string;

  ontologyModelID: number;

  sourceObjectTypeID: number;

  targetObjectTypeID: number;

  type?: LinkType;

  description?: string;

  linkSourceColumnName?: string;

  linkTargetColumnName?: string;

  /** 批量创建时传入已占用 code，避免重复请求 */

  reservedCodes?: string[];
}) => {
  const {
    name,

    ontologyModelID,

    sourceObjectTypeID,

    targetObjectTypeID,

    type = LinkType.ONE_TO_ONE
  } = params;

  const existingCodes =
    params.reservedCodes ??
    (await fetchSceneAllOntologyIdentifiers(ontologyModelID));

  const code =
    params.code?.trim() || generateOntologyIdentifier(name, existingCodes);

  const response = await createOntologyLinkType({
    code,

    name: name.trim(),

    description: params.description?.trim(),

    type,

    ontologyModelID,

    sourceObjectTypeID,

    targetObjectTypeID,

    enableSyncSourceData: false,

    linkSourceColumnName: params.linkSourceColumnName,

    linkTargetColumnName: params.linkTargetColumnName
  });

  if (isOntologyApiSuccess(response)) {
    const createdId = extractCreatedLinkTypeId(response);

    if (createdId != null && isDevBypassEnabled()) {
      devMirrorOntologyLinkType(createdId, {
        code,

        name: name.trim(),

        description: params.description?.trim(),

        type,

        ontologyModelID,

        sourceObjectTypeID,

        targetObjectTypeID,

        enableSyncSourceData: false,

        linkSourceColumnName: params.linkSourceColumnName,

        linkTargetColumnName: params.linkTargetColumnName
      });
    }
  }

  return { response, code };
};
