import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { OntologScene } from '@/types/ontologySceneApi';
import { extractListData, isOntologyApiSuccess } from '@/utils/apiResponse';

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

const resolveListCount = (
  response: { data?: { result?: unknown[]; totalCount?: number } } | null,
  items: unknown[],
  fallback = 0
): number => {
  if (!response || !isOntologyApiSuccess(response)) {
    return Math.max(fallback, items.length);
  }

  const total = response.data?.totalCount;
  if (typeof total === 'number' && total >= 0) {
    return Math.max(total, items.length);
  }

  return items.length || fallback;
};

const countObjectTypes = async (sceneId: number, fallback = 0) => {
  const response = await listOntologyObjectType({
    ontologyModelID: sceneId,
    pageNo: 1,
    pageSize: -1
  });
  const items = extractOntologyListResult(response);
  return resolveListCount(response, items, fallback);
};

const countLinkTypes = async (sceneId: number, fallback = 0) => {
  const response = await listOntologyLinkType({
    ontologyModelID: sceneId,
    pageNo: 1,
    pageSize: -1
  });
  const items = extractOntologyListResult(response);
  return resolveListCount(response, items, fallback);
};

const countActions = async (sceneId: number, fallback = 0) => {
  const response = await getActionList({
    ontologyModelID: sceneId,
    pageNum: 1,
    pageSize: 1
  });
  const total = response.total ?? response.items?.length ?? 0;
  return total >= 0 ? total : fallback;
};

const countFunctions = async (sceneId: number, fallback = 0) => {
  const response = await getFunctionList({
    ontologyModelID: sceneId,
    pageNum: 1,
    pageNo: 1,
    pageSize: 1
  });
  const total = response.total ?? response.items?.length ?? 0;
  return total >= 0 ? total : fallback;
};

const countSceneResources = async (scene: OntologScene) => {
  const sceneId = scene.id!;

  const [
    ontologyObjectTypeCounts,
    ontologyLinkTypeCounts,
    ontologyActionCounts,
    ontologyFunctionCounts
  ] = await Promise.all([
    countObjectTypes(sceneId, scene.ontologyObjectTypeCounts ?? 0).catch(
      () => scene.ontologyObjectTypeCounts ?? 0
    ),
    countLinkTypes(sceneId, scene.ontologyLinkTypeCounts ?? 0).catch(
      () => scene.ontologyLinkTypeCounts ?? 0
    ),
    countActions(sceneId, scene.ontologyActionCounts ?? 0).catch(
      () => scene.ontologyActionCounts ?? 0
    ),
    countFunctions(sceneId, scene.ontologyFunctionCounts ?? 0).catch(
      () => scene.ontologyFunctionCounts ?? 0
    )
  ]);

  return {
    ontologyObjectTypeCounts,
    ontologyLinkTypeCounts,
    ontologyActionCounts,
    ontologyFunctionCounts
  };
};

/** 用子资源列表接口回填场景卡片上的对象/链接/行为/函数数量 */
export const enrichOntologySceneCounts = async (
  scenes: OntologScene[]
): Promise<OntologScene[]> => {
  if (!scenes.length) {
    return scenes;
  }

  const enriched = await Promise.all(
    scenes.map(async (scene) => {
      if (!scene.id) {
        return scene;
      }

      const counts = await countSceneResources(scene);
      return {
        ...scene,
        ...counts
      };
    })
  );

  return enriched;
};
