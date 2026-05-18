import type {
  OntologyTestFinkSQLSyncStrategyPayload,
  SourceDataInfo
} from '@/types/objectType';
import type {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from './types';

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
  return {
    mode: state.mode || 'BINLOG_CDC',
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
    fullSyncBatchSize: state.fullSyncBatchSize ?? pollFetchSize,
    ...(sourceDataInfo ? { sourceDataInfo } : {})
  };
}
