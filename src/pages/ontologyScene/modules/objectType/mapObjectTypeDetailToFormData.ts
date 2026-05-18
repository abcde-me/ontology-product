import { DATA_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import { ObjectTypeFormData } from './components/ObjectTypeFormUtils/types';
import { GetOntologyObjectTypeDetailRes, SourceType } from '@/types/objectType';

const DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT = {
  mode: 'BINLOG_CDC',
  conflictStrategy: 'KEEP_SOURCE',
  syncScope: 'FULL_THEN_INCREMENTAL',
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'STOP_ON_ERROR',
  jdbcPollingIntervalSeconds: 60
};

/**
 * GetOntologyObjectType 接口数据 → ObjectTypeForm initialValues（编辑页与分步刷新复用）
 */
export function mapObjectTypeDetailToFormData(
  objectType: GetOntologyObjectTypeDetailRes
): Partial<ObjectTypeFormData> {
  const dataSourceType =
    objectType.sourceType === SourceType.FILE_UPLOAD
      ? DATA_SOURCE_TYPE.LOCAL_CSV
      : DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC;

  const syncFromApi = objectType.syncSourceDataStrategy;
  const nestedStrategy = syncFromApi?.syncStrategy;

  return {
    code: objectType.code || '',
    name: objectType.name || '',
    description: objectType.description,
    icon: objectType.icon || '',
    ontologyModelID: objectType.ontologyModelID || 0,
    filePath: objectType.filePath,
    originalDbName: objectType.originalDbName || '',
    originalTableName: objectType.originalTableName || '',
    sourceType: objectType.sourceType,
    ontologyPhysicalPropertiesList:
      objectType.ontologyPhysicalPropertiesList || [],
    sourceDataInfo: objectType.sourceDataInfo
      ? {
          connectorId: objectType.sourceDataInfo.connectorId,
          databaseName: objectType.sourceDataInfo.databaseName,
          tableName: objectType.sourceDataInfo.tableName,
          queryMode:
            objectType.sourceDataInfo.queryMode === 'sql' ? 'sql' : 'selected',
          sql: objectType.sourceDataInfo.sql
        }
      : undefined,
    enableSyncSourceData: objectType.enableSyncSourceData,
    syncSourceDataStrategy: syncFromApi
      ? {
          sourceDataInfo: {
            connectorId: syncFromApi.sourceDataInfo?.connectorId,
            databaseName: syncFromApi.sourceDataInfo?.databaseName,
            tableName: syncFromApi.sourceDataInfo?.tableName,
            queryMode:
              syncFromApi.sourceDataInfo?.queryMode === 'sql'
                ? 'sql'
                : 'selected',
            sql: syncFromApi.sourceDataInfo?.sql
          },
          mode:
            syncFromApi.mode ||
            nestedStrategy?.mode ||
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.mode ||
            '',
          conflictStrategy:
            syncFromApi.conflictStrategy ||
            nestedStrategy?.conflictStrategy ||
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.conflictStrategy ||
            '',
          syncScope:
            syncFromApi.syncScope ||
            nestedStrategy?.syncScope ||
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.syncScope ||
            '',
          pollFetchSize:
            syncFromApi.pollFetchSize ??
            nestedStrategy?.pollFetchSize ??
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.pollFetchSize ??
            0,
          fullSyncBatchSize:
            syncFromApi.fullSyncBatchSize ??
            nestedStrategy?.fullSyncBatchSize ??
            syncFromApi.pollFetchSize ??
            nestedStrategy?.pollFetchSize ??
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.fullSyncBatchSize,
          parallelism:
            syncFromApi.parallelism ??
            nestedStrategy?.parallelism ??
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.parallelism ??
            1,
          exceptionStrategy:
            syncFromApi.exceptionStrategy ||
            nestedStrategy?.exceptionStrategy ||
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.exceptionStrategy ||
            '',
          jdbcCheckpointField:
            syncFromApi.jdbcCheckpointField ??
            nestedStrategy?.jdbcCheckpointField,
          jdbcIncrementalTimeField:
            syncFromApi.jdbcIncrementalTimeField ??
            nestedStrategy?.jdbcIncrementalTimeField,
          jdbcPollingIntervalSeconds:
            syncFromApi.jdbcPollingIntervalSeconds ??
            nestedStrategy?.jdbcPollingIntervalSeconds ??
            DEFAULT_SYNC_SOURCE_DATA_STRATEGY_EDIT.jdbcPollingIntervalSeconds,
          jdbcSyncSqlFull:
            syncFromApi.jdbcSyncSqlFull ?? nestedStrategy?.jdbcSyncSqlFull,
          jdbcSyncSqlIncrement:
            syncFromApi.jdbcSyncSqlIncrement ??
            nestedStrategy?.jdbcSyncSqlIncrement
        }
      : undefined,
    _dataSource: {
      type: dataSourceType,
      connectorId: objectType.sourceDataInfo?.connectorId,
      database:
        dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? objectType.sourceDataInfo?.databaseName || objectType.originalDbName
          : undefined,
      table:
        dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? objectType.sourceDataInfo?.tableName || objectType.originalTableName
          : undefined,
      queryMode:
        objectType.sourceDataInfo?.queryMode === 'sql' ? 'sql' : 'selected',
      sql: objectType.sourceDataInfo?.sql
    }
  };
}
