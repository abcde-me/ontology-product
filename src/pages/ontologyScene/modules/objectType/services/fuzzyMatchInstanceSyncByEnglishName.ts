import type { ObjectTypeAttributeField } from '../components/ObjectTypeFormUtils/types';
import type { SourceTableField } from '../components/ObjectTypeFormUtils/types';
import type { InstanceSyncColumnRelation } from './smartMatchInstanceSyncMapping';

const MIN_MATCH_SCORE = 55;

function normalizeEnglishFieldName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function scoreEnglishFieldMatch(
  propertyId: string,
  sourceFieldId: string
): number {
  const left = normalizeEnglishFieldName(propertyId);
  const right = normalizeEnglishFieldName(sourceFieldId);

  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 100;
  }
  if (left.endsWith(right) || right.endsWith(left)) {
    return 85;
  }
  if (left.includes(right) || right.includes(left)) {
    return 72;
  }

  const maxLen = Math.max(left.length, right.length);
  const distance = levenshteinDistance(left, right);
  const ratio = 1 - distance / maxLen;
  return Math.round(ratio * 65);
}

function levenshteinDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(0)
  );

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }
  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

/**
 * 根据属性 id 与源表字段英文名进行模糊匹配。
 */
export function fuzzyMatchInstanceSyncByEnglishName(params: {
  attributes: ObjectTypeAttributeField[];
  sourceFields: SourceTableField[];
}): InstanceSyncColumnRelation[] {
  const { attributes, sourceFields } = params;
  if (!attributes.length || !sourceFields.length) {
    return [];
  }

  const usedSourceIds = new Set<string>();
  const relations: InstanceSyncColumnRelation[] = [];
  const sortedAttributes = [...attributes].sort(
    (left, right) => (right.isPrimary ?? 0) - (left.isPrimary ?? 0)
  );

  sortedAttributes.forEach((attribute) => {
    const propertyId = attribute.propertyID?.trim();
    if (!propertyId) {
      return;
    }

    let bestMatch: { fieldId: string; score: number } | undefined;

    sourceFields.forEach((sourceField) => {
      const fieldId = sourceField.fieldId?.trim();
      if (!fieldId || usedSourceIds.has(fieldId)) {
        return;
      }

      const score = scoreEnglishFieldMatch(propertyId, fieldId);
      if (score < MIN_MATCH_SCORE) {
        return;
      }
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { fieldId, score };
      }
    });

    if (!bestMatch) {
      return;
    }

    usedSourceIds.add(bestMatch.fieldId);
    relations.push({
      objectTypeColumnName: propertyId,
      sourceTableColumnName: bestMatch.fieldId
    });
  });

  return relations;
}
