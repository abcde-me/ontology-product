import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Alert,
  Button,
  Input,
  InputNumber,
  Message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import { listTiDBTypes } from '@/api/ontologySceneLibrary/attributes';
import {
  applyKafkaJsonPathRule,
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';
import {
  DEFAULT_TOPIC_READ_LIMIT,
  fetchKafkaTopicSampleMessage,
  MAX_TOPIC_READ_LIMIT
} from '../../../services/kafkaJsonPathRule/fetchKafkaTopicSample';
import {
  buildFormattedParseResultRows,
  FormattedParseResultRow
} from '../../../services/kafkaJsonPathRule/formatKafkaParseResult';
import {
  ensureTopicReadyForStreamParse,
  supportsTopicSampleFetch
} from '../../ObjectTypeFormUtils/instanceSyncStreamParse';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import { parseResultRowsToSourceFields } from '../../../services/kafkaJsonPathRule/parseResultToSourceFields';
import { resolveSampleHighlightRange } from '../../../services/kafkaJsonPathRule/resolveSampleHighlightRange';
import {
  DEFAULT_RESULT_COLUMN_WIDTHS,
  RESULT_TABLE_HEADER_HEIGHT,
  ResultColumnWidthMap,
  withResizableResultColumn
} from './resizableResultColumns';
import styles from './KafkaMessageParseSettings.module.scss';

const TextArea = Input.TextArea;

type SampleSourceMode = 'paste' | 'topic';

interface KafkaAiRuleTestModalProps {
  visible: boolean;
  form?: any;
  embedded?: boolean;
  strategy: SyncSourceDataStrategyFormState;
  mappingFields?: InstanceSyncMappingField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  setSyncMappingFields?: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  initialRuleJson?: string;
  initialSampleText?: string;
  initialTopicReadLimit?: number;
  readOnly?: boolean;
  onClose: () => void;
  onParseFieldsReady?: (fields: SourceTableField[]) => void;
  onParseLoadingChange?: (loading: boolean) => void;
}

export interface KafkaAiRuleTestEditorHandle {
  executeParse: () => Promise<void>;
}

function buildPropertyTypeOptions(
  tidbTypes: string[],
  mappingFields: InstanceSyncMappingField[],
  objectTypeAttributes: ObjectTypeAttributeField[]
): { label: string; value: string }[] {
  const typeSet = new Set<string>();
  tidbTypes.forEach((type) => typeSet.add(type));
  mappingFields.forEach((field) => {
    if (field.propertyType?.trim()) {
      typeSet.add(field.propertyType.trim());
    }
  });
  objectTypeAttributes.forEach((field) => {
    if (field.propertyType?.trim()) {
      typeSet.add(field.propertyType.trim());
    }
  });
  return Array.from(typeSet).map((type) => ({ label: type, value: type }));
}

function normalizeSampleList(raw: string): string[] {
  const parsed = JSON.parse(raw.trim()) as unknown;
  if (Array.isArray(parsed)) {
    return parsed.map((item) => JSON.stringify(item));
  }
  return [JSON.stringify(parsed)];
}

function formatRuleText(raw: string): string {
  try {
    return formatKafkaJsonPathRule(parseKafkaJsonPathRule(raw));
  } catch {
    return raw;
  }
}

export default forwardRef<
  KafkaAiRuleTestEditorHandle,
  KafkaAiRuleTestModalProps
>(function KafkaAiRuleTestModal(
  {
    visible,
    form,
    embedded = false,
    strategy,
    mappingFields = [],
    objectTypeAttributes = [],
    setSyncMappingFields,
    initialRuleJson,
    initialSampleText = '',
    initialTopicReadLimit,
    readOnly = false,
    onClose,
    onParseFieldsReady,
    onParseLoadingChange
  },
  ref
) {
  const topicSampleEnabled = supportsTopicSampleFetch(strategy);
  const [sampleSourceMode, setSampleSourceMode] =
    useState<SampleSourceMode>('paste');
  const [sampleText, setSampleText] = useState('');
  const [parseRecords, setParseRecords] = useState<Record<string, unknown>[]>(
    []
  );
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fetchTopicLoading, setFetchTopicLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [topicReadLimit, setTopicReadLimit] = useState(
    DEFAULT_TOPIC_READ_LIMIT
  );
  const [resultRows, setResultRows] = useState<FormattedParseResultRow[]>([]);
  const [tidbTypeOptions, setTidbTypeOptions] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<ResultColumnWidthMap>(
    DEFAULT_RESULT_COLUMN_WIDTHS
  );
  const [sampleBodyHeight, setSampleBodyHeight] = useState(320);
  const [selectedResultKey, setSelectedResultKey] = useState('');
  const sampleBodyRef = useRef<HTMLDivElement>(null);
  const sampleTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const ruleText = useMemo(() => {
    if (!initialRuleJson?.trim()) {
      return '';
    }
    return formatRuleText(initialRuleJson);
  }, [initialRuleJson]);

  const ruleFieldMapping = useMemo(() => {
    if (!ruleText.trim()) {
      return undefined;
    }
    try {
      return parseKafkaJsonPathRule(ruleText).field_mapping;
    } catch {
      return undefined;
    }
  }, [ruleText]);

  const builtRows = useMemo(
    () =>
      buildFormattedParseResultRows(parseRecords, mappingFields, {
        ruleFieldMapping
      }),
    [parseRecords, mappingFields, ruleFieldMapping]
  );

  useEffect(() => {
    setResultRows(builtRows);
    setSelectedResultKey('');
  }, [builtRows]);

  const publishParseFields = useCallback(
    (rows: FormattedParseResultRow[]) => {
      if (!rows.length) {
        return;
      }
      onParseFieldsReady?.(parseResultRowsToSourceFields(rows));
    },
    [onParseFieldsReady]
  );

  const propertyTypeOptions = useMemo(
    () =>
      buildPropertyTypeOptions(
        tidbTypeOptions,
        mappingFields,
        objectTypeAttributes
      ),
    [tidbTypeOptions, mappingFields, objectTypeAttributes]
  );

  const showRecordIndex = useMemo(() => {
    const indexes = new Set(resultRows.map((row) => row.recordIndex));
    return indexes.size > 1;
  }, [resultRows]);

  const syncMappingFieldMeta = useCallback(
    (
      propertyID: string,
      updates: { propertyComment?: string; propertyType?: string }
    ) => {
      if (!setSyncMappingFields) {
        return;
      }
      setSyncMappingFields((prev) => {
        const next = prev.map((field) =>
          field.propertyID === propertyID ? { ...field, ...updates } : field
        );
        form?.setFieldValue('syncMappingFields', next);
        return next;
      });
    },
    [form, setSyncMappingFields]
  );

  const handleColumnResize = useCallback((columnKey: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: width
    }));
  }, []);

  const handleResultRowClick = useCallback((row: FormattedParseResultRow) => {
    setSelectedResultKey(row.key);
  }, []);

  const handleRowMetaChange = useCallback(
    (
      name: string,
      updates: Partial<Pick<FormattedParseResultRow, 'comment' | 'fieldType'>>
    ) => {
      setResultRows((prev) => {
        const nextRows = prev.map((row) =>
          row.name === name ? { ...row, ...updates } : row
        );
        publishParseFields(nextRows);
        return nextRows;
      });
      syncMappingFieldMeta(name, {
        propertyComment: updates.comment,
        propertyType: updates.fieldType
      });
    },
    [publishParseFields, syncMappingFieldMeta]
  );

  const formattedColumns = useMemo<
    TableColumnProps<FormattedParseResultRow>[]
  >(() => {
    const baseColumns: TableColumnProps<FormattedParseResultRow>[] = [
      ...(showRecordIndex
        ? [
            {
              title: '样本',
              dataIndex: 'recordIndex'
            }
          ]
        : []),
      {
        title: '名称',
        dataIndex: 'name',
        ellipsis: true
      },
      {
        title: '注释',
        dataIndex: 'comment',
        render: (value: string, record) => (
          <Input
            className={styles['ai-rule-test-result-cell-input']}
            size="mini"
            value={value}
            placeholder="请输入注释"
            disabled={readOnly}
            onClick={(event) => event.stopPropagation()}
            onChange={(comment) =>
              handleRowMetaChange(record.name, { comment })
            }
          />
        )
      },
      {
        title: '字段类型',
        dataIndex: 'fieldType',
        render: (value: string, record) => (
          <Select
            className={styles['ai-rule-test-result-cell-select']}
            size="mini"
            value={value || undefined}
            placeholder="请选择类型"
            options={propertyTypeOptions}
            showSearch
            allowCreate
            disabled={readOnly}
            triggerProps={{ autoAlignPopupWidth: false }}
            onClick={(event) => event.stopPropagation()}
            onChange={(fieldType) =>
              handleRowMetaChange(record.name, {
                fieldType: String(fieldType)
              })
            }
          />
        )
      },
      {
        title: '值',
        dataIndex: 'valueText',
        ellipsis: true,
        render: (value: string) => value || '-'
      }
    ];

    return baseColumns.map((column) =>
      withResizableResultColumn(
        column,
        String(column.dataIndex),
        columnWidths,
        handleColumnResize
      )
    );
  }, [
    showRecordIndex,
    readOnly,
    propertyTypeOptions,
    handleRowMetaChange,
    columnWidths,
    handleColumnResize,
    styles
  ]);

  const tableScrollX = useMemo(
    () =>
      formattedColumns.reduce(
        (sum, column) => sum + (Number(column.width) || 100),
        0
      ),
    [formattedColumns]
  );

  const tableScrollY = useMemo(
    () => Math.max(120, sampleBodyHeight - RESULT_TABLE_HEADER_HEIGHT),
    [sampleBodyHeight]
  );

  const embeddedBoardHeight = embedded ? 280 : 360;

  useLayoutEffect(() => {
    const element = sampleBodyRef.current;
    if (!element || !visible) {
      return;
    }

    const updateHeight = () => {
      setSampleBodyHeight(element.clientHeight);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, sampleSourceMode]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sample = initialSampleText?.trim() ?? '';
    setSampleText(sample);
    setParseRecords([]);
    setParseErrors([]);
    setResultRows([]);
    setSampleSourceMode(sample ? 'paste' : 'topic');
    setTopicReadLimit(initialTopicReadLimit ?? DEFAULT_TOPIC_READ_LIMIT);
    setColumnWidths(DEFAULT_RESULT_COLUMN_WIDTHS);
    setSelectedResultKey('');
  }, [visible, initialSampleText, initialTopicReadLimit]);

  useEffect(() => {
    if (!selectedResultKey || !sampleText.trim()) {
      return;
    }

    const row = resultRows.find((item) => item.key === selectedResultKey);
    if (!row) {
      return;
    }

    const range = resolveSampleHighlightRange(
      sampleText,
      row,
      ruleFieldMapping
    );
    if (!range) {
      return;
    }

    const textarea = sampleTextareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(range.start, range.end);

    const textBefore = sampleText.slice(0, range.start);
    const lineNumber = textBefore.split('\n').length;
    const lineHeight = 18;
    textarea.scrollTop = Math.max(0, (lineNumber - 4) * lineHeight);
  }, [selectedResultKey, sampleText, resultRows, ruleFieldMapping]);

  useEffect(() => {
    onParseLoadingChange?.(parseLoading);
  }, [parseLoading, onParseLoadingChange]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let canceled = false;
    listTiDBTypes()
      .then((response) => {
        if (canceled) {
          return;
        }
        if (
          response.status === 200 &&
          (response.code === '' || !response.code) &&
          Array.isArray(response.data?.types)
        ) {
          setTidbTypeOptions(response.data.types);
        } else {
          setTidbTypeOptions([]);
        }
      })
      .catch(() => {
        if (!canceled) {
          setTidbTypeOptions([]);
        }
      });
    return () => {
      canceled = true;
    };
  }, [visible]);

  const handleFetchTopicSample = async () => {
    if (!topicSampleEnabled) {
      return;
    }
    const limit = topicReadLimit;
    if (!ensureTopicReadyForStreamParse(strategy)) {
      Message.warning('请先配置 Topic');
      return;
    }
    setFetchTopicLoading(true);
    try {
      const sample = await fetchKafkaTopicSampleMessage({
        connectorId: strategy.messageQueueConnectorId,
        topic: strategy.messageQueueTopic,
        limit
      });
      setSampleText(sample);
      Message.success(`已读取 Topic 消息样本（${limit} 条）`);
    } catch (error) {
      Message.error(
        error instanceof Error ? error.message : '读取 Topic 样本失败'
      );
    } finally {
      setFetchTopicLoading(false);
    }
  };

  const handleSampleSourceModeChange = (mode: SampleSourceMode) => {
    if (mode === 'topic' && !topicSampleEnabled) {
      return;
    }
    setSampleSourceMode(mode);
    if (
      mode === 'topic' &&
      !sampleText.trim() &&
      ensureTopicReadyForStreamParse(strategy)
    ) {
      void handleFetchTopicSample();
    }
  };

  const handleExecuteParse = () => {
    if (!sampleText.trim()) {
      Message.warning('请先提供测试样本');
      return;
    }
    if (!ruleText.trim()) {
      Message.warning('请先在「规则生成」中生成规则');
      return;
    }
    setParseLoading(true);
    try {
      const samples = normalizeSampleList(sampleText);
      const allRecords: Record<string, unknown>[] = [];
      const allErrors: string[] = [];

      samples.forEach((sampleItem, index) => {
        const { records, errors } = applyKafkaJsonPathRule(
          sampleItem,
          ruleText,
          { arrayHandleMode: strategy.messageQueueArrayHandleMode }
        );
        if (errors.length) {
          allErrors.push(
            ...errors.map((error) => `样本${index + 1}: ${error}`)
          );
        }
        allRecords.push(...records);
      });

      setParseRecords(allRecords);
      setParseErrors(allErrors);
      publishParseFields(
        buildFormattedParseResultRows(allRecords, mappingFields, {
          ruleFieldMapping
        })
      );
      if (allErrors.length) {
        Message.warning('解析完成，但存在部分错误');
      } else {
        Message.success('解析完成');
      }
    } catch (error) {
      Message.error(
        error instanceof Error ? error.message : '样本 JSON 格式无效'
      );
    } finally {
      setParseLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    executeParse: handleExecuteParse
  }));

  const boardContent = (
    <div
      className={`${styles['ai-rule-test-board']}${embedded ? ` ${styles['ai-rule-test-board--embedded']}` : ''}`}
      style={embedded ? { height: embeddedBoardHeight } : undefined}
    >
      <div className={styles['ai-rule-test-panel-card']}>
        <div className={styles['ai-rule-test-panel-head']}>
          <div className={styles['ai-rule-test-panel-head-row']}>
            <span className={styles['ai-rule-test-panel-title']}>测试样本</span>
          </div>
        </div>
        <div className={styles['ai-rule-test-sample-toolbar']}>
          {topicSampleEnabled ? (
            <Radio.Group
              className={styles['ai-rule-test-source-radio']}
              type="button"
              size="mini"
              value={sampleSourceMode}
              disabled={readOnly}
              onChange={handleSampleSourceModeChange}
            >
              <Radio value="paste">粘贴样本</Radio>
              <Radio value="topic">读取 Topic</Radio>
            </Radio.Group>
          ) : null}
          {topicSampleEnabled && sampleSourceMode === 'topic' ? (
            <div className={styles['ai-rule-test-topic-actions']}>
              <span className={styles['ai-rule-test-read-limit-label']}>
                读取
              </span>
              <InputNumber
                className={styles['ai-rule-test-read-limit']}
                size="mini"
                min={1}
                max={MAX_TOPIC_READ_LIMIT}
                precision={0}
                value={topicReadLimit}
                disabled={readOnly}
                onChange={(value) => {
                  const numeric = Number(value);
                  setTopicReadLimit(
                    Number.isFinite(numeric) && numeric > 0
                      ? Math.min(MAX_TOPIC_READ_LIMIT, Math.floor(numeric))
                      : DEFAULT_TOPIC_READ_LIMIT
                  );
                }}
              />
              <span className={styles['ai-rule-test-read-limit-label']}>
                条
              </span>
              <Button
                type="text"
                size="mini"
                className={styles['parse-config-action-btn']}
                disabled={readOnly}
                loading={fetchTopicLoading}
                onClick={() => void handleFetchTopicSample()}
              >
                读取样本
              </Button>
            </div>
          ) : null}
        </div>
        <div ref={sampleBodyRef} className={styles['ai-rule-test-panel-body']}>
          <TextArea
            ref={(element) => {
              sampleTextareaRef.current =
                (element as { dom?: HTMLTextAreaElement } | null)?.dom ??
                (element as HTMLTextAreaElement | null);
            }}
            className={`${styles['ai-rule-test-editor']}${selectedResultKey ? ` ${styles['ai-rule-test-editor--linked']}` : ''}`}
            placeholder={
              topicSampleEnabled && sampleSourceMode === 'topic'
                ? '选择「读取 Topic」后点击「读取样本」，或手动粘贴 JSON'
                : '粘贴待测试 JSON 样本'
            }
            value={sampleText}
            disabled={readOnly}
            onChange={setSampleText}
          />
        </div>
      </div>

      <div className={styles['ai-rule-test-panel-card']}>
        <div className={styles['ai-rule-test-panel-head']}>
          <div className={styles['ai-rule-test-panel-head-row']}>
            <span className={styles['ai-rule-test-panel-title']}>解析结果</span>
          </div>
        </div>
        <div
          className={`${styles['ai-rule-test-panel-body']} ${styles['ai-rule-test-panel-body-readonly']} ${styles['ai-rule-test-result-body']}${resultRows.length ? ` ${styles['ai-rule-test-result-body--table']}` : ''}`}
        >
          {parseErrors.length ? (
            <Alert
              className={styles['ai-rule-test-result-alert']}
              type="warning"
              content={parseErrors.join('；')}
            />
          ) : null}
          {resultRows.length ? (
            <div className={styles['ai-rule-test-result-table-wrap']}>
              <Table
                className={styles['ai-rule-test-result-table']}
                size="small"
                border={false}
                pagination={false}
                scroll={{
                  x: tableScrollX,
                  y: tableScrollY
                }}
                columns={formattedColumns}
                data={resultRows}
                rowKey="key"
                onRow={(record) => ({
                  onClick: () => handleResultRowClick(record),
                  className:
                    record.key === selectedResultKey
                      ? styles['ai-rule-test-result-row--active']
                      : ''
                })}
              />
            </div>
          ) : (
            <div
              className={styles['ai-rule-test-result-empty']}
              style={{ minHeight: tableScrollY }}
            >
              点击「执行解析」后查看名称、注释、字段类型
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!visible) {
    return null;
  }

  if (embedded) {
    return boardContent;
  }

  return (
    <Modal
      className={styles['ai-rule-test-modal']}
      title="规则测试"
      visible={visible}
      onCancel={onClose}
      footer={
        <div className={styles['ai-rule-test-footer']}>
          <span className={styles['ai-rule-test-engine']}>
            规则引擎：yaml-jsonpath（Go: github.com/vmware-labs/yaml-jsonpath）
          </span>
          <Space>
            <Button
              type="text"
              className={styles['parse-config-action-btn']}
              onClick={onClose}
            >
              关闭
            </Button>
            <Button
              type="text"
              className={styles['parse-config-action-btn']}
              disabled={readOnly}
              loading={parseLoading}
              onClick={() => void handleExecuteParse()}
            >
              执行解析
            </Button>
          </Space>
        </div>
      }
      style={{ width: 'min(1120px, 96vw)' }}
      unmountOnExit
    >
      {boardContent}
    </Modal>
  );
});
