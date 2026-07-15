import UAPI from '@/api';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import {
  deleteOntologyObjectType,
  listOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { deleteOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type {
  ListOntologyModelRes,
  OntologScene
} from '@/types/ontologySceneApi';
import { extractListData, isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  purgeOntologySceneCache,
  resolveDevOntologySceneList
} from '@/utils/devOntologyStore';
import { purgeOntologySceneLocalResources } from '@/utils/purgeOntologySceneLocalResources';

export type PurgeEmptyOntologyScenesResult = {
  scanned: number;
  deleted: number;
  deletedIds: number[];
  deletedNames: string[];
};

const EMPTY_PURGE_SESSION_KEY = 'ai_onto_empty_scenes_purged_v1';

const extractObjectTypes = (
  response: Awaited<ReturnType<typeof listOntologyObjectType>>
) => {
  if (!response || !isOntologyApiSuccess(response)) {
    return [];
  }
  const fromResult = response.data?.result;
  if (Array.isArray(fromResult)) {
    return fromResult;
  }
  return extractListData<{ id?: number }>(response);
};

const hasObjectTypeInstances = async (
  objectTypeId: number,
  sceneId: number
): Promise<boolean> => {
  try {
    const response = await listOntologyObjectTypeData({
      id: objectTypeId,
      page: 1,
      pageSize: 1,
      ontologyModelID: sceneId
    });

    if (!isOntologyApiSuccess(response)) {
      return false;
    }

    const total = response.data?.totalCount;
    if (typeof total === 'number') {
      return total > 0;
    }

    return (response.data?.result?.length ?? 0) > 0;
  } catch {
    return false;
  }
};

/** 无对象类型，或全部对象类型均无实例 */
const isEmptyOntologyScene = async (sceneId: number): Promise<boolean> => {
  const otResponse = await listOntologyObjectType({
    ontologyModelID: sceneId,
    pageNo: 1,
    pageSize: -1
  });
  const objectTypes = extractObjectTypes(otResponse).filter(
    (item): item is { id: number } =>
      item?.id != null && Number.isFinite(Number(item.id))
  );

  if (!objectTypes.length) {
    return true;
  }

  for (const objectType of objectTypes) {
    if (await hasObjectTypeInstances(Number(objectType.id), sceneId)) {
      return false;
    }
  }

  return true;
};

/** 直接拉场景列表，跳过 enrichOntologySceneCounts，避免清理本身变成瓶颈 */
const listScenesForPurge = async (): Promise<OntologScene[]> => {
  const merged = new Map<number, OntologScene>();

  if (isDevBypassEnabled()) {
    resolveDevOntologySceneList().forEach((scene) => {
      if (scene.id != null) {
        merged.set(Number(scene.id), scene);
      }
    });
  }

  try {
    const response = (await UAPI.RES.ListOntologyModelApi({})
      .post({
        pageNo: -1,
        pageSize: -1,
        orderBy: 'create_time',
        order: 'desc',
        filter: ''
      })
      .inRegion()
      .do()) as ApiRes<ListOntologyModelRes>;

    if (isOntologyApiSuccess(response)) {
      (response.data?.result || []).forEach((scene) => {
        if (scene.id != null) {
          merged.set(Number(scene.id), scene);
        }
      });
    }
  } catch {
    // 接口失败时仅用本地列表
  }

  return Array.from(merged.values());
};

const deleteSceneThoroughly = async (sceneId: number) => {
  const otResponse = await listOntologyObjectType({
    ontologyModelID: sceneId,
    pageNo: 1,
    pageSize: -1
  });
  const objectTypes = extractObjectTypes(otResponse);

  for (const objectType of objectTypes) {
    const objectTypeId = Number(objectType.id);
    if (!Number.isFinite(objectTypeId) || objectTypeId <= 0) {
      continue;
    }
    try {
      await deleteOntologyObjectType({
        id: objectTypeId,
        ontologyModelID: sceneId
      });
    } catch (error) {
      console.warn('[purge] 删除对象类型失败，继续清理场景', {
        sceneId,
        objectTypeId,
        error
      });
    }
  }

  const deleteResponse = await deleteOntologyModel({ id: sceneId });
  if (!isOntologyApiSuccess(deleteResponse) && isDevBypassEnabled()) {
    purgeOntologySceneCache(sceneId);
  }
  purgeOntologySceneLocalResources(sceneId);
};

/**
 * 彻底删除「无对象类型」或「有对象类型但无任何对象实例」的场景库。
 * 同会话内默认只自动执行一次，避免列表刷新重复扫描。
 */
export const purgeEmptyOntologyScenes = async (options?: {
  force?: boolean;
}): Promise<PurgeEmptyOntologyScenesResult> => {
  const force = options?.force === true;

  if (!force) {
    try {
      if (window.sessionStorage.getItem(EMPTY_PURGE_SESSION_KEY) === '1') {
        return {
          scanned: 0,
          deleted: 0,
          deletedIds: [],
          deletedNames: []
        };
      }
    } catch {
      // ignore
    }
  }

  const scenes = await listScenesForPurge();
  const deletedIds: number[] = [];
  const deletedNames: string[] = [];

  for (const scene of scenes) {
    const sceneId = Number(scene.id);
    if (!Number.isFinite(sceneId) || sceneId <= 0) {
      continue;
    }

    let empty = false;
    try {
      empty = await isEmptyOntologyScene(sceneId);
    } catch (error) {
      console.warn('[purge] 判断空场景失败，跳过', { sceneId, error });
      continue;
    }

    if (!empty) {
      continue;
    }

    try {
      await deleteSceneThoroughly(sceneId);
      deletedIds.push(sceneId);
      deletedNames.push(scene.name || `场景-${sceneId}`);
    } catch (error) {
      console.warn('[purge] 删除空场景失败', { sceneId, error });
      // 仍尝试本地清理，避免脏缓存继续拖慢列表
      if (isDevBypassEnabled()) {
        purgeOntologySceneCache(sceneId);
        purgeOntologySceneLocalResources(sceneId);
        deletedIds.push(sceneId);
        deletedNames.push(scene.name || `场景-${sceneId}`);
      }
    }
  }

  try {
    window.sessionStorage.setItem(EMPTY_PURGE_SESSION_KEY, '1');
  } catch {
    // ignore
  }

  if (deletedIds.length) {
    console.info(
      `[purge] 已彻底删除 ${deletedIds.length} 个空场景库:`,
      deletedNames
    );
  }

  return {
    scanned: scenes.length,
    deleted: deletedIds.length,
    deletedIds,
    deletedNames
  };
};
