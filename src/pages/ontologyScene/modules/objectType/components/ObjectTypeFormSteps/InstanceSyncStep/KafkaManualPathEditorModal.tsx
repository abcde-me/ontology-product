import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Input,
  InputNumber,
  Message,
  Modal,
  Radio,
  Space,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import {
  IconDelete,
  IconExpand,
  IconPlus,
  IconRobot
} from '@arco-design/web-react/icon';
import { DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT } from '@/pages/ontologyScene/common/constants';
import { formatKafkaJsonPathRule } from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';
import {
  DEFAULT_TOPIC_READ_LIMIT,
  fetchKafkaTopicSampleMessage,
  MAX_TOPIC_READ_LIMIT
} from '../../../services/kafkaJsonPathRule/fetchKafkaTopicSample';
import { generateKafkaJsonPathRule } from '../../../services/kafkaJsonPathRule/generateKafkaJsonPathRule';
import { detectArrayIteratePath } from '../../../services/kafkaJsonPathRule/detectArrayIteratePath';
import { formatKafkaTopicDisplayName } from '../../../services/kafkaTopicNames';
import {
  ensureTopicReadyForStreamParse,
  supportsTopicSampleFetch
} from '../../ObjectTypeFormUtils/instanceSyncStreamParse';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import {
  createEmptyManualPathRow,
  ManualPathMappingRow,
  manualPathRowsToRuleJson,
  ruleToManualPathRows,
  validateManualPathRows
} from '../../../services/kafkaJsonPathRule/manualPathRule';
import { previewManualPathFieldValue } from '../../../services/kafkaJsonPathRule/previewManualPathFieldValue';
import { resolveJsonPathHighlightRange } from '../../../services/kafkaJsonPathRule/resolveSampleHighlightRange';
import styles from './KafkaMessageParseSettings.module.scss';

const TextArea = Input.TextArea;

type SampleSourceMode = 'paste' | 'topic';

export interface KafkaManualPathEditorHandle {
  commit: () => string | null;
  getSampleText: () => string;
  getTopicReadLimit: () => number;
}

interface KafkaManualPathEditorModalProps {
  visible: boolean;
  readOnly?: boolean;
  embedded?: boolean;
  flatLayout?: boolean;
  strategy: SyncSourceDataStrategyFormState;
  initialRuleJson?: string;
  onClose?: () => void;
  onSave?: (ruleJson: string) => void;
}

const KafkaManualPathEditorModal = forwardRef<
  KafkaManualPathEditorHandle,
  KafkaManualPathEditorModalProps
>(function KafkaManualPathEditorModal(
  {
    visible,
    readOnly = false,
    embedded = false,
    flatLayout = false,
    strategy,
    initialRuleJson,
    onClose,
    onSave
  },
  ref
) {
  const topicSampleEnabled = supportsTopicSampleFetch(strategy);
  const [rows, setRows] = useState<ManualPathMappingRow[]>([
    createEmptyManualPathRow()
  ]);
  const [arrayIteratePath, setArrayIteratePath] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [sampleSourceMode, setSampleSourceMode] = useState<SampleSourceMode>(
    topicSampleEnabled ? 'topic' : 'paste'
  );
  const [fetchTopicLoading, setFetchTopicLoading] = useState(false);
  const [topicReadLimit, setTopicReadLimit] = useState(
    DEFAULT_TOPIC_READ_LIMIT
  );
  const [activeJsonPathKey, setActiveJsonPathKey] = useState('');
  const [aiFillLoading, setAiFillLoading] = useState(false);
  const [pathMapExpanded, setPathMapExpanded] = useState(false);
  const sampleTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const topicLabel = formatKafkaTopicDisplayName(strategy.messageQueueTopic);

  const effectiveArrayIteratePath = useMemo(
    () => arrayIteratePath.trim() || detectArrayIteratePath(sampleText) || '',
    [arrayIteratePath, sampleText]
  );

  const buildRuleJson = useCallback((): string | null => {
    const validationError = validateManualPathRows(rows);
    if (validationError) {
      Message.warning(validationError);
      return null;
    }
    try {
      return manualPathRowsToRuleJson(rows, {
        arrayIteratePath: effectiveArrayIteratePath,
        sampleRaw: sampleText
      });
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '路径配置无效');
      return null;
    }
  }, [rows, effectiveArrayIteratePath, sampleText]);

  useImperativeHandle(
    ref,
    () => ({
      commit: buildRuleJson,
      getSampleText: () => sampleText,
      getTopicReadLimit: () => topicReadLimit
    }),
    [buildRuleJson, sampleText, topicReadLimit]
  );

  const handleFetchTopicSample = useCallback(
    async (limit = topicReadLimit) => {
      if (!topicSampleEnabled) {
        return;
      }
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
    },
    [topicSampleEnabled, strategy, topicReadLimit]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    const parsed = ruleToManualPathRows(initialRuleJson);
    setRows(parsed.rows);
    setArrayIteratePath(parsed.arrayIteratePath);
    setSampleText('');
    setSampleSourceMode(topicSampleEnabled ? 'topic' : 'paste');
    setTopicReadLimit(DEFAULT_TOPIC_READ_LIMIT);
    setActiveJsonPathKey('');
    setPathMapExpanded(false);

    if (
      readOnly ||
      !topicSampleEnabled ||
      !ensureTopicReadyForStreamParse(strategy)
    ) {
      return;
    }

    let canceled = false;
    setFetchTopicLoading(true);
    void fetchKafkaTopicSampleMessage({
      connectorId: strategy.messageQueueConnectorId,
      topic: strategy.messageQueueTopic,
      limit: DEFAULT_TOPIC_READ_LIMIT
    })
      .then((sample) => {
        if (!canceled) {
          setSampleText(sample);
        }
      })
      .catch((error) => {
        if (!canceled) {
          Message.error(
            error instanceof Error ? error.message : '读取 Topic 样本失败'
          );
        }
      })
      .finally(() => {
        if (!canceled) {
          setFetchTopicLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [visible, initialRuleJson, readOnly, topicSampleEnabled, strategy]);

  useEffect(() => {
    if (!activeJsonPathKey || !sampleText.trim()) {
      return;
    }

    const jsonpath = rows.find(
      (item) => item.key === activeJsonPathKey
    )?.jsonpath;

    if (!jsonpath?.trim()) {
      return;
    }

    const range = resolveJsonPathHighlightRange(sampleText, jsonpath);
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
  }, [activeJsonPathKey, sampleText, rows]);

  const updateRow = (key: string, updates: Partial<ManualPathMappingRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...updates } : row))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyManualPathRow()]);
  };

  const handleRemoveRow = (key: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [createEmptyManualPathRow()];
      }
      return prev.filter((row) => row.key !== key);
    });
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

  const handleConfirm = () => {
    const ruleJson = buildRuleJson();
    if (!ruleJson) {
      return;
    }
    onSave?.(ruleJson);
    onClose?.();
    if (!embedded) {
      Message.success('路径配置已保存');
    }
  };

  const rowPreviews = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof previewManualPathFieldValue>
    >();
    rows.forEach((row) => {
      map.set(
        row.key,
        previewManualPathFieldValue(sampleText, row, effectiveArrayIteratePath)
      );
    });
    return map;
  }, [sampleText, rows, effectiveArrayIteratePath]);

  const handleAiFill = async () => {
    if (readOnly) {
      return;
    }

    let sampleRaw = sampleText.trim();
    if (!sampleRaw) {
      if (!topicSampleEnabled) {
        Message.warning('请先读取或粘贴原始数据样本');
        return;
      }
      if (!ensureTopicReadyForStreamParse(strategy)) {
        Message.warning('请先读取或粘贴原始数据样本');
        return;
      }
      setAiFillLoading(true);
      try {
        sampleRaw = await fetchKafkaTopicSampleMessage({
          connectorId: strategy.messageQueueConnectorId,
          topic: strategy.messageQueueTopic,
          limit: topicReadLimit
        });
        setSampleText(sampleRaw);
      } catch (error) {
        Message.error(
          error instanceof Error ? error.message : '读取 Topic 样本失败'
        );
        return;
      } finally {
        setAiFillLoading(false);
      }
    }

    setAiFillLoading(true);
    try {
      const { rule, source } = await generateKafkaJsonPathRule({
        sampleRaw,
        prompt: DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT
      });
      const parsed = ruleToManualPathRows(formatKafkaJsonPathRule(rule));
      setRows(parsed.rows);
      setArrayIteratePath(parsed.arrayIteratePath);
      Message.success(
        source === 'llm'
          ? '大模型已智能填写路径映射'
          : '已根据样本自动填写路径映射（启发式）'
      );
    } catch (error) {
      Message.error(error instanceof Error ? error.message : 'AI 智能填写失败');
    } finally {
      setAiFillLoading(false);
    }
  };

  const renderPreviewCell = (rowKey: string) => {
    const preview = rowPreviews.get(rowKey);
    if (!preview || preview.status === 'empty') {
      return <span className={styles['manual-path-preview-empty']}>—</span>;
    }

    const statusClass =
      preview.status === 'success'
        ? styles['manual-path-preview-success']
        : preview.status === 'default'
          ? styles['manual-path-preview-default']
          : preview.status === 'no_match'
            ? styles['manual-path-preview-no-match']
            : styles['manual-path-preview-error'];

    return (
      <Tooltip content={preview.fullDisplay}>
        <span
          className={`${styles['manual-path-preview-value']} ${statusClass}`}
        >
          {preview.display}
        </span>
      </Tooltip>
    );
  };

  const columns: TableColumnProps<ManualPathMappingRow>[] = [
    {
      title: '字段名',
      dataIndex: 'fieldName',
      width: 120,
      render: (_value, record) => (
        <Input
          size="mini"
          placeholder="如 user_id"
          value={record.fieldName}
          disabled={readOnly}
          onChange={(fieldName) => updateRow(record.key, { fieldName })}
        />
      )
    },
    {
      title: 'JSONPath',
      dataIndex: 'jsonpath',
      width: 180,
      render: (_value, record) => (
        <Input
          size="mini"
          placeholder="如 $.payload.temperature"
          value={record.jsonpath}
          disabled={readOnly}
          onChange={(jsonpath) => updateRow(record.key, { jsonpath })}
          onFocus={() => setActiveJsonPathKey(record.key)}
          onBlur={() => setActiveJsonPathKey('')}
        />
      )
    },
    {
      title: '解析结果',
      dataIndex: 'preview',
      width: 120,
      render: (_value, record) => renderPreviewCell(record.key)
    },
    {
      title: '注释',
      dataIndex: 'comment',
      width: 120,
      render: (_value, record) => (
        <Input
          size="mini"
          placeholder="字段说明"
          value={record.comment}
          disabled={readOnly}
          onChange={(comment) => updateRow(record.key, { comment })}
        />
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 100,
      render: (_value, record) => (
        <Input
          size="mini"
          placeholder='如 "" 或 0'
          value={record.defaultValue}
          disabled={readOnly}
          onChange={(defaultValue) => updateRow(record.key, { defaultValue })}
        />
      )
    },
    {
      title: '操作',
      width: 70,
      render: (_value, record) => (
        <Button
          type="text"
          size="mini"
          status="danger"
          icon={<IconDelete />}
          disabled={readOnly}
          onClick={() => handleRemoveRow(record.key)}
        />
      )
    }
  ];

  const renderPathMappingToolbar = () => (
    <Space size={8} wrap>
      <Button
        type="text"
        size="mini"
        className={styles['parse-config-action-btn']}
        icon={<IconPlus />}
        disabled={readOnly}
        onClick={handleAddRow}
      >
        添加字段
      </Button>
      <Button
        type="text"
        size="mini"
        className={styles['parse-config-action-btn']}
        icon={<IconRobot />}
        disabled={readOnly}
        loading={aiFillLoading}
        onClick={() => void handleAiFill()}
      >
        AI 智能填写
      </Button>
    </Space>
  );

  const renderPathMappingTable = (options?: { expanded?: boolean }) => {
    const expanded = options?.expanded ?? false;
    const tableScrollY = expanded ? 480 : embedded ? 220 : 280;

    return (
      <Table
        className={styles['manual-path-editor-table']}
        size="small"
        rowKey="key"
        columns={columns}
        data={rows}
        pagination={false}
        border={false}
        scroll={{ x: 760, y: tableScrollY }}
      />
    );
  };

  const renderPathMappingBody = (options?: { expanded?: boolean }) => {
    const expanded = options?.expanded ?? false;

    return (
      <div
        className={`${styles['manual-path-editor-panel-content']}${expanded ? ` ${styles['manual-path-editor-panel-content--expanded']}` : ''}`}
      >
        {expanded ? (
          <div className={styles['manual-path-editor-panel-toolbar']}>
            {renderPathMappingToolbar()}
          </div>
        ) : null}
        {renderPathMappingTable({ expanded })}
      </div>
    );
  };

  const editorContent = (
    <div
      className={`${styles['manual-path-editor-layout']}${embedded ? ` ${styles['manual-path-editor-layout--embedded']}` : ''}${flatLayout ? ` ${styles['manual-path-editor-layout--flat']}` : ''}`}
    >
      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--header-left']}`}
      >
        <span className={styles['manual-path-editor-panel-title']}>
          原始数据样本
        </span>
      </div>

      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--header-right']}`}
      >
        <span className={styles['manual-path-editor-panel-title']}>
          路径映射
        </span>
        <Tooltip content="放大">
          <Button
            type="text"
            size="mini"
            className={styles['manual-path-editor-config-expand-btn']}
            icon={<IconExpand />}
            onClick={() => setPathMapExpanded(true)}
          />
        </Tooltip>
      </div>

      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--toolbar-left']} ${styles['manual-path-editor-sample-toolbar']}`}
      >
        <div className={styles['manual-path-editor-toolbar-primary']}>
          {topicSampleEnabled ? (
            <Radio.Group
              className={styles['ai-rule-test-source-radio']}
              type="button"
              size="mini"
              value={sampleSourceMode}
              disabled={readOnly}
              onChange={handleSampleSourceModeChange}
            >
              <Radio value="topic">读取 Topic</Radio>
              <Radio value="paste">粘贴样本</Radio>
            </Radio.Group>
          ) : null}
        </div>
        {topicSampleEnabled && sampleSourceMode === 'topic' ? (
          <div className={styles['manual-path-editor-toolbar-secondary']}>
            <span
              className={`${styles['ai-rule-test-read-limit-label']} ${styles['manual-path-editor-topic-label']}`}
              title={topicLabel}
            >
              Topic：{topicLabel}
            </span>
            <div className={styles['manual-path-editor-topic-controls']}>
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
          </div>
        ) : null}
      </div>

      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--toolbar-right']} ${styles['manual-path-editor-panel-toolbar']}`}
      >
        <div className={styles['manual-path-editor-toolbar-primary']}>
          {renderPathMappingToolbar()}
        </div>
      </div>

      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--content-left']}`}
      >
        <TextArea
          ref={(element) => {
            sampleTextareaRef.current =
              (element as { dom?: HTMLTextAreaElement } | null)?.dom ??
              (element as HTMLTextAreaElement | null);
          }}
          className={`${styles['manual-path-editor-sample-textarea']}${activeJsonPathKey ? ` ${styles['ai-rule-test-editor--linked']}` : ''}`}
          placeholder={
            topicSampleEnabled && sampleSourceMode === 'topic'
              ? '将自动读取 Topic 样本，也可手动粘贴 JSON'
              : '粘贴待对照的 JSON 样本'
          }
          value={sampleText}
          disabled={readOnly}
          onChange={setSampleText}
        />
      </div>

      <div
        className={`${styles['manual-path-editor-cell']} ${styles['manual-path-editor-cell--content-right']}`}
      >
        {renderPathMappingBody()}
      </div>

      <Modal
        title="路径映射"
        visible={pathMapExpanded}
        onCancel={() => setPathMapExpanded(false)}
        footer={null}
        style={{ width: 'min(1200px, 96vw)' }}
        unmountOnExit
      >
        {renderPathMappingBody({ expanded: true })}
      </Modal>
    </div>
  );

  if (!visible) {
    return null;
  }

  if (embedded) {
    return editorContent;
  }

  return (
    <Modal
      title="路径配置"
      visible={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button
            type="text"
            className={styles['parse-config-action-btn']}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            type="text"
            className={styles['parse-config-action-btn']}
            disabled={readOnly}
            onClick={handleConfirm}
          >
            保存配置
          </Button>
        </Space>
      }
      style={{ width: 'min(1200px, 96vw)' }}
      unmountOnExit
    >
      {editorContent}
    </Modal>
  );
});

export default KafkaManualPathEditorModal;
