import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { resolveEmbeddingModelConfig } from '@/services/llmScenarioStorage';
import {
  clientVectorSearchAllVectorFields,
  clientVectorSearchOntologyObjectTypeData
} from '@/services/vectorSimilaritySearch';
import { devListOntologyPhysicalProperties } from '@/utils/devObjectTypeStore';
import type { PhysicalProperties } from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import type { OntologScene } from '@/types/ontologySceneApi';
import { ALL_VECTOR_FIELDS_VALUE } from '../constants';
import type {
  VectorFieldOption,
  VectorSearchParams,
  VectorSearchResult
} from '../types';
import {
  loadAllClientInstances,
  resolveClientObjectTypeId
} from './clientInstanceLoader';

export const isAllVectorFields = (vectorFieldName?: string) =>
  vectorFieldName === ALL_VECTOR_FIELDS_VALUE;

const resolveClientInstances = async (
  params: Pick<VectorSearchParams, 'ontologyModelID' | 'objectTypeId'>
): Promise<Record<string, unknown>[]> =>
  loadAllClientInstances({
    objectTypeId: params.objectTypeId,
    sceneId: params.ontologyModelID
  });

const parseVectorDimension = (
  property: PhysicalProperties
): number | undefined => {
  const candidates = [
    property.columnType,
    property.description,
    property.tableField
  ];

  for (const candidate of candidates) {
    const text = String(candidate || '');
    const match =
      text.match(/(\d+)\s*维?/) || text.match(/vector\s*\(\s*(\d+)\s*\)/i);
    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return undefined;
};

const formatVectorFieldLabel = (property: PhysicalProperties): string => {
  const name = property.comment || property.name || '未命名向量字段';
  const dimension = parseVectorDimension(property);

  if (dimension) {
    return `${name} (${dimension} 维)`;
  }

  return name;
};

export const fetchSceneOptions = async (): Promise<OntologScene[]> => {
  const res = await listOntologyModel({
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  if (res.status !== 200 || res.code !== '') {
    return [];
  }

  return res.data?.result || [];
};

export const fetchObjectTypeOptions = async (
  sceneId: number
): Promise<ObjectType[]> => {
  const res = await listOntologyObjectType({
    ontologyModelID: sceneId,
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  if (res.status !== 200 || res.code !== '') {
    return [];
  }

  return res.data?.result || [];
};

export const fetchVectorFieldOptions = async (
  sceneId: number,
  objectTypeId: number
): Promise<VectorFieldOption[]> => {
  const rows: PhysicalProperties[] = [];
  let pageNo = 1;
  let totalCount = 0;
  const pageSize = 100;

  try {
    while (pageNo === 1 || rows.length < totalCount) {
      const res = await listOntologyPhysicalProperties({
        ontologyModelID: sceneId,
        objectTypeIdList: [objectTypeId],
        pageNo,
        pageSize,
        isUse: 1,
        order: 'desc'
      });

      if (res.status !== 200 || res.code !== '') {
        break;
      }

      const properties = res.data?.result || [];
      totalCount = res.data?.totalCount ?? properties.length;
      rows.push(...properties);

      if (properties.length < pageSize || rows.length >= totalCount) {
        break;
      }

      pageNo += 1;
    }
  } catch {
    // 后端不可用时走本地属性缓存
  }

  if (!rows.length) {
    const resolvedId = resolveClientObjectTypeId({
      objectTypeId,
      sceneId
    });
    const devRes = devListOntologyPhysicalProperties({
      ontologyModelID: sceneId,
      objectTypeIdList: [resolvedId],
      pageNo: 1,
      pageSize: 10_000,
      isUse: 1,
      order: 'desc'
    });
    if (devRes.status === 200 && devRes.code === '') {
      rows.push(...(devRes.data?.result || []));
    }
  }

  return rows
    .filter((item) => {
      const columnType = String(item.columnType || '').toLowerCase();
      return columnType === 'vector' || columnType.includes('vector');
    })
    .map((item) => ({
      label: formatVectorFieldLabel(item),
      value: String(item.name || ''),
      comment: item.comment,
      dimension: parseVectorDimension(item)
    }))
    .filter((item) => item.value);
};

const searchSingleVectorField = async (
  params: VectorSearchParams
): Promise<VectorSearchResult> => {
  const instances = await resolveClientInstances(params);
  const data = await clientVectorSearchOntologyObjectTypeData({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    vectorFieldName: params.vectorFieldName,
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    instances,
    embeddingConfig: resolveEmbeddingModelConfig()
  });

  return {
    items: data.result,
    total: data.totalCount
  };
};

export const searchByVectorField = async (
  params: VectorSearchParams
): Promise<VectorSearchResult> => {
  if (!isAllVectorFields(params.vectorFieldName)) {
    return searchSingleVectorField(params);
  }

  const fields = await fetchVectorFieldOptions(
    params.ontologyModelID,
    params.objectTypeId
  );

  if (!fields.length) {
    return { items: [], total: 0 };
  }

  const data = await clientVectorSearchAllVectorFields({
    ontologyModelID: params.ontologyModelID,
    objectTypeId: params.objectTypeId,
    vectorFieldNames: fields.map((field) => field.value),
    fieldLabelByName: Object.fromEntries(
      fields.map((field) => [field.value, field.label])
    ),
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    instances: await resolveClientInstances(params),
    embeddingConfig: resolveEmbeddingModelConfig()
  });

  return {
    items: data.result,
    total: data.totalCount
  };
};
