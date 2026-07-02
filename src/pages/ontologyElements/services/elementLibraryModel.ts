import {
  createOntologyModel,
  listOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

export const ONTOLOGY_ELEMENTS_LIBRARY_SCENE_NAME = '本体要素库';

const STORAGE_KEY = 'ontology_elements_library_model_id';

export const isOntologyElementsLibraryScene = (
  sceneId?: number | null,
  sceneName?: string | null
) => {
  if (sceneName === ONTOLOGY_ELEMENTS_LIBRARY_SCENE_NAME) {
    return true;
  }

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached || sceneId == null) {
    return false;
  }

  return String(sceneId) === cached;
};

export const resolveOntologyElementsLibraryModelId =
  async (): Promise<number> => {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const id = Number(cached);
      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    }

    const listRes = await listOntologyModel({
      pageNo: -1,
      pageSize: -1,
      order: 'desc'
    });

    if (isOntologyApiSuccess(listRes) && listRes.data?.result) {
      const matched = listRes.data.result.find(
        (scene) =>
          scene.name === ONTOLOGY_ELEMENTS_LIBRARY_SCENE_NAME &&
          scene.id != null
      );
      if (matched?.id) {
        window.localStorage.setItem(STORAGE_KEY, String(matched.id));
        return matched.id;
      }
    }

    const createRes = await createOntologyModel({
      name: ONTOLOGY_ELEMENTS_LIBRARY_SCENE_NAME,
      description:
        '跨场景共享的对象类型与链接要素池；业务场景库创建时通过绑定组合引用',
      icon: 'object-type-1',
      tagIdList: []
    });

    if (!isOntologyApiSuccess(createRes) || !createRes.data?.id) {
      throw new Error(createRes.message || '无法初始化本体要素库');
    }

    window.localStorage.setItem(STORAGE_KEY, String(createRes.data.id));
    return createRes.data.id;
  };
