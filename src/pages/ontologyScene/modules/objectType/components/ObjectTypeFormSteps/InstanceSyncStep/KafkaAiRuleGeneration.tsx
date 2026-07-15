import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { IconArrowRight } from '@arco-design/web-react/icon';
import {
  DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT,
  resolveKafkaAiRulePrompt
} from '@/pages/ontologyScene/common/constants';
import {
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';
import { ensureTopicReadyForStreamParse } from '../../ObjectTypeFormUtils/instanceSyncStreamParse';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import { extractSourceFieldsFromKafkaRule } from '../../../services/kafkaJsonPathRule/parseResultToSourceFields';
import KafkaAiRulePromptModal from './KafkaAiRulePromptModal';
import KafkaAiRuleTestModal from './KafkaAiRuleTestModal';
import styles from './KafkaMessageParseSettings.module.scss';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface KafkaAiRuleGenerationProps {
  form: any;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  setSyncMappingFields?: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
  onParseFieldsReady?: (fields: SourceTableField[]) => void;
}

function formatRuleSavedAt(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : raw;
}

function formatSavedRulePreview(raw: string): string {
  try {
    return formatKafkaJsonPathRule(parseKafkaJsonPathRule(raw));
  } catch {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
}

export default function KafkaAiRuleGeneration({
  form,
  syncSourceDataStrategy,
  syncMappingFields = [],
  objectTypeAttributes = [],
  setSyncMappingFields,
  onStrategyUpdate,
  readOnly = false,
  onParseFieldsReady
}: KafkaAiRuleGenerationProps) {
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveDraftRuleJson, setSaveDraftRuleJson] = useState('');
  const [draftRuleJson, setDraftRuleJson] = useState(
    syncSourceDataStrategy.messageQueueAiRuleContent ?? ''
  );
  const [draftRuleGeneratedAt, setDraftRuleGeneratedAt] = useState<
    string | undefined
  >();

  const persistPrompt = (prompt: string) => {
    onStrategyUpdate({ messageQueueAiRulePrompt: prompt });
    form.setFieldValue('syncMessageQueueAiRulePrompt', prompt);
  };

  useEffect(() => {
    if (syncSourceDataStrategy.messageQueueAiRulePrompt?.trim()) {
      return;
    }
    persistPrompt(DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT);
  }, [syncSourceDataStrategy.messageQueueAiRulePrompt]);

  useEffect(() => {
    setDraftRuleJson(syncSourceDataStrategy.messageQueueAiRuleContent ?? '');
  }, [syncSourceDataStrategy.messageQueueAiRuleContent]);

  const savedRulePreview = useMemo(() => {
    const raw = syncSourceDataStrategy.messageQueueAiRuleContent?.trim();
    if (!raw) {
      return '';
    }
    return formatSavedRulePreview(raw);
  }, [syncSourceDataStrategy.messageQueueAiRuleContent]);

  const savedRuleAtLabel = useMemo(
    () => formatRuleSavedAt(syncSourceDataStrategy.messageQueueAiRuleSavedAt),
    [syncSourceDataStrategy.messageQueueAiRuleSavedAt]
  );

  const openPromptModal = () => {
    setPromptModalVisible(true);
  };

  const ensurePromptReady = () => {
    const prompt = resolveKafkaAiRulePrompt(
      syncSourceDataStrategy.messageQueueAiRulePrompt
    );
    if (!syncSourceDataStrategy.messageQueueAiRulePrompt?.trim()) {
      persistPrompt(prompt);
    }
    if (!ensureTopicReadyForStreamParse(syncSourceDataStrategy)) {
      Message.warning('请先填写 Topic');
      return false;
    }
    return true;
  };

  const handleRuleTest = () => {
    if (readOnly || !ensurePromptReady()) {
      return;
    }
    setTestModalVisible(true);
  };

  const handleRuleSave = () => {
    if (readOnly || !ensurePromptReady()) {
      return;
    }

    const ruleRaw = draftRuleJson.trim();
    if (!ruleRaw) {
      Message.warning('请先生成 JSONPath 规则');
      return;
    }

    setSaveDraftRuleJson(formatSavedRulePreview(ruleRaw));
    setSaveModalVisible(true);
  };

  const handleConfirmRuleSave = () => {
    const ruleRaw = saveDraftRuleJson.trim();
    if (!ruleRaw) {
      Message.warning('规则内容不能为空');
      return;
    }

    setSaveLoading(true);
    try {
      const ruleContent = formatKafkaJsonPathRule(
        parseKafkaJsonPathRule(ruleRaw)
      );
      const savedAt = new Date().toISOString();
      onStrategyUpdate({
        messageQueueAiRuleContent: ruleContent,
        messageQueueAiRuleSavedAt: savedAt
      });
      form.setFieldsValue({
        syncMessageQueueAiRuleContent: ruleContent,
        syncMessageQueueAiRuleSavedAt: savedAt
      });
      setDraftRuleJson(ruleContent);
      setSaveModalVisible(false);
      const parsedFields = extractSourceFieldsFromKafkaRule(ruleContent);
      if (parsedFields.length) {
        onParseFieldsReady?.(parsedFields);
      }
      Message.success('规则已入库');
    } catch (error) {
      Message.error(
        error instanceof Error ? error.message : '规则格式无效，无法入库'
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <FormItem
        label="规则生成"
        field="syncMessageQueueAiRuleContent"
        required
        rules={[
          {
            required: true,
            validator: (_value, callback) => {
              if (!syncSourceDataStrategy.messageQueueAiRuleContent?.trim()) {
                callback('请完成规则生成并入库');
                return;
              }
              callback();
            }
          }
        ]}
      >
        <div className={styles['ai-rule-generation-flow']}>
          <Button
            type="text"
            size="small"
            className={styles['ai-rule-generation-btn']}
            disabled={readOnly}
            onClick={openPromptModal}
          >
            规则生成
          </Button>
          <IconArrowRight className={styles['ai-rule-generation-arrow']} />
          <Button
            type="text"
            size="small"
            className={styles['ai-rule-generation-btn']}
            disabled={readOnly}
            onClick={handleRuleTest}
          >
            规则测试
          </Button>
          <IconArrowRight className={styles['ai-rule-generation-arrow']} />
          <Button
            type="text"
            size="small"
            className={styles['ai-rule-generation-btn']}
            disabled={readOnly}
            onClick={handleRuleSave}
          >
            规则入库
          </Button>
        </div>
      </FormItem>

      <KafkaAiRulePromptModal
        visible={promptModalVisible}
        readOnly={readOnly}
        strategy={syncSourceDataStrategy}
        initialPrompt={resolveKafkaAiRulePrompt(
          syncSourceDataStrategy.messageQueueAiRulePrompt
        )}
        initialRuleJson={draftRuleJson}
        initialRuleGeneratedAt={draftRuleGeneratedAt}
        onClose={() => setPromptModalVisible(false)}
        onPromptSave={persistPrompt}
        onRuleGenerated={(ruleJson, generatedAt) => {
          setDraftRuleJson(ruleJson);
          setDraftRuleGeneratedAt(generatedAt);
          const parsedFields = extractSourceFieldsFromKafkaRule(ruleJson);
          if (parsedFields.length) {
            onParseFieldsReady?.(parsedFields);
          }
        }}
      />

      <Modal
        title="规则入库"
        visible={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        onOk={() => void handleConfirmRuleSave()}
        okText="保存"
        cancelText="取消"
        confirmLoading={saveLoading}
        style={{ width: 'min(1000px, 96vw)' }}
        unmountOnExit
      >
        <div className={styles['ai-rule-save-hint']}>
          请确认或编辑待入库规则，确认后将覆盖保存到规则库。
        </div>
        <div className={styles['ai-rule-save-layout']}>
          <div className={styles['ai-rule-save-column']}>
            <div className={styles['ai-rule-save-column-head']}>
              <div className={styles['ai-rule-save-column-title']}>
                待入库规则
              </div>
            </div>
            <TextArea
              className={styles['ai-rule-save-textarea']}
              placeholder="请填写待入库的 JSONPath 规则"
              value={saveDraftRuleJson}
              disabled={readOnly}
              onChange={setSaveDraftRuleJson}
            />
          </div>
          <div className={styles['ai-rule-save-column']}>
            <div className={styles['ai-rule-save-column-head']}>
              <div className={styles['ai-rule-save-column-title']}>
                已入库规则
              </div>
              {savedRuleAtLabel ? (
                <div className={styles['ai-rule-save-column-meta']}>
                  入库时间：{savedRuleAtLabel}
                </div>
              ) : null}
            </div>
            <TextArea
              className={`${styles['ai-rule-save-textarea']} ${styles['ai-rule-save-textarea-readonly']}`}
              placeholder="暂无已入库规则"
              value={savedRulePreview}
              readOnly
            />
          </div>
        </div>
      </Modal>

      <KafkaAiRuleTestModal
        visible={testModalVisible}
        form={form}
        strategy={syncSourceDataStrategy}
        mappingFields={syncMappingFields}
        objectTypeAttributes={objectTypeAttributes}
        setSyncMappingFields={setSyncMappingFields}
        initialRuleJson={draftRuleJson}
        readOnly={readOnly}
        onClose={() => setTestModalVisible(false)}
        onParseFieldsReady={onParseFieldsReady}
      />
    </>
  );
}
