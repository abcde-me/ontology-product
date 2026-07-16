import type { PhysicalProperties } from '@/types/graphApi';
import type { InstanceQueryRow } from '../types';
import { resolveRowFieldValue } from '../services/instanceQuery';
import {
  extractInstanceNameFieldNames,
  fetchProperties
} from '../services/conditionQuery';

const FALLBACK_NAME_KEYS = ['name', 'title', 'label', '名称', 'Name', 'TITLE'];

const instanceNameFieldsCache = new Map<string, string[]>();

export { extractInstanceNameFieldNames };

export const getInstanceNameFieldNames = async (
  sceneId: number,
  objectTypeId: number
): Promise<string[]> => {
  const cacheKey = `${sceneId}:${objectTypeId}`;
  const cached = instanceNameFieldsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const properties = await fetchProperties(sceneId, objectTypeId);
  const fieldNames = extractInstanceNameFieldNames(properties);
  instanceNameFieldsCache.set(cacheKey, fieldNames);
  return fieldNames;
};

export const resolveInstanceDisplayName = (
  row: InstanceQueryRow | Record<string, unknown>,
  fieldNames: string[],
  fallback: string
): string => {
  const parts = fieldNames
    .map((fieldName) =>
      resolveRowFieldValue(row as InstanceQueryRow, fieldName)
    )
    .filter((value) => value != null && String(value).trim())
    .map((value) => String(value).trim());

  if (parts.length) {
    return parts.join(' ');
  }

  for (const key of FALLBACK_NAME_KEYS) {
    const value = resolveRowFieldValue(row as InstanceQueryRow, key);
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return fallback;
};

export const resolveInstanceDisplayNameAsync = async (params: {
  sceneId: number;
  objectTypeId: number;
  row: InstanceQueryRow | Record<string, unknown>;
  fallback: string;
}): Promise<string> => {
  const fieldNames = await getInstanceNameFieldNames(
    params.sceneId,
    params.objectTypeId
  );
  return resolveInstanceDisplayName(params.row, fieldNames, params.fallback);
};
