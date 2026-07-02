import {
  listOntologyLinkType,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import {
  getOntologyObjectTypeDetail,
  listOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { formatLinkDiffLabel } from '@/pages/ontologyScene/services/captureSceneSnapshot';
import {
  SyncStatus,
  type LinkInfo,
  type PhysicalProperties
} from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import { extractListData, isOntologyApiSuccess } from '@/utils/apiResponse';
import { enrichLinkTypesWithObjectTypes } from '@/utils/enrichLinkTypeObjectTypes';
import {
  buildQueryProfilesFromOntologyPhysicalPropertiesList,
  buildSceneObjectTypeQueryProfiles,
  mergeSceneObjectTypeQueryProfiles,
  type SceneObjectTypeQueryProfiles
} from './sceneObjectTypeQueryProfiles';
import type { OntologyPhysicalPropertiesList } from '@/types/objectType';

const PAGE_SIZE = 100;
const LIST_PAGE_SIZE = 500;
const MAX_CONTEXT_CHARS = 12000;

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

const fetchAllPhysicalProperties = async (
  ontologyModelID: number
): Promise<PhysicalProperties[]> => {
  const rows: PhysicalProperties[] = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo === 1 || rows.length < totalCount) {
    const response = await listOntologyPhysicalProperties({
      ontologyModelID,
      pageNo,
      pageSize: PAGE_SIZE,
      isUse: 1,
      order: 'desc'
    });

    if (!isOntologyApiSuccess(response)) {
      break;
    }

    const properties = response.data?.result || [];
    totalCount = response.data?.totalCount ?? properties.length;
    rows.push(...properties);

    if (properties.length < PAGE_SIZE || rows.length >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  return rows;
};

const formatPropertyLine = (property: PhysicalProperties): string => {
  const name = property.name?.trim() || '未命名';
  const label =
    property.comment?.trim() || property.description?.trim() || name;
  const type = property.columnType?.trim() || 'string';
  const primary = property.isPrimary === 1 ? '，主键' : '';
  return `    - ${name}（${label}，${type}${primary}）`;
};

const formatObjectTypeSection = (
  objectTypes: ObjectType[],
  propertiesByObjectTypeId: Map<number, PhysicalProperties[]>
): string => {
  if (!objectTypes.length) {
    return '（当前场景暂无对象类型）';
  }

  return objectTypes
    .map((objectType) => {
      const name = objectType.name?.trim() || '未命名';
      const code = objectType.code?.trim() || String(objectType.id);
      const description = objectType.description?.trim();
      const properties = propertiesByObjectTypeId.get(objectType.id) || [];

      const lines = [
        `- ${name}（code: ${code}，id: ${objectType.id}）`,
        description ? `  描述：${description}` : '',
        properties.length
          ? `  属性：\n${properties.map(formatPropertyLine).join('\n')}`
          : '  属性：（无）'
      ].filter(Boolean);

      return lines.join('\n');
    })
    .join('\n\n');
};

const formatLinkSection = (links: LinkInfo[]): string => {
  if (!links.length) {
    return '（当前场景暂无链接类型）';
  }

  return links
    .map((link) => {
      const label = formatLinkDiffLabel(link);
      const code = link.code?.trim();
      const description = link.description?.trim();
      const lines = [
        `- ${label}`,
        code ? `  code: ${code}` : '',
        link.id != null ? `  id: ${link.id}` : '',
        description ? `  描述：${description}` : ''
      ].filter(Boolean);

      return lines.join('\n');
    })
    .join('\n\n');
};

export interface SceneObjectTypeRef {
  id: number;
  name: string;
  code: string;
  syncStatus?: SyncStatus;
  ontologyTableName?: string;
}

export interface SceneLinkTypeRef {
  id?: number;
  name: string;
  code: string;
  sourceName?: string;
  targetName?: string;
}

export interface SceneOntologyRefs {
  objectTypes: SceneObjectTypeRef[];
  links: SceneLinkTypeRef[];
  contextText: string;
}

const toSceneObjectTypeRefs = (
  objectTypes: ObjectType[]
): SceneObjectTypeRef[] =>
  objectTypes.map((objectType) => ({
    id: objectType.id,
    name: objectType.name?.trim() || '未命名',
    code: objectType.code?.trim() || String(objectType.id),
    syncStatus: objectType.syncStatus,
    ontologyTableName: objectType.ontologyTableName?.trim()
  }));

const toSceneLinkTypeRefs = (links: LinkInfo[]): SceneLinkTypeRef[] =>
  links.map((link) => ({
    id: link.id,
    name: link.name?.trim() || link.code?.trim() || '未命名链接',
    code: link.code?.trim() || String(link.id ?? ''),
    sourceName: link.sourceObjectTypeName,
    targetName: link.targetObjectTypeName
  }));

const buildSceneOntologyContextText = (
  objectTypes: ObjectType[],
  properties: PhysicalProperties[],
  links: LinkInfo[]
): string => {
  const propertiesByObjectTypeId = new Map<number, PhysicalProperties[]>();

  properties.forEach((property) => {
    const objectTypeId = property.ontologyObjectTypeId ?? property.objectTypeID;
    if (!objectTypeId) {
      return;
    }

    const list = propertiesByObjectTypeId.get(objectTypeId) || [];
    list.push(property);
    propertiesByObjectTypeId.set(objectTypeId, list);
  });

  const objectTypeWhitelist = objectTypes.length
    ? objectTypes
        .map((objectType) => {
          const code = objectType.code?.trim() || String(objectType.id);
          const name = objectType.name?.trim() || '未命名';
          const syncHint =
            objectType.syncStatus === SyncStatus.SUCCESS
              ? '，实例已同步'
              : objectType.syncStatus === SyncStatus.SYNCING
                ? '，实例同步中'
                : objectType.syncStatus === SyncStatus.FAILED
                  ? '，实例同步失败'
                  : '，实例未同步';
          return `- ${code}（${name}${syncHint}）`;
        })
        .join('\n')
    : '（当前场景暂无对象类型）';

  return [
    '【可用对象类型 code 白名单（ObjectRef.Type / query 只能使用以下 code，禁止编造；ObjectSet 无 Type 方法）】',
    objectTypeWhitelist,
    '',
    '【对象类型与属性】',
    formatObjectTypeSection(objectTypes, propertiesByObjectTypeId),
    '',
    '【链接类型】',
    formatLinkSection(links)
  ].join('\n');
};

const truncateContext = (text: string): string => {
  if (text.length <= MAX_CONTEXT_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_CONTEXT_CHARS)}\n\n...(场景本体信息已截断，完整结构请在场景库中查看)`;
};

const loadSceneOntologyData = async (ontologyModelID: number) => {
  const [objectTypeRes, properties, linkTypesRaw] = await Promise.all([
    listOntologyObjectType({
      ontologyModelID,
      pageNo: 1,
      pageSize: -1
    }),
    fetchAllPhysicalProperties(ontologyModelID),
    fetchAllSceneLinkTypes(ontologyModelID)
  ]);

  const objectTypes = extractOntologyListResult<ObjectType>(objectTypeRes);
  const links = enrichLinkTypesWithObjectTypes(linkTypesRaw, objectTypes);

  return {
    objectTypes,
    properties,
    links
  };
};

/**
 * 查询当前场景库本体结构，返回结构化引用与可读文本。
 */
export const fetchSceneOntologyRefs = async (
  ontologyModelID: number
): Promise<SceneOntologyRefs> => {
  if (!ontologyModelID || !Number.isFinite(ontologyModelID)) {
    return {
      objectTypes: [],
      links: [],
      contextText: '（未指定场景，无法加载本体结构）'
    };
  }

  const { objectTypes, properties, links } =
    await loadSceneOntologyData(ontologyModelID);

  return {
    objectTypes: toSceneObjectTypeRefs(objectTypes),
    links: toSceneLinkTypeRefs(links),
    contextText: truncateContext(
      buildSceneOntologyContextText(objectTypes, properties, links)
    )
  };
};

/**
 * 查询当前场景库的对象类型、属性与链接信息，格式化为大模型可读的参考文本。
 */
export const fetchSceneOntologyContext = async (
  ontologyModelID: number
): Promise<string> => {
  const refs = await fetchSceneOntologyRefs(ontologyModelID);
  return refs.contextText;
};

/**
 * 拉取场景库各对象类型的 query_objects select 字段（属性英文名）。
 */
export const fetchSceneObjectTypeQueryProfiles = async (
  ontologyModelID: number
): Promise<SceneObjectTypeQueryProfiles> => {
  if (!ontologyModelID || !Number.isFinite(ontologyModelID)) {
    return {};
  }

  const { objectTypes, properties } =
    await loadSceneOntologyData(ontologyModelID);
  let profiles = buildSceneObjectTypeQueryProfiles(objectTypes, properties);

  const missingProfileTypes = objectTypes.filter((objectType) => {
    const code = objectType.code?.trim();
    return code && !profiles[code]?.length;
  });

  for (const objectType of missingProfileTypes) {
    const code = objectType.code?.trim();
    if (!code || !objectType.id) {
      continue;
    }

    const detailRes = await getOntologyObjectTypeDetail({ id: objectType.id });
    if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
      continue;
    }

    const propertyList = (detailRes.data.ontologyPhysicalPropertiesList ||
      []) as OntologyPhysicalPropertiesList[];
    const fields = buildQueryProfilesFromOntologyPhysicalPropertiesList(
      code,
      propertyList
    );
    profiles = mergeSceneObjectTypeQueryProfiles(profiles, code, fields);
  }

  return profiles;
};
