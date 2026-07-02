import { normalizeKafkaTopicName } from '../kafkaTopicNames';

const SENSOR_TOPIC_SAMPLE = `{
  "device_id": "S-10086",
  "timestamp": "2026-06-10T08:45:12Z",
  "payload": "{\\"temperature\\":25.6,\\"humidity\\":61.2,\\"status\\":\\"normal\\"}"
}`;

const CANAL_CDC_TOPIC_SAMPLE = `{
  "type": "INSERT",
  "database": "demo_db",
  "table": "sensor_reading",
  "data": [
    {
      "id": "1001",
      "device_id": "S-10086",
      "temperature": 25.6,
      "humidity": 61.2
    },
    {
      "id": "1002",
      "device_id": "S-10087",
      "temperature": 26.1,
      "humidity": 59.8
    }
  ]
}`;

const DEFAULT_TOPIC_SAMPLE = `{
  "event_id": "evt-001",
  "event_time": "2026-06-10T08:45:12Z",
  "payload": "{\\"code\\":\\"OK\\",\\"value\\":123}"
}`;

function resolveMockSampleByTopic(topic?: string): string {
  const normalized = topic?.trim().toLowerCase() || '';
  if (
    normalized.includes('sensor') ||
    normalized.includes('telemetry') ||
    normalized.includes('device')
  ) {
    return SENSOR_TOPIC_SAMPLE;
  }
  if (normalized.includes('canal') || normalized.includes('cdc')) {
    return CANAL_CDC_TOPIC_SAMPLE;
  }
  return DEFAULT_TOPIC_SAMPLE;
}

const DEFAULT_TOPIC_READ_LIMIT = 1;
const MAX_TOPIC_READ_LIMIT = 20;

function normalizeTopicReadLimit(limit?: number): number {
  const numeric = Number(limit);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_TOPIC_READ_LIMIT;
  }
  return Math.min(
    MAX_TOPIC_READ_LIMIT,
    Math.max(DEFAULT_TOPIC_READ_LIMIT, Math.floor(numeric))
  );
}

function buildMockMessageVariants(baseRaw: string, count: number): string[] {
  const parsed = JSON.parse(baseRaw) as Record<string, unknown>;
  return Array.from({ length: count }, (_, index) => {
    const variant: Record<string, unknown> = {
      ...parsed,
      _sample_index: index + 1
    };
    if (typeof variant.device_id === 'string') {
      variant.device_id = `S-${10086 + index}`;
    }
    if (typeof variant.event_id === 'string') {
      variant.event_id = `evt-${String(index + 1).padStart(3, '0')}`;
    }
    return JSON.stringify(variant, null, 2);
  });
}

function formatTopicSampleMessages(messages: string[]): string {
  if (messages.length === 1) {
    return messages[0];
  }
  const items = messages.map((item) => JSON.parse(item));
  return JSON.stringify(items, null, 2);
}

/** 从 Topic 读取消息样本（当前为 mock，后续对接 Kafka 消费 API） */
export async function fetchKafkaTopicSampleMessage(input: {
  connectorId?: number;
  topic?: string;
  limit?: number;
}): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  void input.connectorId;
  const limit = normalizeTopicReadLimit(input.limit);
  const normalizedTopic = normalizeKafkaTopicName(input.topic);
  const base = resolveMockSampleByTopic(normalizedTopic);
  const messages = buildMockMessageVariants(base, limit);
  return formatTopicSampleMessages(messages);
}

export { DEFAULT_TOPIC_READ_LIMIT, MAX_TOPIC_READ_LIMIT };
