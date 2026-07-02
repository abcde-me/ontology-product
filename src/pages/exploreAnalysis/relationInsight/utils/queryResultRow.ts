import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import { resolveInstanceId } from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import type { QueryResultItem, SelectedObjectContext } from '../types';

const NAME_KEYS = ['name', 'title', 'label', '名称'];
const PHONE_KEYS = [
  'phone',
  'mobile',
  '手机号',
  'phoneNumber',
  'tel',
  'mobilePhone'
];

export const buildInstanceKey = (params: {
  sceneId: number;
  objectTypeId: number;
  instanceId: string;
}) => `${params.sceneId}-${params.objectTypeId}-${params.instanceId}`;

const resolveFieldValue = (
  record: InstanceQueryRow,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== '') {
      return String(value);
    }
  }

  return undefined;
};

export const resolveInstanceLabel = (
  record: InstanceQueryRow,
  instanceId: string | number
) => resolveFieldValue(record, NAME_KEYS) ?? String(instanceId);

export const resolveInstancePhone = (
  record: InstanceQueryRow
): string | undefined => resolveFieldValue(record, PHONE_KEYS);

export const toQueryResultItem = (
  record: InstanceQueryRow,
  context: Pick<
    SelectedObjectContext,
    | 'sceneId'
    | 'sceneName'
    | 'objectTypeId'
    | 'objectTypeName'
    | 'objectTypeCode'
    | 'instanceId'
  >,
  loadStatus: QueryResultItem['loadStatus'] = 'pending'
): QueryResultItem | null => {
  const instanceId = resolveInstanceId(record);
  if (instanceId == null || instanceId === '') {
    return null;
  }

  const normalizedInstanceId = String(instanceId);

  return {
    key: buildInstanceKey({
      sceneId: context.sceneId,
      objectTypeId: context.objectTypeId,
      instanceId: normalizedInstanceId
    }),
    sceneId: context.sceneId,
    sceneName: context.sceneName,
    objectTypeId: context.objectTypeId,
    objectTypeName: context.objectTypeName,
    objectTypeCode: context.objectTypeCode,
    instanceId: normalizedInstanceId,
    instanceLabel: resolveInstanceLabel(record, normalizedInstanceId),
    phone: resolveInstancePhone(record),
    rawRecord: record,
    loadStatus
  };
};

export const toSelectedObjectContext = (
  item: QueryResultItem,
  loadedAsGraph?: boolean
): SelectedObjectContext => ({
  sceneId: item.sceneId,
  sceneName: item.sceneName,
  objectTypeId: item.objectTypeId,
  objectTypeName: item.objectTypeName,
  objectTypeCode: item.objectTypeCode,
  instanceId: item.instanceId,
  instanceLabel: item.instanceLabel,
  loadedAsGraph
});
