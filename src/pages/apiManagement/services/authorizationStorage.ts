import type { ApiAuthorizationRule } from '../types';

const STORAGE_KEY = 'onto_api_authorization_v1';

interface AuthorizationStoragePayload {
  rulesByApiId: Record<string, ApiAuthorizationRule[]>;
}

const readStorage = (): AuthorizationStoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { rulesByApiId: {} };
    }

    const parsed = JSON.parse(raw) as AuthorizationStoragePayload;
    return parsed?.rulesByApiId ? parsed : { rulesByApiId: {} };
  } catch {
    return { rulesByApiId: {} };
  }
};

const writeStorage = (payload: AuthorizationStoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const listApiAuthorizationRules = (
  apiId: string
): ApiAuthorizationRule[] => {
  const storage = readStorage();
  return storage.rulesByApiId[apiId] ?? [];
};

export const saveApiAuthorizationRule = (
  apiId: string,
  rule: ApiAuthorizationRule
): ApiAuthorizationRule[] => {
  const storage = readStorage();
  const currentRules = storage.rulesByApiId[apiId] ?? [];
  const nextRules = [
    ...currentRules.filter((item) => item.id !== rule.id),
    rule
  ];

  storage.rulesByApiId[apiId] = nextRules;
  writeStorage(storage);
  return nextRules;
};

export const deleteApiAuthorizationRule = (
  apiId: string,
  ruleId: string
): ApiAuthorizationRule[] => {
  const storage = readStorage();
  const currentRules = storage.rulesByApiId[apiId] ?? [];
  const nextRules = currentRules.filter((item) => item.id !== ruleId);

  if (nextRules.length) {
    storage.rulesByApiId[apiId] = nextRules;
  } else {
    delete storage.rulesByApiId[apiId];
  }

  writeStorage(storage);
  return nextRules;
};

export const countApiAuthorizationRules = (apiId: string) =>
  listApiAuthorizationRules(apiId).length;
