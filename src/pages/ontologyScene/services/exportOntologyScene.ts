import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { getOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import {
  getActionDetail,
  getActionList
} from '@/api/ontologySceneLibrary/ontologyAction';
import {
  getFunctionDetail,
  getFunctionList
} from '@/api/ontologySceneLibrary/ontologyFunction';
import {
  getOntologyModelDetail,
  listOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import { listOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';
import {
  getOntologyObjectTypeDetail,
  listOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import type {
  ExportedAction,
  ExportedFunction,
  ExportedLinkType,
  ExportedObjectType,
  ExportedPublicProperty,
  OntologySceneExportPackage
} from '@/types/ontologySceneMigration';
import { ONTOLOGY_SCENE_EXPORT_VERSION } from '@/types/ontologySceneMigration';
import type { LinkInfo } from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import { extractListData, isOntologyApiSuccess } from '@/utils/apiResponse';
import { downloadBlob } from '@/utils/download';
import dayjs from 'dayjs';

const LIST_PAGE_SIZE = 500;

const extractOntologyListResult = <T>(
  response: { data?: { result?: T[]; totalCount?: number } } | null | undefined
): T[] => {
  if (!response || !isOntologyApiSuccess(response)) {
    return [];
  }

  const fromResult = response.data?.result;
  if (Array.isArray(fromResult)) {
    return fromResult;
  }

  return extractListData<T>(response);
};

const fetchAllObjectTypes = async (
  ontologyModelID: number
): Promise<ObjectType[]> => {
  const response = await listOntologyObjectType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  return extractOntologyListResult<ObjectType>(response);
};

const fetchAllLinkTypes = async (
  ontologyModelID: number
): Promise<LinkInfo[]> => {
  const firstResponse = await listOntologyLinkType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  const firstBatch = extractOntologyListResult<LinkInfo>(firstResponse);
  const totalCount = firstResponse?.data?.totalCount ?? firstBatch.length;

  if (firstBatch.length >= totalCount) {
    return firstBatch;
  }

  const all = [...firstBatch];
  let pageNo = 2;

  while (all.length < totalCount) {
    const response = await listOntologyLinkType({
      ontologyModelID,
      pageNo,
      pageSize: LIST_PAGE_SIZE
    });
    const batch = extractOntologyListResult<LinkInfo>(response);

    if (!batch.length) {
      break;
    }

    all.push(...batch);

    if (batch.length < LIST_PAGE_SIZE) {
      break;
    }

    pageNo += 1;
  }

  return all;
};

const fetchAllActions = async (ontologyModelID: number) => {
  const { items, total } = await getActionList({
    ontologyModelID,
    pageNum: 1,
    pageSize: LIST_PAGE_SIZE
  });

  if (items.length >= total) {
    return items;
  }

  const all = [...items];
  let pageNum = 2;

  while (all.length < total) {
    const next = await getActionList({
      ontologyModelID,
      pageNum,
      pageSize: LIST_PAGE_SIZE
    });

    if (!next.items.length) {
      break;
    }

    all.push(...next.items);

    if (next.items.length < LIST_PAGE_SIZE) {
      break;
    }

    pageNum += 1;
  }

  return all;
};

const fetchAllFunctions = async (ontologyModelID: number) => {
  const { items, total } = await getFunctionList({
    ontologyModelID,
    pageNo: 1,
    pageSize: LIST_PAGE_SIZE
  });

  if (items.length >= total) {
    return items;
  }

  const all = [...items];
  let pageNo = 2;

  while (all.length < total) {
    const next = await getFunctionList({
      ontologyModelID,
      pageNo,
      pageSize: LIST_PAGE_SIZE
    });

    if (!next.items.length) {
      break;
    }

    all.push(...next.items);

    if (next.items.length < LIST_PAGE_SIZE) {
      break;
    }

    pageNo += 1;
  }

  return all;
};

const fetchAllPublicProperties = async () => {
  const response = await listOntologyPublicProperties({
    pageNo: 1,
    pageSize: -1
  });

  return extractOntologyListResult(response);
};

const sanitizeFileName = (name: string) =>
  name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'ontology_scene';

export const buildOntologySceneExportPackage = async (
  sceneId: number
): Promise<OntologySceneExportPackage> => {
  const detailRes = await getOntologyModelDetail({ id: sceneId });
  if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
    throw new Error(detailRes.message || '获取场景详情失败');
  }

  const sceneDetail = detailRes.data;
  const objectTypeList = await fetchAllObjectTypes(sceneId);
  const objectTypeCodeById = new Map<number, string>();

  objectTypeList.forEach((item) => {
    if (item.id && item.code) {
      objectTypeCodeById.set(item.id, item.code);
    }
  });

  const objectTypes: ExportedObjectType[] = [];

  for (const item of objectTypeList) {
    if (!item.id) {
      continue;
    }

    const detailRes = await getOntologyObjectTypeDetail({ id: item.id });
    if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
      continue;
    }

    objectTypes.push({
      exportId: item.id,
      code: detailRes.data.code || item.code || String(item.id),
      detail: detailRes.data
    });
  }

  const linkTypeList = await fetchAllLinkTypes(sceneId);
  const linkTypes: ExportedLinkType[] = [];

  for (const item of linkTypeList) {
    if (!item.id) {
      continue;
    }

    const detailRes = await getOntologyLinkType({ id: item.id });
    if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
      continue;
    }

    const detail = detailRes.data;
    linkTypes.push({
      exportId: item.id,
      code: detail.code || item.code || String(item.id),
      sourceObjectTypeCode:
        objectTypeCodeById.get(detail.sourceObjectTypeID || 0) ||
        item.sourceObjectTypeName ||
        '',
      targetObjectTypeCode:
        objectTypeCodeById.get(detail.targetObjectTypeID || 0) ||
        item.targetObjectTypeName ||
        '',
      detail
    });
  }

  const actionList = await fetchAllActions(sceneId);
  const functionList = await fetchAllFunctions(sceneId);
  const functionCodeById = new Map<number, string>();

  functionList.forEach((item) => {
    if (item.id && item.code) {
      functionCodeById.set(Number(item.id), item.code);
    }
  });

  const actions: ExportedAction[] = [];

  for (const item of actionList) {
    if (!item.id) {
      continue;
    }

    const detail = await getActionDetail(item.id);
    if (!detail) {
      continue;
    }

    actions.push({
      exportId: Number(item.id),
      code: detail.code || item.code || String(item.id),
      objectTypeCode:
        objectTypeCodeById.get(Number(detail.objectTypeId)) ||
        detail.objectTypeName,
      functionCode:
        functionCodeById.get(Number(detail.functionId)) ||
        detail.functionCode ||
        detail.functionName,
      detail
    });
  }

  const functions: ExportedFunction[] = [];

  for (const item of functionList) {
    if (!item.id) {
      continue;
    }

    const detail = await getFunctionDetail(item.id);
    if (!detail) {
      continue;
    }

    functions.push({
      exportId: Number(item.id),
      code: detail.code || item.code || String(item.id),
      detail
    });
  }

  const publicPropertyList = await fetchAllPublicProperties();
  const usedPublicPropertyIds = new Set<number>();

  objectTypes.forEach(({ detail }) => {
    detail.ontologyPhysicalPropertiesList?.forEach((property) => {
      if (property.publicPropertyID) {
        usedPublicPropertyIds.add(property.publicPropertyID);
      }
    });
  });

  const publicProperties: ExportedPublicProperty[] = publicPropertyList
    .filter((item) => item.id && usedPublicPropertyIds.has(item.id))
    .map((item) => ({
      exportId: item.id!,
      name: item.name || item.comment || String(item.id),
      detail: item
    }));

  return {
    version: ONTOLOGY_SCENE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    sourceScene: {
      id: sceneDetail.id,
      name: sceneDetail.name,
      updateTime: sceneDetail.updateTime,
      updateUser: sceneDetail.updateUser
    },
    scene: {
      name: sceneDetail.name || '',
      description: sceneDetail.description,
      icon: sceneDetail.icon
    },
    publicProperties,
    objectTypes,
    linkTypes,
    functions,
    actions
  };
};

export const downloadOntologySceneExportPackage = (
  pkg: OntologySceneExportPackage
) => {
  const fileName = `${sanitizeFileName(pkg.scene.name)}_ontology_${dayjs().format(
    'YYYYMMDD_HHmmss'
  )}.json`;
  const blob = new Blob([JSON.stringify(pkg, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  downloadBlob(blob, fileName);
};

export const exportOntologyScene = async (sceneId: number) => {
  const pkg = await buildOntologySceneExportPackage(sceneId);
  downloadOntologySceneExportPackage(pkg);
  return pkg;
};

/** 根据场景 ID 查找场景（导出前校验） */
export const resolveOntologySceneForExport = async (sceneId: number) => {
  const detailRes = await getOntologyModelDetail({ id: sceneId });
  if (isOntologyApiSuccess(detailRes) && detailRes.data) {
    return detailRes.data;
  }

  const listRes = await listOntologyModel({
    pageNo: 1,
    pageSize: 1,
    filter: String(sceneId)
  });

  if (isOntologyApiSuccess(listRes)) {
    return listRes.data?.result?.find((item) => item.id === sceneId);
  }

  return undefined;
};
