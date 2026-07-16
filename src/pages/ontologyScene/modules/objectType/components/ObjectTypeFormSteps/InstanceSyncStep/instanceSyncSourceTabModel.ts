import {
  INSTANCE_SYNC_SOURCE_TYPE,
  INSTANCE_SYNC_SOURCE_TYPE_LABEL,
  InstanceSyncSourceType
} from '@/pages/ontologyScene/common/constants';
import {
  InstanceSyncSourceTabItem,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import {
  extractStrategySnapshot,
  getClearedConfigForRemovedSourceType
} from './instanceSyncSourceTabUtils';

export function createSourceTabId(sourceType: InstanceSyncSourceType): string {
  return `${sourceType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function resolveMappingSourceTabs(
  strategy?: Pick<
    SyncSourceDataStrategyFormState,
    'mappingSourceTabs' | 'mappingSourceTypes'
  >
): InstanceSyncSourceTabItem[] {
  if (strategy?.mappingSourceTabs?.length) {
    return strategy.mappingSourceTabs;
  }

  const legacyTypes = strategy?.mappingSourceTypes || [];
  return legacyTypes.map((sourceType, index) => ({
    id: `${sourceType}_legacy_${index}`,
    sourceType
  }));
}

export function getSourceTabLabel(
  tab: InstanceSyncSourceTabItem,
  tabs: InstanceSyncSourceTabItem[]
): string {
  const sameTypeTabs = tabs.filter(
    (item) => item.sourceType === tab.sourceType
  );
  const baseLabel = INSTANCE_SYNC_SOURCE_TYPE_LABEL[tab.sourceType];
  if (sameTypeTabs.length <= 1) {
    return baseLabel;
  }
  const order = sameTypeTabs.findIndex((item) => item.id === tab.id) + 1;
  return `${baseLabel} ${order}`;
}

export function buildMappingSourceLabels(
  tabs: InstanceSyncSourceTabItem[]
): Record<string, string> {
  return Object.fromEntries(
    tabs.map((tab) => [tab.id, getSourceTabLabel(tab, tabs)])
  );
}

const TYPE_SPECIFIC_SNAPSHOT_KEYS: (keyof SyncSourceDataStrategyFormState)[] = [
  'instanceCsvFilePath',
  'messageQueueConnectorId',
  'messageQueueTopic',
  'messageQueueParseMode',
  'messageQueueStructuredParseRule',
  'messageQueueMaxFlattenDepth',
  'messageQueueArrayHandleMode',
  'messageQueueAiRulePrompt',
  'messageQueueAiRuleContent',
  'messageQueueAiRuleSavedAt',
  'messageQueueParseResultFields',
  'apiConnectorId',
  'fileResourceId',
  'fileParseRequirement',
  'fileParseResultRows',
  'fileParseResultRunKey',
  'workflowDataTaskId',
  'workflowDataTaskName',
  'workflowProcessId',
  'workflowDataTaskSnapshot',
  'workflowOutputFields',
  'sourceDataInfo'
];

export function extractTabFullSnapshot(
  strategy: SyncSourceDataStrategyFormState
): Partial<SyncSourceDataStrategyFormState> {
  const snapshot: Partial<SyncSourceDataStrategyFormState> = {
    ...extractStrategySnapshot(strategy)
  };

  TYPE_SPECIFIC_SNAPSHOT_KEYS.forEach((key) => {
    const value = strategy[key];
    if (value !== undefined) {
      (snapshot as Record<string, unknown>)[key] = value;
    }
  });

  return snapshot;
}

export function clearAllTypeSpecificConfig(): Partial<SyncSourceDataStrategyFormState> {
  const allTypes = Object.values(INSTANCE_SYNC_SOURCE_TYPE);
  return allTypes.reduce<Partial<SyncSourceDataStrategyFormState>>(
    (acc, sourceType) => ({
      ...acc,
      ...getClearedConfigForRemovedSourceType(sourceType)
    }),
    {}
  );
}

export function getSourceTabIdentity(
  sourceType: InstanceSyncSourceType,
  config: Partial<SyncSourceDataStrategyFormState>
): string | null {
  switch (sourceType) {
    case INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE:
      return config.apiConnectorId ? `api:${config.apiConnectorId}` : null;
    case INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE: {
      const topic = config.messageQueueTopic?.trim();
      return config.messageQueueConnectorId && topic
        ? `kafka:${config.messageQueueConnectorId}:${topic}`
        : null;
    }
    case INSTANCE_SYNC_SOURCE_TYPE.DATABASE: {
      const source = config.sourceDataInfo;
      if (!source) {
        return null;
      }
      if (source.queryMode === 'sql') {
        const sql = source.sql?.trim();
        return sql ? `db:sql:${source.connectorId ?? 'none'}:${sql}` : null;
      }
      const db = source.databaseName?.trim();
      const table = source.tableName?.trim();
      return source.connectorId && db && table
        ? `db:${source.connectorId}:${db}:${table}`
        : null;
    }
    case INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD: {
      const path = config.instanceCsvFilePath?.trim();
      return path ? `csv:${path}` : null;
    }
    case INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW: {
      const taskId = config.workflowDataTaskId?.trim();
      return taskId ? `wf:${taskId}` : null;
    }
    case INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE: {
      const fileId = config.fileResourceId?.trim();
      return fileId ? `file:${fileId}` : null;
    }
    default:
      return null;
  }
}

export function findDuplicateSourceTab(
  tabs: InstanceSyncSourceTabItem[],
  snapshots: Record<string, Partial<SyncSourceDataStrategyFormState>>,
  currentTabId: string,
  currentConfig: Partial<SyncSourceDataStrategyFormState>
): InstanceSyncSourceTabItem | undefined {
  const currentTab = tabs.find((tab) => tab.id === currentTabId);
  if (!currentTab) {
    return undefined;
  }

  const currentIdentity = getSourceTabIdentity(currentTab.sourceType, {
    ...snapshots[currentTabId],
    ...currentConfig
  });
  if (!currentIdentity) {
    return undefined;
  }

  return tabs.find((tab) => {
    if (tab.id === currentTabId) {
      return false;
    }
    const identity = getSourceTabIdentity(
      tab.sourceType,
      snapshots[tab.id] || {}
    );
    return identity === currentIdentity;
  });
}

export function resolveTabConfigForValidation(
  strategy: SyncSourceDataStrategyFormState,
  tab: InstanceSyncSourceTabItem
): SyncSourceDataStrategyFormState {
  const snapshot = strategy.sourceTabConfigSnapshots?.[tab.id];
  if (!snapshot) {
    return strategy;
  }
  return {
    ...strategy,
    ...clearAllTypeSpecificConfig(),
    ...snapshot
  };
}

export const INSTANCE_SYNC_TAB_TYPE_CLASS: Record<
  InstanceSyncSourceType,
  string
> = {
  [INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD]: 'instance-sync-tab--csv',
  [INSTANCE_SYNC_SOURCE_TYPE.DATABASE]: 'instance-sync-tab--database',
  [INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE]: 'instance-sync-tab--kafka',
  [INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE]: 'instance-sync-tab--api',
  [INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE]: 'instance-sync-tab--file-parse',
  [INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW]: 'instance-sync-tab--workflow'
};
