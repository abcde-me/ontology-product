import UAPI from '@/api';
import { deleteOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import type { LinkInfo, ListOntologyLinkTypeReq } from '@/types/graphApi';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { devDeleteOntologyLinkTypesByObjectTypeIds } from '@/utils/devLinkTypeStore';
import { isDevBypassEnabled } from '@/utils/devFallback';

const collectRelatedLinkIds = (
  links: LinkInfo[],
  objectTypeIds: Set<number>
): number[] => {
  const linkIds = new Set<number>();

  links.forEach((link) => {
    const sourceId = Number(link.sourceObjectTypeID);
    const targetId = Number(link.targetObjectTypeID);
    const linkId = Number(link.id);

    if (!Number.isFinite(linkId) || linkId <= 0) {
      return;
    }

    if (objectTypeIds.has(sourceId) || objectTypeIds.has(targetId)) {
      linkIds.add(linkId);
    }
  });

  return Array.from(linkIds);
};

/** 删除与指定对象类型相关的全部链接（源或目标命中即删除） */
export const deleteRelatedLinkTypesForObjectTypes = async (
  objectTypeIds: number[],
  ontologyModelID?: number
): Promise<{ deleted: number; failed: number }> => {
  const normalizedIds = objectTypeIds.filter(
    (id) => Number.isFinite(id) && id > 0
  );

  if (!normalizedIds.length) {
    return { deleted: 0, failed: 0 };
  }

  const objectTypeIdSet = new Set(normalizedIds);

  if (isDevBypassEnabled()) {
    devDeleteOntologyLinkTypesByObjectTypeIds(normalizedIds);
  }

  try {
    const response = await UAPI.RES.ListOntologyLinkTypeApi({})
      .post({
        ontologyModelID,
        pageNo: 1,
        pageSize: -1
      } satisfies ListOntologyLinkTypeReq)
      .inRegion()
      .do();

    if (!isOntologyApiSuccess(response)) {
      return { deleted: 0, failed: 0 };
    }

    const linkIds = collectRelatedLinkIds(
      response.data?.result || [],
      objectTypeIdSet
    );

    let deleted = 0;
    let failed = 0;

    for (const linkId of linkIds) {
      const deleteResponse = await deleteOntologyLinkType({ id: linkId });
      if (isOntologyApiSuccess(deleteResponse)) {
        deleted += 1;
      } else {
        failed += 1;
      }
    }

    return { deleted, failed };
  } catch (error) {
    if (isDevBypassEnabled()) {
      console.warn('[dev] 查询关联链接失败，跳过服务端链接清理', error);
      return { deleted: 0, failed: 0 };
    }
    throw error;
  }
};

export const deleteRelatedLinkTypesForObjectType = async (
  objectTypeId: number,
  ontologyModelID?: number
) => deleteRelatedLinkTypesForObjectTypes([objectTypeId], ontologyModelID);
