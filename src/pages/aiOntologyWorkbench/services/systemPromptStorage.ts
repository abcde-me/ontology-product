import {
  DEFAULT_SYSTEM_PROMPT_CONTENT,
  type SystemPromptStore,
  type SystemPromptVersion
} from '../types/systemPrompt';

const STORAGE_PREFIX = 'ai_onto_workbench_system_prompt_v1';

const storageKey = (ontologyModelId: number) =>
  `${STORAGE_PREFIX}_${ontologyModelId}`;

const createVersion = (name: string, content: string): SystemPromptVersion => {
  const now = new Date().toISOString();

  return {
    id: `spv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    content,
    createdAt: now,
    updatedAt: now
  };
};

const createDefaultStore = (): SystemPromptStore => {
  const defaultVersion = createVersion(
    '默认版本',
    DEFAULT_SYSTEM_PROMPT_CONTENT
  );

  return {
    activeVersionId: defaultVersion.id,
    versions: [defaultVersion]
  };
};

export const loadSystemPromptStore = (
  ontologyModelId: number
): SystemPromptStore => {
  try {
    const raw = window.localStorage.getItem(storageKey(ontologyModelId));
    if (!raw) {
      const initial = createDefaultStore();
      saveSystemPromptStore(ontologyModelId, initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as SystemPromptStore;
    if (!parsed?.versions?.length) {
      return createDefaultStore();
    }

    const activeVersionId =
      parsed.activeVersionId &&
      parsed.versions.some((item) => item.id === parsed.activeVersionId)
        ? parsed.activeVersionId
        : parsed.versions[0].id;

    return {
      activeVersionId,
      versions: parsed.versions
    };
  } catch {
    return createDefaultStore();
  }
};

export const saveSystemPromptStore = (
  ontologyModelId: number,
  store: SystemPromptStore
) => {
  window.localStorage.setItem(
    storageKey(ontologyModelId),
    JSON.stringify(store)
  );
};

export const getActiveSystemPromptContent = (
  store: SystemPromptStore | null
): string => {
  if (!store?.activeVersionId) {
    return '';
  }

  const active = store.versions.find(
    (item) => item.id === store.activeVersionId
  );

  return active?.content?.trim() || '';
};

export const addSystemPromptVersion = (
  ontologyModelId: number,
  store: SystemPromptStore,
  params: { name: string; content: string }
): SystemPromptStore => {
  const version = createVersion(params.name, params.content);
  const next: SystemPromptStore = {
    activeVersionId: version.id,
    versions: [version, ...store.versions]
  };

  saveSystemPromptStore(ontologyModelId, next);
  return next;
};

export const updateSystemPromptVersion = (
  ontologyModelId: number,
  store: SystemPromptStore,
  versionId: string,
  patch: Partial<Pick<SystemPromptVersion, 'name' | 'content'>>
): SystemPromptStore => {
  const next: SystemPromptStore = {
    ...store,
    versions: store.versions.map((item) =>
      item.id === versionId
        ? {
            ...item,
            ...patch,
            updatedAt: new Date().toISOString()
          }
        : item
    )
  };

  saveSystemPromptStore(ontologyModelId, next);
  return next;
};

export const setActiveSystemPromptVersion = (
  ontologyModelId: number,
  store: SystemPromptStore,
  versionId: string
): SystemPromptStore => {
  if (!store.versions.some((item) => item.id === versionId)) {
    return store;
  }

  const next: SystemPromptStore = {
    ...store,
    activeVersionId: versionId
  };

  saveSystemPromptStore(ontologyModelId, next);
  return next;
};

export const deleteSystemPromptVersion = (
  ontologyModelId: number,
  store: SystemPromptStore,
  versionId: string
): SystemPromptStore | null => {
  if (store.versions.length <= 1) {
    return null;
  }

  const versions = store.versions.filter((item) => item.id !== versionId);
  const activeVersionId =
    store.activeVersionId === versionId
      ? versions[0]?.id || null
      : store.activeVersionId;

  const next: SystemPromptStore = {
    activeVersionId,
    versions
  };

  saveSystemPromptStore(ontologyModelId, next);
  return next;
};
