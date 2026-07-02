import {
  DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH,
  KAFKA_ARRAY_HANDLE_MODE,
  KafkaArrayHandleMode
} from '@/pages/ontologyScene/common/constants';

export const DEFAULT_RULE_DEMO_SAMPLE = {
  device_id: 'S-10086',
  event_time: '2026-06-10T08:45:12Z',
  user: {
    name: '张三',
    profile: {
      city: '北京',
      level: 'vip'
    }
  },
  tags: ['sensor', 'online'],
  payload: '{"temperature":25.6,"humidity":61.2,"status":"normal"}',
  readings: [
    { metric: 'temp', value: 25.6 },
    { metric: 'humidity', value: 61.2 }
  ],
  metadata: {
    source: 'telemetry',
    extra: { batch: 'B001', line: 'L2' }
  }
} as const;

export interface DefaultRulePreviewRow {
  name: string;
  valueText: string;
  limitation?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenObjectFields(
  source: Record<string, unknown>,
  maxDepth: number,
  prefix = '',
  depth = 0
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  Object.entries(source).forEach(([key, value]) => {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value) && depth < maxDepth) {
      Object.assign(
        record,
        flattenObjectFields(value, maxDepth, fieldName, depth + 1)
      );
      return;
    }
    record[fieldName] = value;
  });

  return record;
}

function flattenArrayField(
  fieldName: string,
  value: unknown
): Record<string, unknown> {
  if (!Array.isArray(value)) {
    return { [fieldName]: value };
  }
  const flattened: Record<string, unknown> = {};
  value.forEach((item, index) => {
    flattened[`${fieldName}_${index}`] = item;
  });
  return flattened;
}

function applyArrayHandleMode(
  record: Record<string, unknown>,
  arrayHandleMode: KafkaArrayHandleMode
): Record<string, unknown> {
  if (arrayHandleMode === KAFKA_ARRAY_HANDLE_MODE.RAW_STRING) {
    return Object.fromEntries(
      Object.entries(record).map(([fieldName, value]) => [
        fieldName,
        Array.isArray(value) ? JSON.stringify(value) : value
      ])
    );
  }

  if (arrayHandleMode !== KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN) {
    return record;
  }

  return Object.entries(record).reduce<Record<string, unknown>>(
    (acc, [fieldName, value]) => {
      Object.assign(acc, flattenArrayField(fieldName, value));
      return acc;
    },
    {}
  );
}

function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function detectLimitation(
  fieldName: string,
  value: unknown
): string | undefined {
  if (
    typeof value === 'string' &&
    (value.trim().startsWith('{') || value.trim().startsWith('['))
  ) {
    return '字符串 JSON 不会自动反序列化，内层字段需手动配置路径';
  }

  if (/_\d+$/.test(fieldName) && isPlainObject(value)) {
    return '数组元素为对象时，无法直接提取内层 metric/value 等字段';
  }

  if (isPlainObject(value)) {
    return fieldName.includes('.')
      ? '超过展平深度，嵌套对象保留原样'
      : '嵌套对象未继续展平';
  }

  return undefined;
}

export function buildDefaultRulePreviewRows(options?: {
  maxFlattenDepth?: number;
  arrayHandleMode?: KafkaArrayHandleMode;
}): DefaultRulePreviewRow[] {
  const maxFlattenDepth =
    options?.maxFlattenDepth ?? DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH;
  const arrayHandleMode =
    options?.arrayHandleMode ?? KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN;

  const flattened = flattenObjectFields(
    DEFAULT_RULE_DEMO_SAMPLE as unknown as Record<string, unknown>,
    maxFlattenDepth
  );
  const record = applyArrayHandleMode(flattened, arrayHandleMode);

  return Object.entries(record).map(([name, value]) => ({
    name,
    valueText: formatPreviewValue(value),
    limitation: detectLimitation(name, value)
  }));
}

export function formatDefaultRuleDemoSample(): string {
  return JSON.stringify(DEFAULT_RULE_DEMO_SAMPLE, null, 2);
}
