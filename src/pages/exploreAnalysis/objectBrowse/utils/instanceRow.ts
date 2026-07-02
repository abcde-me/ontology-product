import type { InstanceQueryRow } from '../types';
import {
  formatFieldDisplayLabel,
  type FieldCommentMap
} from './fieldDisplayLabel';

const INSTANCE_ID_KEYS = ['id', 'ID', '_id', 'pk', 'instanceId', 'instance_id'];

const INTERNAL_KEYS = new Set([
  'score',
  '_score',
  'similarity',
  'matchedVectorField'
]);

export const resolveInstanceId = (
  record: InstanceQueryRow
): string | number | undefined => {
  for (const key of INSTANCE_ID_KEYS) {
    const value = record[key];
    if (value != null && value !== '') {
      return value as string | number;
    }
  }

  return undefined;
};

export const getInstanceDisplayFields = (
  record: InstanceQueryRow,
  commentMap?: FieldCommentMap,
  vectorFieldNames?: Set<string>
): Array<{ label: string; value: string }> => {
  return Object.entries(record)
    .filter(
      ([key]) =>
        !INTERNAL_KEYS.has(key) &&
        !key.startsWith('_') &&
        !vectorFieldNames?.has(key)
    )
    .map(([fieldName, value]) => ({
      label: formatFieldDisplayLabel(fieldName, commentMap),
      value: value == null || value === '' ? '-' : String(value)
    }));
};

export const buildRelationInsightPath = (params: {
  sceneId: number;
  objectTypeId: number;
  instanceId?: string | number;
  instanceIds?: Array<string | number>;
}) => {
  const searchParams = new URLSearchParams({
    sceneId: String(params.sceneId),
    objectTypeId: String(params.objectTypeId)
  });

  const instanceIds = (
    params.instanceIds ??
    (params.instanceId != null && params.instanceId !== ''
      ? [params.instanceId]
      : [])
  )
    .map((item) => String(item))
    .filter(Boolean);

  if (instanceIds.length === 1) {
    searchParams.set('instanceId', instanceIds[0]);
  } else if (instanceIds.length > 1) {
    searchParams.set('instanceIds', instanceIds.join(','));
  }

  return `/tenant/compute/onto/exploreAnalysis/relationInsight?${searchParams.toString()}`;
};

export const buildOntologyGraphPath = (params: {
  sceneId: number;
  objectTypeId: number;
  objectTypeCode?: string;
  instanceId?: string | number;
}) => {
  const searchParams = new URLSearchParams({
    objectTypeId: String(params.objectTypeId),
    focusNeighbors: '1'
  });

  if (params.objectTypeCode) {
    searchParams.set('objectTypeCode', params.objectTypeCode);
  }

  if (params.instanceId != null && params.instanceId !== '') {
    searchParams.set('instanceId', String(params.instanceId));
  }

  return `/tenant/compute/onto/ontologyScene/detail/${params.sceneId}/graph?${searchParams.toString()}`;
};
