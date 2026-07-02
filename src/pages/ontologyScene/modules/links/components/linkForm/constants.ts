import { LinkDirection, LinkType } from '../../../../types/link';
import { LinkType as ApiLinkType } from '@/types/graphApi';
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

export const mapLinkDirectionToFormLinkType = (
  direction: LinkDirection
): LinkType => {
  return direction === LinkDirection.BIDIRECTIONAL
    ? LinkType.ONE_TO_ONE
    : LinkType.ONE_TO_MANY;
};

export const mapFormLinkTypeToLinkDirection = (
  linkType: LinkType
): LinkDirection => {
  if (linkType === LinkType.ONE_TO_ONE || linkType === LinkType.MANY_TO_MANY) {
    return LinkDirection.BIDIRECTIONAL;
  }
  return LinkDirection.UNIDIRECTIONAL;
};

export const mapFormLinkTypeToApi = (formType: LinkType): ApiLinkType => {
  const typeMap: Record<LinkType, ApiLinkType> = {
    [LinkType.ONE_TO_ONE]: ApiLinkType.ONE_TO_ONE,
    [LinkType.ONE_TO_MANY]: ApiLinkType.ONE_TO_MANY,
    [LinkType.MANY_TO_MANY]: ApiLinkType.MANY_TO_MANY
  };
  return typeMap[formType] ?? ApiLinkType.ONE_TO_ONE;
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
    fullSyncBatchSize: 500,
    parallelism: 1,
    exceptionStrategy: 'STOP_ON_ERROR'
  };
