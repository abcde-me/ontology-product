import {
  INSTANCE_SYNC_SOURCE_TYPE,
  KAFKA_MESSAGE_PARSE_MODE,
  KAFKA_STRUCTURED_PARSE_RULE
} from '@/pages/ontologyScene/common/constants';
import { SyncSourceDataStrategyFormState } from './types';

export function supportsTopicSampleFetch(
  strategy: Pick<SyncSourceDataStrategyFormState, 'instanceSyncSourceType'>
): boolean {
  return (
    strategy.instanceSyncSourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
  );
}

export function isStreamParseSettingsConfigured(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    | 'messageQueueParseMode'
    | 'messageQueueStructuredParseRule'
    | 'messageQueueMaxFlattenDepth'
    | 'messageQueueArrayHandleMode'
    | 'messageQueueAiRuleContent'
  >
): boolean {
  if (!strategy.messageQueueParseMode) {
    return false;
  }
  if (strategy.messageQueueParseMode === KAFKA_MESSAGE_PARSE_MODE.STRUCTURED) {
    if (!strategy.messageQueueStructuredParseRule) {
      return false;
    }
    if (
      strategy.messageQueueStructuredParseRule ===
      KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL
    ) {
      return !!strategy.messageQueueAiRuleContent?.trim();
    }
    const hasDepthAndArray =
      strategy.messageQueueMaxFlattenDepth !== undefined &&
      Number.isFinite(Number(strategy.messageQueueMaxFlattenDepth)) &&
      Number(strategy.messageQueueMaxFlattenDepth) >= 1 &&
      !!strategy.messageQueueArrayHandleMode;
    if (!hasDepthAndArray) {
      return false;
    }
    if (
      strategy.messageQueueStructuredParseRule ===
      KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED
    ) {
      return !!strategy.messageQueueAiRuleContent?.trim();
    }
    return true;
  }
  return true;
}

export function ensureTopicReadyForStreamParse(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    'instanceSyncSourceType' | 'messageQueueTopic'
  >
): boolean {
  if (!supportsTopicSampleFetch(strategy)) {
    return true;
  }
  if (!strategy.messageQueueTopic?.trim()) {
    return false;
  }
  return true;
}

export function buildStreamParseFormValidateFields(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    | 'messageQueueConnectorId'
    | 'apiConnectorId'
    | 'messageQueueParseMode'
    | 'messageQueueStructuredParseRule'
  >
): string[] {
  if (!strategy.messageQueueConnectorId && !strategy.apiConnectorId) {
    return [];
  }

  const fields = ['syncMessageQueueParseMode'];
  if (strategy.messageQueueParseMode === KAFKA_MESSAGE_PARSE_MODE.STRUCTURED) {
    fields.push(
      'syncMessageQueueStructuredParseRule',
      'syncMessageQueueMaxFlattenDepth',
      'syncMessageQueueArrayHandleMode'
    );
    if (
      strategy.messageQueueStructuredParseRule ===
        KAFKA_STRUCTURED_PARSE_RULE.AI_GENERATED ||
      strategy.messageQueueStructuredParseRule ===
        KAFKA_STRUCTURED_PARSE_RULE.PATH_MANUAL
    ) {
      fields.push('syncMessageQueueAiRuleContent');
    }
  }
  return fields;
}
