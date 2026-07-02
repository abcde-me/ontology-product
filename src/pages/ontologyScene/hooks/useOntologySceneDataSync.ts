import { useEffect } from 'react';
import {
  OntologySceneMutationType,
  subscribeOntologySceneDataChanged
} from '../services/ontologySceneDataSync';

export function useOntologySceneDataSync(
  sceneId: number,
  types: OntologySceneMutationType[],
  onRefresh: () => void
) {
  const typesKey = types.join(',');

  useEffect(() => {
    if (!Number.isFinite(sceneId) || sceneId <= 0) {
      return;
    }

    const watchedTypes = typesKey.split(',') as OntologySceneMutationType[];

    return subscribeOntologySceneDataChanged((detail) => {
      if (
        detail.sceneId === sceneId &&
        detail.types.some((type) => watchedTypes.includes(type))
      ) {
        onRefresh();
      }
    });
  }, [onRefresh, sceneId, typesKey]);
}
