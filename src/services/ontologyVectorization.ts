import { type EmbeddingModelConfig } from '@/config/embeddingDefaults';
import { resolveEmbeddingModelConfig } from '@/services/llmScenarioStorage';
import {
  createEmbedding,
  createEmbeddings,
  cosineSimilarity,
  parseEmbeddingVector,
  serializeEmbeddingVector
} from '@/services/deepseekEmbedding';
import { VECTOR_FIELD_SUFFIX } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import type { CreateOntologyPhysicalProperty } from '@/types/objectType';
import type { VectorSearchRow } from '@/pages/exploreAnalysis/objectBrowse/types';

export interface VectorFieldMapping {
  vectorFieldName: string;
  sourceFieldName: string;
}

export const hasVectorizedPhysicalProperties = (
  properties?: Array<{ isVector?: number | 0 | 1 }>
) =>
  Array.isArray(properties) && properties.some((item) => item.isVector === 1);

export const collectVectorFieldMappings = (
  properties: Array<
    Pick<
      CreateOntologyPhysicalProperty,
      'name' | 'isVector' | 'vectorSourceFieldName'
    > & { propertyName?: string }
  >
): VectorFieldMapping[] => {
  return properties
    .filter((item) => item.isVector === 1)
    .map((item) => {
      const vectorFieldName = String(
        item.name || item.propertyName || ''
      ).trim();
      const sourceFieldName = String(item.vectorSourceFieldName || '').trim();
      if (!vectorFieldName || !sourceFieldName) {
        return null;
      }
      return { vectorFieldName, sourceFieldName };
    })
    .filter((item): item is VectorFieldMapping => !!item);
};

export const collectVectorFieldMappingsFromRecord = (
  properties: Array<Record<string, unknown>>
): VectorFieldMapping[] =>
  collectVectorFieldMappings(
    properties.map((property) => ({
      name: String(property.name || property.propertyName || ''),
      propertyName: String(property.propertyName || property.name || ''),
      isVector: Number(property.isVector ?? 0) === 1 ? 1 : 0,
      vectorSourceFieldName: String(property.vectorSourceFieldName || '')
    }))
  );

const resolveSourceFieldNames = (
  mapping: VectorFieldMapping,
  sample: Record<string, unknown>
): string[] => {
  const candidates = [
    mapping.sourceFieldName,
    `${mapping.sourceFieldName}${VECTOR_FIELD_SUFFIX}`
  ];
  return candidates.filter((name) =>
    Object.prototype.hasOwnProperty.call(sample, name)
  );
};

const readSourceFieldValue = (
  instance: Record<string, unknown>,
  mapping: VectorFieldMapping
): string => {
  const candidates = resolveSourceFieldNames(mapping, instance);
  for (const fieldName of candidates) {
    const value = instance[fieldName];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

export const enrichInstancesWithEmbeddings = async (
  instances: Record<string, unknown>[],
  mappings: VectorFieldMapping[],
  config: EmbeddingModelConfig = resolveEmbeddingModelConfig()
): Promise<Record<string, unknown>[]> => {
  if (!instances.length || !mappings.length) {
    return instances;
  }

  const nextInstances = instances.map((instance) => ({ ...instance }));

  for (const mapping of mappings) {
    const sourceTexts = nextInstances.map((instance) =>
      readSourceFieldValue(instance, mapping)
    );
    const embeddings = await createEmbeddings(sourceTexts, config);

    nextInstances.forEach((instance, index) => {
      const sourceText = sourceTexts[index];
      const embedding = embeddings[index];
      if (!sourceText || !embedding?.length) {
        return;
      }
      instance[mapping.vectorFieldName] = serializeEmbeddingVector(embedding);
    });
  }

  return nextInstances;
};

export interface SemanticVectorSearchParams {
  instances: Record<string, unknown>[];
  vectorFieldName: string;
  query: string;
  topK: number;
  scoreThreshold: number;
  embeddingConfig?: EmbeddingModelConfig;
}

export const searchInstancesBySemanticSimilarity = async ({
  instances,
  vectorFieldName,
  query,
  topK,
  scoreThreshold,
  embeddingConfig = resolveEmbeddingModelConfig()
}: SemanticVectorSearchParams): Promise<VectorSearchRow[]> => {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery || !instances.length) {
    return [];
  }

  const queryEmbedding = await createEmbedding(
    normalizedQuery,
    embeddingConfig
  );
  if (!queryEmbedding.length) {
    return [];
  }

  const scored = instances
    .map((instance) => {
      const storedVector = parseEmbeddingVector(instance[vectorFieldName]);
      if (!storedVector?.length) {
        return null;
      }

      const score = cosineSimilarity(queryEmbedding, storedVector);
      if (score < scoreThreshold) {
        return null;
      }

      return {
        ...instance,
        score
      } as VectorSearchRow;
    })
    .filter((item): item is VectorSearchRow => !!item)
    .sort((left, right) => Number(right.score || 0) - Number(left.score || 0));

  return scored.slice(0, Math.max(1, topK));
};

export const resolveEmbeddingConfigForRequest = () =>
  resolveEmbeddingModelConfig();
