import type { SourceDataInfo } from '@/pages/ontologyScene/components/CollapsibleSection/types';
import type { GetOntologyLinkTypeRes } from '@/types/links';
import type {
  SourceDataInfo as ApiSourceDataInfo,
  SyncSourceDataStrategy
} from '@/types/objectType';

export type LinkDetailSourceFields = Pick<
  GetOntologyLinkTypeRes,
  | 'sourceType'
  | 'sourceDataInfo'
  | 'linkDBName'
  | 'linkTableName'
  | 'syncSourceDataStrategy'
>;

/**
 * 将链接详情接口数据归一化为 DataSourceInfo（与编辑页回显逻辑一致）
 */
export function normalizeLinkDetailSourceDataInfo(
  data: LinkDetailSourceFields
): SourceDataInfo | undefined {
  if (data.sourceType !== 1) {
    return data.sourceDataInfo;
  }

  const detailSourceDataInfo =
    data.syncSourceDataStrategy?.sourceDataInfo ||
    data.sourceDataInfo ||
    (data.linkDBName || data.linkTableName
      ? {
          databaseName: data.linkDBName,
          tableName: data.linkTableName,
          queryMode: 'selected'
        }
      : undefined);

  if (!detailSourceDataInfo) {
    return undefined;
  }

  const queryMode =
    detailSourceDataInfo.queryMode === 'sql' ? 'sql' : 'selected';

  return {
    ...detailSourceDataInfo,
    databaseName: detailSourceDataInfo.databaseName || data.linkDBName,
    tableName: detailSourceDataInfo.tableName || data.linkTableName,
    queryMode
  };
}

/**
 * 将链接详情接口同步策略归一化为 SyncStrategyInfo 所需结构（与对象类型详情、编辑页一致）
 */
export function normalizeLinkDetailSyncSourceDataStrategy(
  data: LinkDetailSourceFields
): SyncSourceDataStrategy | undefined {
  if (data.sourceType !== 1) {
    return undefined;
  }

  const raw = data.syncSourceDataStrategy;
  if (!raw) {
    return undefined;
  }

  const nested = raw.syncStrategy;
  const sourceDataInfo = normalizeLinkDetailSourceDataInfo(data) as
    | ApiSourceDataInfo
    | undefined;

  return {
    sourceDataInfo,
    mode: raw.mode ?? nested?.mode,
    conflictStrategy: raw.conflictStrategy ?? nested?.conflictStrategy,
    syncScope: raw.syncScope ?? nested?.syncScope,
    pollFetchSize: raw.pollFetchSize ?? nested?.pollFetchSize,
    fullSyncBatchSize: raw.fullSyncBatchSize ?? nested?.fullSyncBatchSize,
    parallelism: raw.parallelism ?? nested?.parallelism,
    exceptionStrategy: raw.exceptionStrategy ?? nested?.exceptionStrategy,
    jdbcCheckpointField: raw.jdbcCheckpointField ?? nested?.jdbcCheckpointField,
    jdbcIncrementalTimeField:
      raw.jdbcIncrementalTimeField ?? nested?.jdbcIncrementalTimeField,
    jdbcPollingIntervalSeconds:
      raw.jdbcPollingIntervalSeconds ?? nested?.jdbcPollingIntervalSeconds,
    jdbcSyncSqlFull: raw.jdbcSyncSqlFull ?? nested?.jdbcSyncSqlFull,
    jdbcSyncSqlIncrement:
      raw.jdbcSyncSqlIncrement ?? nested?.jdbcSyncSqlIncrement
  };
}
