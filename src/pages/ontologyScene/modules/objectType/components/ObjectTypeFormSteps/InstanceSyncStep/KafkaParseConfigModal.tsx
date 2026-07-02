import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Message,
  Modal,
  Popover,
  Radio,
  Space
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import {
  DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT,
  DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH,
  DEFAULT_KAFKA_MAX_FLATTEN_DEPTH,
  KAFKA_ARRAY_HANDLE_MODE,
  KAFKA_ARRAY_HANDLE_MODE_LABEL,
  KAFKA_STRUCTURED_PARSE_RULE,
  KafkaArrayHandleMode,
  KafkaStructuredParseRule,
  resolveKafkaAiRulePrompt
} from '@/pages/ontologyScene/common/constants';
import {
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';
import { extractSourceFieldsFromKafkaRule } from '../../../services/kafkaJsonPathRule/parseResultToSourceFields';
import { DEFAULT_TOPIC_READ_LIMIT } from '../../../services/kafkaJsonPathRule/fetchKafkaTopicSample';
import { ensureTopicReadyForStreamParse } from '../../ObjectTypeFormUtils/instanceSyncStreamParse';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import KafkaDefaultRulePreview from './KafkaDefaultRulePreview';
import KafkaAiRulePromptModal, {
  KafkaAiRulePromptEditorHandle
} from './KafkaAiRulePromptModal';
import KafkaAiRuleTestModal, {
  KafkaAiRuleTestEditorHandle
} from './KafkaAiRuleTestModal';
import KafkaManualPathEditorModal, {
  KafkaManualPathEditorHandle
} from './KafkaManualPathEditorModal';
import {
  formatRuleSavedAt,
  formatSavedRulePreview
} from './kafkaParseRuleFormat';
import styles from './KafkaMessageParseSettings.module.scss';

const TextArea = Input.TextArea;

const STRUCTURED_RULE_LABEL: Record<KafkaStructuredParseRule, string> = {
  [KAFKA_STRUCTURED_PARSE_RULE.DEFAULT]: '默认规则',
  [KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED]: 'AI生成规则',
  [KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL]: '路径解析'
};

const SAMPLE_MESSAGE = `{
  "user": { "name": "张三" },
  "tags": ["A", "B"]
}`;

const ARRAY_MODE_EXAMPLES: Record<
  KafkaArrayHandleMode,
  { title: string; lines: string[] }
> = {
  [KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN]: {
    title: '下标展平：数组元素展开为带下标的独立字段',
    lines: ['user.name → "张三"', 'tags_0 → "A"', 'tags_1 → "B"']
  },
  [KAFKA_ARRAY_HANDLE_MODE.SPLIT_RECORDS]: {
    title: '拆成多条记录：数组每个元素生成一条实例记录',
    lines: [
      '记录1: { user.name: "张三", tags: "A" }',
      '记录2: { user.name: "张三", tags: "B" }'
    ]
  },
  [KAFKA_ARRAY_HANDLE_MODE.RAW_STRING]: {
    title: '原样存字符串：数组整体序列化为字符串字段',
    lines: ['user.name → "张三"', 'tags → \'["A","B"]\'']
  }
};

function ArrayHandleModeHelpIcon() {
  return (
    <Popover
      position="right"
      trigger="hover"
      content={
        <div className={styles['array-mode-help']}>
          <div className={styles['array-mode-help-sample']}>
            <div className={styles['array-mode-help-sample-title']}>
              示例消息
            </div>
            <pre>{SAMPLE_MESSAGE}</pre>
          </div>
          {(
            Object.entries(ARRAY_MODE_EXAMPLES) as [
              KafkaArrayHandleMode,
              (typeof ARRAY_MODE_EXAMPLES)[KafkaArrayHandleMode]
            ][]
          ).map(([mode, example]) => (
            <div key={mode} className={styles['array-mode-help-block']}>
              <div className={styles['array-mode-help-block-title']}>
                {KAFKA_ARRAY_HANDLE_MODE_LABEL[mode]}
              </div>
              <div className={styles['array-mode-help-block-desc']}>
                {example.title}
              </div>
              <pre>{example.lines.join('\n')}</pre>
            </div>
          ))}
        </div>
      }
    >
      <IconQuestionCircle
        className={styles['array-mode-help-icon']}
        aria-label="数组处理模式说明"
      />
    </Popover>
  );
}

function getStructuredRuleDefaults(
  rule: KafkaStructuredParseRule
): Pick<
  SyncSourceDataStrategyFormState,
  'messageQueueMaxFlattenDepth' | 'messageQueueArrayHandleMode'
> {
  if (rule === KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL) {
    return {
      messageQueueMaxFlattenDepth: undefined,
      messageQueueArrayHandleMode: undefined
    };
  }
  if (rule === KAFKA_STRUCTURED_PARSE_RULE.DEFAULT) {
    return {
      messageQueueMaxFlattenDepth: DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH,
      messageQueueArrayHandleMode: KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
    };
  }
  return {
    messageQueueMaxFlattenDepth: DEFAULT_KAFKA_MAX_FLATTEN_DEPTH,
    messageQueueArrayHandleMode: KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
  };
}

type ParseConfigStep = 0 | 1 | 2;

interface KafkaParseConfigModalProps {
  visible: boolean;
  readOnly?: boolean;
  form: any;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  setSyncMappingFields?: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  formStyles: Record<string, string>;
  onClose: () => void;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  onParseFieldsReady?: (fields: SourceTableField[]) => void;
}

export default function KafkaParseConfigModal({
  visible,
  readOnly = false,
  form,
  syncSourceDataStrategy,
  syncMappingFields = [],
  objectTypeAttributes = [],
  setSyncMappingFields,
  formStyles,
  onClose,
  onStrategyUpdate,
  onParseFieldsReady
}: KafkaParseConfigModalProps) {
  const pathEditorRef = useRef<KafkaManualPathEditorHandle>(null);
  const aiPromptEditorRef = useRef<KafkaAiRulePromptEditorHandle>(null);
  const aiTestEditorRef = useRef<KafkaAiRuleTestEditorHandle>(null);
  const modalInitializedRef = useRef(false);
  const [structuredRule, setStructuredRule] =
    useState<KafkaStructuredParseRule>(KAFKA_STRUCTURED_PARSE_RULE.DEFAULT);
  const [maxFlattenDepth, setMaxFlattenDepth] = useState(
    DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH
  );
  const [arrayHandleMode, setArrayHandleMode] = useState<KafkaArrayHandleMode>(
    KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
  );
  const [draftPrompt, setDraftPrompt] = useState(
    DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT
  );
  const [draftRuleJson, setDraftRuleJson] = useState('');
  const [draftRuleGeneratedAt, setDraftRuleGeneratedAt] = useState<string>();
  const [draftSampleText, setDraftSampleText] = useState('');
  const [draftTopicReadLimit, setDraftTopicReadLimit] = useState(
    DEFAULT_TOPIC_READ_LIMIT
  );
  const [currentStep, setCurrentStep] = useState<ParseConfigStep>(0);
  const [saveDraftRuleJson, setSaveDraftRuleJson] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiGenerateLoading, setAiGenerateLoading] = useState(false);
  const [aiParseLoading, setAiParseLoading] = useState(false);

  const isDefaultRule = structuredRule === KAFKA_STRUCTURED_PARSE_RULE.DEFAULT;
  const isAiRule = structuredRule === KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED;
  const isPathManual =
    structuredRule === KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL;
  const needsWorkflow = isAiRule || isPathManual;
  const depthDisabled = readOnly || isDefaultRule;
  const arrayModeDisabled = readOnly || isDefaultRule;

  const draftStrategy = useMemo(
    (): SyncSourceDataStrategyFormState => ({
      ...syncSourceDataStrategy,
      messageQueueStructuredParseRule: structuredRule,
      messageQueueMaxFlattenDepth: maxFlattenDepth,
      messageQueueArrayHandleMode: arrayHandleMode,
      messageQueueAiRulePrompt: draftPrompt
    }),
    [
      syncSourceDataStrategy,
      structuredRule,
      maxFlattenDepth,
      arrayHandleMode,
      draftPrompt
    ]
  );

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

  useEffect(() => {
    if (!visible) {
      modalInitializedRef.current = false;
      return;
    }
    if (modalInitializedRef.current) {
      return;
    }
    modalInitializedRef.current = true;

    const rule =
      syncSourceDataStrategy.messageQueueStructuredParseRule ||
      KAFKA_STRUCTURED_PARSE_RULE.DEFAULT;
    const defaults = getStructuredRuleDefaults(rule);
    setStructuredRule(rule);
    setMaxFlattenDepth(
      syncSourceDataStrategy.messageQueueMaxFlattenDepth ??
        defaults.messageQueueMaxFlattenDepth ??
        DEFAULT_KAFKA_MAX_FLATTEN_DEPTH
    );
    setArrayHandleMode(
      syncSourceDataStrategy.messageQueueArrayHandleMode ??
        defaults.messageQueueArrayHandleMode ??
        KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
    );
    setDraftPrompt(
      resolveKafkaAiRulePrompt(syncSourceDataStrategy.messageQueueAiRulePrompt)
    );
    setDraftRuleJson(syncSourceDataStrategy.messageQueueAiRuleContent ?? '');
    setDraftRuleGeneratedAt(undefined);
    setDraftSampleText('');
    setDraftTopicReadLimit(DEFAULT_TOPIC_READ_LIMIT);
    setCurrentStep(0);
    setSaveDraftRuleJson('');
  }, [visible, syncSourceDataStrategy]);

  const syncFormFields = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    form.setFieldsValue({
      syncMessageQueueStructuredParseRule:
        updates.messageQueueStructuredParseRule,
      syncMessageQueueMaxFlattenDepth: updates.messageQueueMaxFlattenDepth,
      syncMessageQueueArrayHandleMode: updates.messageQueueArrayHandleMode,
      syncMessageQueueAiRulePrompt: updates.messageQueueAiRulePrompt,
      syncMessageQueueAiRuleContent: updates.messageQueueAiRuleContent,
      syncMessageQueueAiRuleSavedAt: updates.messageQueueAiRuleSavedAt
    });
  };

  const handleStructuredRuleChange = (rule: KafkaStructuredParseRule) => {
    const defaults = getStructuredRuleDefaults(rule);
    setStructuredRule(rule);
    setMaxFlattenDepth(
      defaults.messageQueueMaxFlattenDepth ??
        (rule === KAFKA_STRUCTURED_PARSE_RULE.DEFAULT
          ? DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH
          : DEFAULT_KAFKA_MAX_FLATTEN_DEPTH)
    );
    setArrayHandleMode(
      defaults.messageQueueArrayHandleMode ??
        KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
    );
    setCurrentStep(0);
    setDraftRuleJson('');
    setDraftRuleGeneratedAt(undefined);
    setSaveDraftRuleJson('');
    if (rule === KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED) {
      setDraftPrompt(
        syncSourceDataStrategy.messageQueueAiRulePrompt?.trim() ||
          DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT
      );
    } else {
      setDraftPrompt(DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT);
    }
  };

  const ensureTopicReady = () => {
    if (!ensureTopicReadyForStreamParse(syncSourceDataStrategy)) {
      Message.warning('请先填写 Topic');
      return false;
    }
    return true;
  };

  const applyBasicSettings = (
    options: { clearRule?: boolean } = {}
  ): Partial<SyncSourceDataStrategyFormState> => {
    const updates: Partial<SyncSourceDataStrategyFormState> = {
      messageQueueStructuredParseRule: structuredRule,
      messageQueueMaxFlattenDepth: isPathManual ? undefined : maxFlattenDepth,
      messageQueueArrayHandleMode: isPathManual ? undefined : arrayHandleMode,
      messageQueueAiRulePrompt: isAiRule ? draftPrompt : undefined
    };
    if (options.clearRule || isDefaultRule) {
      updates.messageQueueAiRuleContent = undefined;
      updates.messageQueueAiRuleSavedAt = undefined;
    }
    return updates;
  };

  const handleApplyDefault = () => {
    const updates = applyBasicSettings({ clearRule: true });
    onStrategyUpdate(updates);
    syncFormFields({
      ...updates,
      messageQueueAiRuleContent: undefined,
      messageQueueAiRuleSavedAt: undefined
    });
    onClose();
    Message.success('解析配置已保存');
  };

  const handleConfirmRuleSave = (ruleRawOverride?: string) => {
    const ruleRaw = (ruleRawOverride ?? saveDraftRuleJson).trim();
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
      const updates: Partial<SyncSourceDataStrategyFormState> = {
        ...applyBasicSettings(),
        messageQueueAiRuleContent: ruleContent,
        messageQueueAiRuleSavedAt: savedAt
      };
      onStrategyUpdate(updates);
      syncFormFields(updates);
      setDraftRuleJson(ruleContent);
      const parsedFields = extractSourceFieldsFromKafkaRule(ruleContent);
      if (parsedFields.length) {
        onParseFieldsReady?.(parsedFields);
      }
      onClose();
      Message.success(isPathManual ? '解析配置已保存' : '解析配置已保存并入库');
    } catch (error) {
      Message.error(
        error instanceof Error
          ? error.message
          : isPathManual
            ? '规则格式无效，无法保存'
            : '规则格式无效，无法入库'
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!ensureTopicReady()) {
      return;
    }

    if (currentStep === 0) {
      if (isPathManual) {
        const ruleJson = pathEditorRef.current?.commit();
        if (!ruleJson) {
          return;
        }
        setDraftRuleJson(ruleJson);
        setDraftSampleText(pathEditorRef.current?.getSampleText() ?? '');
        setDraftTopicReadLimit(
          pathEditorRef.current?.getTopicReadLimit() ?? DEFAULT_TOPIC_READ_LIMIT
        );
        const parsedFields = extractSourceFieldsFromKafkaRule(ruleJson);
        if (parsedFields.length) {
          onParseFieldsReady?.(parsedFields);
        }
      } else if (isAiRule && !draftRuleJson.trim()) {
        Message.warning('请先生成 JSONPath 规则');
        return;
      }
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && isAiRule) {
      if (!draftRuleJson.trim()) {
        Message.warning('请先生成规则');
        return;
      }
      setSaveDraftRuleJson(formatSavedRulePreview(draftRuleJson));
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((step) => Math.max(0, step - 1) as ParseConfigStep);
  };

  const maxWorkflowStep: ParseConfigStep = isPathManual ? 1 : 2;

  const renderSaveStep = () => (
    <div className={styles['parse-config-save-step']}>
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
    </div>
  );

  const renderWorkflowStep = () => {
    if (currentStep === 0) {
      if (isPathManual) {
        return (
          <KafkaManualPathEditorModal
            ref={pathEditorRef}
            embedded
            flatLayout
            visible
            readOnly={readOnly}
            strategy={draftStrategy}
            initialRuleJson={draftRuleJson}
            onSave={setDraftRuleJson}
          />
        );
      }
      return (
        <KafkaAiRulePromptModal
          ref={aiPromptEditorRef}
          embedded
          visible
          readOnly={readOnly}
          strategy={draftStrategy}
          initialPrompt={draftPrompt}
          initialRuleJson={draftRuleJson}
          initialRuleGeneratedAt={draftRuleGeneratedAt}
          onGenerateLoadingChange={setAiGenerateLoading}
          onPromptSave={setDraftPrompt}
          onRuleGenerated={(ruleJson, generatedAt) => {
            setDraftRuleJson(ruleJson);
            setDraftRuleGeneratedAt(generatedAt);
            const parsedFields = extractSourceFieldsFromKafkaRule(ruleJson);
            if (parsedFields.length) {
              onParseFieldsReady?.(parsedFields);
            }
          }}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <KafkaAiRuleTestModal
          ref={aiTestEditorRef}
          embedded
          visible
          form={form}
          strategy={draftStrategy}
          mappingFields={syncMappingFields}
          objectTypeAttributes={objectTypeAttributes}
          setSyncMappingFields={setSyncMappingFields}
          initialRuleJson={draftRuleJson}
          initialSampleText={draftSampleText}
          initialTopicReadLimit={draftTopicReadLimit}
          readOnly={readOnly}
          onClose={() => undefined}
          onParseFieldsReady={onParseFieldsReady}
          onParseLoadingChange={setAiParseLoading}
        />
      );
    }

    if (isAiRule) {
      return renderSaveStep();
    }

    return null;
  };

  return (
    <Modal
      className={styles['parse-config-modal']}
      title="解析配置"
      visible={visible}
      onCancel={onClose}
      footer={
        <div className={styles['parse-config-modal-footer']}>
          {isAiRule && currentStep === 1 ? (
            <span className={styles['ai-rule-test-engine']}>
              规则引擎：yaml-jsonpath（Go:
              github.com/vmware-labs/yaml-jsonpath）
            </span>
          ) : null}
          {needsWorkflow ? (
            <Space className={styles['parse-config-modal-footer-actions']}>
              {isAiRule && currentStep === 0 ? (
                <Button
                  type="text"
                  disabled={readOnly}
                  loading={aiGenerateLoading}
                  onClick={() => void aiPromptEditorRef.current?.generateRule()}
                >
                  生成规则
                </Button>
              ) : null}
              {(isAiRule || isPathManual) && currentStep === 1 ? (
                <Button
                  type="text"
                  disabled={readOnly}
                  loading={aiParseLoading}
                  onClick={() => void aiTestEditorRef.current?.executeParse()}
                >
                  {isPathManual ? '测试' : '执行解析'}
                </Button>
              ) : null}
              {currentStep > 0 ? (
                <Button
                  type="text"
                  disabled={readOnly}
                  onClick={handlePrevStep}
                >
                  上一步
                </Button>
              ) : null}
              {currentStep < maxWorkflowStep ? (
                <Button
                  type="text"
                  disabled={readOnly}
                  onClick={handleNextStep}
                >
                  下一步
                </Button>
              ) : (
                <Button
                  type="text"
                  disabled={readOnly}
                  loading={saveLoading}
                  onClick={() =>
                    void handleConfirmRuleSave(
                      isPathManual ? draftRuleJson : undefined
                    )
                  }
                >
                  {isPathManual ? '保存' : '确认入库'}
                </Button>
              )}
            </Space>
          ) : (
            <Button
              type="text"
              disabled={readOnly}
              onClick={handleApplyDefault}
            >
              确定
            </Button>
          )}
        </div>
      }
      style={{ width: 'min(1200px, 96vw)' }}
      unmountOnExit
    >
      <div
        className={`${styles['parse-config-modal-body']}${isPathManual ? ` ${styles['parse-config-modal-body--path-manual']}` : ''}`}
      >
        <div className={styles['parse-config-basic']}>
          <div className={styles['parse-config-basic-main']}>
            <span className={styles['parse-config-section-label']}>
              解析规则
            </span>
            <Radio.Group
              className={styles['parse-config-rule-radio']}
              value={structuredRule}
              disabled={readOnly}
              onChange={handleStructuredRuleChange}
            >
              <Radio value={KAFKA_STRUCTURED_PARSE_RULE.DEFAULT}>
                默认规则
              </Radio>
              <Radio value={KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED}>
                AI生成规则
              </Radio>
              <Radio value={KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL}>
                {STRUCTURED_RULE_LABEL[KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL]}
              </Radio>
            </Radio.Group>
          </div>

          {!isPathManual ? (
            <div className={styles['parse-config-advanced']}>
              <div className={styles['parse-config-field']}>
                <span className={styles['parse-config-field-label']}>
                  最大展平深度
                </span>
                <InputNumber
                  className={`${formStyles['modeling-borderless-control']} ${styles['parse-config-field-input']}`}
                  min={1}
                  max={10}
                  precision={0}
                  disabled={depthDisabled}
                  value={maxFlattenDepth}
                  onChange={(depth) => {
                    if (isDefaultRule) {
                      return;
                    }
                    const normalized =
                      depth === undefined || depth === null
                        ? DEFAULT_KAFKA_MAX_FLATTEN_DEPTH
                        : Number(depth);
                    setMaxFlattenDepth(normalized);
                  }}
                />
              </div>
              <div className={styles['parse-config-field']}>
                <span className={styles['parse-config-field-label']}>
                  <Space size={4} align="center">
                    <span>数组处理模式</span>
                    <ArrayHandleModeHelpIcon />
                  </Space>
                </span>
                <Radio.Group
                  className={styles['parse-config-array-radio']}
                  value={arrayHandleMode}
                  disabled={arrayModeDisabled}
                  onChange={(mode: KafkaArrayHandleMode) => {
                    if (isDefaultRule) {
                      return;
                    }
                    setArrayHandleMode(mode);
                  }}
                >
                  <Radio value={KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN}>
                    {
                      KAFKA_ARRAY_HANDLE_MODE_LABEL[
                        KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN
                      ]
                    }
                  </Radio>
                  <Radio value={KAFKA_ARRAY_HANDLE_MODE.SPLIT_RECORDS}>
                    {
                      KAFKA_ARRAY_HANDLE_MODE_LABEL[
                        KAFKA_ARRAY_HANDLE_MODE.SPLIT_RECORDS
                      ]
                    }
                  </Radio>
                  <Radio value={KAFKA_ARRAY_HANDLE_MODE.RAW_STRING}>
                    {
                      KAFKA_ARRAY_HANDLE_MODE_LABEL[
                        KAFKA_ARRAY_HANDLE_MODE.RAW_STRING
                      ]
                    }
                  </Radio>
                </Radio.Group>
              </div>
            </div>
          ) : null}
        </div>

        {needsWorkflow ? (
          <div className={styles['parse-config-workflow']}>
            <div
              className={`${styles['parse-config-step-panel']}${isPathManual ? ` ${styles['parse-config-step-panel--path-manual']}` : ''}${isAiRule ? ` ${styles['parse-config-step-panel--ai-rule']}` : ''}`}
            >
              {renderWorkflowStep()}
            </div>
          </div>
        ) : (
          <div className={styles['parse-config-default-panel']}>
            <KafkaDefaultRulePreview />
          </div>
        )}
      </div>
    </Modal>
  );
}

export { STRUCTURED_RULE_LABEL, getStructuredRuleDefaults };
