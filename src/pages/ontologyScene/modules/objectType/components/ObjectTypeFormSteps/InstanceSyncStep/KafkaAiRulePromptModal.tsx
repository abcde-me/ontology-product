import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Input,
  InputNumber,
  Message,
  Modal,
  Space
} from '@arco-design/web-react';
import {
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';
import {
  DEFAULT_TOPIC_READ_LIMIT,
  fetchKafkaTopicSampleMessage,
  MAX_TOPIC_READ_LIMIT
} from '../../../services/kafkaJsonPathRule/fetchKafkaTopicSample';
import { generateKafkaJsonPathRule } from '../../../services/kafkaJsonPathRule/generateKafkaJsonPathRule';
import { formatKafkaTopicDisplayName } from '../../../services/kafkaTopicNames';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import {
  ensureTopicReadyForStreamParse,
  supportsTopicSampleFetch
} from '../../ObjectTypeFormUtils/instanceSyncStreamParse';
import styles from './KafkaMessageParseSettings.module.scss';

const TextArea = Input.TextArea;

interface KafkaAiRulePromptModalProps {
  visible: boolean;
  readOnly?: boolean;
  embedded?: boolean;
  strategy: SyncSourceDataStrategyFormState;
  initialPrompt: string;
  initialRuleJson?: string;
  initialRuleGeneratedAt?: string;
  onClose?: () => void;
  onPromptSave: (prompt: string) => void;
  onRuleGenerated: (ruleJson: string, generatedAt: string) => void;
  onGenerateLoadingChange?: (loading: boolean) => void;
}

export interface KafkaAiRulePromptEditorHandle {
  generateRule: () => Promise<void>;
}

function formatGeneratedAt(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : raw;
}

function formatRulePreview(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }
  try {
    return formatKafkaJsonPathRule(parseKafkaJsonPathRule(raw));
  } catch {
    return raw;
  }
}

export default forwardRef<
  KafkaAiRulePromptEditorHandle,
  KafkaAiRulePromptModalProps
>(function KafkaAiRulePromptModal(
  {
    visible,
    readOnly = false,
    embedded = false,
    strategy,
    initialPrompt,
    initialRuleJson,
    initialRuleGeneratedAt,
    onClose,
    onPromptSave,
    onRuleGenerated,
    onGenerateLoadingChange
  },
  ref
) {
  const [draftPrompt, setDraftPrompt] = useState(initialPrompt);
  const [sampleText, setSampleText] = useState('');
  const [rulePreview, setRulePreview] = useState('');
  const [ruleGeneratedAt, setRuleGeneratedAt] = useState('');
  const [fetchTopicLoading, setFetchTopicLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [topicReadLimit, setTopicReadLimit] = useState(
    DEFAULT_TOPIC_READ_LIMIT
  );

  const topicLabel = formatKafkaTopicDisplayName(strategy.messageQueueTopic);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraftPrompt(initialPrompt);
    setSampleText('');
    setRulePreview(formatRulePreview(initialRuleJson));
    setRuleGeneratedAt(initialRuleGeneratedAt ?? '');
    setTopicReadLimit(DEFAULT_TOPIC_READ_LIMIT);
  }, [visible, initialPrompt, initialRuleJson, initialRuleGeneratedAt]);

  const ruleGeneratedAtLabel = useMemo(
    () => formatGeneratedAt(ruleGeneratedAt),
    [ruleGeneratedAt]
  );

  useEffect(() => {
    onGenerateLoadingChange?.(generateLoading);
  }, [generateLoading, onGenerateLoadingChange]);

  const handleFetchTopicSample = async (limit = topicReadLimit) => {
    if (!supportsTopicSampleFetch(strategy)) {
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
  };

  const handleSavePrompt = () => {
    const trimmed = draftPrompt.trim();
    if (!trimmed) {
      Message.warning('请输入提示词');
      return;
    }
    onPromptSave(trimmed);
    onClose?.();
    if (!embedded) {
      Message.success('提示词已保存');
    }
  };

  const handleSaveAndGenerate = async () => {
    const trimmedPrompt = draftPrompt.trim();
    if (!trimmedPrompt) {
      Message.warning('请输入提示词');
      return;
    }

    let sampleRaw = sampleText.trim();
    if (!sampleRaw) {
      if (!supportsTopicSampleFetch(strategy)) {
        Message.warning('请粘贴原始 JSON 样本');
        return;
      }
      if (!ensureTopicReadyForStreamParse(strategy)) {
        Message.warning('请粘贴原始 JSON 样本，或先配置 Topic 后读取样本');
        return;
      }
      setGenerateLoading(true);
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
        setGenerateLoading(false);
      }
    }

    setGenerateLoading(true);
    try {
      onPromptSave(trimmedPrompt);
      const { rule, source } = await generateKafkaJsonPathRule({
        sampleRaw,
        prompt: trimmedPrompt
      });
      const formatted = formatKafkaJsonPathRule(rule);
      const generatedAt = new Date().toISOString();
      setRulePreview(formatted);
      setRuleGeneratedAt(generatedAt);
      onRuleGenerated(formatted, generatedAt);
      Message.success(
        source === 'llm' ? '规则已由大模型生成' : '规则已生成（启发式）'
      );
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '规则生成失败');
    } finally {
      setGenerateLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    generateRule: handleSaveAndGenerate
  }));

  const panelContent = (
    <>
      <div
        className={`${styles['ai-rule-prompt-layout']}${embedded ? ` ${styles['ai-rule-prompt-layout--embedded']}` : ''}`}
      >
        <div className={styles['ai-rule-prompt-column']}>
          <div className={styles['ai-rule-prompt-section-title']}>规则生成</div>
          <TextArea
            className={styles['ai-rule-prompt-textarea']}
            placeholder="请输入提示词"
            value={draftPrompt}
            disabled={readOnly}
            onChange={setDraftPrompt}
          />

          <div className={styles['ai-rule-prompt-section-title']}>
            原始 JSON 样本
          </div>
          <div className={styles['ai-rule-test-topic-bar']}>
            <span className={styles['ai-rule-test-topic-label']}>
              Topic：{topicLabel}
            </span>
            <div className={styles['ai-rule-test-topic-actions']}>
              <span className={styles['ai-rule-test-read-limit-label']}>
                读取
              </span>
              <InputNumber
                className={styles['ai-rule-test-read-limit']}
                size="small"
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
                读取
              </Button>
            </div>
          </div>
          <TextArea
            className={styles['ai-rule-prompt-sample']}
            placeholder={
              supportsTopicSampleFetch(strategy)
                ? '粘贴原始 JSON 样本；留空时将自动读取 Topic 样本用于生成'
                : '粘贴原始 JSON 样本'
            }
            value={sampleText}
            disabled={readOnly}
            onChange={setSampleText}
          />
        </div>

        <div className={styles['ai-rule-prompt-column']}>
          <div className={styles['ai-rule-prompt-preview-head']}>
            <div className={styles['ai-rule-prompt-section-title']}>
              规则预览
            </div>
            {ruleGeneratedAtLabel ? (
              <div className={styles['ai-rule-prompt-preview-meta']}>
                生成时间：{ruleGeneratedAtLabel}
              </div>
            ) : null}
          </div>
          <TextArea
            className={styles['ai-rule-prompt-preview']}
            placeholder="点击「生成规则」后在此预览 JSONPath 规则"
            value={rulePreview}
            readOnly
          />
        </div>
      </div>
    </>
  );

  if (!visible) {
    return null;
  }

  if (embedded) {
    return panelContent;
  }

  return (
    <Modal
      title="规则生成"
      visible={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button
            type="text"
            className={styles['parse-config-action-btn']}
            disabled={readOnly}
            loading={generateLoading}
            onClick={() => void handleSaveAndGenerate()}
          >
            生成规则
          </Button>
          <Button
            type="text"
            className={styles['parse-config-action-btn']}
            disabled={readOnly}
            onClick={handleSavePrompt}
          >
            保存规则
          </Button>
        </Space>
      }
      style={{ width: 'min(1100px, 96vw)' }}
      unmountOnExit
    >
      {panelContent}
    </Modal>
  );
});
