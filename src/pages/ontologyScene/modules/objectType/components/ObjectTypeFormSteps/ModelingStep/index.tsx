import React from 'react';
import { Form, Message, Radio } from '@arco-design/web-react';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import {
  COLUMN_TYPE_OPTIONS,
  DATA_SOURCE_TYPE,
  DataSourceType
} from '@/pages/ontologyScene/common/constants';
import { PrefixAimdp } from '@/api/endpoints';
import { getSqlConnectorTableSchemaToTIDB } from '@/api/ontologySceneLibrary/objectType';
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
import ObjectTypeAttributeTable from './ObjectTypeAttributeTable';

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
  readOnly = false
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
    if (type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
      setInitialFileList([]);
    }
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
      const response = await getSqlConnectorTableSchemaToTIDB({
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
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        数据源
      </div>
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
          <Radio value={DATA_SOURCE_TYPE.LOCAL_CSV}>本地CSV</Radio>
          <Radio value={DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC}>数据库/表</Radio>
        </Radio.Group>
      </FormItem>

      {dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? (
        <FormItem
          className={styles['local-csv-form-item']}
          label="Schema文件"
          field="file"
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
      ) : (
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
      )}

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
