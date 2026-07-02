import {
  DEFAULT_ONTOLOGY_API_BASE_URL,
  getCatalogItemById,
  ONTOLOGY_API_CATALOG
} from '../constants/ontologyApiCatalog';
import type {
  CreateOntologyApiInput,
  OntologyApiCatalogItem,
  OntologyApiConfig,
  OntologyApiCustomMeta,
  OntologyApiListItem,
  OntologyApiRuntimeRecord,
  OntologyApiStatus,
  UpdateOntologyApiDraftPayload
} from '../types';
import {
  generateApiDocumentation,
  generateCustomApiCode
} from './generateApiDocumentation';

const STORAGE_KEY = 'onto_api_management_v2';

interface StoragePayload {
  records: Record<string, OntologyApiRuntimeRecord>;
}

const EMPTY_PUBLISHED_CONFIG: OntologyApiConfig = {
  baseUrl: DEFAULT_ONTOLOGY_API_BASE_URL,
  path: '',
  description: '',
  useCase: '',
  requestExample: '',
  responseExample: ''
};

const buildDefaultConfig = (
  catalog: OntologyApiCatalogItem
): OntologyApiConfig => ({
  baseUrl: DEFAULT_ONTOLOGY_API_BASE_URL,
  path: catalog.path,
  description: catalog.description,
  useCase: catalog.useCase,
  requestExample: catalog.requestExample,
  responseExample: catalog.responseExample,
  notes: catalog.notes
});

const configsEqual = (left: OntologyApiConfig, right: OntologyApiConfig) =>
  JSON.stringify(left) === JSON.stringify(right);

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { records: {} };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return parsed?.records ? parsed : { records: {} };
  } catch {
    return { records: {} };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const catalogFromRecord = (
  record: OntologyApiRuntimeRecord
): OntologyApiCatalogItem | null => {
  if (record.isCustom && record.customMeta) {
    return {
      id: record.id,
      ...record.customMeta,
      description: record.draftConfig.description,
      useCase: record.draftConfig.useCase,
      requestExample: record.draftConfig.requestExample,
      responseExample: record.draftConfig.responseExample,
      notes: record.draftConfig.notes
    };
  }

  return getCatalogItemById(record.id) ?? null;
};

const ensureRecord = (
  catalog: OntologyApiCatalogItem,
  existing?: OntologyApiRuntimeRecord
): OntologyApiRuntimeRecord => {
  if (existing) {
    return existing;
  }

  const defaultConfig = buildDefaultConfig(catalog);
  const now = new Date().toISOString();

  return {
    id: catalog.id,
    status: 'offline',
    draftConfig: defaultConfig,
    publishedConfig: defaultConfig,
    publishedAt: now,
    updatedAt: now
  };
};

const recordToListItem = (
  catalog: OntologyApiCatalogItem,
  record: OntologyApiRuntimeRecord
): OntologyApiListItem => {
  const effectiveConfig =
    record.status === 'editing'
      ? record.draftConfig
      : record.publishedConfig.path
        ? record.publishedConfig
        : record.draftConfig;

  return {
    ...catalog,
    status: record.status,
    isCustom: record.isCustom,
    baseUrl: effectiveConfig.baseUrl,
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
    hasDraftChanges:
      record.status === 'editing' ||
      !configsEqual(record.draftConfig, record.publishedConfig)
  };
};

const collectExistingCodes = (storage: StoragePayload) => {
  const codes = ONTOLOGY_API_CATALOG.map((item) => item.code);
  Object.values(storage.records).forEach((record) => {
    if (record.customMeta?.code) {
      codes.push(record.customMeta.code);
    }
  });
  return codes;
};

export const listOntologyApis = (): OntologyApiListItem[] => {
  const storage = readStorage();
  const builtInItems = ONTOLOGY_API_CATALOG.map((catalog) => {
    const record = ensureRecord(catalog, storage.records[catalog.id]);
    return recordToListItem(catalog, record);
  });

  const customItems = Object.values(storage.records)
    .filter((record) => record.isCustom)
    .map((record) => {
      const catalog = catalogFromRecord(record);
      if (!catalog) {
        return null;
      }
      return recordToListItem(catalog, record);
    })
    .filter((item): item is OntologyApiListItem => !!item);

  return [...customItems, ...builtInItems];
};

export const getOntologyApiDetail = (id: string) => {
  const storage = readStorage();
  const storedRecord = storage.records[id];

  if (storedRecord?.isCustom) {
    const catalog = catalogFromRecord(storedRecord);
    if (!catalog) {
      return null;
    }
    return { catalog, record: storedRecord };
  }

  const catalog = getCatalogItemById(id);
  if (!catalog) {
    return null;
  }

  const record = ensureRecord(catalog, storedRecord);
  if (!storedRecord) {
    storage.records[id] = record;
    writeStorage(storage);
  }

  return { catalog, record };
};

export const createCustomOntologyApi = (input: CreateOntologyApiInput) => {
  const storage = readStorage();
  const code = generateCustomApiCode(collectExistingCodes(storage));
  const { config, customMeta } = generateApiDocumentation(input, code);
  const id = `custom-${Date.now()}`;
  const now = new Date().toISOString();

  const record: OntologyApiRuntimeRecord = {
    id,
    status: 'editing',
    isCustom: true,
    customMeta,
    draftConfig: config,
    publishedConfig: { ...EMPTY_PUBLISHED_CONFIG, baseUrl: config.baseUrl },
    updatedAt: now
  };

  storage.records[id] = record;
  writeStorage(storage);

  const catalog = catalogFromRecord(record);
  if (!catalog) {
    throw new Error('创建 API 失败');
  }

  return { id, catalog, record };
};

export const updateOntologyApiDraft = (
  id: string,
  payload: UpdateOntologyApiDraftPayload
) => {
  const detail = getOntologyApiDetail(id);
  if (!detail) {
    throw new Error('API 不存在');
  }

  const storage = readStorage();
  const nextCustomMeta = detail.record.isCustom
    ? {
        ...(detail.record.customMeta as OntologyApiCustomMeta),
        ...(payload.customMeta || {}),
        path: payload.config.path
      }
    : undefined;

  const nextRecord: OntologyApiRuntimeRecord = {
    ...detail.record,
    draftConfig: payload.config,
    customMeta: nextCustomMeta,
    updatedAt: new Date().toISOString()
  };

  storage.records[id] = nextRecord;
  writeStorage(storage);
  return nextRecord;
};

export const publishOntologyApi = (id: string) => {
  const detail = getOntologyApiDetail(id);
  if (!detail) {
    throw new Error('API 不存在');
  }

  const storage = readStorage();
  const now = new Date().toISOString();
  const nextRecord: OntologyApiRuntimeRecord = {
    ...detail.record,
    publishedConfig: { ...detail.record.draftConfig },
    status: 'online',
    publishedAt: now,
    updatedAt: now
  };

  if (nextRecord.isCustom && nextRecord.customMeta) {
    nextRecord.customMeta = {
      ...nextRecord.customMeta,
      path: detail.record.draftConfig.path
    };
  }

  storage.records[id] = nextRecord;
  writeStorage(storage);
  return nextRecord;
};

export const updateOntologyApiStatus = (
  id: string,
  status: OntologyApiStatus
) => {
  const detail = getOntologyApiDetail(id);
  if (!detail) {
    throw new Error('API 不存在');
  }

  if (detail.record.status === 'editing' && status === 'online') {
    throw new Error('请先发布 API 后再上线');
  }

  const storage = readStorage();
  const nextRecord: OntologyApiRuntimeRecord = {
    ...detail.record,
    status,
    updatedAt: new Date().toISOString()
  };

  storage.records[id] = nextRecord;
  writeStorage(storage);
  return nextRecord;
};

export const deleteOntologyApi = (id: string) => {
  const detail = getOntologyApiDetail(id);
  if (!detail) {
    throw new Error('API 不存在');
  }

  if (detail.record.status === 'online') {
    throw new Error('已上线 API 不可删除，请先下线');
  }

  const storage = readStorage();

  if (detail.record.isCustom) {
    delete storage.records[id];
    writeStorage(storage);
    return { removed: true };
  }

  delete storage.records[id];
  writeStorage(storage);
  return { removed: false };
};

export const buildApiRequestUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const getEffectiveApiConfig = (
  record: OntologyApiRuntimeRecord,
  useDraft = false
) => {
  if (useDraft || record.status === 'editing') {
    return record.draftConfig;
  }

  return record.publishedConfig.path
    ? record.publishedConfig
    : record.draftConfig;
};

export const getDetailCatalog = (
  catalog: OntologyApiCatalogItem,
  record: OntologyApiRuntimeRecord
): OntologyApiCatalogItem => {
  if (!record.isCustom || !record.customMeta) {
    return catalog;
  }

  return {
    ...catalog,
    ...record.customMeta,
    path: record.draftConfig.path
  };
};
