import {
  createOntologyObjectType,
  listOntologyObjectType,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import {
  createOntologyLinkType,
  updateOntologyLinkType
} from '@/api/ontologySceneLibrary/links';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import {
  JOINT_OPERATIONS_LINK_TYPES,
  JOINT_OPERATIONS_OBJECT_TYPES,
  JOINT_OPERATIONS_ONTOLOGY_NAME,
  isJointOperationsOntologyName,
  type JointOpsObjectTypeSeed
} from '@/data/jointOperationsOntologySeed';
import {
  CreateOntologyObjectTypeReq,
  CreateOntologyPhysicalProperty,
  SourceType
} from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { JOINT_OPERATIONS_GRAPH_INSTANCES } from '@/data/jointOperationsGraphData';
import {
  cacheDevCsvInstances,
  devMirrorOntologyObjectType,
  repairDevObjectTypesForModel
} from '@/utils/devObjectTypeStore';
import { devUpdateOntologyLinkType } from '@/utils/devLinkTypeStore';

export interface BootstrapResult {
  ontologyModelID: number;
  ontologyName: string;
  createdObjectTypes: string[];
  skippedObjectTypes: string[];
  createdLinks: string[];
  skippedLinks: string[];
  repairedObjectTypes: string[];
  repairedLinks: string[];
  errors: string[];
}

const buildFilePath = (code: string) => `dev://joint-operations/${code}.csv`;

const buildProperties = (
  seed: JointOpsObjectTypeSeed
): CreateOntologyPhysicalProperty[] =>
  seed.properties.map((property, index) => ({
    id: index + 1,
    name: property.name,
    comment: property.comment,
    columnType: property.columnType,
    isPrimary: property.isPrimary ? 1 : 0,
    publicPropertyID: 0,
    isUse: 1,
    isStoreAsPublic: 0,
    isVector: 0
  }));

const cacheInstancesForSeed = (seed: JointOpsObjectTypeSeed) => {
  const instances = JOINT_OPERATIONS_GRAPH_INSTANCES[seed.code] || [];
  if (!instances.length) {
    return;
  }
  cacheDevCsvInstances(buildFilePath(seed.code), instances);
};

const buildObjectTypeRequest = (
  seed: JointOpsObjectTypeSeed,
  ontologyModelID: number
): CreateOntologyObjectTypeReq => {
  cacheInstancesForSeed(seed);

  return {
    code: seed.code,
    name: seed.name,
    description: seed.description,
    icon: seed.icon,
    ontologyModelID,
    originalDbName: '',
    originalTableName: '',
    sourceType: SourceType.FILE_UPLOAD,
    enableSyncSourceData: false,
    filePath: buildFilePath(seed.code),
    ontologyPhysicalPropertiesList: buildProperties(seed)
  };
};

const extractObjectTypeId = (response: {
  data?: { data?: { id?: number }; id?: number };
}): number | undefined => response.data?.data?.id ?? response.data?.id;

/** 按名称查找「联合作战」本体场景库 */
export const findJointOperationsOntologyModel = async () => {
  const res = await listOntologyModel({
    pageNo: 1,
    pageSize: 100,
    order: 'desc',
    orderBy: 'create_time'
  });

  if (!isOntologyApiSuccess(res) || !res.data?.result?.length) {
    return null;
  }

  return (
    res.data.result.find((item) => isJointOperationsOntologyName(item.name)) ||
    null
  );
};

/**
 * 将 docs/联合作战.txt 推导的对象类型与链接写入指定本体场景库（按 code 幂等）
 */
export const bootstrapJointOperationsOntology = async (
  ontologyModelID: number,
  ontologyName = JOINT_OPERATIONS_ONTOLOGY_NAME
): Promise<BootstrapResult> => {
  const result: BootstrapResult = {
    ontologyModelID,
    ontologyName,
    createdObjectTypes: [],
    skippedObjectTypes: [],
    createdLinks: [],
    skippedLinks: [],
    repairedObjectTypes: [],
    repairedLinks: [],
    errors: []
  };

  if (isDevBypassEnabled()) {
    repairDevObjectTypesForModel(
      ontologyModelID,
      JOINT_OPERATIONS_GRAPH_INSTANCES
    );
  }

  const listRes = await listOntologyObjectType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  const existingByCode = new Map<string, number>();
  if (isOntologyApiSuccess(listRes)) {
    (listRes.data?.result || []).forEach((item) => {
      if (item.code) {
        existingByCode.set(item.code, item.id);
      }
    });
  }

  const codeToId = new Map<string, number>(existingByCode);

  for (const seed of JOINT_OPERATIONS_OBJECT_TYPES) {
    if (codeToId.has(seed.code)) {
      result.skippedObjectTypes.push(seed.code);
      if (isDevBypassEnabled()) {
        cacheInstancesForSeed(seed);
      }
      continue;
    }

    try {
      const response = await createOntologyObjectType(
        buildObjectTypeRequest(seed, ontologyModelID)
      );

      if (isOntologyApiSuccess(response)) {
        const id = extractObjectTypeId(response);
        if (id) {
          codeToId.set(seed.code, id);
          if (isDevBypassEnabled()) {
            devMirrorOntologyObjectType(
              id,
              buildObjectTypeRequest(seed, ontologyModelID),
              JOINT_OPERATIONS_GRAPH_INSTANCES[seed.code]
            );
          }
        }
        result.createdObjectTypes.push(seed.code);
      } else {
        result.errors.push(
          `对象类型 ${seed.code}: ${response.message || '创建失败'}`
        );
      }
    } catch (error) {
      result.errors.push(
        `对象类型 ${seed.code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  const existingLinkCodes = new Set<string>();
  const linkListRes = await listOntologyLinkType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });
  if (isOntologyApiSuccess(linkListRes)) {
    (linkListRes.data?.result || []).forEach((item) => {
      if (item.code) {
        existingLinkCodes.add(item.code);
      }
    });
  }

  const existingLinkItems = isOntologyApiSuccess(linkListRes)
    ? linkListRes.data?.result || []
    : [];

  for (const linkSeed of JOINT_OPERATIONS_LINK_TYPES) {
    if (existingLinkCodes.has(linkSeed.code)) {
      result.skippedLinks.push(linkSeed.code);
      continue;
    }

    const sourceId = codeToId.get(linkSeed.sourceCode);
    const targetId = codeToId.get(linkSeed.targetCode);

    if (!sourceId || !targetId) {
      result.errors.push(
        `链接 ${linkSeed.code}: 缺少对象类型 ${linkSeed.sourceCode} 或 ${linkSeed.targetCode}`
      );
      continue;
    }

    try {
      const response = await createOntologyLinkType({
        code: linkSeed.code,
        name: linkSeed.name,
        description: linkSeed.description,
        type: linkSeed.type,
        ontologyModelID,
        sourceObjectTypeID: sourceId,
        targetObjectTypeID: targetId,
        enableSyncSourceData: false
      });

      if (isOntologyApiSuccess(response)) {
        existingLinkCodes.add(linkSeed.code);
        result.createdLinks.push(linkSeed.code);
      } else {
        result.errors.push(
          `链接 ${linkSeed.code}: ${response.message || '创建失败'}`
        );
      }
    } catch (error) {
      result.errors.push(
        `链接 ${linkSeed.code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  for (const seed of JOINT_OPERATIONS_OBJECT_TYPES) {
    const objectTypeId = codeToId.get(seed.code);
    if (!objectTypeId) {
      continue;
    }

    try {
      const updateRes = await updateOntologyObjectType({
        ...buildObjectTypeRequest(seed, ontologyModelID),
        id: objectTypeId,
        isReUpload: 0
      });

      if (isOntologyApiSuccess(updateRes)) {
        result.repairedObjectTypes.push(seed.code);
        if (isDevBypassEnabled()) {
          devMirrorOntologyObjectType(
            objectTypeId,
            buildObjectTypeRequest(seed, ontologyModelID),
            JOINT_OPERATIONS_GRAPH_INSTANCES[seed.code]
          );
        }
      }
    } catch (error) {
      result.errors.push(
        `修复 ${seed.code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  if (isDevBypassEnabled()) {
    repairDevObjectTypesForModel(
      ontologyModelID,
      JOINT_OPERATIONS_GRAPH_INSTANCES
    );
  }

  const latestLinkListRes = await listOntologyLinkType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });
  const latestLinks = isOntologyApiSuccess(latestLinkListRes)
    ? latestLinkListRes.data?.result || []
    : existingLinkItems;

  for (const linkSeed of JOINT_OPERATIONS_LINK_TYPES) {
    const existing = latestLinks.find((item) => item.code === linkSeed.code);
    const sourceId = codeToId.get(linkSeed.sourceCode);
    const targetId = codeToId.get(linkSeed.targetCode);

    if (!existing?.id || !sourceId || !targetId) {
      continue;
    }

    if (
      existing.sourceObjectTypeID === sourceId &&
      existing.targetObjectTypeID === targetId
    ) {
      continue;
    }

    try {
      const updateRes = await updateOntologyLinkType({
        id: existing.id,
        code: existing.code || linkSeed.code,
        name: existing.name || linkSeed.name,
        description: existing.description || linkSeed.description,
        type: existing.type ?? linkSeed.type,
        ontologyModelID,
        sourceObjectTypeID: sourceId,
        targetObjectTypeID: targetId,
        enableSyncSourceData: false
      });

      if (isOntologyApiSuccess(updateRes)) {
        result.repairedLinks.push(linkSeed.code);
        if (isDevBypassEnabled()) {
          devUpdateOntologyLinkType({
            id: existing.id,
            code: existing.code || linkSeed.code,
            name: existing.name || linkSeed.name,
            description: existing.description || linkSeed.description,
            type: existing.type ?? linkSeed.type,
            ontologyModelID,
            sourceObjectTypeID: sourceId,
            targetObjectTypeID: targetId,
            enableSyncSourceData: false
          });
        }
      }
    } catch (error) {
      result.errors.push(
        `修复链接 ${linkSeed.code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return result;
};
