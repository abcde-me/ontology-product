import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Space
} from '@arco-design/web-react';
import FieldImportUpload from '@/pages/ontologyScene/components/FieldImportUpload';
import { PrefixAimdp } from '@/api/endpoints';
import {
  INSTANCE_SYNC_SOURCE_TYPE,
  InstanceSyncSourceType,
  KAFKA_MESSAGE_PARSE_MODE,
  KAFKA_TOPIC_LABEL,
  KAFKA_TOPIC_REQUIRED_MESSAGE,
  KAFKA_TOPIC_SELECT_PLACEHOLDER
} from '@/pages/ontologyScene/common/constants';
import { fetchFileResourceList } from '@/pages/dataResource/services/fileApi';
import {
  fetchKafkaConnectorTopics,
  fetchOntologyApiConnectors,
  fetchOntologyKafkaConnectors,
  formatSqlConnectorSelectLabel
} from '../../../services/ontologySqlConnectorService';
import {
  buildKafkaTopicSelectOptions,
  normalizeKafkaTopicName,
  sanitizeKafkaTopicList
} from '../../../services/kafkaTopicNames';
import type {
  ConnectorAnalyseFinkSqlColumnItem,
  SqlConnectorItem
} from '@/types/objectType';
import type { FileResourceListItem } from '@/pages/dataResource/types';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import {
  getDefaultSyncStrategyPatchForSourceType,
  normalizeApiSyncStrategyFields,
  normalizeCsvSyncStrategyFields,
  normalizeMessageQueueSyncStrategyFields
} from '../common/instanceSyncStrategyConfig';
import SqlSourceSelector from '../common/SqlSourceSelector';
import KafkaMessageParseSettings from './KafkaMessageParseSettings';
import FileParseResultModal from './FileParseResultModal';
import { DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT } from '../../../services/extractObjectTypeFileParse';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface InstanceSyncSourceSectionProps {
  form: any;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  setSyncMappingFields?: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  onSourceDataInfoChange: (sourceDataInfo: SqlSourceDataInfo) => void;
  onTableSelected?: (
    value: Required<
      Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
    > & {
      projectID: string;
    }
  ) => void;
  onSqlColumnsParsed?: (columns: ConnectorAnalyseFinkSqlColumnItem[]) => void;
  onCsvColumnsParsed?: (fields: SourceTableField[]) => void;
  onKafkaParseFieldsReady?: (fields: SourceTableField[]) => void;
  onSourceTypeChange?: () => void;
  objectTypeName?: string;
  styles: Record<string, string>;
  readOnly?: boolean;
}

function csvUploadResponseToSourceFields(responseData: {
  columnList?: string[];
  commentList?: string[];
  typeList?: string[];
}): SourceTableField[] {
  const columnList = responseData.columnList || [];
  const commentList = responseData.commentList || [];
  const typeList = responseData.typeList || [];
  return columnList.map((fieldId, index) => ({
    fieldId,
    fieldComment: commentList[index] || fieldId,
    fieldType: typeList[index] || 'varchar'
  }));
}

export default function InstanceSyncSourceSection({
  form,
  syncSourceDataStrategy,
  syncMappingFields = [],
  objectTypeAttributes = [],
  setSyncMappingFields,
  onStrategyUpdate,
  onSourceDataInfoChange,
  onTableSelected,
  onSqlColumnsParsed,
  onCsvColumnsParsed,
  onKafkaParseFieldsReady,
  onSourceTypeChange,
  objectTypeName,
  styles,
  readOnly = false
}: InstanceSyncSourceSectionProps) {
  const sourceType =
    syncSourceDataStrategy.instanceSyncSourceType ||
    INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
  const [fileResources, setFileResources] = useState<FileResourceListItem[]>(
    []
  );
  const [fileResourcesLoading, setFileResourcesLoading] = useState(false);
  const [kafkaConnectors, setKafkaConnectors] = useState<SqlConnectorItem[]>(
    []
  );
  const [apiConnectors, setApiConnectors] = useState<SqlConnectorItem[]>([]);
  const [kafkaConnectorsLoading, setKafkaConnectorsLoading] = useState(false);
  const [kafkaTopics, setKafkaTopics] = useState<string[]>([]);
  const [kafkaTopicsLoading, setKafkaTopicsLoading] = useState(false);
  const [apiConnectorsLoading, setApiConnectorsLoading] = useState(false);
  const [csvFileList, setCsvFileList] = useState<any[]>([]);
  const [fileParseModalVisible, setFileParseModalVisible] = useState(false);
  const autoSelectKafkaTopicRef = useRef(false);

  useEffect(() => {
    if (sourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE) {
      return;
    }

    const loadKafkaConnectors = async () => {
      setKafkaConnectorsLoading(true);
      try {
        const items = await fetchOntologyKafkaConnectors();
        setKafkaConnectors(items);
      } catch (error) {
        console.error('加载消息队列连接失败:', error);
        Message.error('加载消息队列连接失败');
        setKafkaConnectors([]);
      } finally {
        setKafkaConnectorsLoading(false);
      }
    };

    void loadKafkaConnectors();
  }, [sourceType]);

  useEffect(() => {
    if (sourceType !== INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE) {
      return;
    }

    const loadApiConnectors = async () => {
      setApiConnectorsLoading(true);
      try {
        const items = await fetchOntologyApiConnectors();
        setApiConnectors(items);
      } catch (error) {
        console.error('加载 API 连接失败:', error);
        Message.error('加载 API 连接失败');
        setApiConnectors([]);
      } finally {
        setApiConnectorsLoading(false);
      }
    };

    void loadApiConnectors();
  }, [sourceType]);

  useEffect(() => {
    if (sourceType !== INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE) {
      return;
    }

    const loadFileResources = async () => {
      setFileResourcesLoading(true);
      try {
        const response = await fetchFileResourceList({
          pageNo: 1,
          pageSize: 200
        });
        setFileResources(response.items || []);
      } catch (error) {
        console.error('加载文件资源失败:', error);
        setFileResources([]);
      } finally {
        setFileResourcesLoading(false);
      }
    };

    void loadFileResources();
  }, [sourceType]);

  useEffect(() => {
    const filePath = syncSourceDataStrategy.instanceCsvFilePath?.trim();
    if (!filePath) {
      setCsvFileList([]);
      return;
    }
    const fileName = filePath.split('/').pop() || filePath;
    setCsvFileList([
      {
        uid: `sync-instance-csv-${fileName}`,
        name: fileName
      }
    ]);
  }, [syncSourceDataStrategy.instanceCsvFilePath]);

  const handleSourceTypeChange = (nextType: InstanceSyncSourceType) => {
    const defaultStrategyPatch =
      getDefaultSyncStrategyPatchForSourceType(nextType);
    const sourceTypeStrategyPatch =
      nextType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
        ? normalizeMessageQueueSyncStrategyFields({
            mode: defaultStrategyPatch?.mode,
            syncScope: defaultStrategyPatch?.syncScope,
            exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
          })
        : nextType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
          ? normalizeApiSyncStrategyFields({
              mode: defaultStrategyPatch?.mode,
              syncScope: defaultStrategyPatch?.syncScope,
              exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
            })
          : nextType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
            ? normalizeCsvSyncStrategyFields({
                mode: defaultStrategyPatch?.mode,
                syncScope: defaultStrategyPatch?.syncScope,
                exceptionStrategy: defaultStrategyPatch?.exceptionStrategy
              })
            : {};
    onStrategyUpdate({
      ...(defaultStrategyPatch || {}),
      ...sourceTypeStrategyPatch,
      instanceSyncSourceType: nextType,
      instanceCsvFilePath: undefined,
      messageQueueConnectorId: undefined,
      messageQueueTopic: undefined,
      messageQueueParseMode: undefined,
      messageQueueStructuredParseRule: undefined,
      messageQueueMaxFlattenDepth: undefined,
      messageQueueArrayHandleMode: undefined,
      messageQueueAiRulePrompt: undefined,
      messageQueueAiRuleContent: undefined,
      messageQueueAiRuleSavedAt: undefined,
      messageQueueParseResultFields: undefined,
      apiConnectorId: undefined,
      apiIncrementalTimeParam: undefined,
      apiCheckpointParam: undefined,
      apiIncrementalMarkerField: undefined,
      apiPageSizeParam: undefined,
      apiPageNumParam: undefined,
      apiTotalCountParam: undefined,
      apiStartPageNum: undefined,
      fileResourceId: undefined,
      fileParseRequirement:
        nextType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
          ? DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT
          : undefined,
      fileParseResultRows: undefined,
      fileParseResultRunKey: undefined,
      sourceDataInfo: { queryMode: 'selected' }
    });
    form.setFieldsValue({
      ...(defaultStrategyPatch
        ? {
            syncMode: sourceTypeStrategyPatch.mode ?? defaultStrategyPatch.mode,
            conflictStrategy: defaultStrategyPatch.conflictStrategy,
            syncScope:
              sourceTypeStrategyPatch.syncScope ??
              defaultStrategyPatch.syncScope,
            pollFetchSize: defaultStrategyPatch.pollFetchSize,
            parallelism: defaultStrategyPatch.parallelism,
            exceptionStrategy:
              sourceTypeStrategyPatch.exceptionStrategy ??
              defaultStrategyPatch.exceptionStrategy,
            jdbcPollingIntervalSeconds:
              defaultStrategyPatch.jdbcPollingIntervalSeconds
          }
        : {}),
      syncSourceType: nextType,
      syncInstanceCsvFile: undefined,
      syncMessageQueueConnector: undefined,
      syncMessageQueueTopic: undefined,
      syncMessageQueueParseMode: undefined,
      syncMessageQueueStructuredParseRule: undefined,
      syncMessageQueueMaxFlattenDepth: undefined,
      syncMessageQueueArrayHandleMode: undefined,
      syncMessageQueueAiRulePrompt: undefined,
      syncMessageQueueAiRuleContent: undefined,
      syncMessageQueueAiRuleSavedAt: undefined,
      syncApiConnector: undefined,
      syncFileResourceId: undefined,
      syncFileParseRequirement:
        nextType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
          ? DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT
          : undefined,
      syncConnector: undefined,
      syncDatabaseTable: undefined,
      syncSql: undefined,
      syncQueryMode: 'selected'
    });
    onSourceTypeChange?.();
  };

  const handleCsvFileChange = (fileData: any) => {
    if (!fileData || (Array.isArray(fileData) && fileData.length === 0)) {
      onStrategyUpdate({ instanceCsvFilePath: undefined });
      form.setFieldValue('syncInstanceCsvFile', undefined);
      onCsvColumnsParsed?.([]);
      setCsvFileList([]);
      return;
    }

    const responseData =
      Array.isArray(fileData) && fileData.length > 0 ? fileData[0] : fileData;

    if (responseData?.path) {
      onStrategyUpdate({ instanceCsvFilePath: responseData.path });
      form.setFieldValue('syncInstanceCsvFile', responseData.path);
      if (responseData.columnList?.length) {
        onCsvColumnsParsed?.(csvUploadResponseToSourceFields(responseData));
      }
    }
  };

  const hasKafkaConnector = Boolean(
    syncSourceDataStrategy.messageQueueConnectorId
  );
  const hasApiConnector = Boolean(syncSourceDataStrategy.apiConnectorId);

  const normalizedMessageQueueTopic = useMemo(
    () => normalizeKafkaTopicName(syncSourceDataStrategy.messageQueueTopic),
    [syncSourceDataStrategy.messageQueueTopic]
  );

  const kafkaTopicOptions = useMemo(
    () =>
      buildKafkaTopicSelectOptions(kafkaTopics, normalizedMessageQueueTopic),
    [kafkaTopics, normalizedMessageQueueTopic]
  );

  useEffect(() => {
    const current = syncSourceDataStrategy.messageQueueTopic?.trim();
    const normalized = normalizeKafkaTopicName(current);
    if (!current || !normalized || current === normalized) {
      return;
    }
    onStrategyUpdate({ messageQueueTopic: normalized });
    form.setFieldValue('syncMessageQueueTopic', normalized);
  }, [syncSourceDataStrategy.messageQueueTopic, form, onStrategyUpdate]);

  const applyKafkaConnectorTopics = async (
    connectorId: number,
    autoSelectDefault: boolean
  ) => {
    setKafkaTopicsLoading(true);
    try {
      const { topics, defaultTopic } =
        await fetchKafkaConnectorTopics(connectorId);
      setKafkaTopics(sanitizeKafkaTopicList(topics));
      if (autoSelectDefault && defaultTopic) {
        onStrategyUpdate({ messageQueueTopic: defaultTopic });
        form.setFieldValue('syncMessageQueueTopic', defaultTopic);
      }
    } catch (error) {
      console.error('加载 Kafka Topic 失败:', error);
      Message.error('加载 Kafka Topic 失败');
      setKafkaTopics([]);
    } finally {
      setKafkaTopicsLoading(false);
    }
  };

  useEffect(() => {
    const connectorId = syncSourceDataStrategy.messageQueueConnectorId;
    if (
      sourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ||
      !connectorId
    ) {
      setKafkaTopics([]);
      return;
    }

    const shouldAutoSelect = autoSelectKafkaTopicRef.current;
    autoSelectKafkaTopicRef.current = false;
    void applyKafkaConnectorTopics(connectorId, shouldAutoSelect);
  }, [sourceType, syncSourceDataStrategy.messageQueueConnectorId]);

  const handleFileResourceChange = (fileResourceId?: string) => {
    onStrategyUpdate({
      fileResourceId,
      fileParseResultRows: undefined,
      fileParseResultRunKey: undefined
    });
    form.setFieldValue('syncFileResourceId', fileResourceId);
    onCsvColumnsParsed?.([]);
  };

  const handleFileParseRequirementChange = (value: string) => {
    onStrategyUpdate({
      fileParseRequirement: value,
      fileParseResultRows: undefined,
      fileParseResultRunKey: undefined
    });
    form.setFieldValue('syncFileParseRequirement', value);
  };

  const applyFileParseSourceFields = () => {
    if (!objectTypeAttributes.length) {
      return;
    }
    onCsvColumnsParsed?.(
      objectTypeAttributes.map((attribute) => ({
        fieldId: attribute.propertyID,
        fieldComment: attribute.propertyComment || attribute.propertyID,
        fieldType: attribute.propertyType || 'varchar'
      }))
    );
  };

  const handleSaveFileParseResult = (payload: {
    rows: Record<string, string>[];
    runKey: string;
  }) => {
    onStrategyUpdate({
      fileParseResultRows: payload.rows,
      fileParseResultRunKey: payload.runKey
    });
    applyFileParseSourceFields();
  };

  const handleOpenFileParseResult = async () => {
    if (!syncSourceDataStrategy.fileResourceId?.trim()) {
      Message.warning('请先选择解析文件');
      return;
    }
    if (!objectTypeAttributes.length) {
      Message.warning('请先在属性信息步骤配置对象类型属性');
      return;
    }

    try {
      await form.validate(['syncFileResourceId', 'syncFileParseRequirement']);
    } catch {
      return;
    }

    setFileParseModalVisible(true);
  };

  const selectedFileName = fileResources.find(
    (item) => item.id === syncSourceDataStrategy.fileResourceId
  )?.fileName;

  return (
    <>
      <FormItem
        label="数据源类型"
        field="syncSourceType"
        rules={[{ required: true, message: '请选择数据源类型' }]}
        initialValue={INSTANCE_SYNC_SOURCE_TYPE.DATABASE}
      >
        <Radio.Group
          value={sourceType}
          disabled={readOnly}
          onChange={handleSourceTypeChange}
        >
          <Radio value={INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD}>CSV上传</Radio>
          <Radio value={INSTANCE_SYNC_SOURCE_TYPE.DATABASE}>数据库</Radio>
          <Radio value={INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE}>
            消息队列
          </Radio>
          <Radio value={INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE}>API接口</Radio>
          <Radio value={INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE}>文件解析</Radio>
        </Radio.Group>
      </FormItem>

      {sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD ? (
        <FormItem
          label="实例数据文件"
          field="syncInstanceCsvFile"
          rules={[
            {
              required: true,
              validator: (_value, callback) => {
                if (!syncSourceDataStrategy.instanceCsvFilePath?.trim()) {
                  callback('请上传CSV文件');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <FieldImportUpload
            accept=".csv"
            fileType="csv"
            maxSize={100}
            customAction={`${PrefixAimdp}/UploadOntologyEntityDataFile`}
            fileList={csvFileList}
            disabled={readOnly}
            showTemplateLinks={false}
            hasUploadedFile={
              Boolean(syncSourceDataStrategy.instanceCsvFilePath) ||
              csvFileList.length > 0
            }
            onFileChange={handleCsvFileChange}
            onUploadingChange={() => {
              // 保持 FieldImportUpload 调用签名稳定。
            }}
          />
        </FormItem>
      ) : null}

      {sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ? (
        <>
          <FormItem
            label="数据源连接"
            field="syncMessageQueueConnector"
            rules={[{ required: true, message: '请选择消息队列连接' }]}
          >
            <Select
              className={styles['modeling-borderless-control']}
              placeholder="请选择消息队列连接"
              loading={kafkaConnectorsLoading}
              value={syncSourceDataStrategy.messageQueueConnectorId}
              disabled={readOnly}
              allowClear
              showSearch
              onChange={(connectorId) => {
                const numeric =
                  connectorId === undefined ||
                  connectorId === null ||
                  connectorId === ''
                    ? undefined
                    : Number(connectorId);
                const normalized = Number.isFinite(numeric)
                  ? numeric
                  : undefined;
                if (!normalized) {
                  onStrategyUpdate({
                    messageQueueConnectorId: undefined,
                    messageQueueTopic: undefined,
                    messageQueueParseMode: undefined,
                    messageQueueStructuredParseRule: undefined,
                    messageQueueMaxFlattenDepth: undefined,
                    messageQueueArrayHandleMode: undefined,
                    messageQueueAiRulePrompt: undefined,
                    messageQueueAiRuleContent: undefined,
                    messageQueueAiRuleSavedAt: undefined
                  });
                  form.setFieldsValue({
                    syncMessageQueueConnector: undefined,
                    syncMessageQueueTopic: undefined,
                    syncMessageQueueParseMode: undefined,
                    syncMessageQueueStructuredParseRule: undefined,
                    syncMessageQueueMaxFlattenDepth: undefined,
                    syncMessageQueueArrayHandleMode: undefined,
                    syncMessageQueueAiRulePrompt: undefined,
                    syncMessageQueueAiRuleContent: undefined,
                    syncMessageQueueAiRuleSavedAt: undefined
                  });
                  setKafkaTopics([]);
                  return;
                }
                const parseMode =
                  syncSourceDataStrategy.messageQueueParseMode ||
                  KAFKA_MESSAGE_PARSE_MODE.NONE;
                onStrategyUpdate({
                  messageQueueConnectorId: normalized,
                  messageQueueTopic: undefined,
                  messageQueueParseMode: parseMode
                });
                form.setFieldsValue({
                  syncMessageQueueConnector: normalized,
                  syncMessageQueueTopic: undefined,
                  syncMessageQueueParseMode: parseMode
                });
                autoSelectKafkaTopicRef.current = true;
              }}
              options={kafkaConnectors.map((connector) => ({
                label: formatSqlConnectorSelectLabel(
                  connector.name,
                  connector.subtype || 'Kafka'
                ),
                value: connector.id
              }))}
            />
          </FormItem>
          <FormItem
            label={
              <span className={styles['kafka-topic-label']} translate="no">
                {KAFKA_TOPIC_LABEL}
              </span>
            }
            field="syncMessageQueueTopic"
            rules={[{ required: true, message: KAFKA_TOPIC_REQUIRED_MESSAGE }]}
            normalize={(value) => {
              if (value === undefined || value === null || value === '') {
                return undefined;
              }
              return normalizeKafkaTopicName(String(value));
            }}
          >
            <Select
              className={`${styles['modeling-borderless-control']} ${styles['kafka-topic-select']}`}
              translate="no"
              dropdownMenuClassName={styles['kafka-topic-dropdown']}
              placeholder={
                hasKafkaConnector
                  ? KAFKA_TOPIC_SELECT_PLACEHOLDER
                  : '请先选择消息队列连接'
              }
              disabled={readOnly || !hasKafkaConnector}
              loading={kafkaTopicsLoading}
              allowClear
              showSearch
              filterOption={(inputValue, option) => {
                const keyword = String(inputValue ?? '')
                  .trim()
                  .toLowerCase();
                if (!keyword) {
                  return true;
                }
                const value = String(option.props?.value ?? '').toLowerCase();
                const label = String(
                  option.props?.children ?? ''
                ).toLowerCase();
                return value.includes(keyword) || label.includes(keyword);
              }}
              onChange={(topic) => {
                const normalized = normalizeKafkaTopicName(
                  topic === undefined || topic === null || topic === ''
                    ? undefined
                    : String(topic)
                );
                onStrategyUpdate({ messageQueueTopic: normalized });
                form.setFieldValue('syncMessageQueueTopic', normalized);
              }}
            >
              {kafkaTopicOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <span
                    className={styles['kafka-topic-option-label']}
                    translate="no"
                  >
                    {option.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </FormItem>
          {hasKafkaConnector ? (
            <KafkaMessageParseSettings
              form={form}
              syncSourceDataStrategy={syncSourceDataStrategy}
              syncMappingFields={syncMappingFields}
              objectTypeAttributes={objectTypeAttributes}
              setSyncMappingFields={setSyncMappingFields}
              onStrategyUpdate={onStrategyUpdate}
              styles={styles}
              readOnly={readOnly}
              onKafkaParseFieldsReady={onKafkaParseFieldsReady}
            />
          ) : null}
        </>
      ) : null}

      {sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE ? (
        <>
          <FormItem
            label="数据源连接"
            field="syncApiConnector"
            rules={[{ required: true, message: '请选择 API 连接' }]}
          >
            <Select
              className={styles['modeling-borderless-control']}
              placeholder="请选择 API 连接"
              loading={apiConnectorsLoading}
              value={syncSourceDataStrategy.apiConnectorId}
              disabled={readOnly}
              allowClear
              showSearch
              onChange={(connectorId) => {
                const numeric =
                  connectorId === undefined ||
                  connectorId === null ||
                  connectorId === ''
                    ? undefined
                    : Number(connectorId);
                const normalized = Number.isFinite(numeric)
                  ? numeric
                  : undefined;
                if (!normalized) {
                  onStrategyUpdate({
                    apiConnectorId: undefined,
                    messageQueueParseMode: undefined,
                    messageQueueStructuredParseRule: undefined,
                    messageQueueMaxFlattenDepth: undefined,
                    messageQueueArrayHandleMode: undefined,
                    messageQueueAiRulePrompt: undefined,
                    messageQueueAiRuleContent: undefined,
                    messageQueueAiRuleSavedAt: undefined,
                    messageQueueParseResultFields: undefined
                  });
                  form.setFieldsValue({
                    syncApiConnector: undefined,
                    syncMessageQueueParseMode: undefined,
                    syncMessageQueueStructuredParseRule: undefined,
                    syncMessageQueueMaxFlattenDepth: undefined,
                    syncMessageQueueArrayHandleMode: undefined,
                    syncMessageQueueAiRulePrompt: undefined,
                    syncMessageQueueAiRuleContent: undefined,
                    syncMessageQueueAiRuleSavedAt: undefined
                  });
                  return;
                }
                const parseMode =
                  syncSourceDataStrategy.messageQueueParseMode ||
                  KAFKA_MESSAGE_PARSE_MODE.NONE;
                onStrategyUpdate({
                  apiConnectorId: normalized,
                  messageQueueParseMode: parseMode
                });
                form.setFieldsValue({
                  syncApiConnector: normalized,
                  syncMessageQueueParseMode: parseMode
                });
              }}
              options={apiConnectors.map((connector) => ({
                label: formatSqlConnectorSelectLabel(
                  connector.name,
                  connector.subtype || 'API'
                ),
                value: connector.id
              }))}
            />
          </FormItem>
          {hasApiConnector ? (
            <KafkaMessageParseSettings
              form={form}
              syncSourceDataStrategy={syncSourceDataStrategy}
              syncMappingFields={syncMappingFields}
              objectTypeAttributes={objectTypeAttributes}
              setSyncMappingFields={setSyncMappingFields}
              onStrategyUpdate={onStrategyUpdate}
              styles={styles}
              readOnly={readOnly}
              onKafkaParseFieldsReady={onKafkaParseFieldsReady}
            />
          ) : null}
        </>
      ) : null}

      {sourceType === INSTANCE_SYNC_SOURCE_TYPE.DATABASE ? (
        <SqlSourceSelector
          form={form}
          value={syncSourceDataStrategy.sourceDataInfo}
          onChange={onSourceDataInfoChange}
          onTableSelected={onTableSelected}
          onSqlColumnsParsed={onSqlColumnsParsed}
          fieldPrefix="sync"
          styles={styles}
          ontologySqlTestTaskType="TABLE_REALTIME_SYNC"
          syncSourceDataStrategyForSqlTest={syncSourceDataStrategy}
          readOnly={readOnly}
        />
      ) : null}

      {sourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE ? (
        <>
          <FormItem
            label="解析文件"
            field="syncFileResourceId"
            rules={[{ required: true, message: '请选择解析文件' }]}
          >
            <Select
              className={styles['modeling-borderless-control']}
              placeholder="请选择文件资源"
              loading={fileResourcesLoading}
              value={syncSourceDataStrategy.fileResourceId}
              disabled={readOnly}
              allowClear
              showSearch
              onChange={handleFileResourceChange}
              options={fileResources.map((item) => ({
                label: `${item.fileName} (${item.fileFormat})`,
                value: item.id
              }))}
            />
          </FormItem>

          <FormItem
            label="提取要求"
            field="syncFileParseRequirement"
            initialValue={DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT}
            rules={[
              { required: true, message: '请填写提取要求' },
              { minLength: 4, message: '提取要求至少 4 个字符' }
            ]}
            extra="实例提取将按当前对象类型的属性结构进行解析，结果可用于实例同步映射"
          >
            <TextArea
              placeholder="例如：按照对象类型属性提取文档中的业务实例"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              showWordLimit
              disabled={readOnly}
              value={
                syncSourceDataStrategy.fileParseRequirement ??
                DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT
              }
              onChange={handleFileParseRequirementChange}
            />
          </FormItem>

          <FormItem label=" ">
            <Space>
              <Button
                type="outline"
                disabled={
                  readOnly ||
                  !syncSourceDataStrategy.fileResourceId ||
                  !objectTypeAttributes.length
                }
                onClick={() => void handleOpenFileParseResult()}
              >
                查看解析结果
              </Button>
            </Space>
          </FormItem>

          <FileParseResultModal
            visible={fileParseModalVisible}
            fileResourceId={syncSourceDataStrategy.fileResourceId}
            fileName={selectedFileName}
            objectTypeName={objectTypeName}
            objectTypeAttributes={objectTypeAttributes}
            requirement={syncSourceDataStrategy.fileParseRequirement}
            savedRows={syncSourceDataStrategy.fileParseResultRows}
            savedRunKey={syncSourceDataStrategy.fileParseResultRunKey}
            readOnly={readOnly}
            onClose={() => setFileParseModalVisible(false)}
            onSave={handleSaveFileParseResult}
          />
        </>
      ) : null}
    </>
  );
}
