import type { ApplicationScenarioNlParseResult } from '../types';
import {
  expandQueryWithHistory,
  isFollowUpQuery,
  type ScenarioAssistantHistoryMessage
} from './conversationContext';

const RULE_CREATE_PREFIX =
  /^(?:创建|新建|添加|增加)(?:一条|一个|)?(?:场景规则|规则)/;

const RULE_UPDATE_PREFIX = /^(?:更新|修改|编辑|调整)(?:场景规则|规则)/;

const RULE_INFO_QUERY_PATTERN =
  /^(?:查询|检索|查看|列出|显示|搜索|有哪些|多少条|几条)(?:场景)?规则(?:[？?！!。，,\s]|$)/;

const RULE_INFO_LIST_PATTERN =
  /(?:场景)?规则(?:有哪些|列表|清单|详情|信息|内容)(?:[？?！!。，,\s]|$)/;

export const isRuleCreateIntent = (text: string): boolean =>
  RULE_CREATE_PREFIX.test(text.trim());

export const isRuleUpdateIntent = (text: string): boolean => {
  const trimmed = text.trim();
  return (
    RULE_UPDATE_PREFIX.test(trimmed) ||
    /^修改规则\s/.test(trimmed) ||
    /^更新规则\s/.test(trimmed)
  );
};

export const isRuleInfoQueryIntent = (text: string): boolean => {
  const trimmed = text.trim();
  if (isRuleCreateIntent(trimmed) || isRuleUpdateIntent(trimmed)) {
    return false;
  }
  if (/按规则|根据规则|基于规则/.test(trimmed)) {
    return false;
  }
  return (
    RULE_INFO_QUERY_PATTERN.test(trimmed) ||
    RULE_INFO_LIST_PATTERN.test(trimmed) ||
    /^(?:场景)?规则(?:有哪些|列表|清单)/.test(trimmed)
  );
};

const splitNameContent = (input: string) => {
  const byColon = input.split(/[:：]/);
  if (byColon.length >= 2) {
    return {
      name: byColon[0].trim(),
      content: byColon.slice(1).join('：').trim()
    };
  }

  return {
    name: input.slice(0, 24).trim() || '未命名规则',
    content: input.trim()
  };
};

const splitConditionAction = (content: string) => {
  const thenSplit = content.split(/[，,；;]\s*则\s*/);
  if (thenSplit.length >= 2) {
    return {
      condition: thenSplit[0].trim(),
      action: thenSplit.slice(1).join('则').trim()
    };
  }

  const inputActionMatch = content.match(
    /^(.{0,48}?输入[^，,；;]+)[，,；;]\s*(.+)$/
  );
  if (inputActionMatch) {
    return {
      condition: inputActionMatch[1].trim(),
      action: inputActionMatch[2].trim()
    };
  }

  return {
    condition: content,
    action: '按规则筛选图谱实例'
  };
};

const deriveRuleName = (name: string, condition: string, action: string) => {
  if (
    name &&
    name !== condition &&
    name.length <= 24 &&
    !/[，,；;]/.test(name)
  ) {
    return name;
  }

  const inputNameMatch = condition.match(/输入(.{2,12})/);
  if (inputNameMatch?.[1]) {
    return `${inputNameMatch[1]}查询`.slice(0, 20);
  }

  const actionKeyword = action.match(
    /(?:查询|反馈|统计|检索|展示)(?:并反馈)?(?:该|此)?(.{2,12})/
  );
  if (actionKeyword?.[1]) {
    return actionKeyword[1].replace(/[的的信息状态数据]+$/g, '').slice(0, 20);
  }

  return condition.slice(0, 20) || '未命名规则';
};

const parseCreateRule = (text: string): ApplicationScenarioNlParseResult => {
  const stripped = text
    .trim()
    .replace(
      /^(?:创建|新建|添加|增加)(?:一条|一个|)?(?:场景规则|规则)[，,：:\s]*/i,
      ''
    )
    .trim();

  const { name, content } = splitNameContent(stripped);
  const { condition, action } = splitConditionAction(content);

  return {
    intent: 'create_rule',
    name: deriveRuleName(name, condition, action),
    condition,
    action,
    message: `将创建规则「${deriveRuleName(name, condition, action)}」`
  };
};

const parseUpdateRule = (
  namePart: string,
  contentPart: string
): ApplicationScenarioNlParseResult => {
  const { name, content } = splitNameContent(contentPart);
  const resolvedName = namePart.trim() || name;
  const { condition, action } = splitConditionAction(content);

  return {
    intent: 'update_rule',
    name: resolvedName,
    condition: condition?.trim() || content,
    action: action?.trim(),
    message: `将更新规则「${resolvedName}」`
  };
};

const RULE_INFO_UNSUPPORTED_REPLY =
  '暂不支持查询规则信息。请在左侧「规则管理」面板查看规则，或使用「创建规则：…」「修改规则 名称：…」管理规则，使用「查询…」检索图谱实例。';

export const parseApplicationScenarioNaturalLanguage = (
  text: string,
  history: ScenarioAssistantHistoryMessage[] = []
): ApplicationScenarioNlParseResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { intent: 'unknown', message: '请输入自然语言指令' };
  }

  if (isRuleInfoQueryIntent(trimmed)) {
    return {
      intent: 'chat',
      reply: RULE_INFO_UNSUPPORTED_REPLY,
      message: '不支持查询规则信息'
    };
  }

  if (isRuleCreateIntent(trimmed)) {
    return parseCreateRule(trimmed);
  }

  const updateRuleMatch = trimmed.match(
    /^(?:更新|修改|编辑|调整)(?:场景规则|规则)\s*(.+?)[:：]\s*(.+)$/i
  );
  if (updateRuleMatch) {
    return parseUpdateRule(updateRuleMatch[1], updateRuleMatch[2]);
  }

  const updateRuleShortMatch = trimmed.match(/^修改规则\s+(.+?)[:：]\s*(.+)$/i);
  if (updateRuleShortMatch) {
    return parseUpdateRule(updateRuleShortMatch[1], updateRuleShortMatch[2]);
  }

  const createRuleExplicitMatch = trimmed.match(
    /^(?:创建|新建|添加)(?:场景规则|规则)[:：]?\s*(.+)$/i
  );
  if (createRuleExplicitMatch) {
    return parseCreateRule(trimmed);
  }

  const queryMatch = trimmed.match(/^(?:查询|检索|推理|搜索)(.+)$/i);
  if (queryMatch) {
    return {
      intent: 'query_instances',
      queryText: queryMatch[1].trim() || trimmed,
      message: '将执行实例推理查询'
    };
  }

  if (/^(?:执行|应用|运行)(?:场景)?规则/.test(trimmed)) {
    return {
      intent: 'query_instances',
      queryText: trimmed,
      message: '将按规则执行实例推理查询'
    };
  }

  if (/按规则|根据规则|基于规则/.test(trimmed)) {
    return {
      intent: 'query_instances',
      queryText: trimmed,
      message: '将按规则执行实例推理查询'
    };
  }

  if (
    /查询|检索|推理|实例|覆盖|统计|对象类型|车辆|车牌|油耗|里程|品牌|型号/.test(
      trimmed
    ) ||
    /有.+车辆|车辆.+吗|哪些.+车|有没有.+车|我想知道|想知道.+多少|是多少/.test(
      trimmed
    )
  ) {
    const queryText =
      history.length > 0 ? expandQueryWithHistory(trimmed, history) : trimmed;

    return {
      intent: 'query_instances',
      queryText,
      message: '将执行实例推理查询'
    };
  }

  if (history.length && isFollowUpQuery(trimmed)) {
    const expandedQuery = expandQueryWithHistory(trimmed, history);
    if (expandedQuery !== trimmed) {
      return {
        intent: 'query_instances',
        queryText: expandedQuery,
        message: '结合对话上下文执行实例推理查询'
      };
    }
  }

  return {
    intent: 'chat',
    reply:
      '请使用「创建规则：…」「修改规则 名称：…」或「查询…」等指令，我将协助管理规则并推理图谱实例。',
    message: '普通对话'
  };
};

export { RULE_INFO_UNSUPPORTED_REPLY };
