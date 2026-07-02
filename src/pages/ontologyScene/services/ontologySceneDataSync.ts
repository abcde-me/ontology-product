export type OntologySceneMutationType = 'objectType' | 'link';

export interface OntologySceneDataChangedDetail {
  sceneId: number;
  types: OntologySceneMutationType[];
}

export const ONTOLOGY_SCENE_DATA_CHANGED_EVENT = 'ontology-scene-data-changed';

export function notifyOntologySceneDataChanged(
  sceneId: number,
  types: OntologySceneMutationType[]
) {
  if (!Number.isFinite(sceneId) || sceneId <= 0 || types.length === 0) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<OntologySceneDataChangedDetail>(
      ONTOLOGY_SCENE_DATA_CHANGED_EVENT,
      {
        detail: { sceneId, types: [...new Set(types)] }
      }
    )
  );
}

export function subscribeOntologySceneDataChanged(
  handler: (detail: OntologySceneDataChangedDetail) => void
) {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<OntologySceneDataChangedDetail>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(ONTOLOGY_SCENE_DATA_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener(ONTOLOGY_SCENE_DATA_CHANGED_EVENT, listener);
  };
}
