import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import { type EmbeddingModelConfig } from '@/config/embeddingDefaults';
import { resolveEmbeddingModelConfig } from '@/services/llmScenarioStorage';
import { VECTOR_FIELD_SUFFIX } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import type {
  InstanceQueryRow,
  VectorSearchRow
} from '@/pages/exploreAnalysis/objectBrowse/types';
import {
  createEmbeddings,
  parseEmbeddingVector,
  serializeEmbeddingVector
} from '@/services/deepseekEmbedding';
import { searchInstancesBySemanticSimilarity } from '@/services/ontologyVectorization';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

const FETCH_PAGE_SIZE = 500;

export interface ClientVectorSearchParams {
  ontologyModelID: number;
  objectTypeId: number;
  vectorFieldName: string;
  query: string;
  topK: number;
  scoreThreshold: number;
  /** 传入则跳过实例列表拉取（如本地 dev 缓存） */
  instances?: Record<string, unknown>[];
  embeddingConfig?: EmbeddingModelConfig;
}

export async function fetchAllObjectTypeInstances(
  objectTypeId: number
): Promise<InstanceQueryRow[]> {
  const all: InstanceQueryRow[] = [];
  let page = 1;
  let totalCount = 0;

  while (page === 1 || all.length < totalCount) {
    const response = await listOntologyObjectTypeData({
      id: objectTypeId,
      page,
      pageSize: FETCH_PAGE_SIZE
    });

    if (!isOntologyApiSuccess(response)) {
      break;
    }

    const items = response.data?.result || [];
    totalCount = response.data?.totalCount ?? items.length;
    all.push(...items);

    if (items.length < FETCH_PAGE_SIZE || all.length >= totalCount) {
      break;
    }

    page += 1;
  }

  return all;
}

const isVectorProperty = (columnType?: string) => {
  const normalized = String(columnType || '').toLowerCase();
  return normalized === 'vector' || normalized.includes('vector');
};

export async function resolveVectorSourceFieldName(
  ontologyModelID: number,
  objectTypeId: number,
  vectorFieldName: string
): Promise<string> {
  const normalized = vectorFieldName.trim();
  if (!normalized) {
    return '';
  }

  if (ontologyModelID > 0 && objectTypeId > 0) {
    try {
      const response = await listOntologyPhysicalProperties({
        ontologyModelID,
        objectTypeIdList: [objectTypeId],
        pageNo: 1,
        pageSize: 500,
        isUse: 1,
        order: 'desc'
      });

      if (isOntologyApiSuccess(response)) {
        const properties = response.data?.result || [];
        const vectorProperty = properties.find(
          (item) => String(item.name || '').trim() === normalized
        );

        if (vectorProperty && isVectorProperty(vectorProperty.columnType)) {
          const vectorRows = properties.filter((item) =>
            isVectorProperty(item.columnType)
          );
          const sourceProperty = properties.find((item) => {
            const name = String(item.name || '').trim();
            return (
              name &&
              !isVectorProperty(item.columnType) &&
              `${name}${VECTOR_FIELD_SUFFIX}` === normalized
            );
          });

          if (sourceProperty?.name) {
            return String(sourceProperty.name).trim();
          }

          if (
            vectorRows.length === 1 &&
            normalized.endsWith(VECTOR_FIELD_SUFFIX)
          ) {
            return normalized.slice(0, -VECTOR_FIELD_SUFFIX.length);
          }
        }
      }
    } catch (error) {
      console.warn('[vector-search] 解析向量源字段失败，回退命名约定', error);
    }
  }

  if (normalized.endsWith(VECTOR_FIELD_SUFFIX)) {
    return normalized.slice(0, -VECTOR_FIELD_SUFFIX.length);
  }

  return normalized;
}

const readSourceFieldValue = (
  instance: Record<string, unknown>,
  sourceFieldName: string
): string => {
  const candidates = [
    sourceFieldName,
    `${sourceFieldName}${VECTOR_FIELD_SUFFIX}`
  ];

  for (const fieldName of candidates) {
    const value = instance[fieldName];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

async function ensureInstanceVectors(
  instances: Record<string, unknown>[],
  vectorFieldName: string,
  sourceFieldName: string,
  embeddingConfig: EmbeddingModelConfig
): Promise<Record<string, unknown>[]> {
  const missingIndexes: number[] = [];

  instances.forEach((instance, index) => {
    const storedVector = parseEmbeddingVector(instance[vectorFieldName]);
    if (!storedVector?.length) {
      missingIndexes.push(index);
    }
  });

  if (!missingIndexes.length) {
    return instances;
  }

  const sourceTexts = missingIndexes.map((index) =>
    readSourceFieldValue(instances[index], sourceFieldName)
  );
  const embeddings = await createEmbeddings(sourceTexts, embeddingConfig);

  return instances.map((instance, index) => {
    const storedVector = parseEmbeddingVector(instance[vectorFieldName]);
    if (storedVector?.length) {
      return instance;
    }

    const missingIndex = missingIndexes.indexOf(index);
    if (missingIndex < 0) {
      return instance;
    }

    const sourceText = sourceTexts[missingIndex];
    const embedding = embeddings[missingIndex];
    if (!sourceText || !embedding?.length) {
      return instance;
    }

    return {
      ...instance,
      [vectorFieldName]: serializeEmbeddingVector(embedding)
    };
  });
}

export async function clientVectorSearchOntologyObjectTypeData(
  params: ClientVectorSearchParams
): Promise<{ result: VectorSearchRow[]; totalCount: number }> {
  const embeddingConfig =
    params.embeddingConfig || resolveEmbeddingModelConfig();
  const instances =
    params.instances ||
    (await fetchAllObjectTypeInstances(params.objectTypeId));

  if (!instances.length) {
    return { result: [], totalCount: 0 };
  }

  const sourceFieldName = await resolveVectorSourceFieldName(
    params.ontologyModelID,
    params.objectTypeId,
    params.vectorFieldName
  );

  const prepared = await ensureInstanceVectors(
    instances,
    params.vectorFieldName,
    sourceFieldName,
    embeddingConfig
  );

  const items = await searchInstancesBySemanticSimilarity({
    instances: prepared,
    vectorFieldName: params.vectorFieldName,
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    embeddingConfig
  });

  return {
    result: items,
    totalCount: items.length
  };
}

export interface ClientVectorSearchAllFieldsParams {
  ontologyModelID: number;
  objectTypeId: number;
  vectorFieldNames: string[];
  fieldLabelByName: Record<string, string>;
  query: string;
  topK: number;
  scoreThreshold: number;
  instances?: Record<string, unknown>[];
  embeddingConfig?: EmbeddingModelConfig;
}

const mergeVectorRowsByInstance = (
  rows: VectorSearchRow[],
  topK: number
): VectorSearchRow[] => {
  const bestByInstance = new Map<string, VectorSearchRow>();

  for (const row of rows) {
    const instanceId = row.id ?? row.ID ?? row.instanceId ?? row.instance_id;
    const key =
      instanceId != null && instanceId !== ''
        ? String(instanceId)
        : JSON.stringify(
            Object.fromEntries(
              Object.entries(row).filter(
                ([field]) =>
                  field !== 'score' &&
                  field !== '_score' &&
                  field !== 'similarity' &&
                  field !== 'matchedVectorField'
              )
            )
          );
    const score = Number(row.score ?? 0);
    const existing = bestByInstance.get(key);

    if (!existing || Number(existing.score ?? 0) < score) {
      bestByInstance.set(key, row);
    }
  }

  return [...bestByInstance.values()]
    .sort((left, right) => Number(right.score ?? 0) - Number(left.score ?? 0))
    .slice(0, Math.max(1, topK));
};

export async function clientVectorSearchAllVectorFields(
  params: ClientVectorSearchAllFieldsParams
): Promise<{ result: VectorSearchRow[]; totalCount: number }> {
  const embeddingConfig =
    params.embeddingConfig || resolveEmbeddingModelConfig();
  const instances =
    params.instances ||
    (await fetchAllObjectTypeInstances(params.objectTypeId));

  if (!instances.length || !params.vectorFieldNames.length) {
    return { result: [], totalCount: 0 };
  }

  const mergedRows: VectorSearchRow[] = [];

  for (const vectorFieldName of params.vectorFieldNames) {
    const sourceFieldName = await resolveVectorSourceFieldName(
      params.ontologyModelID,
      params.objectTypeId,
      vectorFieldName
    );
    const prepared = await ensureInstanceVectors(
      instances,
      vectorFieldName,
      sourceFieldName,
      embeddingConfig
    );
    const items = await searchInstancesBySemanticSimilarity({
      instances: prepared,
      vectorFieldName,
      query: params.query,
      topK: params.topK,
      scoreThreshold: params.scoreThreshold,
      embeddingConfig
    });

    mergedRows.push(
      ...items.map((item) => ({
        ...item,
        matchedVectorField:
          params.fieldLabelByName[vectorFieldName] || vectorFieldName
      }))
    );
  }

  const result = mergeVectorRowsByInstance(mergedRows, params.topK);

  return {
    result,
    totalCount: result.length
  };
}
