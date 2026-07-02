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
  buildSyncMappingFieldsFromAttributes,
  finkSqlParsedColumnsToSourceTableFields,
  isInstanceSyncSourceConfigured,
  objectTypeAttributeToSyncMapping
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
  const [sourceFields, setSourceFields] = useState<SourceTableField[]>([]);
  const [smartMatchLoading, setSmartMatchLoading] = useState(false);
  const loadedSchemaKeyRef = useRef('');
  const loadedKafkaFieldsKeyRef = useRef('');
  const sourceConfigured = useMemo(
    () =>
      isInstanceSyncSourceConfigured(syncSourceDataStrategy, {
        isDataResource
      }),
    [syncSourceDataStrategy, isDataResource]
  );

  const watchedSyncSourceType = Form.useWatch('syncSourceType', form) as
    | InstanceSyncSourceType
    | undefined;
  const syncSourceType =
    syncSourceDataStrategy.instanceSyncSourceType ||
    watchedSyncSourceType ||
    INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
  const isDatabaseSourceType =
    syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
  const isKafkaSourceType =
    syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE;
  const isApiSourceType =
    syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE;
  const isStreamParseSourceType = isKafkaSourceType || isApiSourceType;
  const isCsvSourceType =
    syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD;

  useEffect(() => {
    if (
      watchedSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ||
      syncSourceDataStrategy.instanceSyncSourceType ===
        INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
    ) {
      return;
    }
    setSyncSourceDataStrategy((prev) =>
      applyInstanceSyncStrategyDefaults({
        ...prev,
        instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
      })
    );
  }, [
    watchedSyncSourceType,
    syncSourceDataStrategy.instanceSyncSourceType,
    setSyncSourceDataStrategy
  ]);

  useEffect(() => {
    if (
      watchedSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE ||
      syncSourceDataStrategy.instanceSyncSourceType ===
        INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
    ) {
      return;
    }
    setSyncSourceDataStrategy((prev) =>
      applyInstanceSyncStrategyDefaults({
        ...prev,
        instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
      })
    );
  }, [
    watchedSyncSourceType,
    syncSourceDataStrategy.instanceSyncSourceType,
    setSyncSourceDataStrategy
  ]);

  useEffect(() => {
    if (
      watchedSyncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD ||
      syncSourceDataStrategy.instanceSyncSourceType ===
        INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
    ) {
      return;
    }
    setSyncSourceDataStrategy((prev) =>
      applyInstanceSyncStrategyDefaults({
        ...prev,
        instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
      })
    );
  }, [
    watchedSyncSourceType,
    syncSourceDataStrategy.instanceSyncSourceType,
    setSyncSourceDataStrategy
  ]);

  useEffect(() => {
    if (!sourceConfigured) {
      setSourceFields([]);
      loadedSchemaKeyRef.current = '';
    }
  }, [sourceConfigured]);

  useEffect(() => {
    setSyncMappingFields((prev) => {
      const existingByPropertyID = new Map(
        prev.map((field) => [field.propertyID, field])
      );
      const nextFields = buildSyncMappingFieldsFromAttributes(
        objectTypeAttributes,
        {
          existingByPropertyID,
          preserveSourceFields: sourceConfigured
        }
      );
      form.setFieldValue('syncMappingFields', nextFields);
      return nextFields;
    });
  }, [objectTypeAttributes, sourceConfigured, form, setSyncMappingFields]);

  const updateStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      ...updates
    }));
    Object.entries(updates).forEach(([key, value]) => {
      const field =
        STRATEGY_FORM_FIELD_MAP[key as keyof SyncSourceDataStrategyFormState];
      if (field) {
        form.setFieldValue(field, value);
      }
    });
  };

  const clearSyncMappingSourceFields = () => {
    loadedSchemaKeyRef.current = '';
    setSourceFields([]);
    const cleared = buildSyncMappingFieldsFromAttributes(objectTypeAttributes, {
      preserveSourceFields: false
    });
    setSyncMappingFields(cleared);
    form.setFieldValue('syncMappingFields', cleared);
  };

  const handleSourceChange = (sourceDataInfo: SqlSourceDataInfo) => {
    const next = {
      ...syncSourceDataStrategy,
      sourceDataInfo
    };
    setSyncSourceDataStrategy(next);
    const configured = isInstanceSyncSourceConfigured(next, { isDataResource });
    if (!configured || sourceDataInfo.queryMode === 'sql') {
      clearSyncMappingSourceFields();
    }
  };

  const handleSourceTypeChange = () => {
    clearSyncMappingSourceFields();
  };

  const handleCsvColumnsParsed = (fields: SourceTableField[]) => {
    setSourceFields(fields);
    if (!readOnly && fields.length) {
      void applyAutoMapping(fields);
    } else if (!fields.length) {
      clearSyncMappingSourceFields();
    }
  };

  const handleKafkaParseFieldsReady = (fields: SourceTableField[]) => {
    if (!fields.length) {
      return;
    }

    const mergedFields = mergeKafkaSourceFields(
      fields,
      syncSourceDataStrategy.messageQueueParseResultFields || []
    );

    setSourceFields(mergedFields);
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      messageQueueParseResultFields: mergedFields
    }));

    if (!readOnly) {
      const shouldAutoMap = !syncMappingFields.some(
        (field) => field.sourceColumnName
      );
      void applyAutoMapping(mergedFields, {
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
    setSourceFields(fields);
  }, [
    isStreamParseSourceType,
    sourceConfigured,
    syncSourceDataStrategy.messageQueueAiRuleContent,
    syncSourceDataStrategy.messageQueueParseResultFields
  ]);

  const applyMappingRelations = (
    fields: SourceTableField[],
    relations: Array<{
      objectTypeColumnName: string;
      sourceTableColumnName: string;
    }>
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
      const mappedSourceFieldId = relationMap.get(attribute.propertyID);
      const sourceField = mappedSourceFieldId
        ? sourceFieldMap.get(mappedSourceFieldId)
        : undefined;
      return {
        ...objectTypeAttributeToSyncMapping(attribute),
        sourceColumnName: sourceField?.fieldId,
        sourceColumnComment: sourceField?.fieldComment,
        sourceColumnType: sourceField?.fieldType,
        sourceCoumnOriginName: sourceField?.fieldId
      };
    });
    setSyncMappingFields(nextFields);
    form.setFieldValue('syncMappingFields', nextFields);
  };

  const applyAutoMapping = async (
    fields: SourceTableField[],
    options?: { showFeedback?: boolean; preferEnglishNameMatch?: boolean }
  ) => {
    if (!objectTypeAttributes.length || !fields.length) {
      return;
    }

    setSmartMatchLoading(true);
    try {
      if (options?.preferEnglishNameMatch || isStreamParseSourceType) {
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

        applyMappingRelations(fields, relations);
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

      applyMappingRelations(fields, relations);

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
    void applyAutoMapping(sourceFields, {
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
        setSourceFields(fields);
        if (!readOnly) {
          await applyAutoMapping(fields);
        }
      } else {
        Message.error(response.message || '加载同步源表字段失败');
        setSourceFields([]);
      }
    } catch (error) {
      console.error('加载同步源表字段失败:', error);
      Message.error('加载同步源表字段失败');
      setSourceFields([]);
    } finally {
      setFieldsLoading(false);
    }
  };

  useEffect(() => {
    if (!sourceConfigured || !isDatabaseSourceType) {
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
    if (loadedSchemaKeyRef.current === schemaKey) {
      return;
    }

    loadedSchemaKeyRef.current = schemaKey;
    void loadTableSchema({
      connectorId,
      databaseName,
      tableName,
      projectID
    });
  }, [
    isDatabaseSourceType,
    sourceConfigured,
    syncSourceDataStrategy.sourceDataInfo.connectorId,
    syncSourceDataStrategy.sourceDataInfo.databaseName,
    currentProjectID,
    syncSourceDataStrategy.sourceDataInfo.projectID,
    syncSourceDataStrategy.sourceDataInfo.queryMode,
    syncSourceDataStrategy.sourceDataInfo.tableName
  ]);

  const handleSqlColumnsParsed = (
    columns: ConnectorAnalyseFinkSqlColumnItem[]
  ) => {
    if (!columns.length) {
      setSourceFields([]);
      return;
    }
    const fields = finkSqlParsedColumnsToSourceTableFields(columns);
    setSourceFields(fields);
    if (!readOnly) {
      void applyAutoMapping(fields);
    }
  };

  return (
    <>
      <div className={styles['modeling-section']}>
        <div className={styles['modeling-section-title']}>数据源</div>
        <InstanceSyncSourceSection
          form={form}
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
          onSourceTypeChange={handleSourceTypeChange}
          objectTypeName={resolvedObjectTypeName}
          styles={styles}
          readOnly={readOnly}
        />
      </div>

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

      <InstanceSyncMappingTable
        form={form}
        mappingFields={syncMappingFields}
        setMappingFields={setSyncMappingFields}
        sourceFields={sourceFields}
        sourceConfigured={sourceConfigured}
        loading={fieldsLoading || smartMatchLoading}
        onSmartMatch={readOnly ? undefined : handleSmartMatch}
        smartMatchLoading={smartMatchLoading}
        smartMatchTooltip={
          isStreamParseSourceType
            ? '根据属性 id 与解析字段英文名进行模糊匹配'
            : undefined
        }
        styles={styles}
        readOnly={readOnly}
      />
    </>
  );
}
