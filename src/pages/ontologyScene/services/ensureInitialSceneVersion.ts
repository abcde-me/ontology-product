import type { OntologySceneVersionStore } from '@/types/ontologySceneVersion';
import { captureSceneSnapshot } from './captureSceneSnapshot';
import { INITIAL_SCENE_VERSION_LABEL } from './ontologySceneVersionLabel';
import {
  addOntologySceneVersion,
  loadOntologySceneVersionStore
} from './ontologySceneVersionStorage';

const BOOTSTRAP_CHANGE_SUMMARY = '初始基线版本（已有场景自动建档）';

const bootstrapLocks = new Map<number, Promise<OntologySceneVersionStore>>();

/**
 * 手动创建首个版本快照时使用；不再在场景加载或打开版本面板时自动建档。
 */
export const ensureInitialSceneVersion = async (
  ontologyModelId: number,
  params?: { createdBy?: string }
): Promise<OntologySceneVersionStore> => {
  const cached = bootstrapLocks.get(ontologyModelId);
  if (cached) {
    return cached;
  }

  const task = (async () => {
    const store = loadOntologySceneVersionStore(ontologyModelId);
    if (store.versions.length > 0) {
      return store;
    }

    const snapshot = await captureSceneSnapshot(ontologyModelId);
    return addOntologySceneVersion(ontologyModelId, store, {
      label: INITIAL_SCENE_VERSION_LABEL,
      changeSummary: BOOTSTRAP_CHANGE_SUMMARY,
      snapshot,
      createdBy: params?.createdBy
    });
  })();

  bootstrapLocks.set(ontologyModelId, task);

  try {
    return await task;
  } finally {
    if (bootstrapLocks.get(ontologyModelId) === task) {
      bootstrapLocks.delete(ontologyModelId);
    }
  }
};
