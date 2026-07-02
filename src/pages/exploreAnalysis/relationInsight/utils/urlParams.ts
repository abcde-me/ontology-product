export interface RelationInsightUrlParams {
  sceneId?: number;
  objectTypeId?: number;
  instanceId?: string;
  instanceIds?: string[];
}

export const parseRelationInsightUrlParams = (
  search: string
): RelationInsightUrlParams => {
  const params = new URLSearchParams(search);
  const sceneId = Number(params.get('sceneId'));
  const objectTypeId = Number(params.get('objectTypeId'));
  const instanceId = params.get('instanceId') || undefined;
  const instanceIdsParam = params.get('instanceIds');

  const instanceIds = instanceIdsParam
    ? instanceIdsParam
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : instanceId
      ? [instanceId]
      : undefined;

  return {
    sceneId: Number.isFinite(sceneId) && sceneId > 0 ? sceneId : undefined,
    objectTypeId:
      Number.isFinite(objectTypeId) && objectTypeId > 0
        ? objectTypeId
        : undefined,
    instanceId: instanceId || undefined,
    instanceIds
  };
};

export const buildRelationInsightSearchParams = (
  objects: Array<{
    sceneId: number;
    objectTypeId: number;
    instanceId: string;
  }>
): URLSearchParams => {
  if (objects.length === 0) {
    return new URLSearchParams();
  }

  const { sceneId, objectTypeId } = objects[0];
  const searchParams = new URLSearchParams({
    sceneId: String(sceneId),
    objectTypeId: String(objectTypeId)
  });

  const instanceIds = objects.map((item) => item.instanceId).filter(Boolean);
  if (instanceIds.length === 1) {
    searchParams.set('instanceId', instanceIds[0]);
  } else if (instanceIds.length > 1) {
    searchParams.set('instanceIds', instanceIds.join(','));
  }

  return searchParams;
};
