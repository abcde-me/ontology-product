import { createOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';
import { createOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { saveBehaviorAction } from '@/api/ontologySceneLibrary/ontologyAction';
import {
  getFunctionList,
  saveFunction
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { createOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type {
  CreateOntologyPhysicalProperty,
  CreateOntologyObjectTypeReq
} from '@/types/objectType';
import type {
  CreateOntologyLinkTypeReq,
  OntologyLinkTypeColumn
} from '@/types/links';
import type {
  OntologySceneExportPackage,
  OntologySceneImportResult
} from '@/types/ontologySceneMigration';
import type { BehaviorActionDetail } from '@/pages/ontologyScene/types/behaviorActions';
import type { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { coerceOntologyPhysicalProperty } from '@/utils/devObjectTypeStore';

const stripRuntimeFields = <T extends Record<string, unknown>>(value: T): T => {
  const next = { ...value };
  delete next.id;
  delete next.createTime;
  delete next.updateTime;
  delete next.createUser;
  delete next.updateUser;
  delete next.createdAt;
  delete next.updatedAt;
  delete next.isDeleted;
  delete next.syncStatus;
  delete next.syncTime;
  delete next.syncEnabled;
  return next;
};

const buildPublicPropertyIdMap = async (
  pkg: OntologySceneExportPackage
): Promise<Map<number, number>> => {
  const idMap = new Map<number, number>();

  for (const item of pkg.publicProperties) {
    const detail = item.detail;
    const response = await createOntologyPublicProperties({
      name: detail.name || item.name,
      comment: detail.comment || detail.name || item.name,
      columnType: detail.columnType || 'varchar(255)',
      description: detail.description
    });

    if (isOntologyApiSuccess(response) && response.data) {
      idMap.set(item.exportId, response.data);
    }
  }

  return idMap;
};

const mapExportedPropertyToCreate = (
  property: Record<string, unknown>,
  index: number,
  publicPropertyIdMap: Map<number, number>
): CreateOntologyPhysicalProperty => {
  const normalized = coerceOntologyPhysicalProperty(property, index);
  const exportedPublicPropertyId = Number(property.publicPropertyID ?? 0);
  const mappedPublicPropertyId =
    publicPropertyIdMap.get(exportedPublicPropertyId) ||
    exportedPublicPropertyId ||
    0;

  const next: CreateOntologyPhysicalProperty = {
    columnType: normalized.propertyType || 'varchar(255)',
    comment: normalized.propertyComment || normalized.propertyName,
    name: normalized.propertyName,
    isPrimary: normalized.isPrimary === 1 ? 1 : 0,
    isUse: Number(property.isUse ?? 1) === 0 ? 0 : 1,
    isStoreAsPublic: Number(property.isStoreAsPublic ?? 0) === 1 ? 1 : 0,
    publicPropertyID: mappedPublicPropertyId
  };

  if (normalized.isVector === 1) {
    next.isVector = 1;
  }
  if (property.vectorSourceFieldName) {
    next.vectorSourceFieldName = String(property.vectorSourceFieldName);
  }
  if (property.sourceTableName) {
    next.sourceTableName = String(property.sourceTableName);
  }

  return next;
};

const buildObjectTypeCreatePayload = (
  detail: OntologySceneExportPackage['objectTypes'][number]['detail'],
  ontologyModelID: number,
  publicPropertyIdMap: Map<number, number>
): CreateOntologyObjectTypeReq => {
  const physicalProperties = (detail.ontologyPhysicalPropertiesList || []).map(
    (property, index) =>
      mapExportedPropertyToCreate(
        property as Record<string, unknown>,
        index,
        publicPropertyIdMap
      )
  );

  return {
    code: detail.code || '',
    name: detail.name || detail.code || '',
    description: detail.description,
    icon: detail.icon || 'object-type-1',
    ontologyModelID,
    filePath: detail.filePath,
    enableSyncSourceData: false,
    originalDbName: detail.originalDbName || '',
    originalTableName: detail.originalTableName || '',
    sourceType: detail.sourceType,
    ontologyPhysicalPropertiesList: physicalProperties
  };
};

const buildLinkTypeCreatePayload = (
  item: OntologySceneExportPackage['linkTypes'][number],
  ontologyModelID: number,
  objectTypeIdByCode: Map<string, number>
): CreateOntologyLinkTypeReq | null => {
  const detail = item.detail;
  const sourceObjectTypeID = objectTypeIdByCode.get(item.sourceObjectTypeCode);
  const targetObjectTypeID = objectTypeIdByCode.get(item.targetObjectTypeCode);

  if (!sourceObjectTypeID || !targetObjectTypeID) {
    return null;
  }

  const columnList: OntologyLinkTypeColumn[] | undefined =
    detail.ontologyLinkTypeColumnList?.map((column) =>
      stripRuntimeFields({
        name: column.name || '',
        comment: column.comment || '',
        columnType: column.columnType || 'varchar(255)',
        isPrimary: column.isPrimary ? 1 : 0,
        isUse: column.isUse ? 1 : 0
      })
    );

  return {
    code: detail.code || item.code,
    name: detail.name || detail.code || item.code,
    description: detail.description,
    type: detail.type || 1,
    ontologyModelID,
    sourceObjectTypeID,
    targetObjectTypeID,
    linkSourceColumnName: detail.linkSourceColumnName,
    linkTargetColumnName: detail.linkTargetColumnName,
    filePath: detail.filePath,
    sourceType: detail.sourceType,
    linkDbName: detail.linkDBName,
    linkTableName: detail.linkTableName,
    ontologyDbName: detail.ontologyDbName,
    ontologyTableName: detail.ontologyTableName,
    enableSyncSourceData: false,
    ontologyLinkTypeColumnList: columnList
  };
};

const buildFunctionCreatePayload = (
  detail: OntologyFunctionDetail,
  ontologyModelID: number
): Partial<OntologyFunctionDetail> => ({
  code: detail.code,
  name: detail.name,
  description: detail.description,
  content: detail.content,
  ontologyModelID,
  params: detail.params?.map((param) =>
    stripRuntimeFields({
      code: param.code || '',
      name: param.name || '',
      type: param.type,
      description: param.description,
      defaultValue: param.defaultValue,
      required: param.required
    })
  )
});

const buildActionCreatePayload = (
  detail: BehaviorActionDetail,
  ontologyModelID: number,
  objectTypeIdByCode: Map<string, number>,
  functionIdByCode: Map<string, number>,
  objectTypeCode?: string,
  functionCode?: string
): BehaviorActionDetail | null => {
  const resolvedObjectTypeCode =
    objectTypeCode ||
    detail.objectTypeName ||
    String(detail.objectTypeId ?? '');

  const objectTypeId = objectTypeIdByCode.get(resolvedObjectTypeCode);
  if (!objectTypeId) {
    return null;
  }

  const resolvedFunctionCode =
    functionCode || detail.functionName || detail.functionCode || '';
  const functionId = resolvedFunctionCode
    ? functionIdByCode.get(resolvedFunctionCode)
    : detail.functionId;

  return {
    code: detail.code,
    name: detail.name || detail.code,
    description: detail.description || '',
    ontologyModelID,
    objectTypeId,
    functionId,
    params: (detail.params || []).map((param) =>
      stripRuntimeFields({
        code: param.code,
        name: param.name,
        type: param.type,
        uiType: param.uiType,
        enabledValidation: param.enabledValidation,
        defaultValue: param.defaultValue,
        description: param.description,
        validationRule: param.validationRule
      })
    )
  };
};

export const importOntologyScenePackage = async (
  ontologyModelID: number,
  pkg: OntologySceneExportPackage
): Promise<OntologySceneImportResult> => {
  const publicPropertyIdMap = await buildPublicPropertyIdMap(pkg);
  const objectTypeIdByCode = new Map<string, number>();
  let objectTypeCount = 0;

  for (const item of pkg.objectTypes) {
    const payload = buildObjectTypeCreatePayload(
      item.detail,
      ontologyModelID,
      publicPropertyIdMap
    );
    const response = await createOntologyObjectType(payload);

    if (isOntologyApiSuccess(response) && response.data?.data?.id) {
      objectTypeIdByCode.set(item.code, response.data.data.id);
      objectTypeCount += 1;
    }
  }

  let functionCount = 0;

  for (const item of pkg.functions) {
    const payload = buildFunctionCreatePayload(item.detail, ontologyModelID);
    const response = await saveFunction(payload);

    if (response.message === 'ok') {
      functionCount += 1;
    }
  }

  const functionListRes = await getFunctionList({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });
  const functionIdByCode = new Map<string, number>();
  functionListRes.items.forEach((item) => {
    if (item.code && item.id) {
      functionIdByCode.set(item.code, Number(item.id));
    }
  });

  let linkTypeCount = 0;

  for (const item of pkg.linkTypes) {
    const payload = buildLinkTypeCreatePayload(
      item,
      ontologyModelID,
      objectTypeIdByCode
    );

    if (!payload) {
      continue;
    }

    const response = await createOntologyLinkType(payload);
    if (isOntologyApiSuccess(response) && response.data?.id) {
      linkTypeCount += 1;
    }
  }

  let actionCount = 0;

  for (const item of pkg.actions) {
    const payload = buildActionCreatePayload(
      item.detail,
      ontologyModelID,
      objectTypeIdByCode,
      functionIdByCode,
      item.objectTypeCode,
      item.functionCode
    );

    if (!payload) {
      continue;
    }

    const response = await saveBehaviorAction(payload);
    if (response.message === 'ok') {
      actionCount += 1;
    }
  }

  return {
    sceneId: ontologyModelID,
    counts: {
      publicProperties: publicPropertyIdMap.size,
      objectTypes: objectTypeCount,
      linkTypes: linkTypeCount,
      functions: functionCount,
      actions: actionCount
    }
  };
};

export const parseOntologySceneExportFile = async (
  file: File
): Promise<OntologySceneExportPackage> => {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('导入文件格式无效');
  }

  const pkg = parsed as OntologySceneExportPackage;

  if (pkg.version !== '1.0') {
    throw new Error('暂不支持该导出包版本');
  }

  if (!Array.isArray(pkg.objectTypes)) {
    throw new Error('导入文件缺少对象类型数据');
  }

  return pkg;
};
