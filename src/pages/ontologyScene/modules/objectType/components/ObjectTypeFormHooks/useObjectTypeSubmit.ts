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
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import {
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

function toSubmitSourceDataInfo(
  source?: SqlSourceDataInfo
): SourceDataInfo | undefined {
  if (!source?.connectorId) return undefined;
  return {
    connectorId: source.connectorId,
    databaseName: source.databaseName,
    tableName: source.tableName,
    queryMode: source.queryMode || 'selected',
    sql: source.sql
  };
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
    if (!isSqlDirectorySource && dataSource?.table?.trim()) {
      return dataSource.table.trim();
    }
    return '';
  };
  const result = objectTypeAttributes.map((field) => {
    const mapping = syncByPropertyID.get(field.propertyID);
    const sourceColumnName =
      mapping?.sourceColumnName || field.sourceColumnName || field.propertyID;
    const sourceCoumnOriginName =
      mapping?.sourceCoumnOriginName || sourceColumnName;
    const sourceColumnType =
      mapping?.sourceColumnType || field.sourceColumnType;
    return {
      propertyID: field.backendPropertyID || 0,
      propertyName: field.propertyID,
      propertyComment: field.propertyComment,
      propertyType: field.propertyType,
      isPrimary: field.isPrimary,
      isVector: mapping?.isVector ?? (field._vectorizationOn ? 1 : 0),
      publicPropertyID: field.publicPropertyID || 0,
      sourceColumnName,
      sourceColumnComment:
        mapping?.sourceColumnComment ||
        field.sourceColumnComment ||
        field.propertyComment,
      sourceColumnType: sourceColumnType || field.propertyType,
      sourceCoumnOriginName,
      sourceTableName: resolveSourceTableName(field),
      sourcePrimaryKey,
      vectorSourceFieldName:
        (mapping?.isVector ?? (field._vectorizationOn ? 1 : 0)) === 1
          ? field.propertyID
          : ''
    };
  });

  return result;
}

function buildSyncSourceDataStrategy(
  state?: SyncSourceDataStrategyFormState
): SyncSourceDataStrategy | undefined {
  if (!state) return undefined;
  const sourceDataInfo = toSubmitSourceDataInfo(state.sourceDataInfo);
  if (!sourceDataInfo) return undefined;
  const jdbcCheckpointField = state.jdbcCheckpointField ?? '';
  const jdbcIncrementalTimeField = state.jdbcIncrementalTimeField ?? '';
  const syncStrategy = {
    mode: state.mode || 'BINLOG_CDC',
    conflictStrategy: state.conflictStrategy || 'KEEP_SOURCE',
    syncScope: state.syncScope || 'FULL_THEN_INCREMENTAL',
    pollFetchSize: state.pollFetchSize || 500,
    fullSyncBatchSize: state.fullSyncBatchSize || state.pollFetchSize || 500,
    parallelism: state.parallelism || 1,
    exceptionStrategy: state.exceptionStrategy || 'STOP_ON_ERROR',
    jdbcCheckpointField,
    jdbcIncrementalTimeField,
    jdbcPollingIntervalSeconds: state.jdbcPollingIntervalSeconds,
    jdbcSyncSqlFull: state.jdbcSyncSqlFull,
    jdbcSyncSqlIncrement: state.jdbcSyncSqlIncrement
  };
  return {
    ...syncStrategy,
    jdbcCheckpointField,
    jdbcIncrementalTimeField,
    jdbcPollingIntervalSeconds: state.jdbcPollingIntervalSeconds,
    jdbcSyncSqlFull: state.jdbcSyncSqlFull,
    jdbcSyncSqlIncrement: state.jdbcSyncSqlIncrement,
    syncStrategy,
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

  if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
    const isSqlMode = dataSource.queryMode === 'sql';
    if (!dataSource.connectorId) {
      Message.warning('请选择数据源链接');
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

  if (!objectTypeAttributes?.length && attributeFields.length === 0) {
    Message.warning('请先上传文件或选择数据源');
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
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
        ? dataSource.database || ''
        : '',
    originalTableName:
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
        ? dataSource.table || ''
        : '',
    sourceType:
      dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
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
    ontologyPhysicalPropertiesList: buildPhysicalProperties(
      data.objectTypeAttributes,
      data.syncMappingFields,
      data.ontologyPhysicalPropertiesList as AttributeField[],
      data._dataSource
    )
  };
}

export function buildUpdateObjectTypeRequest(
  id: number,
  data: ObjectTypeFormData
): UpdateOntologyObjectTypeReq {
  return {
    ...buildCreateObjectTypeRequest(data),
    id
  };
}
