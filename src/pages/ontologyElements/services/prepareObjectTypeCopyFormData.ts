import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import { fetchSceneObjectTypeCodes } from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';
import { mapObjectTypeDetailToFormData } from '@/pages/ontologyScene/modules/objectType/mapObjectTypeDetailToFormData';
import type { ObjectTypeFormData } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import {
  ensureUniqueObjectTypeCode,
  generateLocalObjectTypeCode
} from '@/utils/generateOntologyObjectTypeCodeName';

export async function prepareObjectTypeCopyFormData(
  sourceObjectTypeId: number,
  targetOntologyModelId: number
): Promise<Partial<ObjectTypeFormData>> {
  const detailRes = await getOntologyObjectTypeDetail({
    id: sourceObjectTypeId
  });

  if (detailRes.status !== 200 || !detailRes.data) {
    throw new Error('获取对象类型详情失败');
  }

  const base = mapObjectTypeDetailToFormData(detailRes.data);
  const existingCodes = await fetchSceneObjectTypeCodes(targetOntologyModelId);
  const copyName = `${base.name || '对象类型'}_copy`;

  const sourceCode = base.code?.trim();
  const codeTaken = sourceCode
    ? existingCodes.some(
        (code) => code.trim().toLowerCase() === sourceCode.toLowerCase()
      )
    : true;

  const copyCode =
    sourceCode && !codeTaken
      ? sourceCode
      : sourceCode
        ? ensureUniqueObjectTypeCode(sourceCode, existingCodes)
        : generateLocalObjectTypeCode(copyName, existingCodes);

  return {
    ...base,
    code: copyCode,
    name: copyName,
    ontologyModelID: targetOntologyModelId,
    enableSyncSourceData: false,
    syncSourceDataStrategy: undefined
  };
}
