import type {
  OntologyTestFinkSQLSyncStrategyPayload,
  SourceDataInfo
} from '@/types/objectType';
import type {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from './types';
import { isIcebergConnectorSubtype } from '../ObjectTypeFormSteps/common/instanceSyncStrategyConfig';

export function sqlSourceDataInfoToSourceDataInfoForTest(
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

export function syncFormStateToOntologyTestSyncStrategy(
  state: SyncSourceDataStrategyFormState,
  sourceDataInfo?: SourceDataInfo
): OntologyTestFinkSQLSyncStrategyPayload {
  const pollFetchSize = state.pollFetchSize || 500;
  const isIcebergSource = isIcebergConnectorSubtype(
    state.sourceDataInfo?.connectorSubtype
  );
  return {
    mode: state.mode || (isIcebergSource ? 'JDBC_POLLING' : 'BINLOG_CDC'),
    conflictStrategy: state.conflictStrategy || 'KEEP_SOURCE',
    syncScope: state.syncScope || 'FULL_THEN_INCREMENTAL',
    pollFetchSize,
    parallelism: state.parallelism ?? 1,
    exceptionStrategy: state.exceptionStrategy || 'STOP_ON_ERROR',
    jdbcCheckpointField: state.jdbcCheckpointField ?? '',
    jdbcIncrementalTimeField: state.jdbcIncrementalTimeField ?? '',
    jdbcPollingIntervalSeconds: state.jdbcPollingIntervalSeconds,
    jdbcSyncSqlFull: state.jdbcSyncSqlFull,
    jdbcSyncSqlIncrement: state.jdbcSyncSqlIncrement,
    apiIncrementalTimeParam: state.apiIncrementalTimeParam,
    apiCheckpointParam: state.apiCheckpointParam,
    apiIncrementalMarkerField: state.apiIncrementalMarkerField,
    apiPageSizeParam: state.apiPageSizeParam,
    apiPageNumParam: state.apiPageNumParam,
    apiTotalCountParam: state.apiTotalCountParam,
    apiStartPageNum: state.apiStartPageNum,
    fullSyncBatchSize: state.fullSyncBatchSize ?? pollFetchSize,
    ...(sourceDataInfo ? { sourceDataInfo } : {})
  };
}
