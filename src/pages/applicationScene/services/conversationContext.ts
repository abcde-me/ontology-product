export interface ScenarioAssistantHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CN_PLATE_PATTERN =
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][·•.\-]?[A-HJ-NPR-Z0-9]{4,6}/gi;

const VIN_PATTERN = /[A-HJ-NPR-Z0-9]{11,17}/i;

const FOLLOW_UP_PATTERN =
  /^(?:那|这|它|他|她|其|还|再|继续|另外|然后|同时|以及)?(?:是|有|能|会|什么|多少|哪|几|怎么|如何|是不是|有没有)/;

const SHORT_ATTRIBUTE_QUERY =
  /品牌|型号|颜色|车主|司机|归属|所属|年限|年份|状态|类型|规格|重量|载重|吨|方量|油耗|里程|维修|费用|位置|加油|燃油/;

const PRONOUN_FOLLOW_UP = /^(?:这|那|它|他|她|其)(?:个|辆|台|条|件|种)?/;

export const extractEntityHintsFromText = (text: string): string[] => {
  const hints = new Set<string>();
  const normalized = text.trim();

  const plateMatches = normalized.match(CN_PLATE_PATTERN);
  plateMatches?.forEach((raw) => {
    hints.add(raw);
    hints.add(raw.toUpperCase());
    hints.add(raw.replace(/[··•.\-]/g, '').toUpperCase());
  });

  const vinMatch = normalized.match(VIN_PATTERN);
  if (vinMatch?.[0]) {
    hints.add(vinMatch[0].toUpperCase());
  }

  return [...hints];
};

export const isFollowUpQuery = (text: string): boolean => {
  const trimmed = text.replace(/[/\\？?！!。，,\s]+$/g, '').trim();
  if (!trimmed || trimmed.length > 48) {
    return false;
  }

  if (/^(?:创建|新建|添加|增加|更新|修改|编辑|调整|删除)/.test(trimmed)) {
    return false;
  }

  if (/^(?:查询|检索|搜索|推理)/.test(trimmed)) {
    return false;
  }

  if (CN_PLATE_PATTERN.test(trimmed) || VIN_PATTERN.test(trimmed)) {
    return false;
  }

  return (
    FOLLOW_UP_PATTERN.test(trimmed) ||
    SHORT_ATTRIBUTE_QUERY.test(trimmed) ||
    PRONOUN_FOLLOW_UP.test(trimmed) ||
    /^(?:多少|什么|哪个|哪些|是不是|有没有)/.test(trimmed) ||
    (trimmed.length <= 14 && /吗|呢|的$/.test(trimmed)) ||
    (trimmed.length <= 16 && /(?:是多少|有多少|是什么)$/.test(trimmed))
  );
};

export const extractEntitiesFromHistory = (
  history: ScenarioAssistantHistoryMessage[]
): string[] => {
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    extractEntityHintsFromText(message.content).forEach((hint) => {
      const key = hint.replace(/[··•.\-_\s]/g, '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        ordered.unshift(hint);
      }
    });
  }

  return ordered;
};

export const expandQueryWithHistory = (
  text: string,
  history: ScenarioAssistantHistoryMessage[]
): string => {
  const trimmed = text.trim();
  if (!trimmed || !history.length) {
    return trimmed;
  }

  if (extractEntityHintsFromText(trimmed).length > 0) {
    return trimmed;
  }

  if (!isFollowUpQuery(trimmed)) {
    return trimmed;
  }

  const entities = extractEntitiesFromHistory(history);
  const primaryEntity = entities[entities.length - 1];
  if (!primaryEntity) {
    return trimmed;
  }

  const question = trimmed.replace(/[/\\？?！!。，,\s]+$/g, '').trim();
  if (question.startsWith('的')) {
    return `${primaryEntity}${question}`;
  }

  return `${primaryEntity} ${question}`;
};

export const trimHistoryForLlm = (
  history: ScenarioAssistantHistoryMessage[],
  maxAssistantChars = 480
): ScenarioAssistantHistoryMessage[] =>
  history.map((message) => {
    if (
      message.role !== 'assistant' ||
      message.content.length <= maxAssistantChars
    ) {
      return message;
    }

    return {
      ...message,
      content: `${message.content.slice(0, maxAssistantChars)}…（已截断）`
    };
  });
