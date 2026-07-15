import { DEFAULT_DOMAIN_NAMES } from '../constants';
import type {
  CreateSemanticMappingInput,
  SemanticDomain,
  SemanticMapping,
  SemanticMappingListItem,
  UpdateSemanticMappingInput
} from '../types';

const STORAGE_KEY = 'onto_semantic_mapping_v1';

interface StoragePayload {
  domains: Record<string, SemanticDomain>;
  mappings: Record<string, SemanticMapping>;
  seeded?: boolean;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { domains: {}, mappings: {}, seeded: false };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return {
      domains: parsed?.domains || {},
      mappings: parsed?.mappings || {},
      seeded: Boolean(parsed?.seeded)
    };
  } catch {
    return { domains: {}, mappings: {}, seeded: false };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const ensureSeedDomains = (payload: StoragePayload): StoragePayload => {
  if (payload.seeded || Object.keys(payload.domains).length > 0) {
    if (!payload.seeded) {
      payload.seeded = true;
      writeStorage(payload);
    }
    return payload;
  }

  const now = new Date().toISOString();
  DEFAULT_DOMAIN_NAMES.forEach((name) => {
    const id = generateId('domain');
    payload.domains[id] = { id, name, createdAt: now };
  });
  payload.seeded = true;
  writeStorage(payload);
  return payload;
};

export const listSemanticDomains = (): SemanticDomain[] => {
  const payload = ensureSeedDomains(readStorage());
  return Object.values(payload.domains).sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN')
  );
};

export const findDomainByName = (name: string): SemanticDomain | null => {
  const normalized = name.trim();
  if (!normalized) {
    return null;
  }
  const payload = ensureSeedDomains(readStorage());
  return (
    Object.values(payload.domains).find(
      (item) => item.name.trim() === normalized
    ) || null
  );
};

export const createSemanticDomain = (name: string): SemanticDomain => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('领域名称不能为空');
  }

  const existing = findDomainByName(trimmed);
  if (existing) {
    return existing;
  }

  const payload = ensureSeedDomains(readStorage());
  const domain: SemanticDomain = {
    id: generateId('domain'),
    name: trimmed,
    createdAt: new Date().toISOString()
  };
  payload.domains[domain.id] = domain;
  writeStorage(payload);
  return domain;
};

const resolveDomain = (
  input: Pick<CreateSemanticMappingInput, 'domainId' | 'domainName'>
): SemanticDomain | null => {
  if (input.domainId) {
    const payload = ensureSeedDomains(readStorage());
    const domain = payload.domains[input.domainId];
    if (!domain) {
      throw new Error('所属领域不存在');
    }
    return domain;
  }

  const name = input.domainName?.trim();
  if (!name) {
    return null;
  }
  return createSemanticDomain(name);
};

const normalizeSynonyms = (synonyms?: string[]): string[] => {
  if (!synonyms?.length) {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  synonyms.forEach((item) => {
    const value = item.trim();
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    result.push(value);
  });
  return result;
};

export const listSemanticMappings = (): SemanticMappingListItem[] => {
  const payload = ensureSeedDomains(readStorage());
  return Object.values(payload.mappings)
    .map((item) => ({
      ...item,
      domainName: item.domainId
        ? payload.domains[item.domainId]?.name
        : undefined
    }))
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
};

export const getSemanticMapping = (
  id: string
): SemanticMappingListItem | null => {
  const payload = ensureSeedDomains(readStorage());
  const mapping = payload.mappings[id];
  if (!mapping) {
    return null;
  }
  return {
    ...mapping,
    domainName: mapping.domainId
      ? payload.domains[mapping.domainId]?.name
      : undefined
  };
};

export const createSemanticMapping = (
  input: CreateSemanticMappingInput & { creator: string }
): SemanticMapping => {
  const standardTerm = input.standardTerm.trim();
  if (!standardTerm) {
    throw new Error('标准术语不能为空');
  }

  const domain = resolveDomain(input);
  const now = new Date().toISOString();
  const mapping: SemanticMapping = {
    id: generateId('semantic-mapping'),
    standardTerm,
    domainId: domain?.id,
    description: input.description?.trim() || undefined,
    synonyms: normalizeSynonyms(input.synonyms),
    objectTypes: input.objectTypes || [],
    creator: input.creator.trim() || '未知用户',
    createdAt: now,
    updatedAt: now
  };

  const payload = ensureSeedDomains(readStorage());
  payload.mappings[mapping.id] = mapping;
  writeStorage(payload);
  return mapping;
};

export const updateSemanticMapping = (
  id: string,
  patch: UpdateSemanticMappingInput
): SemanticMapping => {
  const payload = ensureSeedDomains(readStorage());
  const existing = payload.mappings[id];
  if (!existing) {
    throw new Error('语义映射不存在');
  }

  let domainId = existing.domainId;
  if (patch.domainId || patch.domainName) {
    domainId =
      resolveDomain({
        domainId: patch.domainId,
        domainName: patch.domainName
      })?.id || undefined;
  }

  const next: SemanticMapping = {
    ...existing,
    standardTerm: patch.standardTerm?.trim() || existing.standardTerm,
    domainId,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || undefined
        : existing.description,
    synonyms:
      patch.synonyms !== undefined
        ? normalizeSynonyms(patch.synonyms)
        : existing.synonyms,
    objectTypes:
      patch.objectTypes !== undefined
        ? patch.objectTypes
        : existing.objectTypes,
    updatedAt: new Date().toISOString()
  };

  payload.mappings[id] = next;
  writeStorage(payload);
  return next;
};

export const deleteSemanticMapping = (id: string) => {
  const payload = ensureSeedDomains(readStorage());
  if (!payload.mappings[id]) {
    throw new Error('语义映射不存在');
  }
  delete payload.mappings[id];
  writeStorage(payload);
};
