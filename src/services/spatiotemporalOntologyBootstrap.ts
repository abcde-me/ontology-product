import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import {
  SPATIOTEMPORAL_DEMO_STORAGE_KEY,
  SPATIOTEMPORAL_INSTANCES_BY_CODE,
  SPATIOTEMPORAL_OBJECT_TYPES,
  SPATIOTEMPORAL_ONTOLOGY_DESC,
  SPATIOTEMPORAL_ONTOLOGY_NAME,
  buildSpatiotemporalFilePath,
  type SpatiotemporalObjectTypeSeed
} from '@/data/spatiotemporalOntologySeed';
import {
  SourceType,
  type CreateOntologyObjectTypeReq
} from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  cacheDevCsvInstances,
  devCreateOntologyObjectType,
  repairDevObjectTypesForModel
} from '@/utils/devObjectTypeStore';
import {
  devCreateOntologyModel,
  devListOntologyScenes
} from '@/utils/devOntologyStore';

export interface SpatiotemporalDemoOntology {
  sceneId: number;
  sceneName: string;
  objectTypes: Array<{ id: number; code: string; name: string }>;
}

const readCachedDemo = (): SpatiotemporalDemoOntology | null => {
  try {
    const raw = window.localStorage.getItem(SPATIOTEMPORAL_DEMO_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SpatiotemporalDemoOntology;
    if (!parsed?.sceneId || !parsed.objectTypes?.length) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeCachedDemo = (payload: SpatiotemporalDemoOntology) => {
  window.localStorage.setItem(
    SPATIOTEMPORAL_DEMO_STORAGE_KEY,
    JSON.stringify(payload)
  );
};

const isSpatiotemporalSceneName = (name?: string) =>
  name === SPATIOTEMPORAL_ONTOLOGY_NAME ||
  name?.includes('时空态势') ||
  name?.includes('时空分析演示');

const buildObjectTypeRequest = (
  seed: SpatiotemporalObjectTypeSeed,
  ontologyModelID: number
): CreateOntologyObjectTypeReq => {
  const filePath = buildSpatiotemporalFilePath(seed.code);
  const instances = SPATIOTEMPORAL_INSTANCES_BY_CODE[seed.code] || [];
  cacheDevCsvInstances(filePath, instances);

  return {
    code: seed.code,
    name: seed.name,
    description: seed.description,
    ontologyModelID,
    originalDbName: '',
    originalTableName: '',
    sourceType: SourceType.FILE_UPLOAD,
    enableSyncSourceData: false,
    filePath,
    ontologyPhysicalPropertiesList: seed.properties.map((property, index) => ({
      id: index + 1,
      name: property.name,
      comment: property.comment,
      columnType: property.columnType,
      isPrimary: property.isPrimary ? 1 : 0,
      publicPropertyID: 0,
      isUse: 1,
      isStoreAsPublic: 0,
      isVector: 0
    }))
  };
};

const findExistingScene = async (): Promise<{
  id: number;
  name: string;
} | null> => {
  const cached = readCachedDemo();
  if (cached) {
    return { id: cached.sceneId, name: cached.sceneName };
  }

  const localScenes = devListOntologyScenes();
  const localHit = localScenes.find((item) =>
    isSpatiotemporalSceneName(item.name)
  );
  if (localHit?.id) {
    return {
      id: localHit.id,
      name: localHit.name || SPATIOTEMPORAL_ONTOLOGY_NAME
    };
  }

  try {
    const res = await listOntologyModel({
      pageNo: 1,
      pageSize: 100,
      order: 'desc',
      orderBy: 'create_time'
    });
    if (isOntologyApiSuccess(res) && res.data?.result) {
      const hit = res.data.result.find((item) =>
        isSpatiotemporalSceneName(item.name)
      );
      if (hit?.id) {
        return { id: hit.id, name: hit.name || SPATIOTEMPORAL_ONTOLOGY_NAME };
      }
    }
  } catch {
    // fall through to create
  }

  return null;
};

const ensureScene = async (): Promise<{ id: number; name: string }> => {
  const existing = await findExistingScene();
  if (existing) {
    return existing;
  }

  const created = devCreateOntologyModel({
    name: SPATIOTEMPORAL_ONTOLOGY_NAME,
    description: SPATIOTEMPORAL_ONTOLOGY_DESC,
    icon: 'icon-map'
  });

  const sceneId = created.data?.id;
  if (!sceneId) {
    throw new Error('创建演示场景失败');
  }

  return { id: sceneId, name: SPATIOTEMPORAL_ONTOLOGY_NAME };
};

const ensureObjectTypes = async (
  sceneId: number
): Promise<Array<{ id: number; code: string; name: string }>> => {
  const existingRes = await listOntologyObjectType({
    ontologyModelID: sceneId,
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  const existingMap = new Map<string, { id: number; name: string }>();
  if (existingRes.status === 200 && existingRes.data?.result) {
    existingRes.data.result.forEach((item) => {
      if (item.code && item.id != null) {
        existingMap.set(item.code, {
          id: item.id,
          name: item.name || item.code
        });
      }
    });
  }

  const resolved: Array<{ id: number; code: string; name: string }> = [];

  for (const seed of SPATIOTEMPORAL_OBJECT_TYPES) {
    const hit = existingMap.get(seed.code);
    if (hit) {
      resolved.push({ id: hit.id, code: seed.code, name: hit.name });
      continue;
    }

    const created = devCreateOntologyObjectType(
      buildObjectTypeRequest(seed, sceneId)
    );
    const id = created.data?.data?.id;
    if (!id) {
      throw new Error(`创建对象类型「${seed.name}」失败`);
    }
    resolved.push({ id, code: seed.code, name: seed.name });
  }

  repairDevObjectTypesForModel(sceneId, SPATIOTEMPORAL_INSTANCES_BY_CODE);

  return resolved;
};

/**
 * 幂等初始化「海峡时空态势演示」场景及实例数据（dev 环境）
 */
export const ensureSpatiotemporalDemoOntology =
  async (): Promise<SpatiotemporalDemoOntology> => {
    if (!isDevBypassEnabled()) {
      throw new Error('演示数据仅在开发/本地环境可用');
    }

    const cached = readCachedDemo();
    if (cached) {
      repairDevObjectTypesForModel(
        cached.sceneId,
        SPATIOTEMPORAL_INSTANCES_BY_CODE
      );
      return cached;
    }

    const scene = await ensureScene();
    const objectTypes = await ensureObjectTypes(scene.id);
    const payload: SpatiotemporalDemoOntology = {
      sceneId: scene.id,
      sceneName: scene.name,
      objectTypes
    };
    writeCachedDemo(payload);
    return payload;
  };

export const getSpatiotemporalDemoOntology =
  (): SpatiotemporalDemoOntology | null => readCachedDemo();
