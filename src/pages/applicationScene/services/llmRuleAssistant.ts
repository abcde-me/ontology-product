import {
  resolveDirectLlmRequestUrl,
  runDirectLlmChatStream,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { AI_WORKBENCH_LLM_CONFIG } from '@/pages/aiOntologyWorkbench/config/llm';
import type {
  ApplicationScenarioNlParseResult,
  ApplicationScenarioRule,
  ThinkingProgressCallbacks
} from '../types';
import {
  expandQueryWithHistory,
  isFollowUpQuery,
  trimHistoryForLlm,
  type ScenarioAssistantHistoryMessage
} from './conversationContext';
import {
  isRuleCreateIntent,
  isRuleInfoQueryIntent,
  isRuleUpdateIntent,
  parseApplicationScenarioNaturalLanguage,
  RULE_INFO_UNSUPPORTED_REPLY
} from './ruleNlInterpreter';

export type { ScenarioAssistantHistoryMessage };

const MAX_HISTORY_TURNS = 10;

const SYSTEM_PROMPT = `你是应用场景规则助手。根据用户自然语言，解析为以下意图之一并输出合法 JSON（不要 markdown）：
{"intent":"create_rule|update_rule|query_instances|chat","name":"规则名称","condition":"触发条件","action":"执行动作","queryText":"查询文本","reply":"普通回复"}
意图判定优先级（必须严格遵守）：
1. 创建/新建/添加/增加规则 → create_rule（即使用户描述中包含「查询」「检索」等词，只要是在定义规则行为，一律 create_rule）
2. 更新/修改/编辑规则 → update_rule，需 name，可更新 condition/action
3. 查询/检索/推理/统计/按规则/执行规则/基于规则查询图谱实例数据 → query_instances，需 queryText
4. 用户要求查看/列出/检索规则本身的信息（如「有哪些规则」「查询规则列表」）→ chat，reply 说明不支持查询规则信息
5. 其他 → chat，reply 用简洁中文说明
字段要求：
- create_rule 需 name、condition、action；condition 为触发条件，action 为执行动作
- condition/action 用中文，简洁可执行
- 结合对话历史理解省略指代、追问和修正，queryText 必须补全为可独立执行的完整查询
- 追问上一辆车/实体属性时一律 query_instances，不要 chat
- 仅当用户明确换话题或与上文无关时，忽略历史上下文`;

const applyHistoryContext = (
  result: ApplicationScenarioNlParseResult,
  text: string,
  history: ScenarioAssistantHistoryMessage[]
): ApplicationScenarioNlParseResult => {
  if (!history.length) {
    return result;
  }

  const expandedQuery = expandQueryWithHistory(
    result.queryText || text,
    history
  );

  if (result.intent === 'query_instances') {
    return {
      ...result,
      queryText: expandedQuery
    };
  }

  if (
    isFollowUpQuery(text) &&
    expandedQuery !== text &&
    (result.intent === 'chat' || result.intent === 'unknown')
  ) {
    return {
      intent: 'query_instances',
      queryText: expandedQuery,
      message: '结合对话上下文执行实例推理查询'
    };
  }

  return result;
};

const extractJsonFromLlmContent = (content: string): unknown => {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
};

const buildRulesContext = (rules: ApplicationScenarioRule[]) => {
  if (!rules.length) {
    return '当前无规则。';
  }

  return rules
    .map(
      (rule) =>
        `- ${rule.name}（启用=${rule.enabled}）：若 ${rule.condition}，则 ${rule.action}`
    )
    .join('\n');
};

const sanitizeLlmResult = (
  parsed: unknown,
  fallback: ApplicationScenarioNlParseResult
): ApplicationScenarioNlParseResult => {
  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }

  const record = parsed as Record<string, unknown>;
  const intent = String(
    record.intent || ''
  ).trim() as ApplicationScenarioNlParseResult['intent'];
  const allowed: ApplicationScenarioNlParseResult['intent'][] = [
    'create_rule',
    'update_rule',
    'query_instances',
    'chat',
    'unknown'
  ];

  if (!allowed.includes(intent)) {
    return fallback;
  }

  return {
    intent,
    name: String(record.name || '').trim() || fallback.name,
    condition: String(record.condition || '').trim() || fallback.condition,
    action: String(record.action || '').trim() || fallback.action,
    queryText: String(record.queryText || '').trim() || fallback.queryText,
    reply: String(record.reply || '').trim() || fallback.reply,
    message: fallback.message
  };
};

const buildHistoryMessages = (
  history: ScenarioAssistantHistoryMessage[]
): DirectLlmMessage[] => {
  const recent = trimHistoryForLlm(history).slice(-MAX_HISTORY_TURNS * 2);

  return recent.map((item) => ({
    role: item.role,
    content: item.content
  }));
};

const reconcileParseResult = (
  llmResult: ApplicationScenarioNlParseResult,
  fallback: ApplicationScenarioNlParseResult,
  text: string,
  history: ScenarioAssistantHistoryMessage[]
): ApplicationScenarioNlParseResult => {
  if (isRuleInfoQueryIntent(text)) {
    return {
      intent: 'chat',
      reply: RULE_INFO_UNSUPPORTED_REPLY,
      message: '不支持查询规则信息'
    };
  }

  if (isRuleCreateIntent(text)) {
    const createResult =
      fallback.intent === 'create_rule' ? fallback : llmResult;
    if (createResult.intent === 'create_rule') {
      return createResult;
    }
    return fallback.intent === 'create_rule' ? fallback : llmResult;
  }

  if (isRuleUpdateIntent(text)) {
    const updateResult =
      fallback.intent === 'update_rule' ? fallback : llmResult;
    if (updateResult.intent === 'update_rule') {
      return updateResult;
    }
    return fallback.intent === 'update_rule' ? fallback : llmResult;
  }

  if (
    fallback.intent === 'query_instances' &&
    (llmResult.intent === 'chat' || llmResult.intent === 'unknown')
  ) {
    return applyHistoryContext(fallback, text, history);
  }

  return applyHistoryContext(llmResult, text, history);
};

const describeParseIntent = (result: ApplicationScenarioNlParseResult) => {
  switch (result.intent) {
    case 'create_rule':
      return `创建规则「${result.name || '未命名'}」`;
    case 'update_rule':
      return `更新规则「${result.name || ''}」`;
    case 'query_instances':
      return `实例查询：${result.queryText || ''}`;
    case 'chat':
      return result.message === '不支持查询规则信息'
        ? '不支持查询规则信息'
        : '普通对话';
    default:
      return result.message || '未知意图';
  }
};

const parseWithLlmStream = async (
  messages: DirectLlmMessage[],
  fallback: ApplicationScenarioNlParseResult,
  progress?: ThinkingProgressCallbacks
): Promise<ApplicationScenarioNlParseResult> => {
  let answerContent = '';
  let reasoningStarted = false;

  progress?.onThinkingLine?.('▸ 解析用户意图（大模型）…');

  await new Promise<void>((resolve, reject) => {
    void runDirectLlmChatStream({
      messages,
      thinking: { type: 'enabled' },
      callbacks: {
        onMessage: (event) => {
          const type = String(event.type || '');
          const chunk = String(event.content || '');

          if (type === 'thinking' && chunk) {
            if (!reasoningStarted) {
              reasoningStarted = true;
              progress?.onThinkingLine?.('  模型推理：');
            }
            progress?.onThinkingChunk?.(chunk);
            return;
          }

          if ((type === 'answer' || !type || type === 'message') && chunk) {
            answerContent += chunk;
          }
        },
        onClose: () => resolve(),
        onError: (error) => reject(error)
      }
    });
  });

  if (reasoningStarted) {
    progress?.onThinkingLine?.('');
  }

  const parsed = extractJsonFromLlmContent(answerContent);
  return sanitizeLlmResult(parsed, fallback);
};

export const parseApplicationScenarioWithLlm = async (
  text: string,
  rules: ApplicationScenarioRule[],
  history: ScenarioAssistantHistoryMessage[] = [],
  progress?: ThinkingProgressCallbacks
): Promise<ApplicationScenarioNlParseResult> => {
  const fallback = parseApplicationScenarioNaturalLanguage(text, history);
  const { apiKey, model } = AI_WORKBENCH_LLM_CONFIG;

  if (!apiKey?.trim()) {
    progress?.onThinkingLine?.('▸ 使用启发式规则解析意图…');
    const result = reconcileParseResult(fallback, fallback, text, history);
    progress?.onThinkingLine?.(`▸ ${describeParseIntent(result)}`);
    return result;
  }

  const messages: DirectLlmMessage[] = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n当前规则：\n${buildRulesContext(rules)}`
    },
    ...buildHistoryMessages(history),
    { role: 'user', content: text }
  ];

  try {
    let result: ApplicationScenarioNlParseResult;

    if (progress?.onThinkingLine || progress?.onThinkingChunk) {
      result = await parseWithLlmStream(messages, fallback, progress);
    } else {
      const response = await fetch(resolveDirectLlmRequestUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          thinking: { type: 'disabled' }
        })
      });

      if (!response.ok) {
        progress?.onThinkingLine?.('▸ 大模型不可用，回退启发式解析…');
        const reconciled = reconcileParseResult(
          fallback,
          fallback,
          text,
          history
        );
        progress?.onThinkingLine?.(`▸ ${describeParseIntent(reconciled)}`);
        return reconciled;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content || '';
      const parsed = extractJsonFromLlmContent(content);
      result = sanitizeLlmResult(parsed, fallback);
    }

    result = reconcileParseResult(result, fallback, text, history);

    progress?.onThinkingLine?.(`▸ ${describeParseIntent(result)}`);
    return result;
  } catch {
    progress?.onThinkingLine?.('▸ 大模型解析失败，回退启发式解析…');
    const result = reconcileParseResult(fallback, fallback, text, history);
    progress?.onThinkingLine?.(`▸ ${describeParseIntent(result)}`);
    return result;
  }
};
