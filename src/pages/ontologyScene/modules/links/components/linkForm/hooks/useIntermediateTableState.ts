import { useState } from 'react';
import { Message } from '@arco-design/web-react';
import { COLUMN_TYPE_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { getSqlConnectorTableSchemaToTIDB } from '@/api/ontologySceneLibrary/objectType';
import { ConnectorAnalyseFinkSqlColumnItem } from '@/types/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  DEFAULT_INTERMEDIATE_TABLE,
  DEFAULT_SYNC_SOURCE_DATA_STRATEGY
} from '../constants';
import {
  AttributeField,
  FileData,
  IntermediateTable,
  IntermediateTableType
} from '../types';
import {
  ObjectTypeAttributeField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import {
  finkSqlParsedColumnsToObjectTypeAttributes,
  sourceFieldToObjectTypeAttribute
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import {
  getPrimaryKeyListFromTiDBSchema,
  isOntologyApiSuccessResponse,
  normalizeSourceFieldsFromTiDBSchema,
  resolvePrimaryColumnIndex
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/sqlConnectorTiDBSchema';
import { objectTypeAttributeToLinkAttribute } from '../utils/linkAttributeFields';

function createDefaultSyncSourceDataStrategy(): SyncSourceDataStrategyFormState {
  return {
    ...DEFAULT_SYNC_SOURCE_DATA_STRATEGY,
    sourceDataInfo: {
      ...DEFAULT_SYNC_SOURCE_DATA_STRATEGY.sourceDataInfo
    }
  };
}

export function useIntermediateTableState(form: any) {
  const currentProjectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [intermediateTable, setIntermediateTable] = useState<IntermediateTable>(
    DEFAULT_INTERMEDIATE_TABLE
  );
  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isReUpload, setIsReUpload] = useState(false);
  const [initialFileList, setInitialFileList] = useState<any[]>([]);
  const [syncSourceDataStrategy, setSyncSourceDataStrategy] =
    useState<SyncSourceDataStrategyFormState>(
      createDefaultSyncSourceDataStrategy
    );

  const clearRelationFields = () => {
    form.setFieldValue('sourceAttribute', undefined);
    form.setFieldValue('targetAttribute', undefined);
  };

  const clearAttributeFields = () => {
    setAttributeFields([]);
    form.setFieldValue('attributeFields', []);
  };

  const getAttributeOptions = () =>
    attributeFields.map((field) => ({
      label: field.tableField,
      value: field.tableField
    }));

  const resetForLinkTypeChange = () => {
    setIntermediateTable(DEFAULT_INTERMEDIATE_TABLE);
    setSyncSourceDataStrategy(createDefaultSyncSourceDataStrategy());
    clearAttributeFields();
    setFileUploaded(false);
    setIsReUpload(false);
  };

  const syncIntermediateTableWithSource = (
    sourceDataInfo: SqlSourceDataInfo
  ) => {
    setIntermediateTable((prev) => ({
      ...prev,
      type: 'data_lake_sync',
      sourceDataInfo,
      database: sourceDataInfo.databaseName,
      table: sourceDataInfo.tableName,
      queryMode: sourceDataInfo.queryMode || 'selected',
      sql: sourceDataInfo.sql
    }));
  };

  const handleSyncSourceDataInfoChange = (
    sourceDataInfo: SqlSourceDataInfo
  ) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      sourceDataInfo
    }));
    syncIntermediateTableWithSource(sourceDataInfo);
    clearAttributeFields();
    setFileUploaded(false);
    clearRelationFields();
  };

  const applyObjectTypeAttributes = (attrs: ObjectTypeAttributeField[]) => {
    const nextFields = attrs.map(objectTypeAttributeToLinkAttribute);
    setAttributeFields(nextFields);
    form.setFieldValue('attributeFields', nextFields);
    setFileUploaded(nextFields.length > 0);
    clearRelationFields();
  };

  const handleDatabaseSourceTableSelected = async ({
    connectorId,
    databaseName,
    tableName,
    projectID: projectIDFromEvent
  }: Required<
    Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
  > & { projectID: string }) => {
    const projectID = projectIDFromEvent || currentProjectID;
    if (!projectID) {
      Message.warning('缺少项目信息，无法加载数据表字段');
      return;
    }
    setFieldsLoading(true);
    try {
      const response = await getSqlConnectorTableSchemaToTIDB({
        id: connectorId,
        database_name: databaseName,
        table_name: tableName,
        projectID
      });
      if (isOntologyApiSuccessResponse(response)) {
        const sourceFields = normalizeSourceFieldsFromTiDBSchema(
          response.data,
          { fieldTypeFromTiDBOnly: true }
        );
        const primaryKeyList = getPrimaryKeyListFromTiDBSchema(response.data);
        const primaryColumnIndex = resolvePrimaryColumnIndex(
          sourceFields,
          primaryKeyList
        );
        const attrs = sourceFields.map((field, index) =>
          sourceFieldToObjectTypeAttribute(
            field,
            index,
            index === primaryColumnIndex,
            tableName
          )
        );
        applyObjectTypeAttributes(attrs);
      } else {
        Message.error(response.message || '加载数据源字段失败');
        clearAttributeFields();
        setFileUploaded(false);
        clearRelationFields();
      }
    } catch (error) {
      console.error('加载数据源字段失败:', error);
      Message.error('加载数据源字段失败');
      clearAttributeFields();
      setFileUploaded(false);
      clearRelationFields();
    } finally {
      setFieldsLoading(false);
    }
  };

  const handleSqlColumnsParsed = (
    columns: ConnectorAnalyseFinkSqlColumnItem[]
  ) => {
    const attrs = finkSqlParsedColumnsToObjectTypeAttributes(columns);
    applyObjectTypeAttributes(attrs);
  };

  const updateSyncSourceDataStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const handleIntermediateTableTypeChange = (type: IntermediateTableType) => {
    setTimeout(() => {
      form.setFields({
        intermediateTable: { error: undefined }
      });
    }, 0);
    if (type === 'local_csv') {
      form.setFieldsValue({
        databaseTable: undefined,
        linkSourceConnector: undefined,
        linkSourceDatabaseTable: undefined,
        linkSourceQueryMode: undefined,
        linkSourceSql: undefined,
        syncMode: undefined,
        conflictStrategy: undefined,
        syncScope: undefined,
        pollFetchSize: undefined,
        parallelism: undefined,
        exceptionStrategy: undefined,
        jdbcCheckpointField: undefined,
        jdbcIncrementalTimeField: undefined,
        jdbcPollingIntervalSeconds: undefined,
        jdbcSyncSqlFull: undefined,
        jdbcSyncSqlIncrement: undefined
      });
      setSyncSourceDataStrategy(createDefaultSyncSourceDataStrategy());
    }

    setIntermediateTable({
      type,
      database: undefined,
      table: undefined,
      file: undefined,
      filePath: undefined
    });
    clearAttributeFields();
    setFileUploaded(false);
    setIsReUpload(false);
    clearRelationFields();

    if (type === 'data_lake_sync') {
      setInitialFileList([]);
      const defaultStrategy = createDefaultSyncSourceDataStrategy();
      setSyncSourceDataStrategy(defaultStrategy);
      form.setFieldsValue({
        syncMode: defaultStrategy.mode,
        conflictStrategy: defaultStrategy.conflictStrategy,
        syncScope: defaultStrategy.syncScope,
        pollFetchSize: defaultStrategy.pollFetchSize,
        parallelism: defaultStrategy.parallelism,
        exceptionStrategy: defaultStrategy.exceptionStrategy,
        jdbcPollingIntervalSeconds: defaultStrategy.jdbcPollingIntervalSeconds,
        linkSourceQueryMode: defaultStrategy.sourceDataInfo.queryMode
      });
    }
  };

  const handleIntermediateTableFileChange = (fileData: FileData) => {
    if (!fileData || (Array.isArray(fileData) && fileData.length === 0)) {
      setIntermediateTable({
        ...intermediateTable,
        file: undefined,
        filePath: undefined
      });
      clearAttributeFields();
      setFileUploaded(false);
      setIsReUpload(false);
      clearRelationFields();
      return;
    }

    const responseData =
      Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;

    if (responseData && responseData.columnList && responseData.path) {
      const {
        columnList,
        path,
        commentList = [],
        typeList = []
      } = responseData;

      setIntermediateTable({
        ...intermediateTable,
        type: 'local_csv',
        file: undefined,
        filePath: path
      });

      const attrs = columnList.map((column: string, index: number) =>
        sourceFieldToObjectTypeAttribute(
          {
            fieldId: column,
            fieldComment: commentList[index] || column,
            fieldType: typeList[index] || COLUMN_TYPE_OPTIONS[0].value
          },
          index
        )
      );
      applyObjectTypeAttributes(attrs);
    }
  };

  const handleLocalCsvFileChange = (file: any, markReUpload: boolean) => {
    if (file === undefined || (Array.isArray(file) && file.length === 0)) {
      setIntermediateTable((prev) => ({
        ...prev,
        file: undefined,
        filePath: undefined
      }));
      form.setFieldValue('intermediateTable', {
        ...intermediateTable,
        file: undefined
      });
      clearAttributeFields();
      setFileUploaded(false);
      setInitialFileList([]);
      clearRelationFields();
    } else {
      setIsReUpload(markReUpload);
      handleIntermediateTableFileChange(file);
    }
  };

  return {
    intermediateTable,
    setIntermediateTable,
    attributeFields,
    setAttributeFields,
    fieldsLoading,
    fileUploaded,
    setFileUploaded,
    isReUpload,
    setIsReUpload,
    initialFileList,
    setInitialFileList,
    syncSourceDataStrategy,
    setSyncSourceDataStrategy,
    getAttributeOptions,
    resetForLinkTypeChange,
    handleIntermediateTableTypeChange,
    handleLocalCsvFileChange,
    handleSyncSourceDataInfoChange,
    handleDatabaseSourceTableSelected,
    handleSqlColumnsParsed,
    updateSyncSourceDataStrategy
  };
}
