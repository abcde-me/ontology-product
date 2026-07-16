import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Select,
  Space
} from '@arco-design/web-react';
import { IconDownload } from '@arco-design/web-react/icon';
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
import SqlSourceSelector from '../common/SqlSourceSelector';
import KafkaMessageParseSettings from './KafkaMessageParseSettings';
import FileParseResultModal from './FileParseResultModal';
import WorkflowSourceSelector from './WorkflowSourceSelector';
import { DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT } from '../../../services/extractObjectTypeFileParse';
import { downloadInstanceSyncCsvTemplate } from '../../../services/buildInstanceSyncCsvTemplate';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface InstanceSyncSourceSectionProps {
  form: any;
  /** 当前 Tab 固定的数据源类型 */
  sourceType: InstanceSyncSourceType;
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
  onWorkflowOutputFieldsReady?: (fields: SourceTableField[]) => void;
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
  sourceType: selectedSourceType,
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
  onWorkflowOutputFieldsReady,
  objectTypeName,
  styles,
  readOnly = false
}: InstanceSyncSourceSectionProps) {
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
    if (selectedSourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE) {
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
  }, [selectedSourceType]);

  useEffect(() => {
    if (selectedSourceType !== INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE) {
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
  }, [selectedSourceType]);

  useEffect(() => {
    if (selectedSourceType !== INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE) {
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
  }, [selectedSourceType]);

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
      selectedSourceType !== INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ||
      !connectorId
    ) {
      setKafkaTopics([]);
      return;
    }

    const shouldAutoSelect = autoSelectKafkaTopicRef.current;
    autoSelectKafkaTopicRef.current = false;
    void applyKafkaConnectorTopics(connectorId, shouldAutoSelect);
  }, [selectedSourceType, syncSourceDataStrategy.messageQueueConnectorId]);

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

  const handleDownloadInstanceSyncTemplate = () => {
    if (readOnly) {
      return;
    }
    if (
      Boolean(syncSourceDataStrategy.instanceCsvFilePath) ||
      csvFileList.length > 0
    ) {
      Message.warning('请先删除已上传的文件后再下载模板');
      return;
    }
    if (!objectTypeAttributes.length) {
      Message.warning('请先在属性信息步骤配置对象类型属性');
      return;
    }
    downloadInstanceSyncCsvTemplate(objectTypeAttributes, objectTypeName);
    Message.success('开始下载导入模板');
  };

  const selectedFileName = fileResources.find(
    (item) => item.id === syncSourceDataStrategy.fileResourceId
  )?.fileName;

  return (
    <>
      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD ? (
        <>
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
            {!readOnly ? (
              <div className={styles['instance-sync-csv-template-row']}>
                <button
                  type="button"
                  className={styles['instance-sync-csv-template-link']}
                  onClick={handleDownloadInstanceSyncTemplate}
                >
                  <IconDownload />
                  下载导入模板(.csv)
                </button>
                <span className={styles['instance-sync-csv-template-tip']}>
                  请先下载模板，填写实例数据后再上传
                </span>
              </div>
            ) : null}
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
              csvFormatHint={`UTF-8 编码，不超过 100MB；第 1 行属性 id、第 2 行属性字段类型、第 3 行属性字段信息，第 4 行起为实例数据`}
              onFileChange={handleCsvFileChange}
              onUploadingChange={() => {
                // 保持 FieldImportUpload 调用签名稳定。
              }}
            />
          </FormItem>
        </>
      ) : null}

      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE ? (
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

      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE ? (
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

      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.DATABASE ? (
        <>
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
        </>
      ) : null}

      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE ? (
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

      {selectedSourceType === INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW ? (
        <>
          <WorkflowSourceSelector
            form={form}
            syncSourceDataStrategy={syncSourceDataStrategy}
            objectTypeAttributes={objectTypeAttributes}
            onStrategyUpdate={onStrategyUpdate}
            onWorkflowOutputFieldsReady={onWorkflowOutputFieldsReady}
            styles={styles}
            readOnly={readOnly}
          />
        </>
      ) : null}
    </>
  );
}
