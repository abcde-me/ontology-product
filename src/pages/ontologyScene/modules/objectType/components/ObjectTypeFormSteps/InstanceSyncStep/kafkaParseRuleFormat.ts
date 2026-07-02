import dayjs from 'dayjs';
import {
  formatKafkaJsonPathRule,
  parseKafkaJsonPathRule
} from '../../../services/kafkaJsonPathRule/applyKafkaJsonPathRule';

export function formatRuleSavedAt(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : raw;
}

export function formatSavedRulePreview(raw: string): string {
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
