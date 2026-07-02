import type {
  OntologySceneVersion,
  OntologySceneVersionSnapshot,
  OntologySceneVersionStore
} from '@/types/ontologySceneVersion';
import { getNextSceneVersionLabel } from './ontologySceneVersionLabel';

const STORAGE_PREFIX = 'ai_onto_scene_versions_v1';

const storageKey = (ontologyModelId: number) =>
  `${STORAGE_PREFIX}_${ontologyModelId}`;

const createVersionId = () =>
  `osv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeSnapshot = (
  snapshot?: Partial<OntologySceneVersionSnapshot> | null
): OntologySceneVersionSnapshot => {
  const objectTypeNames = Array.isArray(snapshot?.objectTypeNames)
    ? (snapshot?.objectTypeNames ?? [])
    : [];
  const linkTypeNames = Array.isArray(snapshot?.linkTypeNames)
    ? (snapshot?.linkTypeNames ?? [])
    : [];
  const actionNames = Array.isArray(snapshot?.actionNames)
    ? (snapshot?.actionNames ?? [])
    : [];
  const functionNames = Array.isArray(snapshot?.functionNames)
    ? (snapshot?.functionNames ?? [])
    : [];

  return {
    objectTypeNames,
    linkTypeNames,
    actionNames,
    functionNames,
    counts: {
      objectTypes: snapshot?.counts?.objectTypes ?? objectTypeNames.length,
      linkTypes: snapshot?.counts?.linkTypes ?? linkTypeNames.length,
      actions: snapshot?.counts?.actions ?? actionNames.length,
      functions: snapshot?.counts?.functions ?? functionNames.length
    }
  };
};

const normalizeVersion = (
  version: Partial<OntologySceneVersion> & { id: string }
): OntologySceneVersion => ({
  id: version.id,
  label: version.label || '',
  changeSummary: version.changeSummary || '',
  createdAt: version.createdAt || new Date().toISOString(),
  createdBy: version.createdBy,
  snapshot: normalizeSnapshot(version.snapshot)
});

export const loadOntologySceneVersionStore = (
  ontologyModelId: number
): OntologySceneVersionStore => {
  try {
    const raw = window.localStorage.getItem(storageKey(ontologyModelId));
    if (!raw) {
      return { activeVersionId: null, versions: [] };
    }

    const parsed = JSON.parse(raw) as OntologySceneVersionStore;
    const versions = (Array.isArray(parsed?.versions) ? parsed.versions : [])
      .filter((item) => Boolean(item?.id))
      .map((item) =>
        normalizeVersion(item as Partial<OntologySceneVersion> & { id: string })
      );
    const activeVersionId =
      parsed.activeVersionId &&
      versions.some((item) => item.id === parsed.activeVersionId)
        ? parsed.activeVersionId
        : (versions[0]?.id ?? null);

    return { activeVersionId, versions };
  } catch {
    return { activeVersionId: null, versions: [] };
  }
};

export const saveOntologySceneVersionStore = (
  ontologyModelId: number,
  store: OntologySceneVersionStore
) => {
  window.localStorage.setItem(
    storageKey(ontologyModelId),
    JSON.stringify(store)
  );
};

export const addOntologySceneVersion = (
  ontologyModelId: number,
  store: OntologySceneVersionStore,
  params: {
    changeSummary: string;
    snapshot: OntologySceneVersionSnapshot;
    createdBy?: string;
    label?: string;
  }
): OntologySceneVersionStore => {
  const version: OntologySceneVersion = {
    id: createVersionId(),
    label: params.label?.trim() || getNextSceneVersionLabel(store.versions),
    changeSummary: params.changeSummary.trim(),
    createdAt: new Date().toISOString(),
    createdBy: params.createdBy,
    snapshot: params.snapshot
  };

  const next: OntologySceneVersionStore = {
    activeVersionId: version.id,
    versions: [version, ...store.versions]
  };

  saveOntologySceneVersionStore(ontologyModelId, next);
  return next;
};

export const deleteOntologySceneVersion = (
  ontologyModelId: number,
  store: OntologySceneVersionStore,
  versionId: string
): OntologySceneVersionStore | null => {
  const versions = store.versions.filter((item) => item.id !== versionId);
  if (versions.length === store.versions.length) {
    return store;
  }

  const activeVersionId =
    store.activeVersionId === versionId
      ? (versions[0]?.id ?? null)
      : store.activeVersionId;

  const next: OntologySceneVersionStore = { activeVersionId, versions };
  saveOntologySceneVersionStore(ontologyModelId, next);
  return next;
};
