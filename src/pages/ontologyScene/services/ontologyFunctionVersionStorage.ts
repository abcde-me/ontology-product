import type {
  OntologyFunctionVersion,
  OntologyFunctionVersionSnapshot,
  OntologyFunctionVersionStore
} from '@/types/ontologyFunctionVersion';
import { getNextFunctionVersionLabel } from './ontologyFunctionVersionLabel';

const STORAGE_PREFIX = 'ai_onto_function_versions_v1';

const storageKey = (functionId: number) => `${STORAGE_PREFIX}_${functionId}`;

const createVersionId = () =>
  `ofv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeSnapshot = (
  snapshot?: Partial<OntologyFunctionVersionSnapshot> | null
): OntologyFunctionVersionSnapshot => ({
  name: snapshot?.name || '',
  code: snapshot?.code || '',
  description: snapshot?.description || '',
  content: snapshot?.content || '',
  params: Array.isArray(snapshot?.params) ? snapshot.params : []
});

const normalizeVersion = (
  version: Partial<OntologyFunctionVersion> & { id: string }
): OntologyFunctionVersion => ({
  id: version.id,
  label: version.label || '',
  changeSummary: version.changeSummary || '',
  createdAt: version.createdAt || new Date().toISOString(),
  createdBy: version.createdBy,
  snapshot: normalizeSnapshot(version.snapshot)
});

export const loadOntologyFunctionVersionStore = (
  functionId: number
): OntologyFunctionVersionStore => {
  try {
    const raw = window.localStorage.getItem(storageKey(functionId));
    if (!raw) {
      return { activeVersionId: null, versions: [] };
    }

    const parsed = JSON.parse(raw) as OntologyFunctionVersionStore;
    const versions = (Array.isArray(parsed?.versions) ? parsed.versions : [])
      .filter((item) => Boolean(item?.id))
      .map((item) =>
        normalizeVersion(
          item as Partial<OntologyFunctionVersion> & { id: string }
        )
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

export const saveOntologyFunctionVersionStore = (
  functionId: number,
  store: OntologyFunctionVersionStore
) => {
  window.localStorage.setItem(storageKey(functionId), JSON.stringify(store));
};

export const addOntologyFunctionVersion = (
  functionId: number,
  store: OntologyFunctionVersionStore,
  params: {
    changeSummary: string;
    snapshot: OntologyFunctionVersionSnapshot;
    createdBy?: string;
    label?: string;
  }
): OntologyFunctionVersionStore => {
  const version: OntologyFunctionVersion = {
    id: createVersionId(),
    label: params.label?.trim() || getNextFunctionVersionLabel(store.versions),
    changeSummary: params.changeSummary.trim(),
    createdAt: new Date().toISOString(),
    createdBy: params.createdBy,
    snapshot: params.snapshot
  };

  const next: OntologyFunctionVersionStore = {
    activeVersionId: version.id,
    versions: [version, ...store.versions]
  };

  saveOntologyFunctionVersionStore(functionId, next);
  return next;
};

export const deleteOntologyFunctionVersion = (
  functionId: number,
  store: OntologyFunctionVersionStore,
  versionId: string
): OntologyFunctionVersionStore | null => {
  const versions = store.versions.filter((item) => item.id !== versionId);
  if (versions.length === store.versions.length) {
    return store;
  }

  const activeVersionId =
    store.activeVersionId === versionId
      ? (versions[0]?.id ?? null)
      : store.activeVersionId;

  const next: OntologyFunctionVersionStore = { activeVersionId, versions };
  saveOntologyFunctionVersionStore(functionId, next);
  return next;
};
