import React, { useMemo, useState } from 'react';
import { Button, Form, Radio, Tooltip } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import {
  KAFKA_MESSAGE_PARSE_MODE,
  KAFKA_MESSAGE_PARSE_MODE_LABEL,
  KAFKA_STRUCTURED_PARSE_RULE,
  KafkaMessageParseMode
} from '@/pages/ontologyScene/common/constants';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import KafkaParseConfigModal, {
  getStructuredRuleDefaults,
  STRUCTURED_RULE_LABEL
} from './KafkaParseConfigModal';
import styles from './KafkaMessageParseSettings.module.scss';

const FormItem = Form.Item;

interface KafkaMessageParseSettingsProps {
  form: any;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  setSyncMappingFields?: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  styles: Record<string, string>;
  readOnly?: boolean;
  onKafkaParseFieldsReady?: (fields: SourceTableField[]) => void;
}

export default function KafkaMessageParseSettings({
  form,
  syncSourceDataStrategy,
  syncMappingFields = [],
  objectTypeAttributes = [],
  setSyncMappingFields,
  onStrategyUpdate,
  styles: formStyles,
  readOnly = false,
  onKafkaParseFieldsReady
}: KafkaMessageParseSettingsProps) {
  const [configModalVisible, setConfigModalVisible] = useState(false);

  const parseMode =
    syncSourceDataStrategy.messageQueueParseMode ||
    KAFKA_MESSAGE_PARSE_MODE.NONE;
  const isStructured = parseMode === KAFKA_MESSAGE_PARSE_MODE.STRUCTURED;
  const structuredRule =
    syncSourceDataStrategy.messageQueueStructuredParseRule ||
    KAFKA_STRUCTURED_PARSE_RULE.DEFAULT;
  const needsRuleContent =
    structuredRule === KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED ||
    structuredRule === KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL;

  const configSummary = useMemo(() => {
    const ruleLabel = STRUCTURED_RULE_LABEL[structuredRule];
    if (!needsRuleContent) {
      return ruleLabel;
    }
    if (syncSourceDataStrategy.messageQueueAiRuleContent?.trim()) {
      return ruleLabel;
    }
    return `${ruleLabel} · 未完成配置`;
  }, [
    structuredRule,
    needsRuleContent,
    syncSourceDataStrategy.messageQueueAiRuleContent
  ]);

  const handleParseModeChange = (nextMode: KafkaMessageParseMode) => {
    const updates: Partial<SyncSourceDataStrategyFormState> = {
      messageQueueParseMode: nextMode
    };
    if (nextMode === KAFKA_MESSAGE_PARSE_MODE.STRUCTURED) {
      const rule =
        syncSourceDataStrategy.messageQueueStructuredParseRule ||
        KAFKA_STRUCTURED_PARSE_RULE.DEFAULT;
      const defaults = getStructuredRuleDefaults(rule);
      Object.assign(updates, {
        messageQueueStructuredParseRule: rule,
        ...defaults
      });
      onStrategyUpdate(updates);
      form.setFieldsValue({
        syncMessageQueueParseMode: nextMode,
        syncMessageQueueStructuredParseRule: rule,
        syncMessageQueueMaxFlattenDepth: defaults.messageQueueMaxFlattenDepth,
        syncMessageQueueArrayHandleMode: defaults.messageQueueArrayHandleMode
      });
      return;
    }

    updates.messageQueueStructuredParseRule = undefined;
    updates.messageQueueMaxFlattenDepth = undefined;
    updates.messageQueueArrayHandleMode = undefined;
    updates.messageQueueAiRulePrompt = undefined;
    updates.messageQueueAiRuleContent = undefined;
    updates.messageQueueAiRuleSavedAt = undefined;
    onStrategyUpdate(updates);
    form.setFieldsValue({
      syncMessageQueueParseMode: nextMode,
      syncMessageQueueStructuredParseRule: undefined,
      syncMessageQueueMaxFlattenDepth: undefined,
      syncMessageQueueArrayHandleMode: undefined,
      syncMessageQueueAiRulePrompt: undefined,
      syncMessageQueueAiRuleContent: undefined,
      syncMessageQueueAiRuleSavedAt: undefined
    });
  };

  return (
    <>
      <FormItem
        label="解析设置"
        field="syncMessageQueueParseMode"
        required
        rules={[{ required: true, message: '请选择解析设置' }]}
        initialValue={KAFKA_MESSAGE_PARSE_MODE.NONE}
      >
        <Radio.Group
          className={styles['kafka-parse-mode-radio']}
          value={parseMode}
          disabled={readOnly}
          onChange={handleParseModeChange}
        >
          <Radio value={KAFKA_MESSAGE_PARSE_MODE.NONE}>
            <span translate="no">
              {KAFKA_MESSAGE_PARSE_MODE_LABEL[KAFKA_MESSAGE_PARSE_MODE.NONE]}
            </span>
          </Radio>
          <Radio value={KAFKA_MESSAGE_PARSE_MODE.STRUCTURED}>
            <span translate="no">
              {
                KAFKA_MESSAGE_PARSE_MODE_LABEL[
                  KAFKA_MESSAGE_PARSE_MODE.STRUCTURED
                ]
              }
            </span>
          </Radio>
        </Radio.Group>
      </FormItem>

      {isStructured ? (
        <FormItem
          label="解析配置"
          field="syncMessageQueueStructuredParseRule"
          required
          rules={[
            {
              required: true,
              validator: (_value, callback) => {
                if (!syncSourceDataStrategy.messageQueueStructuredParseRule) {
                  callback('请完成解析配置');
                  return;
                }
                if (
                  needsRuleContent &&
                  !syncSourceDataStrategy.messageQueueAiRuleContent?.trim()
                ) {
                  callback('请完成解析配置并入库规则');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <div className={styles['parse-config-entry']}>
            <span className={styles['parse-config-entry-summary']}>
              {configSummary}
            </span>
            <Tooltip content="设置规则">
              <Button
                type="text"
                size="mini"
                icon={<IconSettings />}
                className={styles['parse-config-entry-btn']}
                disabled={readOnly}
                onClick={() => setConfigModalVisible(true)}
              />
            </Tooltip>
          </div>
        </FormItem>
      ) : null}

      <KafkaParseConfigModal
        visible={configModalVisible}
        readOnly={readOnly}
        form={form}
        syncSourceDataStrategy={syncSourceDataStrategy}
        syncMappingFields={syncMappingFields}
        objectTypeAttributes={objectTypeAttributes}
        setSyncMappingFields={setSyncMappingFields}
        formStyles={formStyles}
        onClose={() => setConfigModalVisible(false)}
        onStrategyUpdate={onStrategyUpdate}
        onParseFieldsReady={onKafkaParseFieldsReady}
      />
    </>
  );
}
