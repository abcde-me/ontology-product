import { devDeleteOntologyLinkTypesByModelId } from '@/utils/devLinkTypeStore';
import { devDeleteOntologyObjectTypesByModelId } from '@/utils/devObjectTypeStore';

const SCENE_VERSION_PREFIX = 'ai_onto_scene_versions_v1_';
const JOINT_OPS_PREFIX = 'dev_joint_operations_knowledge_';
const SCENE_PLAN_INTRO_PREFIX = 'dev_scene_plan_intro_';

/**
 * 删除场景后级联清理本地附属数据，避免 OT/链接/版本等成为孤儿并拖慢列表。
 */
export const purgeOntologySceneLocalResources = (ontologyModelId: number) => {
  const sceneId = Number(ontologyModelId);
  if (!Number.isFinite(sceneId) || sceneId <= 0) {
    return;
  }

  try {
    devDeleteOntologyObjectTypesByModelId(sceneId);
  } catch {
    // ignore
  }

  try {
    devDeleteOntologyLinkTypesByModelId(sceneId);
  } catch {
    // ignore
  }

  try {
    window.localStorage.removeItem(`${SCENE_VERSION_PREFIX}${sceneId}`);
    window.localStorage.removeItem(`${JOINT_OPS_PREFIX}${sceneId}`);

    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) {
        continue;
      }
      if (
        key.startsWith(SCENE_PLAN_INTRO_PREFIX) &&
        key.endsWith(`_${sceneId}`)
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // ignore
  }
};
