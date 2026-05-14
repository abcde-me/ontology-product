import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@arco-design/web-react';
import { getSqlConnectorTableSchemaToTIDB } from '@/api/ontologySceneLibrary/objectType';
import { mapOntologyObjectTypeColumns } from '@/api/ontologySceneLibrary/attributes';
import type {
  ConnectorAnalyseFinkSqlColumnItem,
  GetSqlConnectorTableSchemaToTIDBRes
} from '@/types/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import {
  finkSqlParsedColumnsToSourceTableFields,
  objectTypeAttributeToSyncMapping
} from '../../ObjectTypeFormUtils/attributeFields';
import SqlSourceSelector from '../common/SqlSourceSelector';
import SyncSourceDataStrategyFormSection, {
  STRATEGY_FORM_FIELD_MAP
} from '../common/SyncSourceDataStrategyFormSection';
import InstanceSyncMappingTable from './InstanceSyncMappingTable';

interface InstanceSyncStepProps {
  form: any;
  objectTypeAttributes: ObjectTypeAttributeField[];
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
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.status === 0) &&
    (response.code === '' || response.code === 0 || response.code === undefined)
  );
}

function normalizeSourceFieldsFromTiDBSchema(
  data?: GetSqlConnectorTableSchemaToTIDBRes
): SourceTableField[] {
  const rawColumns = data?.columns;
  const columns = Array.isArray(rawColumns)
    ? rawColumns
    : rawColumns
      ? [rawColumns]
      : [];

  return columns
    .map((column) => ({
      fieldId: column.columnName,
      fieldComment: column.columnComment || column.columnName,
      fieldType: column.columnTypeTiDB || column.columnType
    }))
    .filter((field) => !!field.fieldId);
}

export default function InstanceSyncStep({
  form,
  objectTypeAttributes,
  syncSourceDataStrategy,
  setSyncSourceDataStrategy,
  syncMappingFields,
  setSyncMappingFields,
  fieldsLoading,
  setFieldsLoading,
  styles,
  readOnly = false
}: InstanceSyncStepProps) {
  const currentProjectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [sourceFields, setSourceFields] = useState<SourceTableField[]>([]);
  const loadedSchemaKeyRef = useRef('');

  useEffect(() => {
    setSyncMappingFields((prev) => {
      const existingByPropertyID = new Map(
        prev.map((field) => [field.propertyID, field])
      );
      const nextFields = objectTypeAttributes.map((attribute) => ({
        ...objectTypeAttributeToSyncMapping(attribute),
        ...existingByPropertyID.get(attribute.propertyID),
        propertyID: attribute.propertyID,
        propertyComment: attribute.propertyComment,
        propertyType: attribute.propertyType,
        isPrimary: attribute.isPrimary
      }));
      form.setFieldValue('syncMappingFields', nextFields);
      return nextFields;
    });
  }, [objectTypeAttributes, form, setSyncMappingFields]);

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

  const handleSourceChange = (sourceDataInfo: SqlSourceDataInfo) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      sourceDataInfo
    }));
    if (sourceDataInfo.queryMode === 'sql') {
      setSourceFields([]);
      setSyncMappingFields(
        objectTypeAttributes.map(objectTypeAttributeToSyncMapping)
      );
    }
  };

  const applyAutoMapping = async (fields: SourceTableField[]) => {
    if (!objectTypeAttributes.length || !fields.length) {
      return;
    }

    const sourceFieldMap = new Map(
      fields.map((field) => [field.fieldId, field])
    );
    const objectTypeColumns = objectTypeAttributes
      .map((attribute) => attribute.propertyID)
      .filter((propertyID): propertyID is string => !!propertyID);
    const sourceTableColumns = fields
      .map((field) => field.fieldId)
      .filter((fieldId): fieldId is string => !!fieldId);

    const relationMap = new Map<string, string>();
    if (objectTypeColumns.length && sourceTableColumns.length) {
      try {
        const response = await mapOntologyObjectTypeColumns({
          objectTypeColumns,
          sourceTableColumns
        });
        if (
          isSuccessResponse(response) &&
          Array.isArray(response.data?.mapRelations)
        ) {
          response.data.mapRelations.forEach((relation) => {
            if (
              relation?.objectTypeColumnName &&
              relation?.sourceTableColumnName
            ) {
              relationMap.set(
                relation.objectTypeColumnName,
                relation.sourceTableColumnName
              );
            }
          });
        } else {
          Message.error(response?.message || '自动匹配字段映射失败');
        }
      } catch (error) {
        console.error('自动匹配字段映射失败:', error);
        Message.error('自动匹配字段映射失败');
      }
    }

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
      const response = await getSqlConnectorTableSchemaToTIDB({
        id: connectorId,
        database_name: databaseName,
        table_name: tableName,
        projectID
      });
      if (isSuccessResponse(response)) {
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
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        数据源
      </div>
      <SqlSourceSelector
        form={form}
        value={syncSourceDataStrategy.sourceDataInfo}
        onChange={handleSourceChange}
        onTableSelected={loadTableSchema}
        onSqlColumnsParsed={handleSqlColumnsParsed}
        fieldPrefix="sync"
        styles={styles}
        ontologySqlTestTaskType="TABLE_REALTIME_SYNC"
        syncSourceDataStrategyForSqlTest={syncSourceDataStrategy}
        readOnly={readOnly}
      />

      <SyncSourceDataStrategyFormSection
        styles={styles}
        syncSourceDataStrategy={syncSourceDataStrategy}
        onStrategyUpdate={updateStrategy}
        readOnly={readOnly}
      />

      <InstanceSyncMappingTable
        form={form}
        mappingFields={syncMappingFields}
        setMappingFields={setSyncMappingFields}
        sourceFields={sourceFields}
        loading={fieldsLoading}
        styles={styles}
        readOnly={readOnly}
      />
    </>
  );
}
