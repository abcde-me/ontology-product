import { LinkType } from '../../../../types/link';
import { SyncSourceDataStrategyFormState } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

export const LINK_TYPE_OPTIONS: LinkType[] = [
  LinkType.ONE_TO_ONE,
  LinkType.ONE_TO_MANY,
  LinkType.MANY_TO_MANY
];

export const LINK_TYPE_DESCRIPTIONS: Record<LinkType, string> = {
  [LinkType.ONE_TO_ONE]: '双方实例严格唯一对应',
  [LinkType.ONE_TO_MANY]: '一方实例关联多个另一方实例',
  [LinkType.MANY_TO_MANY]: '双方实例可任意关联'
};

export const DEFAULT_INTERMEDIATE_TABLE = {
  type: 'local_csv' as const
};

export const DEFAULT_SYNC_SOURCE_DATA_STRATEGY: SyncSourceDataStrategyFormState =
  {
    sourceDataInfo: {
      queryMode: 'selected'
    },
    mode: 'BINLOG_CDC',
    conflictStrategy: 'KEEP_SOURCE',
    syncScope: 'FULL_THEN_INCREMENTAL',
    jdbcPollingIntervalSeconds: 60,
    pollFetchSize: 500,
    parallelism: 1,
    exceptionStrategy: 'STOP_ON_ERROR'
  };
