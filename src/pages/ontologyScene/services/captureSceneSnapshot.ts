import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { LinkInfo } from '@/types/graphApi';
import type { OntologySceneVersionSnapshot } from '@/types/ontologySceneVersion';
import { extractListData, isOntologyApiSuccess } from '@/utils/apiResponse';
import { enrichLinkTypesWithObjectTypes } from '@/utils/enrichLinkTypeObjectTypes';

const LIST_PAGE_SIZE = 500;

const pickNames = (
  items: Array<{ name?: string; code?: string; id?: string | number }>
): string[] =>
  items
    .map(
      (item) => item.name?.trim() || item.code?.trim() || String(item.id ?? '')
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

const extractOntologyListResult = <T>(
  response: { data?: { result?: T[]; totalCount?: number } } | null | undefined
): T[] => {
  if (!response || !isOntologyApiSuccess(response)) {
    return [];
  }

  const fromResult = response.data?.result;
  if (Array.isArray(fromResult)) {
    return fromResult;
  }

  return extractListData<T>(response);
};

/** 拉取场景下全部链接（优先 pageSize=-1，不足时分页补齐） */
const fetchAllSceneLinkTypes = async (
  ontologyModelID: number
): Promise<LinkInfo[]> => {
  const firstResponse = await listOntologyLinkType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  const firstBatch = extractOntologyListResult<LinkInfo>(firstResponse);
  const totalCount = firstResponse?.data?.totalCount ?? firstBatch.length;

  if (firstBatch.length >= totalCount) {
    return firstBatch;
  }

  const all = [...firstBatch];
  let pageNo = 2;

  while (all.length < totalCount) {
    const response = await listOntologyLinkType({
      ontologyModelID,
      pageNo,
      pageSize: LIST_PAGE_SIZE
    });
    const batch = extractOntologyListResult<LinkInfo>(response);

    if (!batch.length) {
      break;
    }

    all.push(...batch);

    if (batch.length < LIST_PAGE_SIZE) {
      break;
    }

    pageNo += 1;
  }

  return all;
};

/** 链接比对标签：名称 + 源/目标对象类型，避免仅按名称无法识别新增链接 */
export const formatLinkDiffLabel = (link: LinkInfo): string => {
  const name =
    link.name?.trim() || link.code?.trim() || String(link.id ?? '').trim();
  const source =
    link.sourceObjectTypeName?.trim() ||
    (link.sourceObjectTypeID != null ? `#${link.sourceObjectTypeID}` : '');
  const target =
    link.targetObjectTypeName?.trim() ||
    (link.targetObjectTypeID != null ? `#${link.targetObjectTypeID}` : '');

  if (source && target) {
    return `${name}（${source} → ${target}）`;
  }

  return name;
};

const pickLinkDiffLabels = (links: LinkInfo[]): string[] =>
  links
    .map(formatLinkDiffLabel)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

export const captureSceneSnapshot = async (
  ontologyModelId: number
): Promise<OntologySceneVersionSnapshot> => {
  const [objectTypeRes, linkTypesRaw, actionRes, functionRes] =
    await Promise.all([
      listOntologyObjectType({
        ontologyModelID: ontologyModelId,
        pageNo: 1,
        pageSize: -1
      }),
      fetchAllSceneLinkTypes(ontologyModelId),
      getActionList({
        ontologyModelID: ontologyModelId,
        pageNum: 1,
        pageSize: LIST_PAGE_SIZE
      }).catch(() => ({ items: [], total: 0 })),
      getFunctionList({
        ontologyModelID: ontologyModelId,
        pageNo: 1,
        pageSize: LIST_PAGE_SIZE
      }).catch(() => ({ items: [], total: 0 }))
    ]);

  const objectTypes = extractOntologyListResult(objectTypeRes);
  const linkTypes = enrichLinkTypesWithObjectTypes(linkTypesRaw, objectTypes);

  const objectTypeNames = pickNames(objectTypes);
  const linkTypeNames = pickLinkDiffLabels(linkTypes);
  const actionNames = pickNames(actionRes.items || []);
  const functionNames = pickNames(functionRes.items || []);

  return {
    objectTypeNames,
    linkTypeNames,
    actionNames,
    functionNames,
    counts: {
      objectTypes: objectTypeNames.length,
      linkTypes: linkTypeNames.length,
      actions: actionNames.length,
      functions: functionNames.length
    }
  };
};
