import { Message } from '@arco-design/web-react';
import {
  CreateOntologyObjectTypeReq,
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList,
  SourceDataInfo,
  SourceType,
  SyncSourceDataStrategy,
  UpdateOntologyObjectTypeReq
} from '@/types/objectType';
import {
  DATA_SOURCE_TYPE,
  INSTANCE_SYNC_SOURCE_TYPE,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import {
  API_SYNC_MODE,
  CSV_SYNC_MODE,
  applyInstanceSyncStrategyDefaults,
  isApiPollingMode,
  isCsvIncrementalImportScope,
  isIcebergConnectorSubtype
} from '../ObjectTypeFormSteps/common/instanceSyncStrategyConfig';
import { resolveEmbeddingModelConfig } from '@/services/llmScenarioStorage';
import { hasVectorizedPhysicalProperties } from '@/services/ontologyVectorization';
import { isGraphObjectTypePlaceholderFilePath } from '@/utils/ontologyCsvTemplate';
import {
  VECTOR_FIELD_SUFFIX,
  flattenOntologyPhysicalPropertiesForSubmit,
  objectTypeAttributeToLegacyField
} from '../ObjectTypeFormUtils/attributeFields';
import {
  AttributeField,
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  ObjectTypeDataSourceState,
  ObjectTypeFormData,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../ObjectTypeFormUtils/types';

interface BuildObjectTypeFormDataParams {
  values: any;
  selectedIcon: string;
  initialOntologyModelID?: number;
  dataSource: ObjectTypeDataSourceState;
  attributeFields: AttributeField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  syncSourceDataStrategy?: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  enableSyncSourceData?: boolean;
  isReUpload: boolean;
}

function toSubmitSourceDataInfoFromSyncState(
  state: SyncSourceDataStrategyFormState
): SourceDataInfo | undefined {
  const sourceType =
    state.instanceSyncSourceType || INSTANCE_SYNC_SOURCE_TYPE.DATABASE;

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE) {
    if (!state.messageQueueConnectorId) {
      return undefined;
    }
    return {
      connectorId: state.messageQueueConnectorId,
      tableName: state.messageQueueTopic?.trim() || undefined,
      queryMode: 'selected'
    };
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE) {
    if (!state.apiConnectorId) {
      return undefined;
    }
    return {
      connectorId: state.apiConnectorId,
      queryMode: 'selected'
    };
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD) {
    if (!state.instanceCsvFilePath?.trim()) {
      return undefined;
    }
    return {
      tableName: state.instanceCsvFilePath.trim(),
      queryMode: 'selected'
    };
  }

  return toSubmitSourceDataInfo(state.sourceDataInfo);
}

function toSubmitSourceDataInfo(
  source?: SqlSourceDataInfo
): SourceDataInfo | undefined {
  if (!source) return undefined;

  const queryMode = source.queryMode || 'selected';

  if (source.connectorId) {
    return {
      connectorId: source.connectorId,
      databaseName: source.databaseName,
      tableName: source.tableName,
      queryMode,
      sql: source.sql
    };
  }

  // 数据资源建模：无 SQL 连接器，依赖 originalDbName / originalTableName 提交同步策略
  if (queryMode === 'selected' && source.tableName?.trim()) {
    return {
      databaseName: source.databaseName,
      tableName: source.tableName.trim(),
      queryMode
    };
  }

  return undefined;
}

function dataSourceStateToSqlSourceDataInfo(
  dataSource: ObjectTypeDataSourceState
): SqlSourceDataInfo | undefined {
  if (dataSource.type !== DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
    return undefined;
  }
  return {
    connectorId: dataSource.connectorId,
    connectorName: dataSource.connectorName,
    connectorSubtype: dataSource.connectorSubtype,
    databaseName: dataSource.database,
    tableName: dataSource.table,
    queryMode: dataSource.queryMode || 'selected',
    sql: dataSource.sql
  };
}

function buildPhysicalProperties(
  objectTypeAttributes: ObjectTypeAttributeField[] | undefined,
  syncMappingFields: InstanceSyncMappingField[] | undefined,
  fallbackAttributeFields: AttributeField[],
  dataSource?: ObjectTypeDataSourceState
): CreateOntologyPhysicalProperty[] | OntologyPhysicalPropertiesList[] {
  if (!objectTypeAttributes?.length) {
    return flattenOntologyPhysicalPropertiesForSubmit(fallbackAttributeFields);
  }

  const syncByPropertyID = new Map(
    (syncMappingFields || []).map((field) => [field.propertyID, field])
  );
  const sourcePrimaryKey = (
    syncMappingFields?.length
      ? syncMappingFields
          .filter((field) => field.isPrimary === 1)
          .map((field) => field.sourceColumnName || field.propertyID)
      : objectTypeAttributes
          .filter((field) => field.isPrimary === 1)
          .map((field) => field.sourceColumnName || field.propertyID)
  ).filter(Boolean);
  const isSqlDirectorySource =
    dataSource?.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
    dataSource?.queryMode === 'sql';
  const resolveSourceTableName = (field: ObjectTypeAttributeField) => {
    const fromField = field.sourceTableName?.trim();
    if (fromField) return fromField;
    if (
      !isSqlDirectorySource &&
      (dataSource?.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ||
        dataSource?.type === DATA_SOURCE_TYPE.DATA_RESOURCE) &&
      dataSource?.table?.trim()
    ) {
      return dataSource.table.trim();
    }
    return '';
  };
  const result: OntologyPhysicalPropertiesList[] = [];

  for (const field of objectTypeAttributes) {
    const mapping = syncByPropertyID.get(field.propertyID);
    const sourceColumnName =
      mapping?.sourceColumnName || field.sourceColumnName || field.propertyID;
    const sourceCoumnOriginName =
      mapping?.sourceCoumnOriginName || sourceColumnName;
    const sourceColumnType =
      mapping?.sourceColumnType || field.sourceColumnType;
    const sourceTableName = resolveSourceTableName(field);
    const sourceColumnComment =
      mapping?.sourceColumnComment ||
      field.sourceColumnComment ||
      field.propertyComment;
    const vectorizationOn =
      (mapping?.isVector ?? (field._vectorizationOn ? 1 : 0)) === 1;

    result.push({
      propertyID: field.backendPropertyID || 0,
      propertyName: field.propertyID,
      propertyComment: field.propertyComment,
      propertyType: field.propertyType,
      isPrimary: field.isPrimary,
      isVector: 0,
      publicPropertyID: field.publicPropertyID || 0,
      sourceColumnName,
      sourceColumnComment,
      sourceColumnType: sourceColumnType || field.propertyType,
      sourceCoumnOriginName,
      sourceTableName,
      sourcePrimaryKey,
      vectorSourceFieldName: ''
    });

    if (vectorizationOn) {
      const vecName = `${field.propertyID}${VECTOR_FIELD_SUFFIX}`;
      const vecComment =
        mapping?._vectorComment ??
        field._vectorComment ??
        `${field.propertyComment || ''}${VECTOR_FIELD_SUFFIX}`;
      let vecBackendId = 0;
      const vectorPropertyId =
        mapping?._vectorPropertyId ?? field._vectorPropertyId;
      if (vectorPropertyId !== undefined && vectorPropertyId !== '') {
        const n = Number(vectorPropertyId);
        if (Number.isFinite(n)) vecBackendId = Math.trunc(n);
      }
      result.push({
        propertyID: vecBackendId,
        propertyName: vecName,
        propertyComment: vecComment,
        propertyType: 'vector',
        isPrimary: 0,
        isVector: 1,
        publicPropertyID: 0,
        sourceColumnName,
        sourceColumnComment,
        sourceColumnType: sourceColumnType || field.propertyType,
        sourceCoumnOriginName,
        sourceTableName,
        sourcePrimaryKey,
        vectorSourceFieldName: field.propertyID
      });
    }
  }

  return result;
}

function buildSyncSourceDataStrategy(
  state?: SyncSourceDataStrategyFormState
): SyncSourceDataStrategy | undefined {
  if (!state) return undefined;

  const normalizedState = applyInstanceSyncStrategyDefaults(state);

  const sourceDataInfo = toSubmitSourceDataInfoFromSyncState(normalizedState);
  if (!sourceDataInfo) return undefined;

  const isKafkaSource =
    normalizedState.instanceSyncSourceType ===
    INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE;
  const isApiSource =
    normalizedState.instanceSyncSourceType ===
    INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE;
  const isCsvSource =
    normalizedState.instanceSyncSourceType ===
    INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD;
  const isIcebergDatabaseSource =
    normalizedState.instanceSyncSourceType ===
      INSTANCE_SYNC_SOURCE_TYPE.DATABASE &&
    isIcebergConnectorSubtype(normalizedState.sourceDataInfo?.connectorSubtype);
  const jdbcCheckpointField = isApiSource
    ? ''
    : (normalizedState.jdbcCheckpointField ?? '');
  const jdbcIncrementalTimeField = isApiSource
    ? ''
    : (normalizedState.jdbcIncrementalTimeField ?? '');
  const syncStrategyPayload = {
    mode: isKafkaSource
      ? normalizedState.mode || 'KAFKA_CDC'
      : isApiSource
        ? normalizedState.mode || API_SYNC_MODE.API_PUSH
        : isCsvSource
          ? normalizedState.mode || CSV_SYNC_MODE.CSV_IMPORT
          : isIcebergDatabaseSource
            ? normalizedState.mode || 'JDBC_POLLING'
            : normalizedState.mode || 'BINLOG_CDC',
    conflictStrategy:
      isCsvSource && !isCsvIncrementalImportScope(normalizedState.syncScope)
        ? ''
        : normalizedState.conflictStrategy || 'KEEP_SOURCE',
    syncScope: isKafkaSource
      ? normalizedState.syncScope || 'INCREMENTAL'
      : isApiSource
        ? normalizedState.syncScope || 'INCREMENTAL'
        : isCsvSource
          ? normalizedState.syncScope || 'FULL'
          : normalizedState.syncScope || 'FULL_THEN_INCREMENTAL',
    pollFetchSize: isCsvSource ? 500 : normalizedState.pollFetchSize || 500,
    fullSyncBatchSize: isCsvSource
      ? 500
      : normalizedState.fullSyncBatchSize ||
        normalizedState.pollFetchSize ||
        500,
    parallelism:
      isCsvSource || (isApiSource && !isApiPollingMode(normalizedState.mode))
        ? 1
        : normalizedState.parallelism || 1,
    exceptionStrategy:
      isKafkaSource || isApiSource || isCsvSource
        ? normalizedState.exceptionStrategy || 'LOG_ERROR_AND_CONTINUE'
        : normalizedState.exceptionStrategy || 'STOP_ON_ERROR',
    jdbcCheckpointField,
    jdbcIncrementalTimeField,
    jdbcPollingIntervalSeconds: normalizedState.jdbcPollingIntervalSeconds,
    jdbcSyncSqlFull: normalizedState.jdbcSyncSqlFull,
    jdbcSyncSqlIncrement: normalizedState.jdbcSyncSqlIncrement,
    apiIncrementalTimeParam: isApiSource
      ? normalizedState.apiIncrementalTimeParam?.trim() || undefined
      : undefined,
    apiCheckpointParam: isApiSource
      ? normalizedState.apiCheckpointParam?.trim() || undefined
      : undefined,
    apiIncrementalMarkerField: isApiSource
      ? normalizedState.apiIncrementalMarkerField?.trim() || undefined
      : undefined,
    apiPageSizeParam: isApiSource
      ? normalizedState.apiPageSizeParam?.trim() || undefined
      : undefined,
    apiPageNumParam: isApiSource
      ? normalizedState.apiPageNumParam?.trim() || undefined
      : undefined,
    apiTotalCountParam: isApiSource
      ? normalizedState.apiTotalCountParam?.trim() || undefined
      : undefined,
    apiStartPageNum: isApiSource ? normalizedState.apiStartPageNum : undefined
  };
  return {
    ...syncStrategyPayload,
    syncStrategy: syncStrategyPayload,
    sourceDataInfo
  };
}

export function buildObjectTypeFormData({
  values,
  selectedIcon,
  initialOntologyModelID,
  dataSource,
  attributeFields,
  objectTypeAttributes,
  syncSourceDataStrategy,
  syncMappingFields,
  enableSyncSourceData = false,
  isReUpload
}: BuildObjectTypeFormDataParams): ObjectTypeFormData | null {
  if (!dataSource.filePath && dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV) {
    Message.warning('请上传文件');
    return null;
  }

  if (dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE) {
    const selectedCount = dataSource.dataResourceIds?.length || 0;
    if (!dataSource.table && selectedCount === 0) {
      Message.warning('请选择数据资源表');
      return null;
    }
  }

  if (
    dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV &&
    isGraphObjectTypePlaceholderFilePath(dataSource.filePath)
  ) {
    Message.warning('请上传 Schema 文件或使用智能生成模板后再保存');
    return null;
  }

  if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
    const isSqlMode = dataSource.queryMode === 'sql';
    if (!dataSource.connectorId) {
      Message.warning('请选择数据源连接');
      return null;
    }
    if (isSqlMode) {
      if (!String(dataSource.sql ?? '').trim()) {
        Message.warning('请先输入自定义SQL');
        return null;
      }
    } else if (!dataSource.database || !dataSource.table) {
      Message.warning('请选择数据库和表');
      return null;
    }
  }

  if (dataSource.type === DATA_SOURCE_TYPE.MANUAL_CREATION) {
    if (!dataSource.filePath) {
      Message.warning('请先完善对象类型属性');
      return null;
    }
  }

  if (!objectTypeAttributes?.length && attributeFields.length === 0) {
    Message.warning(
      dataSource.type === DATA_SOURCE_TYPE.MANUAL_CREATION
        ? '请先添加对象类型属性'
        : '请先上传文件或选择数据源'
    );
    return null;
  }

  const selectedFields = objectTypeAttributes?.length
    ? objectTypeAttributes.map(objectTypeAttributeToLegacyField)
    : flattenOntologyPhysicalPropertiesForSubmit(attributeFields);
  const sourceDataInfo = dataSourceStateToSqlSourceDataInfo(dataSource);

  return {
    code: values.code,
    name: values.name,
    description: values.description,
    icon:
      selectedIcon || values.icon || OBJECT_TYPE_ICON_OPTIONS[0]?.value || '',
    ontologyModelID: values.ontologyModelID || initialOntologyModelID || 0,
    filePath: dataSource.filePath,
    originalDbName:
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ||
      dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE
        ? dataSource.database || ''
        : '',
    originalTableName:
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ||
      dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE
        ? dataSource.table || ''
        : '',
    sourceType:
      dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ||
      dataSource.type === DATA_SOURCE_TYPE.MANUAL_CREATION
        ? SourceType.FILE_UPLOAD
        : SourceType.ICEBERG,
    ontologyPhysicalPropertiesList: selectedFields,
    objectTypeAttributes,
    sourceDataInfo,
    enableSyncSourceData,
    syncSourceDataStrategy: enableSyncSourceData
      ? syncSourceDataStrategy
      : undefined,
    syncMappingFields: enableSyncSourceData ? syncMappingFields : [],
    isReUpload:
      dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? isReUpload : false,
    _dataSource: dataSource
  };
}

export function buildCreateObjectTypeRequest(
  data: ObjectTypeFormData
): CreateOntologyObjectTypeReq {
  const ontologyPhysicalPropertiesList = buildPhysicalProperties(
    data.objectTypeAttributes,
    data.syncMappingFields,
    data.ontologyPhysicalPropertiesList as AttributeField[],
    data._dataSource
  );

  return {
    code: data.code,
    name: data.name,
    description: data.description,
    icon: data.icon,
    ontologyModelID: data.ontologyModelID,
    filePath: data.filePath,
    originalDbName: data.originalDbName,
    originalTableName: data.originalTableName,
    sourceType: data.sourceType,
    enableSyncSourceData: data.enableSyncSourceData === true,
    sourceDataInfo: toSubmitSourceDataInfo(data.sourceDataInfo),
    syncSourceDataStrategy: buildSyncSourceDataStrategy(
      data.syncSourceDataStrategy
    ),
    ontologyPhysicalPropertiesList,
    embeddingModel: hasVectorizedPhysicalProperties(
      ontologyPhysicalPropertiesList
    )
      ? resolveEmbeddingModelConfig()
      : undefined
  };
}

export function buildUpdateObjectTypeRequest(
  id: number,
  data: ObjectTypeFormData
): UpdateOntologyObjectTypeReq {
  const isLocalCsv =
    data._dataSource?.type === DATA_SOURCE_TYPE.LOCAL_CSV ||
    data.sourceType === SourceType.FILE_UPLOAD;

  return {
    ...buildCreateObjectTypeRequest(data),
    id,
    isReUpload: isLocalCsv ? (data.isReUpload ? 1 : 0) : 0
  };
}
