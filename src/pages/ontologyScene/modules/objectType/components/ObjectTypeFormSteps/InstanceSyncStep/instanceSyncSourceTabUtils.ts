import {
  INSTANCE_SYNC_SOURCE_TYPE,
  InstanceSyncSourceType
} from '@/pages/ontologyScene/common/constants';
import { DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT } from '../../../services/extractObjectTypeFileParse';
import {
  getDefaultSyncStrategyPatchForSourceType,
  normalizeApiSyncStrategyFields,
  normalizeCsvSyncStrategyFields,
  normalizeMessageQueueSyncStrategyFields
} from '../common/instanceSyncStrategyConfig';
import { syncStrategyStateToFormValues } from '../common/SyncSourceDataStrategyFormSection';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import type { InstanceSyncSourceTabItem } from '../../ObjectTypeFormUtils/types';
import { createSourceTabId } from './instanceSyncSourceTabModel';

export const STRATEGY_SNAPSHOT_KEYS: (keyof SyncSourceDataStrategyFormState)[] =
  [
    'mode',
    'conflictStrategy',
    'syncScope',
    'pollFetchSize',
    'fullSyncBatchSize',
    'parallelism',
    'exceptionStrategy',
    'jdbcCheckpointField',
    'jdbcIncrementalTimeField',
    'jdbcPollingIntervalSeconds',
    'jdbcSyncSqlFull',
    'jdbcSyncSqlIncrement',
    'apiIncrementalTimeParam',
    'apiCheckpointParam',
    'apiIncrementalMarkerField',
    'apiPageSizeParam',
    'apiPageNumParam',
    'apiTotalCountParam',
    'apiStartPageNum'
  ];

export function extractStrategySnapshot(
  strategy: SyncSourceDataStrategyFormState
): Partial<SyncSourceDataStrategyFormState> {
  const snapshot: Partial<SyncSourceDataStrategyFormState> = {};
  STRATEGY_SNAPSHOT_KEYS.forEach((key) => {
    const value = strategy[key];
    if (value !== undefined) {
      (snapshot as Record<string, unknown>)[key] = value;
    }
  });
  return snapshot;
}

export function getClearedConfigForRemovedSourceType(
  sourceType: InstanceSyncSourceType
): Partial<SyncSourceDataStrategyFormState> {
  switch (sourceType) {
    case INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD:
      return { instanceCsvFilePath: undefined };
    case INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE:
      return {
        messageQueueConnectorId: undefined,
        messageQueueTopic: undefined,
        messageQueueParseMode: undefined,
        messageQueueStructuredParseRule: undefined,
        messageQueueMaxFlattenDepth: undefined,
        messageQueueArrayHandleMode: undefined,
        messageQueueAiRulePrompt: undefined,
        messageQueueAiRuleContent: undefined,
        messageQueueAiRuleSavedAt: undefined,
        messageQueueParseResultFields: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE:
      return {
        apiConnectorId: undefined,
        apiIncrementalTimeParam: undefined,
        apiCheckpointParam: undefined,
        apiIncrementalMarkerField: undefined,
        apiPageSizeParam: undefined,
        apiPageNumParam: undefined,
        apiTotalCountParam: undefined,
        apiStartPageNum: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE:
      return {
        fileResourceId: undefined,
        fileParseRequirement: undefined,
        fileParseResultRows: undefined,
        fileParseResultRunKey: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW:
      return {
        workflowDataTaskId: undefined,
        workflowDataTaskName: undefined,
        workflowProcessId: undefined,
        workflowDataTaskSnapshot: undefined,
        workflowOutputFields: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.DATABASE:
      return { sourceDataInfo: { queryMode: 'selected' } };
    default:
      return {};
  }
}

export function getClearedFormFieldsForRemovedSourceType(
  sourceType: InstanceSyncSourceType
): Record<string, undefined> {
  switch (sourceType) {
    case INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD:
      return { syncInstanceCsvFile: undefined };
    case INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE:
      return {
        syncMessageQueueConnector: undefined,
        syncMessageQueueTopic: undefined,
        syncMessageQueueParseMode: undefined,
        syncMessageQueueStructuredParseRule: undefined,
        syncMessageQueueMaxFlattenDepth: undefined,
        syncMessageQueueArrayHandleMode: undefined,
        syncMessageQueueAiRulePrompt: undefined,
        syncMessageQueueAiRuleContent: undefined,
        syncMessageQueueAiRuleSavedAt: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE:
      return { syncApiConnector: undefined };
    case INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE:
      return {
        syncFileResourceId: undefined,
        syncFileParseRequirement: undefined
      };
    case INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW:
      return { syncWorkflowDataTaskId: undefined };
    case INSTANCE_SYNC_SOURCE_TYPE.DATABASE:
      return {
        syncConnector: undefined,
        syncDatabaseTable: undefined,
        syncSql: undefined,
        syncQueryMode: 'selected'
      };
    default:
      return {};
  }
}

function buildDefaultStrategyPatchForSourceType(
  sourceType: InstanceSyncSourceType
): Partial<SyncSourceDataStrategyFormState> {
  const defaultStrategyPatch =
    getDefaultSyncStrategyPatchForSourceType(sourceType);
  const sourceTypeStrategyPatch =
    sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
      ? normalizeMessageQueueSyncStrategyFields({
          mode: defaultStrategyPatch?.mode,
          syncScope: defaultStrategyPatch?.syncScope,
          exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
        })
      : sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
        ? normalizeApiSyncStrategyFields({
            mode: defaultStrategyPatch?.mode,
            syncScope: defaultStrategyPatch?.syncScope,
            exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
          })
        : sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
          ? normalizeCsvSyncStrategyFields({
              mode: defaultStrategyPatch?.mode,
              syncScope: defaultStrategyPatch?.syncScope,
              exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
            })
          : {};

  return {
    ...(defaultStrategyPatch || {}),
    ...sourceTypeStrategyPatch,
    ...(sourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
      ? { fileParseRequirement: DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT }
      : {})
  };
}

function buildDefaultFormPatchForSourceType(
  sourceType: InstanceSyncSourceType
): Record<string, unknown> {
  const defaultStrategyPatch =
    getDefaultSyncStrategyPatchForSourceType(sourceType);
  const sourceTypeStrategyPatch =
    sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
      ? normalizeMessageQueueSyncStrategyFields({
          mode: defaultStrategyPatch?.mode,
          syncScope: defaultStrategyPatch?.syncScope,
          exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
        })
      : sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
        ? normalizeApiSyncStrategyFields({
            mode: defaultStrategyPatch?.mode,
            syncScope: defaultStrategyPatch?.syncScope,
            exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
          })
        : sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
          ? normalizeCsvSyncStrategyFields({
              mode: defaultStrategyPatch?.mode,
              syncScope: defaultStrategyPatch?.syncScope,
              exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
            })
          : {};

  if (!defaultStrategyPatch) {
    return sourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
      ? { syncFileParseRequirement: DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT }
      : {};
  }

  return {
    syncMode: sourceTypeStrategyPatch.mode ?? defaultStrategyPatch.mode,
    conflictStrategy: defaultStrategyPatch.conflictStrategy,
    syncScope:
      sourceTypeStrategyPatch.syncScope ?? defaultStrategyPatch.syncScope,
    pollFetchSize: defaultStrategyPatch.pollFetchSize,
    parallelism: defaultStrategyPatch.parallelism,
    exceptionStrategy:
      sourceTypeStrategyPatch.exceptionStrategy ??
      defaultStrategyPatch.exceptionStrategy,
    jdbcPollingIntervalSeconds: defaultStrategyPatch.jdbcPollingIntervalSeconds,
    ...(sourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
      ? { syncFileParseRequirement: DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT }
      : {})
  };
}

export function buildAddSourceTabPatches(
  sourceType: InstanceSyncSourceType,
  currentTabs: InstanceSyncSourceTabItem[]
): {
  newTab: InstanceSyncSourceTabItem;
  strategyPatch: Partial<SyncSourceDataStrategyFormState>;
  formPatch: Record<string, unknown>;
} {
  const newTab: InstanceSyncSourceTabItem = {
    id: createSourceTabId(sourceType),
    sourceType
  };
  const nextTabs = [...currentTabs, newTab];
  return {
    newTab,
    strategyPatch: {
      mappingSourceTabs: nextTabs,
      mappingSourceTypes: nextTabs.map((tab) => tab.sourceType),
      instanceSyncSourceType: sourceType,
      ...buildDefaultStrategyPatchForSourceType(sourceType)
    },
    formPatch: {
      syncSourceType: nextTabs.map((tab) => tab.sourceType),
      ...buildDefaultFormPatchForSourceType(sourceType)
    }
  };
}

export function buildRemoveSourceTabPatches(
  tabId: string,
  currentTabs: InstanceSyncSourceTabItem[]
): {
  strategyPatch: Partial<SyncSourceDataStrategyFormState>;
  formPatch: Record<string, unknown>;
  nextTabs: InstanceSyncSourceTabItem[];
  removedTab?: InstanceSyncSourceTabItem;
} {
  const removedTab = currentTabs.find((tab) => tab.id === tabId);
  const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);
  const strategyPatch: Partial<SyncSourceDataStrategyFormState> = {
    mappingSourceTabs: nextTabs,
    mappingSourceTypes: nextTabs.map((tab) => tab.sourceType),
    instanceSyncSourceType: nextTabs[0]?.sourceType
  };
  const formPatch: Record<string, unknown> = {
    syncSourceType: nextTabs.length
      ? nextTabs.map((tab) => tab.sourceType)
      : undefined
  };

  return { strategyPatch, formPatch, nextTabs, removedTab };
}

export function buildAddSourceTypePatches(
  sourceType: InstanceSyncSourceType,
  currentTypes: InstanceSyncSourceType[]
): {
  strategyPatch: Partial<SyncSourceDataStrategyFormState>;
  formPatch: Record<string, unknown>;
} {
  const nextTypes = [...currentTypes, sourceType];
  const strategyPatch: Partial<SyncSourceDataStrategyFormState> = {
    mappingSourceTypes: nextTypes,
    instanceSyncSourceType: sourceType,
    ...buildDefaultStrategyPatchForSourceType(sourceType)
  };
  const formPatch: Record<string, unknown> = {
    syncSourceType: nextTypes,
    ...buildDefaultFormPatchForSourceType(sourceType)
  };

  return { strategyPatch, formPatch };
}

export function buildRemoveSourceTypePatches(
  sourceType: InstanceSyncSourceType,
  currentTypes: InstanceSyncSourceType[]
): {
  strategyPatch: Partial<SyncSourceDataStrategyFormState>;
  formPatch: Record<string, unknown>;
  nextTypes: InstanceSyncSourceType[];
} {
  const nextTypes = currentTypes.filter((type) => type !== sourceType);
  const strategyPatch: Partial<SyncSourceDataStrategyFormState> = {
    mappingSourceTypes: nextTypes,
    instanceSyncSourceType: nextTypes[0],
    ...getClearedConfigForRemovedSourceType(sourceType)
  };
  const formPatch: Record<string, unknown> = {
    syncSourceType: nextTypes.length ? nextTypes : undefined,
    ...getClearedFormFieldsForRemovedSourceType(sourceType)
  };

  return { strategyPatch, formPatch, nextTypes };
}

export function buildStrategyRestorePatch(
  sourceType: InstanceSyncSourceType,
  savedSnapshot?: Partial<SyncSourceDataStrategyFormState>
): Partial<SyncSourceDataStrategyFormState> {
  if (savedSnapshot && Object.keys(savedSnapshot).length) {
    return {
      ...savedSnapshot,
      instanceSyncSourceType: sourceType
    };
  }
  return {
    ...buildDefaultStrategyPatchForSourceType(sourceType),
    instanceSyncSourceType: sourceType
  };
}

export function strategyRestorePatchToFormValues(
  patch: Partial<SyncSourceDataStrategyFormState>
): Record<string, unknown> {
  return syncStrategyStateToFormValues({
    sourceDataInfo: { queryMode: 'selected' },
    mode: '',
    conflictStrategy: '',
    syncScope: '',
    pollFetchSize: 500,
    parallelism: 1,
    exceptionStrategy: '',
    ...patch
  });
}
