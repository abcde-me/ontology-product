import {
  getOntologyObjectTypeDetail,
  syncObjectTypeTask,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { buildUpdateObjectTypeRequest } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormHooks/useObjectTypeSubmit';
import {
  legacyFieldToObjectTypeAttribute,
  mergeOntologyPhysicalPropertiesForForm,
  mergeOntologyPhysicalPropertiesListForForm,
  objectTypeAttributeToSyncMapping
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import type {
  ObjectTypeAttributeField,
  ObjectTypeFormData,
  SyncSourceDataStrategyFormState
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { mapObjectTypeDetailToFormData } from '@/pages/ontologyScene/modules/objectType/mapObjectTypeDetailToFormData';
import {
  findDataResourceTableBySource,
  isDataResourceBackedObjectType,
  isDataResourceBackedObjectTypeFromRecord
} from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import { resolveDataResourceSyncConnector } from '@/pages/ontologyScene/modules/objectType/services/resolveDataResourceSyncConnector';
import type {
  ObjectType,
  OntologyPhysicalPropertiesList
} from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { SqlSourceDataInfo } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

export { isDataResourceBackedObjectTypeFromRecord };

export const canAutoConfigureDataResourceInstanceSync = (
  record: Pick<
    ObjectType,
    | 'sourceType'
    | 'filePath'
    | 'originalDbName'
    | 'originalTableName'
    | 'enableSyncSourceData'
  >
): boolean =>
  !record.enableSyncSourceData &&
  isDataResourceBackedObjectTypeFromRecord(record);

const DEFAULT_DATA_RESOURCE_SYNC_STRATEGY: SyncSourceDataStrategyFormState = {
  sourceDataInfo: {
    queryMode: 'selected'
  },
  // 数据资源无连接器时无法走 CDC，使用轮询全量同步
  mode: 'JDBC_POLLING',
  conflictStrategy: 'KEEP_SOURCE',
  syncScope: 'FULL',
  jdbcPollingIntervalSeconds: 60,
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'STOP_ON_ERROR'
};

const resolveObjectTypeAttributes = (
  propertyList: OntologyPhysicalPropertiesList[]
): ObjectTypeAttributeField[] => {
  if (!propertyList.length) {
    return [];
  }

  const usesNewPropertyShape = propertyList.some(
    (field) => field.propertyID !== undefined
  );

  if (usesNewPropertyShape) {
    return mergeOntologyPhysicalPropertiesListForForm(propertyList);
  }

  return mergeOntologyPhysicalPropertiesForForm(propertyList as never).map(
    (field) => legacyFieldToObjectTypeAttribute(field)
  );
};

export const buildDataResourceInstanceSyncFormData = (
  detail: NonNullable<
    Awaited<ReturnType<typeof getOntologyObjectTypeDetail>>['data']
  >
): ObjectTypeFormData | null => {
  const propertyList = (detail.ontologyPhysicalPropertiesList ||
    []) as OntologyPhysicalPropertiesList[];

  if (!propertyList.length) {
    return null;
  }

  const objectTypeAttributes = resolveObjectTypeAttributes(propertyList);
  if (!objectTypeAttributes.length) {
    return null;
  }

  const tableName = detail.originalTableName?.trim();
  const databaseName = detail.originalDbName?.trim();
  if (!tableName) {
    return null;
  }

  const baseForm = mapObjectTypeDetailToFormData(detail);
  const syncMappingFields = objectTypeAttributes.map((attribute) => ({
    ...objectTypeAttributeToSyncMapping(attribute),
    sourceColumnName: attribute.sourceColumnName || attribute.propertyID,
    ...(tableName
      ? { sourceTableName: attribute.sourceTableName || tableName }
      : {})
  }));

  const syncSourceDataStrategy: SyncSourceDataStrategyFormState = {
    ...DEFAULT_DATA_RESOURCE_SYNC_STRATEGY,
    sourceDataInfo: {
      databaseName,
      tableName,
      queryMode: 'selected'
    }
  };

  return {
    ...(baseForm as ObjectTypeFormData),
    enableSyncSourceData: true,
    syncSourceDataStrategy,
    syncMappingFields,
    objectTypeAttributes,
    ontologyPhysicalPropertiesList: propertyList
  };
};

const applyResolvedSyncConnector = async (
  formData: ObjectTypeFormData,
  detail: NonNullable<
    Awaited<ReturnType<typeof getOntologyObjectTypeDetail>>['data']
  >
): Promise<{ ok: boolean; message: string }> => {
  const catalogTable = findDataResourceTableBySource(
    detail.originalDbName,
    detail.originalTableName
  );
  if (!catalogTable) {
    return { ok: true, message: '' };
  }

  const resolved = await resolveDataResourceSyncConnector({
    tableName: catalogTable.tableName,
    databaseType: catalogTable.databaseType
  });
  if (!resolved) {
    return {
      ok: true,
      message: ''
    };
  }

  const sourceDataInfo: SqlSourceDataInfo = {
    connectorId: resolved.connectorId,
    connectorName: resolved.connectorName,
    databaseName: resolved.databaseName,
    tableName: resolved.tableName,
    queryMode: 'selected'
  };

  formData.sourceDataInfo = sourceDataInfo;
  formData.syncSourceDataStrategy = {
    ...(formData.syncSourceDataStrategy as SyncSourceDataStrategyFormState),
    sourceDataInfo
  };

  return { ok: true, message: '' };
};

/**
 * 数据资源建模的对象类型：一键开启实例同步，将原表字段映射写入并触发全量同步任务。
 */
export const configureDataResourceInstanceSync = async (
  objectTypeId: number
): Promise<{ ok: boolean; message: string }> => {
  if (!objectTypeId) {
    return { ok: false, message: '对象类型 ID 无效' };
  }

  const detailRes = await getOntologyObjectTypeDetail({ id: objectTypeId });
  if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
    return {
      ok: false,
      message: detailRes.message || '获取对象类型详情失败'
    };
  }

  const detail = detailRes.data;
  if (!isDataResourceBackedObjectType(detail)) {
    return {
      ok: false,
      message: '仅支持数据资源建模的对象类型一键配置实例同步'
    };
  }

  const formData = buildDataResourceInstanceSyncFormData(detail);
  if (!formData) {
    return {
      ok: false,
      message: '对象类型缺少属性或原表信息，无法配置实例同步'
    };
  }

  await applyResolvedSyncConnector(formData, detail);

  const updateRes = await updateOntologyObjectType(
    buildUpdateObjectTypeRequest(objectTypeId, formData)
  );
  if (!isOntologyApiSuccess(updateRes)) {
    return {
      ok: false,
      message: updateRes.message || '开启实例同步配置失败'
    };
  }

  const syncRes = await syncObjectTypeTask({ id: objectTypeId });
  if (!isOntologyApiSuccess(syncRes)) {
    const connectorHint = formData.syncSourceDataStrategy?.sourceDataInfo
      ?.connectorId
      ? ''
      : `请先在「数据源管理」创建包含表「${detail.originalTableName}」的 SQL 连接，或在编辑页第 3 步手动选择连接器后保存；`;
    return {
      ok: false,
      message:
        syncRes.message ||
        `${connectorHint}已保存同步配置，但触发实例同步任务失败，请在列表中点击「重试」`
    };
  }

  return {
    ok: true,
    message: `已开启实例同步，正在将原表「${detail.originalTableName}」数据同步到对象实例，请稍后刷新查看同步状态`
  };
};
