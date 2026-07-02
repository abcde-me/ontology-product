import {
  INSTANCE_SYNC_SOURCE_TYPE,
  InstanceSyncSourceType
} from '@/pages/ontologyScene/common/constants';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';

/** Kafka 固定为实时消费模式（无轮询） */
export const MESSAGE_QUEUE_SYNC_MODE = {
  KAFKA_CDC: 'KAFKA_CDC'
} as const;

export type MessageQueueSyncMode =
  (typeof MESSAGE_QUEUE_SYNC_MODE)[keyof typeof MESSAGE_QUEUE_SYNC_MODE];

/** API 同步模式：实时接收 / 定时拉取 */
export const API_SYNC_MODE = {
  API_PUSH: 'API_PUSH',
  API_POLLING: 'API_POLLING'
} as const;

export type ApiSyncMode = (typeof API_SYNC_MODE)[keyof typeof API_SYNC_MODE];

export const API_SYNC_MODE_LABEL: Record<ApiSyncMode, string> = {
  [API_SYNC_MODE.API_PUSH]: '实时接收',
  [API_SYNC_MODE.API_POLLING]: '定时拉取'
};

const KAFKA_SHARED_DEFAULTS = {
  conflictStrategy: 'KEEP_SOURCE',
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1
} as const;

/** Kafka 实时消费默认策略 */
export const DEFAULT_KAFKA_SYNC_STRATEGY: Pick<
  SyncSourceDataStrategyFormState,
  | 'mode'
  | 'conflictStrategy'
  | 'syncScope'
  | 'pollFetchSize'
  | 'fullSyncBatchSize'
  | 'parallelism'
  | 'exceptionStrategy'
> = {
  ...KAFKA_SHARED_DEFAULTS,
  mode: MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC,
  syncScope: 'INCREMENTAL',
  exceptionStrategy: 'LOG_ERROR_AND_CONTINUE'
};

export const DEFAULT_MESSAGE_QUEUE_SYNC_STRATEGY = DEFAULT_KAFKA_SYNC_STRATEGY;

/** Kafka 起始位点选项 */
export const KAFKA_OFFSET_SCOPE_OPTIONS = ['INCREMENTAL', 'FULL'] as const;

/** API 推送：接收方不配置范围，由推送方决定；保留 INCREMENTAL 仅作后端协议默认值 */
export const API_PUSH_SYNC_SCOPE_OPTIONS = ['INCREMENTAL'] as const;

/** API 定时拉取可选同步范围 */
export const API_POLLING_SYNC_SCOPE_OPTIONS = [
  'INCREMENTAL',
  'FULL',
  'FULL_THEN_INCREMENTAL'
] as const;

const API_SHARED_DEFAULTS = {
  conflictStrategy: 'KEEP_SOURCE',
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'LOG_ERROR_AND_CONTINUE'
} as const;

/** API 实时接收默认策略（无请求并行数，由被动接收场景决定） */
export const DEFAULT_API_PUSH_SYNC_STRATEGY: Pick<
  SyncSourceDataStrategyFormState,
  | 'mode'
  | 'conflictStrategy'
  | 'syncScope'
  | 'pollFetchSize'
  | 'fullSyncBatchSize'
  | 'exceptionStrategy'
> = {
  conflictStrategy: API_SHARED_DEFAULTS.conflictStrategy,
  pollFetchSize: API_SHARED_DEFAULTS.pollFetchSize,
  fullSyncBatchSize: API_SHARED_DEFAULTS.fullSyncBatchSize,
  exceptionStrategy: API_SHARED_DEFAULTS.exceptionStrategy,
  mode: API_SYNC_MODE.API_PUSH,
  syncScope: 'INCREMENTAL'
};

/** API 定时拉取默认策略 */
export const DEFAULT_API_POLLING_SYNC_STRATEGY: Pick<
  SyncSourceDataStrategyFormState,
  | 'mode'
  | 'conflictStrategy'
  | 'syncScope'
  | 'pollFetchSize'
  | 'fullSyncBatchSize'
  | 'parallelism'
  | 'exceptionStrategy'
  | 'jdbcPollingIntervalSeconds'
> = {
  ...API_SHARED_DEFAULTS,
  mode: API_SYNC_MODE.API_POLLING,
  syncScope: 'INCREMENTAL',
  jdbcPollingIntervalSeconds: 60
};

export const DEFAULT_API_SYNC_STRATEGY = DEFAULT_API_PUSH_SYNC_STRATEGY;

/** CSV 文件导入固定模式 */
export const CSV_SYNC_MODE = {
  CSV_IMPORT: 'CSV_IMPORT'
} as const;

export type CsvSyncMode = (typeof CSV_SYNC_MODE)[keyof typeof CSV_SYNC_MODE];

/** CSV 可选导入范围 */
export const CSV_IMPORT_SCOPE_OPTIONS = ['FULL', 'INCREMENTAL'] as const;

export const CSV_IMPORT_SCOPE_LABEL: Record<
  (typeof CSV_IMPORT_SCOPE_OPTIONS)[number],
  string
> = {
  FULL: '清空覆盖',
  INCREMENTAL: '增量更新'
};

export function isCsvIncrementalImportScope(syncScope?: string): boolean {
  return syncScope === 'INCREMENTAL';
}

export function resolveCsvImportScopeDisplayLabel(syncScope?: string): string {
  if (!syncScope) {
    return '-';
  }
  if (syncScope in CSV_IMPORT_SCOPE_LABEL) {
    return CSV_IMPORT_SCOPE_LABEL[
      syncScope as (typeof CSV_IMPORT_SCOPE_OPTIONS)[number]
    ];
  }
  return syncScope;
}

const CSV_SHARED_DEFAULTS = {
  exceptionStrategy: 'LOG_ERROR_AND_CONTINUE'
} as const;

/** CSV 上传默认策略（批大小由后端控制，不在前端配置） */
export const DEFAULT_CSV_SYNC_STRATEGY: Pick<
  SyncSourceDataStrategyFormState,
  'mode' | 'syncScope' | 'exceptionStrategy'
> = {
  ...CSV_SHARED_DEFAULTS,
  mode: CSV_SYNC_MODE.CSV_IMPORT,
  syncScope: 'FULL'
};

export function isCsvSyncMode(mode?: string): boolean {
  return mode === CSV_SYNC_MODE.CSV_IMPORT;
}

export function normalizeCsvImportScope(syncScope?: string): string {
  if (
    syncScope &&
    CSV_IMPORT_SCOPE_OPTIONS.includes(
      syncScope as (typeof CSV_IMPORT_SCOPE_OPTIONS)[number]
    )
  ) {
    return syncScope;
  }
  return DEFAULT_CSV_SYNC_STRATEGY.syncScope;
}

export function normalizeCsvSyncStrategyFields(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    'mode' | 'syncScope' | 'exceptionStrategy'
  >
): Partial<SyncSourceDataStrategyFormState> {
  const patches: Partial<SyncSourceDataStrategyFormState> = {};
  const legacyMode =
    strategy.mode === 'BINLOG_CDC' ||
    strategy.mode === 'JDBC_POLLING' ||
    strategy.mode === 'KAFKA_CDC' ||
    strategy.mode === 'KAFKA_POLLING' ||
    strategy.mode === 'API_PUSH' ||
    strategy.mode === 'API_POLLING' ||
    !isCsvSyncMode(strategy.mode);

  if (legacyMode) {
    patches.mode = CSV_SYNC_MODE.CSV_IMPORT;
  }

  const normalizedScope = normalizeCsvImportScope(strategy.syncScope);
  if (normalizedScope !== strategy.syncScope) {
    patches.syncScope = normalizedScope;
  }

  if (legacyMode) {
    patches.exceptionStrategy = DEFAULT_CSV_SYNC_STRATEGY.exceptionStrategy;
  }

  return patches;
}

export function applyCsvSyncStrategyDefaults(
  strategy: SyncSourceDataStrategyFormState
): SyncSourceDataStrategyFormState {
  if (
    strategy.instanceSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
  ) {
    return strategy;
  }

  return {
    sourceDataInfo: strategy.sourceDataInfo || { queryMode: 'selected' },
    instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD,
    ...DEFAULT_CSV_SYNC_STRATEGY,
    ...strategy,
    ...normalizeCsvSyncStrategyFields({
      mode: strategy.mode,
      syncScope: strategy.syncScope,
      exceptionStrategy: strategy.exceptionStrategy
    })
  };
}

export function isKafkaSyncMode(mode?: string): boolean {
  return (
    mode === MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC || mode === 'KAFKA_POLLING' // 历史数据兼容，展示与提交时归一化为 KAFKA_CDC
  );
}

/** @deprecated Kafka 无轮询，恒为 false */
export function isMessageQueuePollingMode(_mode?: string): boolean {
  return false;
}

export function getKafkaOffsetScopeOptions(): readonly string[] {
  return KAFKA_OFFSET_SCOPE_OPTIONS;
}

export function normalizeKafkaOffsetScope(syncScope?: string): string {
  if (
    syncScope &&
    KAFKA_OFFSET_SCOPE_OPTIONS.includes(
      syncScope as (typeof KAFKA_OFFSET_SCOPE_OPTIONS)[number]
    )
  ) {
    return syncScope;
  }
  return DEFAULT_KAFKA_SYNC_STRATEGY.syncScope;
}

/** 将遗留 mode / 范围 / 异常策略校正为 Kafka 实时消费 */
export function normalizeMessageQueueSyncStrategyFields(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    'mode' | 'syncScope' | 'exceptionStrategy'
  >
): Partial<SyncSourceDataStrategyFormState> {
  const patches: Partial<SyncSourceDataStrategyFormState> = {};
  const legacyMode =
    strategy.mode === 'BINLOG_CDC' ||
    strategy.mode === 'JDBC_POLLING' ||
    strategy.mode === 'KAFKA_POLLING' ||
    !isKafkaSyncMode(strategy.mode);

  if (legacyMode) {
    patches.mode = MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC;
  }

  const normalizedScope = normalizeKafkaOffsetScope(strategy.syncScope);
  if (normalizedScope !== strategy.syncScope) {
    patches.syncScope = normalizedScope;
  }

  if (legacyMode) {
    patches.exceptionStrategy = DEFAULT_KAFKA_SYNC_STRATEGY.exceptionStrategy;
  }

  return patches;
}

export function applyMessageQueueSyncStrategyDefaults(
  strategy: SyncSourceDataStrategyFormState
): SyncSourceDataStrategyFormState {
  if (
    strategy.instanceSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
  ) {
    return strategy;
  }

  return {
    sourceDataInfo: strategy.sourceDataInfo || { queryMode: 'selected' },
    instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE,
    ...DEFAULT_MESSAGE_QUEUE_SYNC_STRATEGY,
    ...strategy,
    ...normalizeMessageQueueSyncStrategyFields({
      mode: strategy.mode,
      syncScope: strategy.syncScope,
      exceptionStrategy: strategy.exceptionStrategy
    })
  };
}

export function isApiPollingMode(mode?: string): boolean {
  return mode === API_SYNC_MODE.API_POLLING;
}

/** 定时拉取下需配置增量参数的范围（非全量） */
export function isApiPollingIncrementalScope(syncScope?: string): boolean {
  return syncScope === 'INCREMENTAL' || syncScope === 'FULL_THEN_INCREMENTAL';
}

export function isApiSyncMode(mode?: string): boolean {
  return mode === API_SYNC_MODE.API_PUSH || mode === API_SYNC_MODE.API_POLLING;
}

export function getDefaultApiSyncStrategyForMode(
  mode: ApiSyncMode
):
  | typeof DEFAULT_API_PUSH_SYNC_STRATEGY
  | typeof DEFAULT_API_POLLING_SYNC_STRATEGY {
  return mode === API_SYNC_MODE.API_POLLING
    ? DEFAULT_API_POLLING_SYNC_STRATEGY
    : DEFAULT_API_PUSH_SYNC_STRATEGY;
}

export function normalizeApiSyncScopeForMode(
  mode: string | undefined,
  syncScope?: string
): string {
  const options = isApiPollingMode(mode)
    ? API_POLLING_SYNC_SCOPE_OPTIONS
    : API_PUSH_SYNC_SCOPE_OPTIONS;
  if (syncScope && options.includes(syncScope as (typeof options)[number])) {
    return syncScope;
  }
  return getDefaultApiSyncStrategyForMode(
    mode === API_SYNC_MODE.API_POLLING
      ? API_SYNC_MODE.API_POLLING
      : API_SYNC_MODE.API_PUSH
  ).syncScope;
}

export function normalizeApiSyncStrategyFields(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    'mode' | 'syncScope' | 'exceptionStrategy'
  >
): Partial<SyncSourceDataStrategyFormState> {
  const patches: Partial<SyncSourceDataStrategyFormState> = {};
  const legacyMode =
    strategy.mode === 'BINLOG_CDC' ||
    strategy.mode === 'JDBC_POLLING' ||
    strategy.mode === 'KAFKA_CDC' ||
    strategy.mode === 'KAFKA_POLLING' ||
    !isApiSyncMode(strategy.mode);

  let mode = strategy.mode;
  if (legacyMode) {
    mode =
      strategy.mode === 'JDBC_POLLING'
        ? API_SYNC_MODE.API_POLLING
        : API_SYNC_MODE.API_PUSH;
    patches.mode = mode;
  }

  const normalizedScope = normalizeApiSyncScopeForMode(
    mode,
    strategy.syncScope
  );
  if (normalizedScope !== strategy.syncScope) {
    patches.syncScope = normalizedScope;
  }

  if (legacyMode) {
    patches.exceptionStrategy = getDefaultApiSyncStrategyForMode(
      mode as ApiSyncMode
    ).exceptionStrategy;
  }

  return patches;
}

export function applyApiSyncStrategyDefaults(
  strategy: SyncSourceDataStrategyFormState
): SyncSourceDataStrategyFormState {
  if (
    strategy.instanceSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
  ) {
    return strategy;
  }

  return {
    sourceDataInfo: strategy.sourceDataInfo || { queryMode: 'selected' },
    instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE,
    ...DEFAULT_API_SYNC_STRATEGY,
    ...strategy,
    ...normalizeApiSyncStrategyFields({
      mode: strategy.mode,
      syncScope: strategy.syncScope,
      exceptionStrategy: strategy.exceptionStrategy
    })
  };
}

export function applyInstanceSyncStrategyDefaults(
  strategy: SyncSourceDataStrategyFormState
): SyncSourceDataStrategyFormState {
  return applyCsvSyncStrategyDefaults(
    applyApiSyncStrategyDefaults(
      applyMessageQueueSyncStrategyDefaults(strategy)
    )
  );
}

export function getDefaultSyncStrategyPatchForSourceType(
  sourceType: InstanceSyncSourceType
): Partial<SyncSourceDataStrategyFormState> | undefined {
  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE) {
    return DEFAULT_MESSAGE_QUEUE_SYNC_STRATEGY;
  }
  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE) {
    return DEFAULT_API_SYNC_STRATEGY;
  }
  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD) {
    return DEFAULT_CSV_SYNC_STRATEGY;
  }
  return undefined;
}

export function resolveSyncModeLabel(mode?: string): string {
  if (!mode) {
    return '-';
  }
  if (isKafkaSyncMode(mode)) {
    return '实时消费';
  }
  if (mode in API_SYNC_MODE_LABEL) {
    return API_SYNC_MODE_LABEL[mode as ApiSyncMode];
  }
  if (isCsvSyncMode(mode)) {
    return '文件导入';
  }
  if (mode === 'BINLOG_CDC') {
    return 'CDC';
  }
  if (mode === 'JDBC_POLLING') {
    return '轮询';
  }
  return mode;
}

/** @deprecated 使用 isKafkaSyncMode */
export function isValidKafkaSyncMode(mode?: string): boolean {
  return isKafkaSyncMode(mode);
}

/** @deprecated Kafka 无多模式切换 */
export function getDefaultKafkaSyncStrategyForMode(
  _mode?: MessageQueueSyncMode
): typeof DEFAULT_KAFKA_SYNC_STRATEGY {
  return DEFAULT_KAFKA_SYNC_STRATEGY;
}

/** @deprecated 使用 normalizeKafkaOffsetScope */
export function normalizeKafkaSyncScopeForMode(
  _mode: string | undefined,
  syncScope?: string
): string {
  return normalizeKafkaOffsetScope(syncScope);
}

/** @deprecated 使用 getKafkaOffsetScopeOptions */
export function getKafkaSyncScopeOptions(_mode?: string): readonly string[] {
  return KAFKA_OFFSET_SCOPE_OPTIONS;
}

export const MESSAGE_QUEUE_SYNC_MODE_LABEL = {
  [MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC]: '实时消费'
} as const;

export const KAFKA_CDC_SYNC_SCOPE_OPTIONS = KAFKA_OFFSET_SCOPE_OPTIONS;
