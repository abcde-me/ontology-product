import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Popover,
  Radio,
  Space,
  Tooltip
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import {
  connectorTestFinkSQL,
  getSqlConnectorTableSchemaToTIDB
} from '@/api/ontologySceneLibrary/objectType';
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
import {
  sqlSourceDataInfoToSourceDataInfoForTest,
  syncFormStateToOntologyTestSyncStrategy
} from '../../ObjectTypeFormUtils/ontologyTestFinkSQLPayload';
import SqlSourceSelector from '../common/SqlSourceSelector';
import InstanceSyncMappingTable from './InstanceSyncMappingTable';

const FormItem = Form.Item;
const { TextArea } = Input;

type SyncSqlType = 'full' | 'increment';

const STRATEGY_FORM_FIELD_MAP: Partial<
  Record<keyof SyncSourceDataStrategyFormState, string>
> = {
  mode: 'syncMode',
  conflictStrategy: 'conflictStrategy',
  syncScope: 'syncScope',
  pollFetchSize: 'pollFetchSize',
  parallelism: 'parallelism',
  exceptionStrategy: 'exceptionStrategy',
  jdbcCheckpointField: 'jdbcCheckpointField',
  jdbcIncrementalTimeField: 'jdbcIncrementalTimeField',
  jdbcPollingIntervalSeconds: 'jdbcPollingIntervalSeconds',
  jdbcSyncSqlFull: 'jdbcSyncSqlFull',
  jdbcSyncSqlIncrement: 'jdbcSyncSqlIncrement'
};

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
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.status === 0) &&
    (response.code === '' || response.code === 0 || response.code === undefined)
  );
}

function validateSyncSql(sqlText: string): string | undefined {
  const sql = sqlText.trim().replace(/;+\s*$/g, '');
  if (!sql) {
    return '请先输入SQL';
  }
  if (!/^(select|with)\b/i.test(sql)) {
    return 'SQL只支持查询操作，最外层仅支持SELECT语句';
  }
  return undefined;
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
  styles
}: InstanceSyncStepProps) {
  const currentProjectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [sourceFields, setSourceFields] = useState<SourceTableField[]>([]);
  const [sqlTestLoading, setSqlTestLoading] = useState<
    Record<SyncSqlType, boolean>
  >({
    full: false,
    increment: false
  });
  const [sqlTestResult, setSqlTestResult] = useState<
    Partial<
      Record<
        SyncSqlType,
        {
          status: 'succeed' | 'failed';
          message: string;
        }
      >
    >
  >({});
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
        await applyAutoMapping(fields);
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
    void applyAutoMapping(fields);
  };

  const currentQueryMode =
    syncSourceDataStrategy.sourceDataInfo.queryMode || 'selected';
  const isPollingMode = syncSourceDataStrategy.mode === 'JDBC_POLLING';
  const isSqlPolling = currentQueryMode === 'sql' && isPollingMode;

  const executeTestSyncSql = async (type: SyncSqlType) => {
    const sql =
      type === 'full'
        ? syncSourceDataStrategy.jdbcSyncSqlFull || ''
        : syncSourceDataStrategy.jdbcSyncSqlIncrement || '';
    const validationMessage = validateSyncSql(sql);
    if (validationMessage) {
      Message.warning(validationMessage);
      return;
    }
    const connectorId = syncSourceDataStrategy.sourceDataInfo.connectorId;
    if (!connectorId) {
      Message.warning('请先选择数据源链接');
      return;
    }
    if (!currentProjectID) {
      Message.warning('项目信息缺失，请重新登录后重试');
      return;
    }

    const rawSourceDataInfo = sqlSourceDataInfoToSourceDataInfoForTest(
      syncSourceDataStrategy.sourceDataInfo
    );
    if (!rawSourceDataInfo) {
      Message.warning('请先选择数据源链接');
      return;
    }
    const sourceDataInfo = {
      ...rawSourceDataInfo,
      sql: undefined
    };

    setSqlTestLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const response = await connectorTestFinkSQL({
        projectID: currentProjectID,
        sourceDataInfo,
        taskType: 'TABLE_REALTIME_SYNC',
        syncSourceDataStrategy: syncFormStateToOntologyTestSyncStrategy(
          syncSourceDataStrategy
        )
      });
      const passed =
        isSuccessResponse(response) && response.data?.status === 'succeed';
      const message =
        response.data?.message ||
        response.message ||
        (passed ? '测试通过' : '测试失败');
      setSqlTestResult((prev) => ({
        ...prev,
        [type]: {
          status: passed ? 'succeed' : 'failed',
          message
        }
      }));
    } catch (error) {
      console.error('测试同步 SQL 失败:', error);
      setSqlTestResult((prev) => ({
        ...prev,
        [type]: {
          status: 'failed',
          message: '测试失败，请稍后重试'
        }
      }));
    } finally {
      setSqlTestLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderSyncSqlEditor = (
    type: SyncSqlType,
    title: string,
    field: 'jdbcSyncSqlFull' | 'jdbcSyncSqlIncrement',
    placeholder: string
  ) => {
    const value = syncSourceDataStrategy[field] || '';
    const result = sqlTestResult[type];
    const canTest = !!value.trim();

    return (
      <FormItem key={field} label=" " field={field}>
        <div className={styles['sql-editor-wrapper']}>
          <div className={styles['sql-editor-toolbar']}>
            <span className={styles['sql-editor-toolbar-title']}>{title}</span>
            <Tooltip content={!canTest ? `请先输入${title}` : ''}>
              <span>
                <Button
                  type="text"
                  size="small"
                  loading={sqlTestLoading[type]}
                  disabled={!canTest}
                  onClick={() => executeTestSyncSql(type)}
                >
                  测试
                </Button>
              </span>
            </Tooltip>
          </div>
          <TextArea
            placeholder={placeholder}
            value={value}
            autoSize={{ minRows: 6 }}
            onChange={(sql) => {
              updateStrategy(
                field === 'jdbcSyncSqlFull'
                  ? { jdbcSyncSqlFull: sql }
                  : { jdbcSyncSqlIncrement: sql }
              );
              setSqlTestResult((prev) => ({ ...prev, [type]: undefined }));
            }}
          />
          {result && (
            <div className={styles['sql-action-result']}>
              <div className={styles['sql-action-result-header']}>
                <span>测试结果</span>
                <span
                  className={
                    result.status === 'succeed'
                      ? styles['sql-action-result-success']
                      : styles['sql-action-result-failed']
                  }
                >
                  {result.status === 'succeed' ? '通过' : '失败'}
                </span>
              </div>
              <div className={styles['sql-action-result-message']}>
                {result.message}
              </div>
            </div>
          )}
        </div>
      </FormItem>
    );
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
      />

      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        同步策略
      </div>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            同步模式
            <Popover content="选择实例数据同步的触发方式">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        field="syncMode"
        rules={[{ required: true, message: '请选择同步模式' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.mode}
          onChange={(mode) => updateStrategy({ mode })}
        >
          <Radio value="BINLOG_CDC">CDC</Radio>
          <Radio value="JDBC_POLLING">轮询</Radio>
        </Radio.Group>
      </FormItem>

      {isSqlPolling && (
        <>
          {renderSyncSqlEditor(
            'full',
            '全量SQL',
            'jdbcSyncSqlFull',
            '请输入全量SQL，例如 SELECT line_id,voltage_level,maint_org FROM ods_line_assets'
          )}
          {renderSyncSqlEditor(
            'increment',
            '增量SQL',
            'jdbcSyncSqlIncrement',
            '请输入增量SQL，例如 SELECT voltage_level FROM ods_line_assets WHERE voltage_level > 400'
          )}
        </>
      )}

      {isPollingMode && (
        <>
          <FormItem
            label="轮询间隔"
            field="jdbcPollingIntervalSeconds"
            rules={[{ required: true, message: '请输入轮询间隔' }]}
          >
            <Space size={8}>
              <InputNumber
                min={1}
                step={1}
                value={syncSourceDataStrategy.jdbcPollingIntervalSeconds}
                onChange={(jdbcPollingIntervalSeconds) =>
                  updateStrategy({
                    jdbcPollingIntervalSeconds:
                      Number(jdbcPollingIntervalSeconds) || 1
                  })
                }
              />
              <span>秒</span>
            </Space>
          </FormItem>

          <FormItem
            label={
              <span className="inline-flex items-center gap-[4px]">
                单次拉取数量
                <Popover content="单次从数据源拉取的最大实例数量">
                  <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                </Popover>
              </span>
            }
            field="pollFetchSize"
            rules={[{ required: true, message: '请输入单次拉取数量' }]}
          >
            <InputNumber
              min={1}
              step={1}
              value={syncSourceDataStrategy.pollFetchSize}
              onChange={(pollFetchSize) =>
                updateStrategy({ pollFetchSize: Number(pollFetchSize) || 1 })
              }
            />
          </FormItem>

          <FormItem
            label="增量时间列"
            field="jdbcIncrementalTimeField"
            rules={[{ required: true, message: '请输入增量时间列' }]}
          >
            <Input
              placeholder="如update_time, last_modified"
              value={syncSourceDataStrategy.jdbcIncrementalTimeField}
              onChange={(jdbcIncrementalTimeField) =>
                updateStrategy({ jdbcIncrementalTimeField })
              }
            />
          </FormItem>

          <FormItem
            label="断点辅助列"
            field="jdbcCheckpointField"
            rules={[{ required: true, message: '请输入断点辅助列' }]}
          >
            <Input
              placeholder="如id、主键或组合列名"
              value={syncSourceDataStrategy.jdbcCheckpointField}
              onChange={(jdbcCheckpointField) =>
                updateStrategy({ jdbcCheckpointField })
              }
            />
          </FormItem>
        </>
      )}

      <FormItem
        label="冲突策略"
        field="conflictStrategy"
        rules={[{ required: true, message: '请选择冲突策略' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.conflictStrategy}
          onChange={(conflictStrategy) => updateStrategy({ conflictStrategy })}
        >
          <Radio value="KEEP_SOURCE">保留数据源</Radio>
          <Radio value="KEEP_TARGET">保留目标表</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem
        label="同步范围"
        field="syncScope"
        rules={[{ required: true, message: '请选择同步范围' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={(syncScope) => updateStrategy({ syncScope })}
        >
          <Radio value="INCREMENTAL">增量</Radio>
          <Radio value="FULL">全量</Radio>
          <Radio value="FULL_THEN_INCREMENTAL">增量+全量</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem label="并行数" field="parallelism">
        <InputNumber
          min={1}
          step={1}
          value={syncSourceDataStrategy.parallelism}
          onChange={(parallelism) =>
            updateStrategy({ parallelism: Number(parallelism) || 1 })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            异常策略
            <Popover content="同步出现异常时的处理方式">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        field="exceptionStrategy"
        rules={[{ required: true, message: '请选择异常策略' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.exceptionStrategy}
          onChange={(exceptionStrategy) =>
            updateStrategy({ exceptionStrategy })
          }
        >
          <Radio value="STOP_ON_ERROR">立即停止</Radio>
          <Radio value="LOG_ERROR_AND_CONTINUE">继续消费</Radio>
        </Radio.Group>
      </FormItem>

      <InstanceSyncMappingTable
        form={form}
        mappingFields={syncMappingFields}
        setMappingFields={setSyncMappingFields}
        sourceFields={sourceFields}
        loading={fieldsLoading}
        styles={styles}
      />
    </>
  );
}
