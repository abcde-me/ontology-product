import type { ObjectType } from '@/types/objectType';
import type { OntologScene } from '@/types/ontologySceneApi';
import { fetchObjectTypeOptions, fetchSceneOptions } from './semanticQuery2';

export interface ObjectTypeWithScene extends ObjectType {
  sceneId: number;
  sceneName: string;
}

export const fetchAllObjectTypesWithScene = async (): Promise<
  ObjectTypeWithScene[]
> => {
  const scenes = await fetchSceneOptions();
  const rows: ObjectTypeWithScene[] = [];

  await Promise.all(
    scenes.map(async (scene) => {
      if (!scene.id) {
        return;
      }

      try {
        const objectTypes = await fetchObjectTypeOptions(scene.id);
        objectTypes.forEach((item) => {
          rows.push({
            ...item,
            sceneId: scene.id!,
            sceneName: scene.name || '未命名场景'
          });
        });
      } catch (error) {
        console.error(`加载场景 ${scene.id} 对象类型失败:`, error);
      }
    })
  );

  return rows;
};

export const getUniqueObjectTypeOptions = (
  rows: ObjectTypeWithScene[]
): ObjectTypeWithScene[] => {
  const map = new Map<string, ObjectTypeWithScene>();

  rows.forEach((item) => {
    const key = item.code || String(item.id);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
};

export const getScenesForObjectType = (
  rows: ObjectTypeWithScene[],
  scenes: OntologScene[],
  objectTypeId?: number
): OntologScene[] => {
  const selected = rows.find((item) => item.id === objectTypeId);
  if (!selected?.code) {
    return [];
  }

  const sceneIds = new Set(
    rows
      .filter((item) => item.code === selected.code)
      .map((item) => item.sceneId)
  );

  return scenes.filter((scene) => scene.id != null && sceneIds.has(scene.id));
};

export const resolveObjectTypeInScene = (
  rows: ObjectTypeWithScene[],
  sceneId?: number,
  objectTypeId?: number
): number | undefined => {
  if (!sceneId || !objectTypeId) {
    return objectTypeId;
  }

  const selected = rows.find((item) => item.id === objectTypeId);
  if (!selected?.code) {
    return objectTypeId;
  }

  return (
    rows.find((item) => item.sceneId === sceneId && item.code === selected.code)
      ?.id ?? objectTypeId
  );
};

export const loadObjectBrowseScopeOptions = async () => {
  const [scenes, allObjectTypes] = await Promise.all([
    fetchSceneOptions(),
    fetchAllObjectTypesWithScene()
  ]);

  return { scenes, allObjectTypes };
};

/** 解析当前场景下可用于实例查询的对象类型 ID（按 code 对齐，避免跨场景 ID 混用） */
export const resolveObjectTypeIdForQuery = async (
  sceneId: number | undefined,
  objectTypeId: number
): Promise<number> => {
  if (!sceneId) {
    return objectTypeId;
  }

  const sceneObjectTypes = await fetchObjectTypeOptions(sceneId);
  const directMatch = sceneObjectTypes.find((item) => item.id === objectTypeId);
  if (directMatch?.id) {
    return directMatch.id;
  }

  const allObjectTypes = await fetchAllObjectTypesWithScene();
  const code = allObjectTypes.find((item) => item.id === objectTypeId)?.code;
  if (!code) {
    return objectTypeId;
  }

  return (
    sceneObjectTypes.find((item) => item.code === code)?.id ??
    resolveObjectTypeInScene(allObjectTypes, sceneId, objectTypeId) ??
    objectTypeId
  );
};

export const resolveObjectTypeForQuery = async (
  sceneId: number | undefined,
  objectTypeId: number
): Promise<{ id: number; code?: string; name?: string }> => {
  const id = await resolveObjectTypeIdForQuery(sceneId, objectTypeId);

  if (!sceneId) {
    return { id };
  }

  const sceneObjectTypes = await fetchObjectTypeOptions(sceneId);
  const matched = sceneObjectTypes.find((item) => item.id === id);

  return {
    id,
    code: matched?.code,
    name: matched?.name
  };
};
