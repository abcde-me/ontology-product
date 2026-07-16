import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Message } from '@arco-design/web-react';
import { fetchSqlConnectorTableSchema } from '../../../services/ontologySqlConnectorService';
import type { ConnectorAnalyseFinkSqlColumnItem } from '@/types/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import {
  applyMappingKeysToFields,
  buildSyncMappingFieldsFromAttributes,
  finkSqlParsedColumnsToSourceTableFields,
  hasAnySourceMapping,
  isInstanceSyncSourceTypeConfigured,
  objectTypeAttributeToSyncMapping,
  syncLegacySourceFieldsFromPrimaryKey
} from '../../ObjectTypeFormUtils/attributeFields';
import {
  isOntologyApiSuccessResponse,
  normalizeSourceFieldsFromTiDBSchema
} from '../../ObjectTypeFormUtils/sqlConnectorTiDBSchema';
import {
  INSTANCE_SYNC_SOURCE_TYPE,
  InstanceSyncSourceType
} from '@/pages/ontologyScene/common/constants';
import { applyInstanceSyncStrategyDefaults } from '../common/instanceSyncStrategyConfig';
import { fuzzyMatchInstanceSyncByEnglishName } from '../../../services/fuzzyMatchInstanceSyncByEnglishName';
import {
  extractSourceFieldsFromKafkaRule,
  mergeKafkaSourceFields
} from '../../../services/kafkaJsonPathRule/parseResultToSourceFields';
import { smartMatchInstanceSyncColumns } from '../../../services/smartMatchInstanceSyncMapping';
import ApiSyncStrategyFormSection from '../common/ApiSyncStrategyFormSection';
import CsvSyncStrategyFormSection from '../common/CsvSyncStrategyFormSection';
import MessageQueueSyncStrategyFormSection from '../common/MessageQueueSyncStrategyFormSection';
import SyncSourceDataStrategyFormSection, {
  STRATEGY_FORM_FIELD_MAP
} from '../common/SyncSourceDataStrategyFormSection';
import InstanceSyncMappingTable from './InstanceSyncMappingTable';
import InstanceSyncSourceSection from './InstanceSyncSourceSection';
import InstanceSyncSourceTabs from './InstanceSyncSourceTabs';
import {
  buildAddSourceTabPatches,
  buildRemoveSourceTabPatches,
  buildStrategyRestorePatch,
  strategyRestorePatchToFormValues
} from './instanceSyncSourceTabUtils';
import {
  buildMappingSourceLabels,
  clearAllTypeSpecificConfig,
  extractTabFullSnapshot,
  findDuplicateSourceTab,
  resolveMappingSourceTabs
} from './instanceSyncSourceTabModel';

interface InstanceSyncStepProps {
  form: any;
  objectTypeAttributes: ObjectTypeAttributeField[];
  objectTypeName?: string;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  setSyncSourceDataStrategy: React.Dispatch<
    React.SetStateAction<SyncSourceDataStrategyFormState>
  >;
  syncMappingFields: InstanceSyncMappingField[];
  setSyncMappingFields: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  fieldsLoading: boolean;
  setFieldsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  styles: Record<string, string>;
  readOnly?: boolean;
  isDataResource?: boolean;
}

export default function InstanceSyncStep({
  form,
  objectTypeAttributes,
  objectTypeName,
  syncSourceDataStrategy,
  setSyncSourceDataStrategy,
  syncMappingFields,
  setSyncMappingFields,
  fieldsLoading,
  setFieldsLoading,
  styles,
  readOnly = false,
  isDataResource = false
}: InstanceSyncStepProps) {
  const watchedObjectTypeName = Form.useWatch('name', form) as
    | string
    | undefined;
  const resolvedObjectTypeName = objectTypeName || watchedObjectTypeName;
  const currentProjectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [sourceFieldsByTabId, setSourceFieldsByTabId] = useState<
    Record<string, SourceTableField[]>
  >({});
  const [smartMatchLoading, setSmartMatchLoading] = useState(false);
  const [activeSourceTabId, setActiveSourceTabId] = useState<
    string | undefined
  >();
  const loadedSchemaKeyRef = useRef<Record<string, string>>({});
  const loadedKafkaFieldsKeyRef = useRef('');
  const strategySnapshotsRef = useRef<
    Record<string, Partial<SyncSourceDataStrategyFormState>>
  >({});

  const mappingSourceTabs = useMemo(
    () => resolveMappingSourceTabs(syncSourceDataStrategy),
    [
      syncSourceDataStrategy.mappingSourceTabs,
      syncSourceDataStrategy.mappingSourceTypes
    ]
  );
  const mappingSourceLabels = useMemo(
    () => buildMappingSourceLabels(mappingSourceTabs),
    [mappingSourceTabs]
  );

  const activeSourceTab = useMemo(
    () => mappingSourceTabs.find((tab) => tab.id === activeSourceTabId),
    [activeSourceTabId, mappingSourceTabs]
  );

  useEffect(() => {
    if (!mappingSourceTabs.length) {
      setActiveSourceTabId(undefined);
      return;
    }
    if (
      !activeSourceTabId ||
      !mappingSourceTabs.some((tab) => tab.id === activeSourceTabId)
    ) {
      setActiveSourceTabId(mappingSourceTabs[0].id);
    }
  }, [activeSourceTabId, mappingSourceTabs]);

  const primarySourceType =
    activeSourceTab?.sourceType || INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
  const isKafkaSourceType =
    primarySourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE;
  const isApiSourceType =
    primarySourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE;
  const isStreamParseSourceType = isKafkaSourceType || isApiSourceType;
  const isCsvSourceType =
    primarySourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD;
  const isWorkflowSourceType =
    primarySourceType === INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW;

  const sourceConfigured = useMemo(
    () =>
      Boolean(activeSourceTab) &&
      isInstanceSyncSourceTypeConfigured(
        syncSourceDataStrategy,
        primarySourceType,
        { isDataResource }
      ),
    [activeSourceTab, syncSourceDataStrategy, primarySourceType, isDataResource]
  );

  useEffect(() => {
    if (!mappingSourceTabs.length) {
      return;
    }
    const stored = syncSourceDataStrategy.sourceTabConfigSnapshots || {};
    mappingSourceTabs.forEach((tab) => {
      if (stored[tab.id]) {
        strategySnapshotsRef.current[tab.id] = stored[tab.id];
      }
    });
    if (
      mappingSourceTabs.length === 1 &&
      !stored[mappingSourceTabs[0].id] &&
      !Object.keys(strategySnapshotsRef.current).length
    ) {
      const snapshot = extractTabFullSnapshot(syncSourceDataStrategy);
      strategySnapshotsRef.current[mappingSourceTabs[0].id] = snapshot;
    }
  }, [mappingSourceTabs.length]);

  const updateSourceFieldsForTab = (
    tabId: string,
    fields: SourceTableField[]
  ) => {
    setSourceFieldsByTabId((prev) => ({
      ...prev,
      [tabId]: fields
    }));
  };

  const sourceFields = activeSourceTabId
    ? sourceFieldsByTabId[activeSourceTabId] || []
    : [];

  useEffect(() => {
    if (!mappingSourceTabs.length) {
      setSourceFieldsByTabId({});
      loadedSchemaKeyRef.current = {};
    }
  }, [mappingSourceTabs.length]);

  useEffect(() => {
    if (
      !activeSourceTab ||
      activeSourceTab.sourceType !== INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW ||
      !isInstanceSyncSourceTypeConfigured(
        syncSourceDataStrategy,
        INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW,
        { isDataResource }
      )
    ) {
      return;
    }

    const fields = syncSourceDataStrategy.workflowOutputFields || [];
    if (!fields.length || !activeSourceTabId) {
      return;
    }

    const fieldsKey = fields.map((field) => field.fieldId).join('|');
    const loadedKey = loadedSchemaKeyRef.current[activeSourceTabId];
    if (loadedKey === fieldsKey) {
      return;
    }
    loadedSchemaKeyRef.current[activeSourceTabId] = fieldsKey;
    updateSourceFieldsForTab(activeSourceTabId, fields);
  }, [
    activeSourceTab,
    activeSourceTabId,
    syncSourceDataStrategy.workflowOutputFields,
    isDataResource
  ]);

  useEffect(() => {
    setSyncMappingFields((prev) => {
      const existingByPropertyID = new Map(
        prev.map((field) => [field.propertyID, field])
      );
      const tabIds = mappingSourceTabs.map((tab) => tab.id);
      const nextFields = applyMappingKeysToFields(
        buildSyncMappingFieldsFromAttributes(objectTypeAttributes, {
          existingByPropertyID,
          preserveSourceFields: tabIds.length > 0
        }),
        tabIds
      );
      form.setFieldValue('syncMappingFields', nextFields);
      return nextFields;
    });
  }, [form, mappingSourceTabs, objectTypeAttributes, setSyncMappingFields]);

  const updateStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    if (activeSourceTabId && activeSourceTab) {
      const nextStrategy = {
        ...syncSourceDataStrategy,
        ...updates
      };
      const duplicate = findDuplicateSourceTab(
        mappingSourceTabs,
        {
          ...(syncSourceDataStrategy.sourceTabConfigSnapshots || {}),
          ...strategySnapshotsRef.current
        },
        activeSourceTabId,
        nextStrategy
      );
      if (duplicate) {
        Message.warning(
          `不能与「${mappingSourceLabels[duplicate.id]}」选择相同的数据源`
        );
        return;
      }
    }

    setSyncSourceDataStrategy((prev) => {
      const merged = { ...prev, ...updates };
      if (!activeSourceTabId) {
        return merged;
      }
      const snapshot = extractTabFullSnapshot(merged);
      strategySnapshotsRef.current[activeSourceTabId] = snapshot;
      return {
        ...merged,
        sourceTabConfigSnapshots: {
          ...(prev.sourceTabConfigSnapshots || {}),
          [activeSourceTabId]: snapshot
        }
      };
    });
    Object.entries(updates).forEach(([key, value]) => {
      const field =
        STRATEGY_FORM_FIELD_MAP[key as keyof SyncSourceDataStrategyFormState];
      if (field) {
        form.setFieldValue(field, value);
      }
    });
  };

  const clearSyncMappingSourceFieldsForTab = (tabId: string) => {
    loadedSchemaKeyRef.current[tabId] = '';
    setSourceFieldsByTabId((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    setSyncMappingFields((prev) => {
      const next = applyMappingKeysToFields(
        prev,
        mappingSourceTabs.map((tab) => tab.id).filter((id) => id !== tabId),
        [tabId]
      );
      form.setFieldValue('syncMappingFields', next);
      return next;
    });
  };

  const handleSourceChange = (sourceDataInfo: SqlSourceDataInfo) => {
    const next = applyInstanceSyncStrategyDefaults({
      ...syncSourceDataStrategy,
      sourceDataInfo
    });
    updateStrategy(next);
    if (next.mode !== syncSourceDataStrategy.mode) {
      form.setFieldValue('syncMode', next.mode);
    }
    const configured = isInstanceSyncSourceTypeConfigured(
      next,
      INSTANCE_SYNC_SOURCE_TYPE.DATABASE,
      { isDataResource }
    );
    if (
      (!configured || sourceDataInfo.queryMode === 'sql') &&
      activeSourceTabId
    ) {
      clearSyncMappingSourceFieldsForTab(activeSourceTabId);
    }
  };

  const handleWorkflowOutputFieldsReady = (fields: SourceTableField[]) => {
    if (!activeSourceTabId) {
      return;
    }
    updateSourceFieldsForTab(activeSourceTabId, fields);
    if (!readOnly && fields.length) {
      void applyAutoMapping(fields, activeSourceTabId);
    } else if (!fields.length) {
      clearSyncMappingSourceFieldsForTab(activeSourceTabId);
    }
  };

  const handleCsvColumnsParsed = (fields: SourceTableField[]) => {
    if (!activeSourceTabId) {
      return;
    }
    updateSourceFieldsForTab(activeSourceTabId, fields);
    if (!readOnly && fields.length) {
      void applyAutoMapping(fields, activeSourceTabId);
    } else if (!fields.length) {
      clearSyncMappingSourceFieldsForTab(activeSourceTabId);
    }
  };

  const handleKafkaParseFieldsReady = (fields: SourceTableField[]) => {
    if (!fields.length || !activeSourceTabId) {
      return;
    }

    const mergedFields = mergeKafkaSourceFields(
      fields,
      syncSourceDataStrategy.messageQueueParseResultFields || []
    );

    updateSourceFieldsForTab(activeSourceTabId, mergedFields);
    updateStrategy({
      messageQueueParseResultFields: mergedFields
    });

    if (!readOnly) {
      const shouldAutoMap = !syncMappingFields.some((field) =>
        hasAnySourceMapping(field, [activeSourceTabId])
      );
      void applyAutoMapping(mergedFields, activeSourceTabId, {
        preferEnglishNameMatch: true,
        showFeedback: shouldAutoMap
      });
    }
  };

  const resolveKafkaSourceFields = (): SourceTableField[] => {
    const savedFields =
      syncSourceDataStrategy.messageQueueParseResultFields || [];
    const ruleFields = extractSourceFieldsFromKafkaRule(
      syncSourceDataStrategy.messageQueueAiRuleContent
    );
    return mergeKafkaSourceFields(savedFields, ruleFields);
  };

  useEffect(() => {
    if (!isStreamParseSourceType || !sourceConfigured) {
      loadedKafkaFieldsKeyRef.current = '';
      return;
    }

    const fields = resolveKafkaSourceFields();
    if (!fields.length) {
      return;
    }

    const fieldsKey = fields.map((field) => field.fieldId).join('|');
    if (loadedKafkaFieldsKeyRef.current === fieldsKey) {
      return;
    }
    loadedKafkaFieldsKeyRef.current = fieldsKey;
    if (activeSourceTabId) {
      updateSourceFieldsForTab(activeSourceTabId, fields);
    }
  }, [
    activeSourceTabId,
    isStreamParseSourceType,
    sourceConfigured,
    syncSourceDataStrategy.messageQueueAiRuleContent,
    syncSourceDataStrategy.messageQueueParseResultFields
  ]);

  const handleTabsChange = (
    nextTabs: ReturnType<typeof resolveMappingSourceTabs>,
    removedTabIds: string[]
  ) => {
    setSyncMappingFields((prev) => {
      const next = applyMappingKeysToFields(
        prev,
        nextTabs.map((tab) => tab.id),
        removedTabIds
      );
      form.setFieldValue('syncMappingFields', next);
      return next;
    });
    if (removedTabIds.length) {
      setSourceFieldsByTabId((prev) => {
        const next = { ...prev };
        removedTabIds.forEach((tabId) => {
          delete next[tabId];
          delete loadedSchemaKeyRef.current[tabId];
          delete strategySnapshotsRef.current[tabId];
        });
        return next;
      });
      setSyncSourceDataStrategy((prev) => {
        const nextSnapshots = { ...(prev.sourceTabConfigSnapshots || {}) };
        removedTabIds.forEach((tabId) => {
          delete nextSnapshots[tabId];
        });
        return {
          ...prev,
          sourceTabConfigSnapshots: nextSnapshots
        };
      });
    }
    updateStrategy({
      mappingSourceTabs: nextTabs,
      mappingSourceTypes: nextTabs.map((tab) => tab.sourceType)
    });
  };

  const switchActiveSourceTab = (nextTabId: string) => {
    const nextTab = mappingSourceTabs.find((tab) => tab.id === nextTabId);
    if (!nextTab) {
      return;
    }

    if (activeSourceTabId && activeSourceTabId !== nextTabId) {
      const snapshot = extractTabFullSnapshot(syncSourceDataStrategy);
      strategySnapshotsRef.current[activeSourceTabId] = snapshot;
    }

    const restorePatch = {
      ...clearAllTypeSpecificConfig(),
      ...buildStrategyRestorePatch(
        nextTab.sourceType,
        strategySnapshotsRef.current[nextTabId]
      ),
      instanceSyncSourceType: nextTab.sourceType,
      mappingSourceTabs,
      mappingSourceTypes: mappingSourceTabs.map((tab) => tab.sourceType),
      sourceTabConfigSnapshots: {
        ...(syncSourceDataStrategy.sourceTabConfigSnapshots || {}),
        ...(activeSourceTabId
          ? {
              [activeSourceTabId]: extractTabFullSnapshot(
                syncSourceDataStrategy
              )
            }
          : {})
      }
    };
    updateStrategy(restorePatch);
    form.setFieldsValue(strategyRestorePatchToFormValues(restorePatch));
    setActiveSourceTabId(nextTabId);
  };

  const handleAddSourceTab = (sourceType: InstanceSyncSourceType) => {
    if (activeSourceTabId) {
      strategySnapshotsRef.current[activeSourceTabId] = extractTabFullSnapshot(
        syncSourceDataStrategy
      );
    }

    const { newTab, strategyPatch, formPatch } = buildAddSourceTabPatches(
      sourceType,
      mappingSourceTabs
    );
    const nextTabs = [...mappingSourceTabs, newTab];

    updateStrategy({
      ...clearAllTypeSpecificConfig(),
      ...strategyPatch
    });
    form.setFieldsValue(formPatch);
    handleTabsChange(nextTabs, []);
    strategySnapshotsRef.current[newTab.id] = extractTabFullSnapshot({
      ...syncSourceDataStrategy,
      ...clearAllTypeSpecificConfig(),
      ...strategyPatch
    } as SyncSourceDataStrategyFormState);
    setActiveSourceTabId(newTab.id);
  };

  const handleRemoveSourceTab = (tabId: string) => {
    const { strategyPatch, formPatch, nextTabs } = buildRemoveSourceTabPatches(
      tabId,
      mappingSourceTabs
    );

    if (activeSourceTabId === tabId) {
      const nextActive = nextTabs[0];
      if (nextActive) {
        delete strategySnapshotsRef.current[tabId];
        handleTabsChange(nextTabs, [tabId]);
        switchActiveSourceTab(nextActive.id);
        return;
      }
    }

    updateStrategy(strategyPatch);
    form.setFieldsValue(formPatch);
    handleTabsChange(nextTabs, [tabId]);
    delete strategySnapshotsRef.current[tabId];

    if (activeSourceTabId === tabId) {
      setActiveSourceTabId(undefined);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === activeSourceTabId) {
      return;
    }
    switchActiveSourceTab(tabId);
  };

  const applyMappingRelations = (
    fields: SourceTableField[],
    relations: Array<{
      objectTypeColumnName: string;
      sourceTableColumnName: string;
    }>,
    mappingKey: string
  ) => {
    const sourceFieldMap = new Map(
      fields.map((field) => [field.fieldId, field])
    );
    const relationMap = new Map(
      relations.map((relation) => [
        relation.objectTypeColumnName,
        relation.sourceTableColumnName
      ])
    );

    const nextFields = objectTypeAttributes.map((attribute) => {
      const existing = syncMappingFields.find(
        (field) => field.propertyID === attribute.propertyID
      );
      const mappedSourceFieldId = relationMap.get(attribute.propertyID);
      const sourceField = mappedSourceFieldId
        ? sourceFieldMap.get(mappedSourceFieldId)
        : undefined;
      const base = existing || objectTypeAttributeToSyncMapping(attribute);
      const sourceMappings = {
        ...(base.sourceMappings || {}),
        ...(sourceField
          ? {
              [mappingKey]: {
                fieldName: sourceField.fieldId,
                fieldComment: sourceField.fieldComment,
                fieldType: sourceField.fieldType,
                fieldOriginName: sourceField.fieldId
              }
            }
          : {})
      };
      return syncLegacySourceFieldsFromPrimaryKey(
        {
          ...base,
          sourceMappings,
          sourceColumnName: sourceField?.fieldId,
          sourceColumnComment: sourceField?.fieldComment,
          sourceColumnType: sourceField?.fieldType,
          sourceCoumnOriginName: sourceField?.fieldId
        },
        mappingKey
      );
    });
    setSyncMappingFields(nextFields);
    form.setFieldValue('syncMappingFields', nextFields);
  };

  const applyAutoMapping = async (
    fields: SourceTableField[],
    mappingKey: string,
    options?: { showFeedback?: boolean; preferEnglishNameMatch?: boolean }
  ) => {
    if (!objectTypeAttributes.length || !fields.length || !activeSourceTab) {
      return;
    }

    const isStreamSource =
      activeSourceTab.sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ||
      activeSourceTab.sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE;

    setSmartMatchLoading(true);
    try {
      if (options?.preferEnglishNameMatch || isStreamSource) {
        const relations = fuzzyMatchInstanceSyncByEnglishName({
          attributes: objectTypeAttributes,
          sourceFields: fields
        });

        if (!relations.length) {
          if (options?.showFeedback) {
            Message.warning('未能根据英文字段名自动匹配，请手动选择表字段');
          }
          return;
        }

        applyMappingRelations(fields, relations, mappingKey);
        if (options?.showFeedback) {
          Message.success('已根据英文字段名完成自动匹配');
        }
        return;
      }

      const { relations, source } = await smartMatchInstanceSyncColumns({
        attributes: objectTypeAttributes,
        sourceFields: fields
      });

      if (!relations.length) {
        if (options?.showFeedback) {
          Message.warning('未能自动匹配到字段映射，请手动配置');
        }
        return;
      }

      applyMappingRelations(fields, relations, mappingKey);

      if (!options?.showFeedback) {
        return;
      }

      if (source === 'llm') {
        Message.success('已根据字段注释完成智能匹配');
      } else if (source === 'api') {
        Message.success('已根据字段名完成自动匹配');
      }
    } catch (error) {
      console.error('自动匹配字段映射失败:', error);
      if (options?.showFeedback) {
        Message.error(
          error instanceof Error ? error.message : '自动匹配字段映射失败'
        );
      }
    } finally {
      setSmartMatchLoading(false);
    }
  };

  const handleSmartMatch = () => {
    if (!sourceFields.length) {
      Message.warning(
        isStreamParseSourceType
          ? '请先在规则测试中执行解析，或完成规则入库'
          : '请先配置并加载数据源表字段'
      );
      return;
    }
    void applyAutoMapping(sourceFields, activeSourceTabId, {
      showFeedback: true,
      preferEnglishNameMatch: isKafkaSourceType
    });
  };

  const loadTableSchema = async ({
    connectorId,
    databaseName,
    tableName,
    projectID
  }: Required<
    Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
  > & {
    projectID: string;
  }) => {
    if (!activeSourceTabId) {
      return;
    }
    setFieldsLoading(true);
    try {
      const response = await fetchSqlConnectorTableSchema({
        id: connectorId,
        database_name: databaseName,
        table_name: tableName,
        projectID
      });
      if (isOntologyApiSuccessResponse(response)) {
        const fields = normalizeSourceFieldsFromTiDBSchema(response.data);
        updateSourceFieldsForTab(activeSourceTabId, fields);
        if (!readOnly) {
          await applyAutoMapping(fields, activeSourceTabId);
        }
      } else {
        Message.error(response.message || '加载同步源表字段失败');
        updateSourceFieldsForTab(activeSourceTabId, []);
      }
    } catch (error) {
      console.error('加载同步源表字段失败:', error);
      Message.error('加载同步源表字段失败');
      updateSourceFieldsForTab(activeSourceTabId, []);
    } finally {
      setFieldsLoading(false);
    }
  };

  useEffect(() => {
    if (
      !activeSourceTab ||
      activeSourceTab.sourceType !== INSTANCE_SYNC_SOURCE_TYPE.DATABASE ||
      !activeSourceTabId ||
      !isInstanceSyncSourceTypeConfigured(
        syncSourceDataStrategy,
        INSTANCE_SYNC_SOURCE_TYPE.DATABASE,
        { isDataResource }
      )
    ) {
      return;
    }

    const sourceDataInfo = syncSourceDataStrategy.sourceDataInfo;
    const {
      connectorId,
      databaseName,
      tableName,
      queryMode = 'selected'
    } = sourceDataInfo;
    const projectID = sourceDataInfo.projectID || currentProjectID;

    if (
      queryMode !== 'selected' ||
      !connectorId ||
      !databaseName ||
      !tableName ||
      !projectID
    ) {
      return;
    }

    const schemaKey = `${connectorId}/${projectID}/${databaseName}/${tableName}`;
    const loadedKey = loadedSchemaKeyRef.current[activeSourceTabId];
    if (loadedKey === schemaKey) {
      return;
    }

    loadedSchemaKeyRef.current[activeSourceTabId] = schemaKey;
    void loadTableSchema({
      connectorId,
      databaseName,
      tableName,
      projectID
    });
  }, [
    activeSourceTab,
    activeSourceTabId,
    syncSourceDataStrategy.sourceDataInfo.connectorId,
    syncSourceDataStrategy.sourceDataInfo.databaseName,
    currentProjectID,
    syncSourceDataStrategy.sourceDataInfo.projectID,
    syncSourceDataStrategy.sourceDataInfo.queryMode,
    syncSourceDataStrategy.sourceDataInfo.tableName,
    isDataResource
  ]);

  const handleSqlColumnsParsed = (
    columns: ConnectorAnalyseFinkSqlColumnItem[]
  ) => {
    if (!activeSourceTabId) {
      return;
    }
    if (!columns.length) {
      updateSourceFieldsForTab(activeSourceTabId, []);
      return;
    }
    const fields = finkSqlParsedColumnsToSourceTableFields(columns);
    updateSourceFieldsForTab(activeSourceTabId, fields);
    if (!readOnly) {
      void applyAutoMapping(fields, activeSourceTabId);
    }
  };

  return (
    <>
      <Form.Item
        field="syncSourceType"
        hidden
        rules={[
          {
            validator: (_value, callback) => {
              if (!mappingSourceTabs.length) {
                callback('请至少添加一个数据源');
                return;
              }
              callback();
            }
          }
        ]}
      >
        <input type="hidden" />
      </Form.Item>

      <InstanceSyncSourceTabs
        sourceTabs={mappingSourceTabs}
        activeSourceTabId={activeSourceTabId}
        onTabChange={handleTabChange}
        onAddSource={handleAddSourceTab}
        onRemoveSource={handleRemoveSourceTab}
        readOnly={readOnly}
        styles={styles}
      />

      {activeSourceTab && activeSourceTabId ? (
        <>
          <div className={styles['modeling-section']}>
            <div className={styles['modeling-section-title']}>数据源</div>
            <InstanceSyncSourceSection
              form={form}
              sourceType={activeSourceTab.sourceType}
              syncSourceDataStrategy={syncSourceDataStrategy}
              syncMappingFields={syncMappingFields}
              objectTypeAttributes={objectTypeAttributes}
              setSyncMappingFields={setSyncMappingFields}
              onStrategyUpdate={updateStrategy}
              onSourceDataInfoChange={handleSourceChange}
              onTableSelected={loadTableSchema}
              onSqlColumnsParsed={handleSqlColumnsParsed}
              onCsvColumnsParsed={handleCsvColumnsParsed}
              onKafkaParseFieldsReady={handleKafkaParseFieldsReady}
              onWorkflowOutputFieldsReady={handleWorkflowOutputFieldsReady}
              objectTypeName={resolvedObjectTypeName}
              styles={styles}
              readOnly={readOnly}
            />
          </div>

          {!isWorkflowSourceType ? (
            <div className={styles['modeling-section']}>
              <div className={styles['modeling-section-title']}>同步策略</div>
              {isKafkaSourceType ? (
                <MessageQueueSyncStrategyFormSection
                  syncSourceDataStrategy={syncSourceDataStrategy}
                  onStrategyUpdate={updateStrategy}
                  readOnly={readOnly}
                />
              ) : isApiSourceType ? (
                <ApiSyncStrategyFormSection
                  syncSourceDataStrategy={syncSourceDataStrategy}
                  onStrategyUpdate={updateStrategy}
                  readOnly={readOnly}
                />
              ) : isCsvSourceType ? (
                <CsvSyncStrategyFormSection
                  syncSourceDataStrategy={syncSourceDataStrategy}
                  onStrategyUpdate={updateStrategy}
                  readOnly={readOnly}
                />
              ) : (
                <SyncSourceDataStrategyFormSection
                  styles={styles}
                  syncSourceDataStrategy={syncSourceDataStrategy}
                  onStrategyUpdate={updateStrategy}
                  readOnly={readOnly}
                />
              )}
            </div>
          ) : null}

          {!isWorkflowSourceType ? (
            <InstanceSyncMappingTable
              form={form}
              mappingFields={syncMappingFields}
              setMappingFields={setSyncMappingFields}
              mappingSourceKeys={[activeSourceTabId]}
              activeMappingKey={activeSourceTabId}
              mappingSourceLabel={mappingSourceLabels[activeSourceTabId]}
              sourceFieldsByKey={sourceFieldsByTabId}
              sourceConfigured={sourceConfigured}
              loading={fieldsLoading || smartMatchLoading}
              onSmartMatch={readOnly ? undefined : handleSmartMatch}
              smartMatchLoading={smartMatchLoading}
              smartMatchTooltip={
                isStreamParseSourceType
                  ? '根据属性 id 与解析字段英文名进行模糊匹配'
                  : undefined
              }
              sourceUnconfiguredMessage={`请完成${mappingSourceLabels[activeSourceTabId]}的数据源配置`}
              styles={styles}
              readOnly={readOnly}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
