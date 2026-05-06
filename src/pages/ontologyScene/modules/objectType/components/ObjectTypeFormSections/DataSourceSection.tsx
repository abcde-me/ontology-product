import React, { useEffect, useState } from 'react';
import {
  Cascader,
  Form,
  Message,
  Popover,
  Radio,
  Select
} from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import {
  DATA_SOURCE_TYPE,
  DataSourceType,
  COLUMN_TYPE_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import {
  listMetadataIcebergDatabaseName,
  listMetadataIcebergTable,
  listMetadataIcebergTiDBTable
} from '@/api/ontologySceneLibrary/objectType';
import { PrefixAimdp } from '@/api/endpoints';
import { openNewPage } from '@/utils/env';
import { IcebergTableItem, MetadataMenuItem } from '@/types/objectType';
import { AttributeField, FileData } from '../ObjectTypeFormUtils/types';
import { normalizeColumnTypeForPrimary } from '../ObjectTypeFormUtils/attributeFields';
import { useSchemaSourceConnectors } from '../ObjectTypeFormHooks/useSchemaSource';

const FormItem = Form.Item;

interface CascaderOption {
  label: string;
  value: string;
  children?: Array<{ label: string; value: string; isLeaf?: boolean }>;
  isLeaf?: boolean;
}

interface DataSourceSectionProps {
  form: any;
  initialCode?: string;
  dataSource: {
    type: DataSourceType;
    database?: string;
    table?: string;
    file?: any;
    filePath?: string;
  };
  setDataSource: React.Dispatch<
    React.SetStateAction<{
      type: DataSourceType;
      database?: string;
      table?: string;
      file?: any;
      filePath?: string;
    }>
  >;
  setAttributeFields: React.Dispatch<React.SetStateAction<AttributeField[]>>;
  setFieldsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setFileUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReUpload: React.Dispatch<React.SetStateAction<boolean>>;
  initialFileList: any[];
  setInitialFileList: React.Dispatch<React.SetStateAction<any[]>>;
  styles: Record<string, string>;
}

function databaseTableCascaderFilterOption(
  input: string,
  option: { label?: unknown; value?: unknown }
): boolean {
  const q = String(input ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;

  const labelStr =
    option?.label != null && option.label !== ''
      ? String(option.label).toLowerCase()
      : '';
  const valueStr =
    option?.value != null && option.value !== ''
      ? String(option.value).toLowerCase()
      : '';

  return labelStr.includes(q) || valueStr.includes(q);
}

export default function DataSourceSection({
  form,
  initialCode,
  dataSource,
  setDataSource,
  setAttributeFields,
  setFieldsLoading,
  setFileUploaded,
  setIsReUpload,
  initialFileList,
  setInitialFileList,
  styles
}: DataSourceSectionProps) {
  const [creationMode, setCreationMode] = useState<
    'schema_only' | 'schema_with_data'
  >('schema_only');
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>();
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
  const { connectors, loading: connectorsLoading } =
    useSchemaSourceConnectors();

  const loadDatabaseList = async () => {
    try {
      const response = await listMetadataIcebergDatabaseName({
        instanceId: 1
      });
      if (response.status === 200 && response.code === '') {
        const databases: MetadataMenuItem[] = response.data.data || [];
        const options = databases.map((db) => ({
          label: db.databaseName,
          value: String(db.id),
          isLeaf: false
        }));
        setCascaderOptions(options);
      } else {
        Message.error(response.message || '加载数据库列表失败');
      }
    } catch (error) {
      console.error('加载数据库列表失败:', error);
      Message.error('加载数据库列表失败');
    }
  };

  useEffect(() => {
    if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
      loadDatabaseList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.type]);

  useEffect(() => {
    if (
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
      dataSource.database &&
      dataSource.table &&
      cascaderValue.length === 0
    ) {
      setSelectedDatabase(dataSource.database);
      setSelectedTable(dataSource.table);
      setCascaderValue([dataSource.database, dataSource.table]);
      form.setFieldValue(
        'databaseTable',
        `${dataSource.database}/${dataSource.table}`
      );
    }
  }, [
    dataSource.database,
    dataSource.table,
    dataSource.type,
    cascaderValue.length,
    form
  ]);

  const clearAttributeFields = () => {
    setAttributeFields([]);
    form.setFieldValue('attributeFields', []);
    setFileUploaded(false);
  };

  const handleCascaderChange = async (value: string[] | undefined) => {
    const newValue = value && Array.isArray(value) ? value : [];
    setCascaderValue(newValue);
    form.setFieldValue('database', newValue[0] || undefined);
    form.setFieldValue('table', newValue[1] || undefined);

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

      setDataSource((prev) => ({
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

      setDataSource((prev) => ({
        ...prev,
        database: databaseName,
        table: undefined
      }));
      setSelectedDatabase(databaseName);
      setSelectedTable(undefined);
      form.setFieldValue('database', databaseName);
      form.setFieldValue('table', undefined);
      form.setFieldValue('databaseTable', undefined);
    } else {
      setDataSource((prev) => ({
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
            const fields: AttributeField[] = fieldList.map((field, index) => {
              const isPrimary = index === 0;
              const baseType = field.dataType;
              return {
                name: field.fieldName,
                comment: field.description || field.fieldName,
                columnType: normalizeColumnTypeForPrimary(baseType, isPrimary),
                isPrimary: isPrimary ? 1 : 0,
                isUse: 1,
                isStoreAsPublic: 0,
                publicPropertyID: 0,
                _tableField: field.fieldName,
                _attributeName: field.description || field.fieldName
              };
            });

            setAttributeFields(fields);
            form.setFieldValue('attributeFields', fields);
            setFileUploaded(true);
          } else {
            Message.error(response.message || '加载字段列表失败');
            clearAttributeFields();
          }
        } catch (error) {
          console.error('加载字段列表失败:', error);
          Message.error('加载字段列表失败');
          clearAttributeFields();
        } finally {
          setFieldsLoading(false);
        }
      } else {
        clearAttributeFields();
      }
    } else {
      clearAttributeFields();
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

            if (
              cascaderValue.length === 2 &&
              Number(cascaderValue[0]) === databaseId
            ) {
              const tableId = Number(cascaderValue[1]);
              const tableItem = tables.find((t) => t.id === tableId);
              if (tableItem) {
                const databaseOption = cascaderOptions.find(
                  (opt) => opt.value === String(databaseId)
                );
                const databaseName = databaseOption?.label || cascaderValue[0];
                setDataSource((prev) => ({
                  ...prev,
                  database: databaseName,
                  table: tableItem.tableName
                }));
                setSelectedDatabase(databaseName);
                setSelectedTable(tableItem.tableName);
              }
            }

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

  const handleDataSourceTypeChange = (type: DataSourceType) => {
    form.setFieldValue('dataSourceType', type);
    if (type === DATA_SOURCE_TYPE.LOCAL_CSV) {
      setSelectedConnectorId(undefined);
      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      setCascaderValue([]);
      form.setFieldsValue({
        connector: undefined,
        database: undefined,
        table: undefined,
        databaseTable: undefined
      });
    } else {
      form.setFieldValue('databaseTable', undefined);
    }

    const newDataSource = {
      type,
      database:
        type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? selectedDatabase
          : undefined,
      table:
        type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
          ? selectedTable
          : undefined,
      file: undefined,
      filePath: undefined
    };
    setDataSource(newDataSource);
    form.setFieldValue('file', undefined);
    clearAttributeFields();
    setIsReUpload(false);
    if (type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
      setInitialFileList([]);
    }
  };

  const handleDataSourceFileChange = (fileData: FileData) => {
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

      setSelectedDatabase(undefined);
      setSelectedTable(undefined);
      form.setFieldsValue({
        database: undefined,
        table: undefined
      });

      setDataSource((prev) => ({
        ...prev,
        type: DATA_SOURCE_TYPE.LOCAL_CSV as DataSourceType,
        file: undefined,
        database: undefined,
        table: undefined,
        filePath: path
      }));

      const fields: AttributeField[] = columnList.map((column, index) => ({
        name: column,
        comment: commentList[index] || column,
        columnType: typeList[index] || COLUMN_TYPE_OPTIONS[0].value,
        isPrimary: index === 0 ? 1 : 0,
        isUse: 1,
        isStoreAsPublic: 0,
        publicPropertyID: 0,
        _tableField: column,
        _attributeName: commentList[index] || column
      }));

      setAttributeFields(fields);
      form.setFieldValue('attributeFields', fields);
      setFileUploaded(true);
    }
  };

  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        数据源
      </div>
      <FormItem label="创建模式" required>
        <div className="grid grid-cols-2 gap-[16px]">
          <div
            className={classNames(
              'cursor-pointer rounded-[8px] border p-[20px]',
              creationMode === 'schema_only'
                ? 'border-[#165DFF] bg-[#F2F7FF]'
                : 'border-[#E5E6EB]'
            )}
            onClick={() => setCreationMode('schema_only')}
          >
            <div className="mb-[12px] text-[16px] font-[500] text-[var(--color-text-1)]">
              只建模不导入数据
            </div>
            <div className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
              支持以连接器的库表/字段或本地CSV导入作为 Schema
              来源，先完成对象类型定义。
            </div>
          </div>
          <div className="cursor-not-allowed rounded-[8px] border border-[#E5E6EB] p-[20px] opacity-60">
            <div className="mb-[12px] text-[16px] font-[500] text-[var(--color-text-1)]">
              建模并导入数据
            </div>
            <div className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
              适用于上游数据已治理完成，可直接导入本体对象表。
            </div>
          </div>
        </div>
      </FormItem>
      <FormItem
        label="Schema来源"
        field="dataSourceType"
        rules={[{ required: true, message: '请选择Schema来源' }]}
      >
        <Radio.Group
          value={dataSource.type}
          onChange={handleDataSourceTypeChange}
        >
          <Radio value={DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC}>
            连接器的库表/字段
          </Radio>
          <Radio value={DATA_SOURCE_TYPE.LOCAL_CSV}>本地CSV导入</Radio>
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
              validator: (value, callback) => {
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
                clearAttributeFields();
                setInitialFileList([]);
              } else {
                setIsReUpload(!!initialCode);
                handleDataSourceFileChange(file);
              }
            }}
            onUploadingChange={() => {
              // 预留上传状态回调，保持 FieldImportUpload 调用签名稳定。
            }}
          />
        </FormItem>
      ) : (
        <>
          <FormItem
            label="连接器"
            field="connector"
            rules={[{ required: true, message: '请选择连接器' }]}
          >
            <Select
              placeholder="请选择连接器"
              loading={connectorsLoading}
              value={selectedConnectorId}
              onChange={(value) => {
                setSelectedConnectorId(value);
                form.setFieldValue('connector', value);
              }}
              options={connectors.map((connector) => ({
                label: `${connector.name} (${connector.dataSourceType})`,
                value: connector.id
              }))}
              allowClear
            />
          </FormItem>
          <FormItem
            label="数据库/表"
            field="databaseTable"
            rules={[
              {
                required: true,
                validator: (value, callback) => {
                  if (
                    dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
                    (!cascaderValue || cascaderValue.length !== 2)
                  ) {
                    callback('请选择数据库/表');
                  } else {
                    callback();
                  }
                }
              }
            ]}
          >
            <div className="flex items-center">
              <Cascader
                placeholder="请选择数据库/表"
                value={cascaderValue.length > 0 ? cascaderValue : undefined}
                filterOption={databaseTableCascaderFilterOption}
                changeOnSelect
                options={cascaderOptions}
                onChange={(value) => {
                  handleCascaderChange(value as string[] | undefined);
                }}
                loadMore={handleCascaderLoadMore}
                allowClear
                dropdownMenuClassName={styles['object-type-cascader-dropdown']}
                renderFormat={(valueShow) => {
                  if (valueShow.length === 0) return '';
                  if (valueShow.length === 1) {
                    return valueShow[0];
                  }
                  return `${valueShow[0]}/${valueShow[1]}`;
                }}
                renderOption={(option) => {
                  const isTableLevel = option.isLeaf === true;

                  if (isTableLevel) {
                    return (
                      <div
                        className={classNames(
                          styles['table-option-with-icon'],
                          'flex w-full items-center justify-between'
                        )}
                      >
                        <EllipsisPopover
                          preferTypography
                          value={option.label}
                          className="min-w-0 flex-1"
                        />
                        <Popover content="详情" position="top" trigger="hover">
                          <IconInfoCircle
                            className="flex-shrink-0 cursor-pointer text-[16px] text-[#86909C] transition-colors hover:text-[#165DFF]"
                            onClick={(e) => {
                              e.stopPropagation();
                              openNewPage(
                                `/onto/tenant/compute/onto/metadataManagement/detail?id=${option.value}&metadataType=ICEBERG`
                              );
                            }}
                          />
                        </Popover>
                      </div>
                    );
                  }

                  return (
                    <EllipsisPopover preferTypography value={option.label} />
                  );
                }}
                showSearch
                dropdownMenuColumnStyle={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                virtualListProps={{
                  threshold: 100,
                  isStaticItemHeight: true
                }}
              />
            </div>
          </FormItem>
        </>
      )}
    </>
  );
}
