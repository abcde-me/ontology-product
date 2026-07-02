/** 旧版 mock / 配置里可能出现的中文 Topic 别名 → 真实 Topic 名 */
const LEGACY_KAFKA_TOPIC_ALIASES: Record<string, string> = {
  传感器原始读数: 'sensor.raw.readings',
  传感器聚合指标: 'sensor.aggregated.metrics',
  传感器告警: 'sensor.alerts',
  传感器警报: 'sensor.alerts',
  设备遥测: 'device.telemetry',
  设备状态事件: 'device.status.events'
};

export const SENSOR_KAFKA_TOPICS = [
  'sensor.raw.readings',
  'sensor.aggregated.metrics',
  'sensor.alerts',
  'device.telemetry',
  'device.status.events'
] as const;

export const GENERIC_KAFKA_TOPICS = [
  'events.raw',
  'events.processed',
  'metrics.stream'
] as const;

export function normalizeKafkaTopicName(topic?: string): string | undefined {
  const trimmed = topic?.trim();
  if (!trimmed) {
    return undefined;
  }
  return LEGACY_KAFKA_TOPIC_ALIASES[trimmed] || trimmed;
}

/** 界面展示 Topic：统一为真实 Topic 名，不显示中文别名 */
export function formatKafkaTopicDisplayName(topic?: string): string {
  return normalizeKafkaTopicName(topic) || '未配置 Topic';
}

export function sanitizeKafkaTopicList(topics: string[]): string[] {
  return Array.from(
    new Set(
      topics
        .map((topic) => normalizeKafkaTopicName(topic))
        .filter((topic): topic is string => !!topic)
    )
  );
}

/** 下拉选项始终使用 canonical Topic 名（英文/真实值），不展示中文别名 */
export function buildKafkaTopicSelectOptions(
  topics: string[],
  currentTopic?: string
): Array<{ label: string; value: string }> {
  const normalizedCurrent = normalizeKafkaTopicName(currentTopic);
  const merged = sanitizeKafkaTopicList(
    normalizedCurrent ? [...topics, normalizedCurrent] : topics
  );

  return merged.map((topic) => {
    const canonical = normalizeKafkaTopicName(topic) || topic;
    return {
      label: canonical,
      value: canonical
    };
  });
}
