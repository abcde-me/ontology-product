import React from 'react';
import { Form, Message, Radio } from '@arco-design/web-react';
import FieldImportUpload, {
  CsvSchemaTemplateLinks
} from '@/pages/ontologyScene/components/FieldImportUpload';
import {
  COLUMN_TYPE_OPTIONS,
  DATA_SOURCE_TYPE,
  DataSourceType
} from '@/pages/ontologyScene/common/constants';
import { PrefixAimdp } from '@/api/endpoints';
import { fetchSqlConnectorTableSchema } from '../../../services/ontologySqlConnectorService';
import type { ConnectorAnalyseFinkSqlColumnItem } from '@/types/objectType';
import {
  ObjectTypeAttributeField,
  ObjectTypeDataSourceState,
  SqlSourceDataInfo
} from '../../ObjectTypeFormUtils/types';
import {
  finkSqlParsedColumnsToObjectTypeAttributes,
  sourceFieldToObjectTypeAttribute
} from '../../ObjectTypeFormUtils/attributeFields';
import {
  getPrimaryKeyListFromTiDBSchema,
  isOntologyApiSuccessResponse,
  normalizeSourceFieldsFromTiDBSchema,
  resolvePrimaryColumnIndex
} from '../../ObjectTypeFormUtils/sqlConnectorTiDBSchema';
import SqlSourceSelector from '../common/SqlSourceSelector';
import DataResourceTableSelector from '../common/DataResourceTableSelector';
import ObjectTypeAttributeTable from './ObjectTypeAttributeTable';
import type { DataResourceTable } from '@/pages/dataResource/types';
import {
  buildDataResourceDataSourceStateFromTables,
  dataResourceTablesToObjectTypeAttributes
} from '../../../services/dataResourceMapping';

const FormItem = Form.Item;

interface ModelingStepProps {
  form: any;
  initialCode?: string;
  dataSource: ObjectTypeDataSourceState;
  setDataSource: React.Dispatch<
    React.SetStateAction<ObjectTypeDataSourceState>
  >;
  modelingSourceDataInfo: SqlSourceDataInfo;
  setModelingSourceDataInfo: React.Dispatch<
    React.SetStateAction<SqlSourceDataInfo>
  >;
  objectTypeAttributes: ObjectTypeAttributeField[];
  setObjectTypeAttributes: React.Dispatch<
    React.SetStateAction<ObjectTypeAttributeField[]>
  >;
  fieldsLoading: boolean;
  setFieldsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setFileUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReUpload: React.Dispatch<React.SetStateAction<boolean>>;
  initialFileList: any[];
  setInitialFileList: React.Dispatch<React.SetStateAction<any[]>>;
  styles: Record<string, string>;
  readOnly?: boolean;
  onGenerateSchema?: () => void | Promise<void>;
  generatingSchema?: boolean;
  showGenerateSchemaButton?: boolean;
  onDataResourceSelected?: (tables: DataResourceTable[]) => void;
}

export default function ModelingStep({
  form,
  initialCode,
  dataSource,
  setDataSource,
  modelingSourceDataInfo,
  setModelingSourceDataInfo,
  objectTypeAttributes,
  setObjectTypeAttributes,
  fieldsLoading,
  setFieldsLoading,
  setFileUploaded,
  setIsReUpload,
  initialFileList,
  setInitialFileList,
  styles,
  readOnly = false,
  onGenerateSchema,
  generatingSchema = false,
  showGenerateSchemaButton = false,
  onDataResourceSelected
}: ModelingStepProps) {
  const syncAttributes = (fields: ObjectTypeAttributeField[]) => {
    setObjectTypeAttributes(fields);
    form.setFieldValue('objectTypeAttributes', fields);
  };

  const clearAttributes = () => {
    syncAttributes([]);
    setFileUploaded(false);
  };

  const handleDataSourceTypeChange = (type: DataSourceType) => {
    form.setFieldValue('dataSourceType', type);
    setDataSource({
      type,
      queryMode: 'selected'
    });
    setModelingSourceDataInfo({ queryMode: 'selected' });
    form.setFieldsValue({
      modelingConnector: undefined,
      modelingDatabaseTable: undefined,
      file: undefined
    });
    clearAttributes();
    setIsReUpload(false);
    if (
      type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ||
      type === DATA_SOURCE_TYPE.DATA_RESOURCE
    ) {
      setInitialFileList([]);
    }
    form.setFieldValue('dataResourceTableId', undefined);
  };

  const handleDataResourceTablesChange = (tables: DataResourceTable[]) => {
    if (!tables.length) {
      setDataSource((prev) => ({
        ...prev,
        type: DATA_SOURCE_TYPE.DATA_RESOURCE,
        database: undefined,
        table: undefined,
        dataResourceId: undefined,
        dataResourceIds: undefined,
        tables: undefined
      }));
      clearAttributes();
      form.setFieldValue('dataResourceTableId', undefined);
      return;
    }

    const nextDataSource = buildDataResourceDataSourceStateFromTables(tables);
    setDataSource((prev) => ({
      ...prev,
      ...nextDataSource,
      connectorId: undefined,
      connectorName: undefined,
      connectorSubtype: undefined,
      file: undefined,
      filePath: undefined,
      queryMode: 'selected',
      sql: undefined
    }));
    setModelingSourceDataInfo({ queryMode: 'selected' });
    form.setFieldValue(
      'dataResourceTableId',
      tables.map((table) => table.id)
    );
    syncAttributes(dataResourceTablesToObjectTypeAttributes(tables));
    setFileUploaded(true);
    onDataResourceSelected?.(tables);
  };

  const handleModelingSourceChange = (source: SqlSourceDataInfo) => {
    setModelingSourceDataInfo(source);
    setDataSource((prev) => ({
      ...prev,
      type: DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC,
      connectorId: source.connectorId,
      connectorName: source.connectorName,
      connectorSubtype: source.connectorSubtype,
      database: source.databaseName,
      table: source.tableName,
      queryMode: source.queryMode,
      sql: source.sql,
      file: undefined,
      filePath: undefined
    }));
    if (source.queryMode === 'sql') {
      clearAttributes();
    }
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
    if (!projectID) {
      Message.warning('缺少项目信息，无法加载数据表字段');
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
        const sourceFields = normalizeSourceFieldsFromTiDBSchema(
          response.data,
          {
            fieldTypeFromTiDBOnly: true
          }
        );
        const primaryKeyList = getPrimaryKeyListFromTiDBSchema(response.data);
        const primaryColumnIndex = resolvePrimaryColumnIndex(
          sourceFields,
          primaryKeyList
        );

        const fields = sourceFields.map((field, index) =>
          sourceFieldToObjectTypeAttribute(
            field,
            index,
            index === primaryColumnIndex,
            tableName
          )
        );
        syncAttributes(fields);
        setFileUploaded(true);
      } else {
        Message.error(response.message || '加载字段列表失败');
        clearAttributes();
      }
    } catch (error) {
      console.error('加载字段列表失败:', error);
      Message.error('加载字段列表失败');
      clearAttributes();
    } finally {
      setFieldsLoading(false);
    }
  };

  const handleSqlColumnsParsed = (
    columns: ConnectorAnalyseFinkSqlColumnItem[]
  ) => {
    if (!columns.length) {
      clearAttributes();
      return;
    }
    syncAttributes(finkSqlParsedColumnsToObjectTypeAttributes(columns));
    setFileUploaded(true);
  };

  const handleDataSourceFileChange = (fileData: any) => {
    if (!fileData || (Array.isArray(fileData) && fileData.length === 0)) {
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

      setModelingSourceDataInfo({ queryMode: 'selected' });
      setDataSource((prev) => ({
        ...prev,
        type: DATA_SOURCE_TYPE.LOCAL_CSV as DataSourceType,
        file: undefined,
        database: undefined,
        table: undefined,
        filePath: path,
        queryMode: 'selected'
      }));

      const fields = columnList.map((column: string, index: number) =>
        sourceFieldToObjectTypeAttribute(
          {
            fieldId: column,
            fieldComment: commentList[index] || column,
            fieldType: typeList[index] || COLUMN_TYPE_OPTIONS[0].value
          },
          index
        )
      );
      syncAttributes(fields);
      setFileUploaded(true);
    }
  };

  return (
    <>
      <div className={styles['modeling-section']}>
        <div className={styles['modeling-section-title']}>创建方式</div>
        <FormItem
          label="数据来源类型"
          field="dataSourceType"
          rules={[{ required: true, message: '请选择数据来源类型' }]}
        >
          <Radio.Group
            value={dataSource.type}
            onChange={handleDataSourceTypeChange}
            disabled={readOnly}
          >
            <Radio value={DATA_SOURCE_TYPE.MANUAL_CREATION}>手动创建</Radio>
            <Radio value={DATA_SOURCE_TYPE.LOCAL_CSV}>本地CSV</Radio>
            <Radio value={DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC}>
              数据库/表
            </Radio>
            <Radio value={DATA_SOURCE_TYPE.DATA_RESOURCE}>数据资源</Radio>
          </Radio.Group>
        </FormItem>

        {dataSource.type ===
        DATA_SOURCE_TYPE.MANUAL_CREATION ? null : dataSource.type ===
          DATA_SOURCE_TYPE.DATA_RESOURCE ? (
          <FormItem
            label="数据资源表"
            field="dataResourceTableId"
            rules={[
              {
                required: true,
                validator: (_value, callback) => {
                  const selectedCount = dataSource.dataResourceIds?.length || 0;
                  if (!dataSource.table && selectedCount === 0) {
                    callback('请选择数据资源表');
                  } else {
                    callback();
                  }
                }
              }
            ]}
          >
            <DataResourceTableSelector
              value={dataSource.dataResourceIds || dataSource.dataResourceId}
              onChange={handleDataResourceTablesChange}
              readOnly={readOnly}
            />
          </FormItem>
        ) : dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? (
          <FormItem
            className={styles['local-csv-form-item']}
            label={
              <div className={styles['schema-file-label-row']}>
                <span className={styles['schema-file-label-text']}>
                  Schema文件
                </span>
                <CsvSchemaTemplateLinks
                  from="object_type"
                  disabled={readOnly}
                  hasUploadedFile={
                    Boolean(dataSource.filePath) || initialFileList.length > 0
                  }
                  onGenerateSchema={onGenerateSchema}
                  generatingSchema={generatingSchema}
                  showGenerateSchemaButton={showGenerateSchemaButton}
                />
              </div>
            }
            field="file"
            layout="vertical"
            rules={[
              {
                required: true,
                validator: (_value, callback) => {
                  if (!dataSource.filePath) {
                    callback('请上传文件');
                  } else {
                    callback();
                  }
                }
              }
            ]}
          >
            <FieldImportUpload
              accept=".csv"
              fileType="csv"
              maxSize={100}
              customAction={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
              fileList={initialFileList}
              disabled={readOnly}
              showTemplateLinks={false}
              hasUploadedFile={
                Boolean(dataSource.filePath) || initialFileList.length > 0
              }
              onGenerateSchema={onGenerateSchema}
              generatingSchema={generatingSchema}
              showGenerateSchemaButton={showGenerateSchemaButton}
              onFileChange={(file) => {
                if (
                  file === undefined ||
                  (Array.isArray(file) && file.length === 0)
                ) {
                  setDataSource((prev) => ({
                    ...prev,
                    file: undefined,
                    filePath: undefined
                  }));
                  form.setFieldValue('file', undefined);
                  clearAttributes();
                  setInitialFileList([]);
                } else {
                  setIsReUpload(!!initialCode);
                  handleDataSourceFileChange(file);
                }
              }}
              onUploadingChange={() => {
                // 保持 FieldImportUpload 调用签名稳定。
              }}
            />
          </FormItem>
        ) : dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ? (
          <SqlSourceSelector
            form={form}
            value={modelingSourceDataInfo}
            onChange={handleModelingSourceChange}
            onTableSelected={loadTableSchema}
            onSqlColumnsParsed={handleSqlColumnsParsed}
            fieldPrefix="modeling"
            styles={styles}
            ontologySqlTestTaskType="TABLE_REALTIME_SYNC"
            readOnly={readOnly}
          />
        ) : null}
      </div>

      <ObjectTypeAttributeTable
        form={form}
        attributeFields={objectTypeAttributes}
        setAttributeFields={setObjectTypeAttributes}
        fieldsLoading={fieldsLoading}
        styles={styles}
        readOnly={readOnly}
      />
    </>
  );
}
