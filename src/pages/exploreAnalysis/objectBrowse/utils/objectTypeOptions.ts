import type { ObjectType } from '@/types/objectType';

export const resolveObjectTypeCode = (
  objectTypes: ObjectType[],
  objectTypeId?: number
): string | undefined => {
  if (!objectTypeId) {
    return undefined;
  }

  return objectTypes.find((item) => item.id === objectTypeId)?.code;
};
