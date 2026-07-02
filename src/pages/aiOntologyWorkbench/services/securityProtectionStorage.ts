import {
  DEFAULT_SECURITY_PROTECTION_CONFIG,
  type SecurityProtectionConfig
} from '../types/securityProtection';

const STORAGE_PREFIX = 'ai_onto_workbench_security_protection_v1';

const storageKey = (ontologyModelId: number) =>
  `${STORAGE_PREFIX}_${ontologyModelId}`;

const mergeWithDefaults = (
  config: SecurityProtectionConfig
): SecurityProtectionConfig => {
  const defaultCategoryMap = new Map(
    DEFAULT_SECURITY_PROTECTION_CONFIG.categories.map((item) => [
      item.type,
      item
    ])
  );

  const categories = DEFAULT_SECURITY_PROTECTION_CONFIG.categories.map(
    (defaultItem) => {
      const saved = config.categories.find(
        (item) => item.type === defaultItem.type
      );

      return saved ? { ...defaultItem, ...saved } : { ...defaultItem };
    }
  );

  config.categories.forEach((item) => {
    if (!defaultCategoryMap.has(item.type)) {
      categories.push(item);
    }
  });

  return {
    enabled: config.enabled ?? DEFAULT_SECURITY_PROTECTION_CONFIG.enabled,
    blockOnMatch:
      config.blockOnMatch ?? DEFAULT_SECURITY_PROTECTION_CONFIG.blockOnMatch,
    categories,
    customKeywords:
      config.customKeywords ?? DEFAULT_SECURITY_PROTECTION_CONFIG.customKeywords
  };
};

export const loadSecurityProtectionConfig = (
  ontologyModelId: number
): SecurityProtectionConfig => {
  try {
    const raw = window.localStorage.getItem(storageKey(ontologyModelId));
    if (!raw) {
      const initial = mergeWithDefaults(DEFAULT_SECURITY_PROTECTION_CONFIG);
      saveSecurityProtectionConfig(ontologyModelId, initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as SecurityProtectionConfig;
    return mergeWithDefaults(parsed);
  } catch {
    return mergeWithDefaults(DEFAULT_SECURITY_PROTECTION_CONFIG);
  }
};

export const saveSecurityProtectionConfig = (
  ontologyModelId: number,
  config: SecurityProtectionConfig
) => {
  window.localStorage.setItem(
    storageKey(ontologyModelId),
    JSON.stringify(config)
  );
};

export const updateSecurityProtectionConfig = (
  ontologyModelId: number,
  config: SecurityProtectionConfig
): SecurityProtectionConfig => {
  const next = mergeWithDefaults(config);
  saveSecurityProtectionConfig(ontologyModelId, next);
  return next;
};
