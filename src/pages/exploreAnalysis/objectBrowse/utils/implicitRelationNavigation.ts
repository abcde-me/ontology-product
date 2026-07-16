export const IMPLICIT_RELATION_DETAIL_BASE =
  '/tenant/compute/onto/exploreAnalysis/implicitRelation/detail';

export const buildImplicitRelationDetailPath = (
  taskId: string,
  discoveryId?: string
) => {
  const base = `${IMPLICIT_RELATION_DETAIL_BASE}/${encodeURIComponent(taskId)}`;
  if (!discoveryId) {
    return base;
  }
  const searchParams = new URLSearchParams({
    discoveryId
  });
  return `${base}?${searchParams.toString()}`;
};
