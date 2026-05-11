import { useEffect, useState } from 'react';
import { Message } from '@arco-design/web-react';
import { COLUMN_TYPE_OPTIONS } from '@/pages/ontologyScene/common/constants';
import {
  listMetadataIcebergDatabaseName,
  listMetadataIcebergTable,
  listMetadataIcebergTiDBTable
} from '@/api/ontologySceneLibrary/objectType';
import { IcebergTableItem } from '@/types/objectType';
import { DEFAULT_INTERMEDIATE_TABLE } from '../constants';
import {
  AttributeField,
  CascaderOption,
  FileData,
  IntermediateTable,
  IntermediateTableType
} from '../types';
import { normalizeFieldTypeForPrimary } from '../utils/linkFormUtils';

export function useIntermediateTableState(form: any) {
  const [intermediateTable, setIntermediateTable] = useState<IntermediateTable>(
    DEFAULT_INTERMEDIATE_TABLE
  );
  const [selectedDatabase, setSelectedDatabase] = useState<
    string | undefined
  >();
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [cascaderOptions, setCascaderOptions] = useState<CascaderOption[]>([]);
  const [cascaderValue, setCascaderValue] = useState<string[]>([]);
  const [tableListMap, setTableListMap] = useState<
    Record<number, IcebergTableItem[]>
  >({});
  const [loadingTables, setLoadingTables] = useState<Record<number, boolean>>(
    {}
  );
  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isReUpload, setIsReUpload] = useState(false);
  const [initialFileList, setInitialFileList] = useState<any[]>([]);

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
    clearAttributeFields();
    setFileUploaded(false);
    setIsReUpload(false);
  };

  const loadDatabaseList = async () => {
    try {
      const response = await listMetadataIcebergDatabaseName({
        instanceId: 1
      });
      if (response.status === 200 && response.code === '') {
        const databases = response.data.data || [];
        setCascaderOptions(
          databases.map((db) => ({
            label: db.databaseName,
            value: String(db.id),
            isLeaf: false
          }))
        );
      } else {
        Message.error(response.message || '加载数据库列表失败');
      }
    } catch (error) {
      console.error('加载数据库列表失败:', error);
      Message.error('加载数据库列表失败');
    }
  };

  const handleCascaderLoadMore = async (
    pathValue: string[],
    level: number
  ): Promise<any[]> => {
    if (level === 1 && pathValue.length > 0) {
      const databaseId = Number(pathValue[0]);
      if (!isNaN(databaseId) && !tableListMap[databaseId]) {
        try {
          setLoadingTables((prev) => ({ ...prev, [databaseId]: true }));
          const response = await listMetadataIcebergTable({
            pageNum: 1,
            pageSize: 1000,
            filters: {
              databaseId
            }
          });

          if (response.status === 200 && response.code === '') {
            const tables = response.data.data?.list || [];
            setTableListMap((prev) => ({ ...prev, [databaseId]: tables }));

            setCascaderOptions((prevOptions) =>
              prevOptions.map((option) => {
                if (option.value === String(databaseId)) {
                  return {
                    ...option,
                    children: tables.map((table) => ({
                      label: table.tableName,
                      value: String(table.id),
                      isLeaf: true
                    }))
                  };
                }
                return option;
              })
            );

            return tables.map((table) => ({
              label: table.tableName,
              value: String(table.id)
            }));
          }
          Message.error(response.message || '加载表列表失败');
          return [];
        } catch (error) {
          console.error('加载表列表失败:', error);
          Message.error('加载表列表失败');
          return [];
        } finally {
          setLoadingTables((prev) => ({ ...prev, [databaseId]: false }));
        }
      } else if (tableListMap[databaseId]) {
        return tableListMap[databaseId].map((table) => ({
          label: table.tableName,
          value: String(table.id),
          isLeaf: true
        }));
      }
    }
    return [];
  };

  const handleCascaderChange = async (value: string[] | undefined) => {
    const newValue = value && Array.isArray(value) ? value : [];
    setCascaderValue(newValue);

    if (newValue.length === 2 && newValue[1]) {
      const databaseId = Number(newValue[0]);
      const tableId = Number(newValue[1]);
      const databaseOption = cascaderOptions.find(
        (opt) => opt.value === String(databaseId)
      );
      const databaseName = databaseOption?.label || newValue[0];
      const tables = tableListMap[databaseId] || [];
      const tableItem = tables.find((t) => t.id === tableId);
      const tableName = tableItem?.tableName || newValue[1];

      setIntermediateTable((prev) => ({
        ...prev,
        database: databaseName,
        table: tableName
      }));
      setSelectedDatabase(databaseName);
      setSelectedTable(tableName);
      form.setFieldValue('databaseTable', `${databaseName}/${tableName}`);
    } else if (newValue.length >= 1 && newValue[0]) {
      const databaseOption = cascaderOptions.find(
        (opt) => opt.value === String(newValue[0])
      );
      const databaseName = databaseOption?.label || newValue[0];

      setIntermediateTable((prev) => ({
        ...prev,
        database: databaseName,
        table: undefined
      }));
      setSelectedDatabase(databaseName);
      setSelectedTable(undefined);
      form.setFieldValue('databaseTable', undefined);
    } else {
      setIntermediateTable((prev) => ({
        ...prev,
        database: undefined,
        table: undefined
      }));
      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      form.setFieldValue('databaseTable', undefined);
    }

    if (newValue.length === 2 && newValue[1]) {
      const tableId = Number(newValue[1]);
      if (!isNaN(tableId) && tableId > 0) {
        setFieldsLoading(true);
        try {
          const response = await listMetadataIcebergTiDBTable({
            pageNum: 1,
            pageSize: 1000,
            filters: {
              tableId
            }
          });

          if (response.status === 200 && response.code === '') {
            const fieldList = response.data.data?.list || [];
            const fields: AttributeField[] = fieldList
              .map((field, index) => ({
                tableField: field.fieldName,
                isUse: 1,
                attributeName: field.description || field.fieldName,
                fieldType: field.dataType || '',
                isPrimary: index === 0
              }))
              .map((f) => ({
                ...f,
                fieldType: normalizeFieldTypeForPrimary(
                  f.fieldType,
                  f.isPrimary
                )
              }));

            setAttributeFields(fields);
            form.setFieldValue('attributeFields', fields);
            setFileUploaded(true);
            clearRelationFields();
          } else {
            Message.error(response.message || '加载字段列表失败');
            clearAttributeFields();
            setFileUploaded(false);
            clearRelationFields();
          }
        } catch (error) {
          console.error('加载字段列表失败:', error);
          Message.error('加载字段列表失败');
          clearAttributeFields();
          setFileUploaded(false);
          clearRelationFields();
        } finally {
          setFieldsLoading(false);
        }
      } else {
        clearAttributeFields();
        setFileUploaded(false);
        clearRelationFields();
      }
    } else {
      clearAttributeFields();
      setFileUploaded(false);
      clearRelationFields();
    }
  };

  const handleIntermediateTableTypeChange = (type: IntermediateTableType) => {
    setTimeout(() => {
      form.setFields({
        intermediateTable: { error: undefined }
      });
    }, 0);
    if (type === 'local_csv') {
      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      setCascaderValue([]);
      form.setFieldsValue({
        databaseTable: undefined
      });
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
      loadDatabaseList();
    }
  };

  useEffect(() => {
    if (
      intermediateTable.type === 'data_lake_sync' &&
      cascaderOptions.length === 0
    ) {
      loadDatabaseList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intermediateTable.type]);

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

      const fields: AttributeField[] = columnList.map((column, index) => ({
        tableField: column,
        isUse: 1,
        attributeName: commentList[index] || column,
        fieldType: typeList[index] || COLUMN_TYPE_OPTIONS[0].value,
        isPrimary: index === 0
      }));

      setAttributeFields(fields);
      form.setFieldValue('attributeFields', fields);
      setFileUploaded(true);
      clearRelationFields();
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
    selectedDatabase,
    setSelectedDatabase,
    selectedTable,
    setSelectedTable,
    cascaderOptions,
    setCascaderOptions,
    cascaderValue,
    setCascaderValue,
    loadingTables,
    attributeFields,
    setAttributeFields,
    fieldsLoading,
    fileUploaded,
    setFileUploaded,
    isReUpload,
    setIsReUpload,
    initialFileList,
    setInitialFileList,
    getAttributeOptions,
    resetForLinkTypeChange,
    handleCascaderLoadMore,
    handleCascaderChange,
    handleIntermediateTableTypeChange,
    handleLocalCsvFileChange
  };
}
