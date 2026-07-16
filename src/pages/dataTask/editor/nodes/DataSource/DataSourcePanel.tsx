import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tooltip
} from '@arco-design/web-react';
import { IconEye } from '@arco-design/web-react/icon';
import { useNodeDataUpdate } from '@ceai-front/workflow';
import SqlSourceSelector from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/SqlSourceSelector';
import type { SqlSourceDataInfo } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import {
  fetchKafkaConnectorTopics,
  fetchOntologyApiConnectors,
  fetchOntologyKafkaConnectors,
  formatSqlConnectorSelectLabel
} from '@/pages/ontologyScene/modules/objectType/services/ontologySqlConnectorService';
import {
  buildKafkaTopicSelectOptions,
  normalizeKafkaTopicName,
  sanitizeKafkaTopicList
} from '@/pages/ontologyScene/modules/objectType/services/kafkaTopicNames';
import {
  KAFKA_TOPIC_LABEL,
  KAFKA_TOPIC_REQUIRED_MESSAGE,
  KAFKA_TOPIC_SELECT_PLACEHOLDER
} from '@/pages/ontologyScene/common/constants';
import type { SqlConnectorItem } from '@/types/objectType';
import {
  DATA_TASK_SOURCE_TYPE,
  DATA_TASK_SOURCE_TYPE_LABEL,
  type DataTaskSourceType
} from '@/pages/dataTask/constants/dataSourceTypes';
import type { DataSourceNodeConfig } from '@/pages/dataTask/types';
import {
  canPreviewDataSource,
  getPreviewDisabledReason
} from '@/pages/dataTask/services/previewDataSource';
import DocumentFileUpload from './DocumentFileUpload';
import DataSourcePreviewModal from './DataSourcePreviewModal';
import styles from './DataSourcePanel.module.scss';

const EMPTY_STYLES: Record<string, string> = {};

const getDefaultSourceDataInfo = (): SqlSourceDataInfo => ({
  queryMode: 'selected'
});

const normalizeNodeData = (
  data: Record<string, unknown>
): DataSourceNodeConfig => ({
  sourceName: String(data.sourceName ?? ''),
  sourceType:
    (data.sourceType as DataTaskSourceType) ?? DATA_TASK_SOURCE_TYPE.DATABASE,
  documentFilePath: data.documentFilePath as string | undefined,
  documentFileName: data.documentFileName as string | undefined,
  sourceDataInfo:
    (data.sourceDataInfo as SqlSourceDataInfo) ?? getDefaultSourceDataInfo(),
  messageQueueConnectorId: data.messageQueueConnectorId as number | undefined,
  messageQueueConnectorName: data.messageQueueConnectorName as
    | string
    | undefined,
  messageQueueTopic: data.messageQueueTopic as string | undefined,
  apiConnectorId: data.apiConnectorId as number | undefined,
  apiConnectorName: data.apiConnectorName as string | undefined
});

interface DataSourcePanelProps {
  id: string;
  data: Record<string, unknown>;
}

export default function DataSourcePanel({ id, data }: DataSourcePanelProps) {
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const [form] = Form.useForm();
  const nodeData = useMemo(() => normalizeNodeData(data), [data]);
  const sourceType = nodeData.sourceType;

  const [kafkaConnectors, setKafkaConnectors] = useState<SqlConnectorItem[]>(
    []
  );
  const [apiConnectors, setApiConnectors] = useState<SqlConnectorItem[]>([]);
  const [kafkaConnectorsLoading, setKafkaConnectorsLoading] = useState(false);
  const [apiConnectorsLoading, setApiConnectorsLoading] = useState(false);
  const [kafkaTopics, setKafkaTopics] = useState<string[]>([]);
  const [kafkaTopicsLoading, setKafkaTopicsLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const autoSelectKafkaTopicRef = useRef(false);

  const patchNodeData = useCallback(
    (patch: Partial<DataSourceNodeConfig>) => {
      handleNodeDataUpdate({
        id,
        data: {
          ...data,
          ...patch
        }
      });
    },
    [data, handleNodeDataUpdate, id]
  );

  useEffect(() => {
    form.setFieldsValue({
      sourceName: nodeData.sourceName,
      sourceType: nodeData.sourceType,
      documentFile: nodeData.documentFilePath,
      messageQueueConnector: nodeData.messageQueueConnectorId,
      messageQueueTopic: nodeData.messageQueueTopic,
      apiConnector: nodeData.apiConnectorId
    });
  }, [form, nodeData]);

  useEffect(() => {
    if (sourceType !== DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
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
    if (sourceType !== DATA_TASK_SOURCE_TYPE.API) {
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

  const normalizedMessageQueueTopic = useMemo(
    () => normalizeKafkaTopicName(nodeData.messageQueueTopic),
    [nodeData.messageQueueTopic]
  );

  const kafkaTopicOptions = useMemo(
    () =>
      buildKafkaTopicSelectOptions(kafkaTopics, normalizedMessageQueueTopic),
    [kafkaTopics, normalizedMessageQueueTopic]
  );

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
        patchNodeData({ messageQueueTopic: defaultTopic });
        form.setFieldValue('messageQueueTopic', defaultTopic);
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
    const connectorId = nodeData.messageQueueConnectorId;
    if (sourceType !== DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE || !connectorId) {
      setKafkaTopics([]);
      return;
    }

    const shouldAutoSelect = autoSelectKafkaTopicRef.current;
    autoSelectKafkaTopicRef.current = false;
    void applyKafkaConnectorTopics(connectorId, shouldAutoSelect);
  }, [nodeData.messageQueueConnectorId, sourceType]);

  const handleSourceTypeChange = (nextType: DataTaskSourceType) => {
    patchNodeData({
      sourceType: nextType,
      documentFilePath: undefined,
      documentFileName: undefined,
      sourceDataInfo: getDefaultSourceDataInfo(),
      messageQueueConnectorId: undefined,
      messageQueueConnectorName: undefined,
      messageQueueTopic: undefined,
      apiConnectorId: undefined,
      apiConnectorName: undefined
    });
    form.setFieldsValue({
      sourceType: nextType,
      documentFile: undefined,
      messageQueueConnector: undefined,
      messageQueueTopic: undefined,
      apiConnector: undefined
    });
    setKafkaTopics([]);
  };

  const handleSourceDataInfoChange = (sourceDataInfo: SqlSourceDataInfo) => {
    patchNodeData({ sourceDataInfo });
  };

  const hasKafkaConnector = Boolean(nodeData.messageQueueConnectorId);
  const canPreview = canPreviewDataSource(nodeData);
  const previewDisabledReason = getPreviewDisabledReason(nodeData);

  return (
    <div className={styles['data-source-panel']}>
      <div className={styles['panel-header']}>
        <div className={styles['panel-header-title']}>数据源配置</div>
        <Tooltip content={canPreview ? '预览样本数据' : previewDisabledReason}>
          <span>
            <Button
              type="outline"
              size="small"
              icon={<IconEye />}
              disabled={!canPreview}
              onClick={() => setPreviewVisible(true)}
            >
              预览
            </Button>
          </span>
        </Tooltip>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item label="数据源名称" field="sourceName">
          <Input
            placeholder="请输入数据源名称（可选）"
            value={nodeData.sourceName}
            onChange={(value) => patchNodeData({ sourceName: value })}
          />
        </Form.Item>

        <Form.Item
          label="数据源类型"
          field="sourceType"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Radio.Group value={sourceType} onChange={handleSourceTypeChange}>
            {Object.entries(DATA_TASK_SOURCE_TYPE_LABEL).map(
              ([value, label]) => (
                <Radio key={value} value={value}>
                  {label}
                </Radio>
              )
            )}
          </Radio.Group>
        </Form.Item>

        {sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT ? (
          <Form.Item
            label="文档文件"
            field="documentFile"
            rules={[
              {
                required: true,
                validator: (_value, callback) => {
                  if (!nodeData.documentFilePath?.trim()) {
                    callback('请上传文档文件');
                    return;
                  }
                  callback();
                }
              }
            ]}
            extra="支持 CSV、TXT、PDF、Word、Excel 等文档格式"
          >
            <DocumentFileUpload
              value={nodeData.documentFilePath}
              fileName={nodeData.documentFileName}
              onChange={(payload) => {
                if (!payload) {
                  patchNodeData({
                    documentFilePath: undefined,
                    documentFileName: undefined
                  });
                  form.setFieldValue('documentFile', undefined);
                  return;
                }

                patchNodeData({
                  documentFilePath: payload.path,
                  documentFileName: payload.name
                });
                form.setFieldValue('documentFile', payload.path);
              }}
            />
          </Form.Item>
        ) : null}

        {sourceType === DATA_TASK_SOURCE_TYPE.DATABASE ? (
          <SqlSourceSelector
            form={form}
            value={nodeData.sourceDataInfo ?? getDefaultSourceDataInfo()}
            onChange={handleSourceDataInfoChange}
            fieldPrefix="dataSource"
            styles={EMPTY_STYLES}
            ontologySqlTestTaskType="TABLE_REALTIME_SYNC"
          />
        ) : null}

        {sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE ? (
          <>
            <Form.Item
              label="数据源连接"
              field="messageQueueConnector"
              rules={[{ required: true, message: '请选择消息队列连接' }]}
            >
              <Select
                placeholder="请选择消息队列连接"
                loading={kafkaConnectorsLoading}
                value={nodeData.messageQueueConnectorId}
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
                    patchNodeData({
                      messageQueueConnectorId: undefined,
                      messageQueueConnectorName: undefined,
                      messageQueueTopic: undefined
                    });
                    form.setFieldsValue({
                      messageQueueConnector: undefined,
                      messageQueueTopic: undefined
                    });
                    setKafkaTopics([]);
                    return;
                  }

                  const connector = kafkaConnectors.find(
                    (item) => item.id === normalized
                  );
                  patchNodeData({
                    messageQueueConnectorId: normalized,
                    messageQueueConnectorName: connector?.name,
                    messageQueueTopic: undefined
                  });
                  form.setFieldsValue({
                    messageQueueConnector: normalized,
                    messageQueueTopic: undefined
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
            </Form.Item>

            <Form.Item
              label={KAFKA_TOPIC_LABEL}
              field="messageQueueTopic"
              rules={[
                { required: true, message: KAFKA_TOPIC_REQUIRED_MESSAGE }
              ]}
              normalize={(value) => {
                if (value === undefined || value === null || value === '') {
                  return undefined;
                }
                return normalizeKafkaTopicName(String(value));
              }}
            >
              <Select
                placeholder={
                  hasKafkaConnector
                    ? KAFKA_TOPIC_SELECT_PLACEHOLDER
                    : '请先选择消息队列连接'
                }
                disabled={!hasKafkaConnector}
                loading={kafkaTopicsLoading}
                value={nodeData.messageQueueTopic}
                allowClear
                showSearch
                onChange={(topic) => {
                  const normalized = normalizeKafkaTopicName(
                    topic === undefined || topic === null || topic === ''
                      ? undefined
                      : String(topic)
                  );
                  patchNodeData({ messageQueueTopic: normalized });
                  form.setFieldValue('messageQueueTopic', normalized);
                }}
              >
                {kafkaTopicOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        ) : null}

        {sourceType === DATA_TASK_SOURCE_TYPE.API ? (
          <Form.Item
            label="数据源连接"
            field="apiConnector"
            rules={[{ required: true, message: '请选择 API 连接' }]}
          >
            <Select
              placeholder="请选择 API 连接"
              loading={apiConnectorsLoading}
              value={nodeData.apiConnectorId}
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
                  patchNodeData({
                    apiConnectorId: undefined,
                    apiConnectorName: undefined
                  });
                  form.setFieldValue('apiConnector', undefined);
                  return;
                }

                const connector = apiConnectors.find(
                  (item) => item.id === normalized
                );
                patchNodeData({
                  apiConnectorId: normalized,
                  apiConnectorName: connector?.name
                });
                form.setFieldValue('apiConnector', normalized);
              }}
              options={apiConnectors.map((connector) => ({
                label: formatSqlConnectorSelectLabel(
                  connector.name,
                  connector.subtype || 'API'
                ),
                value: connector.id
              }))}
            />
          </Form.Item>
        ) : null}
      </Form>

      <div className={styles['ai-assist-placeholder']}>
        <div className={styles['ai-assist-title']}>AI 辅助</div>
        <div className={styles['ai-assist-desc']}>
          后续将支持根据业务场景推荐数据源连接与字段映射
        </div>
      </div>

      <DataSourcePreviewModal
        visible={previewVisible}
        config={nodeData}
        onClose={() => setPreviewVisible(false)}
      />
    </div>
  );
}
