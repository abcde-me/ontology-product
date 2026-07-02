import {
  getOntologyObjectTypeDetail,
  listOntologyObjectType,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import {
  findDataResourceTableForObjectType,
  needsPhysicalPropertyRepair,
  resolveExpectedPhysicalPropertiesForObjectType,
  toCreatePhysicalPropertiesFromList
} from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import type { GetOntologyObjectTypeDetailRes } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  devMirrorOntologyObjectType,
  resolveDevInstancesForPayload
} from '@/utils/devObjectTypeStore';

export interface ScenePhysicalPropertyRepairResult {
  repairedObjectTypes: string[];
  skippedObjectTypes: string[];
  errors: string[];
}

const normalizeDetailProperties = (detail: GetOntologyObjectTypeDetailRes) =>
  (detail.ontologyPhysicalPropertiesList || []).map((property) => ({
    name: property.propertyName,
    comment: property.propertyComment,
    propertyName: property.propertyName,
    propertyComment: property.propertyComment
  }));

const buildUpdatePayload = (
  detail: GetOntologyObjectTypeDetailRes,
  objectTypeId: number,
  expectedProperties: ReturnType<
    typeof resolveExpectedPhysicalPropertiesForObjectType
  >
) => ({
  id: objectTypeId,
  code: detail.code || '',
  name: detail.name || detail.code || '',
  description: detail.description,
  icon: detail.icon || 'object-type-1',
  ontologyModelID: detail.ontologyModelID,
  filePath: detail.filePath,
  enableSyncSourceData: detail.enableSyncSourceData ?? false,
  originalDbName: detail.originalDbName || '',
  originalTableName: detail.originalTableName || '',
  sourceType: detail.sourceType,
  isReUpload: 0 as const,
  ontologyPhysicalPropertiesList: toCreatePhysicalPropertiesFromList(
    expectedProperties || []
  )
});

/**
 * 扫描场景内对象类型，将数据资源目录中的字段定义写回缺失/空壳属性。
 * 适用于车辆维修等从数据资源创建、或导入时属性字段映射错误的历史数据。
 */
export const repairScenePhysicalProperties = async (
  ontologyModelID: number
): Promise<ScenePhysicalPropertyRepairResult> => {
  const result: ScenePhysicalPropertyRepairResult = {
    repairedObjectTypes: [],
    skippedObjectTypes: [],
    errors: []
  };

  const listRes = await listOntologyObjectType({
    ontologyModelID,
    pageNo: 1,
    pageSize: -1
  });

  if (!isOntologyApiSuccess(listRes)) {
    result.errors.push(listRes.message || '获取对象类型列表失败');
    return result;
  }

  const objectTypes = listRes.data?.result || [];

  for (const objectType of objectTypes) {
    const objectTypeId = Number(objectType.id);
    if (!Number.isFinite(objectTypeId)) {
      continue;
    }

    const detailRes = await getOntologyObjectTypeDetail({ id: objectTypeId });
    if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
      result.errors.push(
        `${objectType.name || objectType.code || objectTypeId}: 获取详情失败`
      );
      continue;
    }

    const detail = detailRes.data;
    const table = findDataResourceTableForObjectType(detail);
    const expected = resolveExpectedPhysicalPropertiesForObjectType(detail);

    if (!table || !expected?.length) {
      result.skippedObjectTypes.push(
        detail.name || detail.code || String(objectTypeId)
      );
      continue;
    }

    const current = normalizeDetailProperties(detail);
    if (!needsPhysicalPropertyRepair(current, expected.length)) {
      result.skippedObjectTypes.push(
        detail.name || detail.code || String(objectTypeId)
      );
      continue;
    }

    try {
      const payload = buildUpdatePayload(detail, objectTypeId, expected);
      const updateRes = await updateOntologyObjectType(payload);

      if (isOntologyApiSuccess(updateRes)) {
        result.repairedObjectTypes.push(
          detail.name || detail.code || String(objectTypeId)
        );

        if (isDevBypassEnabled()) {
          devMirrorOntologyObjectType(
            objectTypeId,
            payload,
            resolveDevInstancesForPayload(payload)
          );
        }
      } else {
        result.errors.push(
          `${detail.name || detail.code}: ${updateRes.message || '更新失败'}`
        );
      }
    } catch (error) {
      result.errors.push(
        `${detail.name || detail.code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return result;
};
