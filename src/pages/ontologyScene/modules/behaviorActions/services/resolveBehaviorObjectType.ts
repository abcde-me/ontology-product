import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import type { ObjectType } from '@/types/objectType';

export const GLOBAL_BEHAVIOR_OBJECT_TYPE_NAME = '全局行为';

export const resolveBehaviorObjectTypeId = (
  action: Pick<
    BehaviorActionItem,
    'objectTypeId' | 'ontologyObjectTypeId' | 'objectTypeID'
  >
): number | undefined => {
  const raw =
    action.objectTypeId ?? action.ontologyObjectTypeId ?? action.objectTypeID;

  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const isGlobalBehaviorObjectType = (objectTypeId?: number): boolean =>
  objectTypeId == null || objectTypeId <= 0;

export const buildBehaviorObjectTypeLookup = (objectTypes: ObjectType[]) =>
  new Map(
    objectTypes
      .filter((item) => item.id != null && item.id > 0)
      .map((item) => [item.id, { name: item.name || '', icon: item.icon }])
  );

export const resolveBehaviorObjectTypeDisplay = (
  action: BehaviorActionItem,
  lookup?: Map<number, { name: string; icon?: string }>
) => {
  const objectTypeId = resolveBehaviorObjectTypeId(action);

  if (isGlobalBehaviorObjectType(objectTypeId)) {
    return {
      objectTypeId,
      objectTypeName: GLOBAL_BEHAVIOR_OBJECT_TYPE_NAME,
      objectTypeIcon: undefined as string | undefined
    };
  }

  const matched = lookup?.get(objectTypeId!);
  let objectTypeName = action.objectTypeName?.trim() || matched?.name || '';
  if (!objectTypeName && lookup) {
    objectTypeName = `对象类型#${objectTypeId}`;
  }
  const objectTypeIcon = action.objectTypeIcon || matched?.icon;

  return {
    objectTypeId,
    objectTypeName,
    objectTypeIcon
  };
};
