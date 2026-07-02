import type {
  CreateOntologyModelReq,
  ListOntologyModelRes,
  OntologScene
} from '@/types/ontologySceneApi';
import { sortOntologyScenesByCreateTimeDesc } from '@/utils/sortOntologyScenes';
const STORAGE_KEY = 'dev_ontology_scenes';
const DETAIL_SNAPSHOT_KEY = 'ontology_scene_detail_snapshots';

const readScenes = (): OntologScene[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeScenes = (scenes: OntologScene[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
};

export const isPermissionRelatedError = (message?: string) =>
  !!message?.includes('权限');

export const devCreateOntologyModel = (params: CreateOntologyModelReq) => {
  const scenes = readScenes();
  const id = Date.now();
  const scene: OntologScene = {
    id,
    name: params.name,
    description: params.description,
    icon: params.icon,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    ontologyObjectTypeCounts: 0,
    ontologyLinkTypeCounts: 0,
    ontologyActionCounts: 0,
    ontologyFunctionCounts: 0
  };

  writeScenes([scene, ...scenes]);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: { id }
  };
};

export const devListOntologyScenes = () => readScenes();

/** 缓存列表/详情页已加载的场景快照，刷新详情页时可回退 */
export const cacheOntologySceneDetailSnapshot = (scene: OntologScene) => {
  if (!scene.id) {
    return;
  }

  try {
    const raw = window.sessionStorage.getItem(DETAIL_SNAPSHOT_KEY);
    const map: Record<string, OntologScene> = raw ? JSON.parse(raw) : {};
    map[String(scene.id)] = scene;
    window.sessionStorage.setItem(DETAIL_SNAPSHOT_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

export const getCachedOntologySceneDetailSnapshot = (
  id: number
): OntologScene | null => {
  try {
    const raw = window.sessionStorage.getItem(DETAIL_SNAPSHOT_KEY);
    if (!raw) {
      return null;
    }
    const map: Record<string, OntologScene> = JSON.parse(raw);
    return map[String(id)] ?? null;
  } catch {
    return null;
  }
};

/** 读取会话内缓存的全部场景快照（列表页刷新后可回退） */
export const listCachedOntologySceneSnapshots = (): OntologScene[] => {
  try {
    const raw = window.sessionStorage.getItem(DETAIL_SNAPSHOT_KEY);
    if (!raw) {
      return [];
    }
    const map: Record<string, OntologScene> = JSON.parse(raw);
    return Object.values(map).filter(
      (scene): scene is OntologScene => scene?.id != null
    );
  } catch {
    return [];
  }
};

/** 将场景写入本地列表缓存，供接口不可用时恢复列表 */
export const persistDevOntologyScene = (scene: OntologScene) => {
  if (!scene.id) {
    return;
  }

  const scenes = readScenes();
  const index = scenes.findIndex(
    (item) => Number(item.id) === Number(scene.id)
  );

  if (index >= 0) {
    scenes[index] = { ...scenes[index], ...scene };
  } else {
    scenes.unshift(scene);
  }

  writeScenes(scenes);
};

const matchesSceneFilter = (scene: OntologScene, filter = '') => {
  const keyword = filter.trim().toLowerCase();
  if (!keyword) {
    return true;
  }

  const name = scene.name?.toLowerCase() || '';
  const description = scene.description?.toLowerCase() || '';
  return name.includes(keyword) || description.includes(keyword);
};

/** 合并本地持久化 + 会话快照，得到可展示的场景列表 */
export const resolveDevOntologySceneList = (filter = ''): OntologScene[] => {
  const merged = new Map<number, OntologScene>();

  devListOntologyScenes().forEach((scene) => {
    if (scene.id != null) {
      merged.set(Number(scene.id), scene);
    }
  });

  listCachedOntologySceneSnapshots().forEach((scene) => {
    const sceneId = Number(scene.id);
    if (!Number.isFinite(sceneId)) {
      return;
    }

    const existing = merged.get(sceneId);
    merged.set(sceneId, existing ? { ...existing, ...scene } : scene);
  });

  return sortOntologyScenesByCreateTimeDesc(
    Array.from(merged.values()).filter((scene) =>
      matchesSceneFilter(scene, filter)
    )
  );
};

const wrapOntologySceneDetailResponse = (
  scene: OntologScene
): ApiRes<OntologScene> => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: scene
});

export const devGetOntologyModelDetail = (
  id: number
): ApiRes<OntologScene> | null => {
  const scene = readScenes().find((item) => Number(item.id) === Number(id));
  if (!scene) {
    return null;
  }

  return wrapOntologySceneDetailResponse(scene);
};

export const buildDevOntologyModelDetailStub = (
  id: number
): ApiRes<OntologScene> => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: {
    id,
    name: `本体场景-${id}`,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
});

export const isDevOntologyScene = (id: number) =>
  readScenes().some((scene) => Number(scene.id) === Number(id));

/** 删除后清理本地持久化与会话快照，避免列表合并时把已删场景重新展示 */
export const purgeOntologySceneCache = (id: number) => {
  const sceneId = Number(id);
  if (!Number.isFinite(sceneId)) {
    return;
  }

  writeScenes(readScenes().filter((scene) => Number(scene.id) !== sceneId));

  try {
    const raw = window.sessionStorage.getItem(DETAIL_SNAPSHOT_KEY);
    if (!raw) {
      return;
    }
    const map: Record<string, OntologScene> = JSON.parse(raw);
    delete map[String(sceneId)];
    window.sessionStorage.setItem(DETAIL_SNAPSHOT_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

export const devDeleteOntologyModel = (id: number) => {
  purgeOntologySceneCache(id);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: ''
  };
};

/** 更新本地持久化与会话快照中的场景基础信息 */
export const patchOntologySceneCache = (
  id: number,
  patch: Pick<OntologScene, 'name' | 'description' | 'icon'>
) => {
  const sceneId = Number(id);
  if (!Number.isFinite(sceneId)) {
    return;
  }

  const existing = getCachedOntologySceneDetailSnapshot(sceneId) ||
    readScenes().find((scene) => Number(scene.id) === sceneId) || {
      id: sceneId,
      createTime: new Date().toISOString()
    };

  const updated: OntologScene = {
    ...existing,
    ...patch,
    id: sceneId,
    updateTime: new Date().toISOString()
  };

  cacheOntologySceneDetailSnapshot(updated);
  persistDevOntologyScene(updated);
};

export const devUpdateOntologyModel = (params: {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}) => {
  patchOntologySceneCache(params.id, {
    name: params.name,
    description: params.description,
    icon: params.icon
  });

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: ''
  };
};

export const buildDevListResponse = (
  filter = ''
): ApiRes<ListOntologyModelRes> => {
  const devScenes = resolveDevOntologySceneList(filter);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result: devScenes,
      totalCount: devScenes.length
    }
  };
};

export const LOCAL_LLM_APP_PREFIX = 'local-llm-';

export const isLocalLlmAppId = (appId?: string) =>
  !!appId?.startsWith(LOCAL_LLM_APP_PREFIX);

/** 开发环境：后端 Agent 不可用时，使用本地 LLM 直连占位 appID */
export const devCreateLocalLlmAgent = (ontologyModelId: number) => {
  const appID = `${LOCAL_LLM_APP_PREFIX}${ontologyModelId}`;
  const scenes = readScenes();
  const nextScenes = scenes.map((scene) =>
    scene.id === ontologyModelId ? { ...scene, appID } : scene
  );

  if (!nextScenes.some((scene) => scene.id === ontologyModelId)) {
    nextScenes.unshift({
      id: ontologyModelId,
      name: `本体场景-${ontologyModelId}`,
      appID,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    });
  }

  writeScenes(nextScenes);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: { appID }
  };
};

export const devCreateOntologyAgent = (ontologyModelId: number) => {
  const appID = `dev-app-${ontologyModelId}`;
  const scenes = readScenes();
  const nextScenes = scenes.map((scene) =>
    scene.id === ontologyModelId ? { ...scene, appID } : scene
  );

  if (!nextScenes.some((scene) => scene.id === ontologyModelId)) {
    nextScenes.unshift({
      id: ontologyModelId,
      name: `本体场景-${ontologyModelId}`,
      appID,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    });
  }

  writeScenes(nextScenes);

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: { appID }
  };
};

export const devGetOntologyAgentId = (ontologyModelId: number) => {
  const scene = readScenes().find((item) => item.id === ontologyModelId);
  return scene?.appID;
};

export const devClearOntologyAgentId = (ontologyModelId: number) => {
  const scenes = readScenes();
  writeScenes(
    scenes.map((scene) =>
      scene.id === ontologyModelId ? { ...scene, appID: undefined } : scene
    )
  );
};

export const devSetOntologyAgentId = (
  ontologyModelId: number,
  appID: string
) => {
  const scenes = readScenes();
  const hasScene = scenes.some((scene) => scene.id === ontologyModelId);

  if (!hasScene) {
    return;
  }

  writeScenes(
    scenes.map((scene) =>
      scene.id === ontologyModelId ? { ...scene, appID } : scene
    )
  );
};
