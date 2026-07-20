/**
 * 关系挖掘结果对话问答：可选注入关系图谱、发现总结与发现详情。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { IMPLICIT_RELATION_RESULT_QA_SCENARIO } from '@/services/llmScenarios/definitions/implicitRelationResultQa.scenario';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  ImplicitAnalysisScope,
  ImplicitDiscoveryResult,
  ImplicitRelationTask
} from '../types';
import {
  formatInstanceScopeSummary,
  formatObjectTypeSummary
} from './scopeInstances';

export interface RelationMiningChatConfig {
  /** 是否注入关系图谱（确认边） */
  includeGraph: boolean;
  /** 是否注入发现总结（summary） */
  includeSummary: boolean;
  /** 是否注入发现详情（挖掘候选边） */
  includeDiscoveries: boolean;
}

export interface RelationMiningChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskRelationMiningChatInput {
  question: string;
  history?: RelationMiningChatMessage[];
  task: Pick<ImplicitRelationTask, 'id' | 'name' | 'description' | 'scope'>;
  result: ImplicitDiscoveryResult;
  config: RelationMiningChatConfig;
  signal?: AbortSignal;
}

const MAX_HISTORY_TURNS = 8;
const MAX_CONFIRMED_EDGES = 40;
const MAX_DISCOVERIES = 20;

const SYSTEM_PROMPT = `你是本体关系挖掘问答助手。请严格依据提供的「分析范围、关系图谱、发现总结、发现详情」回答用户问题。
要求：
1. 仅基于给定上下文作答，不要编造未出现的节点、关系或证据
2. 回答简洁专业，使用中文；必要时引用具体实例对与置信度
3. 若上下文不足以回答，明确说明缺少哪类信息（图谱/总结/发现关系/证据）
4. 可给出复核建议，但不要声称已写入本体模型
直接输出自然语言回复，不要 JSON，不要 markdown 代码块。`;

const buildScopeText = (scope?: ImplicitAnalysisScope) => {
  if (!scope) {
    return '未配置';
  }
  return [
    `场景：${scope.ontologySceneName || `#${scope.ontologySceneId}`}`,
    `对象类型：${formatObjectTypeSummary(scope.objectTypes)}`,
    `实例：${formatInstanceScopeSummary(
      scope.instanceMode,
      scope.instances.length,
      scope.objectTypes.length
    )}`
  ].join('；');
};

const hasAnyScope = (config: RelationMiningChatConfig) =>
  config.includeGraph || config.includeSummary || config.includeDiscoveries;

export const buildRelationMiningChatContext = (params: {
  task: AskRelationMiningChatInput['task'];
  result: ImplicitDiscoveryResult;
  config: RelationMiningChatConfig;
}): string => {
  const { task, result, config } = params;
  const sections: string[] = [
    `任务：${task.name}`,
    task.description ? `描述：${task.description}` : '',
    `算法：${DISCOVERY_ALGORITHM_LABEL[result.algorithm] || result.algorithm}`,
    `分析范围：${buildScopeText(task.scope)}`,
    `确认关系数：${result.confirmedEdges.length}`,
    `挖掘关系数：${result.discoveries.length}`
  ].filter(Boolean);

  if (config.includeSummary) {
    sections.push(
      `发现总结：${result.summary?.trim() || '（暂无总结，可先执行发现）'}`
    );
  }

  if (config.includeGraph) {
    const confirmed = result.confirmedEdges
      .slice(0, MAX_CONFIRMED_EDGES)
      .map(
        (edge) =>
          `${edge.sourceNodeName} -[${edge.linkName}]-> ${edge.targetNodeName}`
      );
    sections.push(
      [
        '关系图谱：',
        `【确认关系（最多 ${MAX_CONFIRMED_EDGES} 条）】`,
        confirmed.length ? confirmed.join('\n') : '（无）'
      ].join('\n')
    );
  }

  if (config.includeDiscoveries) {
    const discoveries = result.discoveries
      .slice(0, MAX_DISCOVERIES)
      .map(
        (item) =>
          `${item.sourceNodeName} -[发现:${item.suggestedName}|置信度${item.confidence.toFixed(2)}]-> ${item.targetNodeName}` +
          (item.evidence?.[0] ? `；证据：${item.evidence[0].title}` : '')
      );
    sections.push(
      [
        '发现详情：',
        `【挖掘候选（最多 ${MAX_DISCOVERIES} 条）】`,
        discoveries.length ? discoveries.join('\n') : '（无）'
      ].join('\n')
    );
  }

  if (!hasAnyScope(config)) {
    sections.push(
      '（未勾选查询范围，仅可依据任务元信息作答；建议至少开启一项）'
    );
  }

  return sections.join('\n');
};

const buildLocalAnswer = (
  question: string,
  result: ImplicitDiscoveryResult,
  config: RelationMiningChatConfig
): string => {
  const top = result.discoveries.slice(0, 3);
  const examples =
    top.length > 0
      ? top
          .map(
            (item) =>
              `「${item.sourceNodeName}」—「${item.targetNodeName}」(置信度 ${item.confidence.toFixed(2)})`
          )
          .join('；')
      : '暂无挖掘关系候选';

  const parts = [
    `针对「${question}」，当前任务使用${DISCOVERY_ALGORITHM_LABEL[result.algorithm]}，共确认 ${result.confirmedEdges.length} 条关系、挖掘 ${result.discoveries.length} 条候选。`
  ];

  if (config.includeSummary && result.summary) {
    parts.push(`发现总结：${result.summary}`);
  }
  if (config.includeDiscoveries) {
    parts.push(`代表性发现关系：${examples}。`);
  }
  if (config.includeGraph) {
    parts.push(`关系图谱中当前有 ${result.confirmedEdges.length} 条确认关系。`);
  }
  if (!hasAnyScope(config)) {
    parts.push(
      '当前未勾选查询范围，回答仅供参考；请勾选后重试以获得更准确解读。'
    );
  } else {
    parts.push('（大模型未配置或调用失败，以上为本地规则回复）');
  }

  return parts.join('\n');
};

const askWithLlm = async (
  input: AskRelationMiningChatInput,
  contextText: string
): Promise<string> => {
  const llmConfig = resolveScenarioLlmConfig(
    IMPLICIT_RELATION_RESULT_QA_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const history = (input.history || [])
    .slice(-MAX_HISTORY_TURNS * 2)
    .map((item) => ({
      role: item.role,
      content: item.content
    }));

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `【关系挖掘上下文】\n${contextText}`
    },
    ...history,
    { role: 'user', content: input.question.trim() }
  ];

  const response = await fetch(url, {
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
    }),
    signal: input.signal
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      errText?.slice(0, 200) || `大模型请求失败 (${response.status})`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('大模型未返回内容');
  }
  return content;
};

export const askRelationMiningChat = async (
  input: AskRelationMiningChatInput
): Promise<{ answer: string; source: 'llm' | 'local' }> => {
  const question = input.question.trim();
  if (!question) {
    throw new Error('请输入问题');
  }

  const contextText = buildRelationMiningChatContext({
    task: input.task,
    result: input.result,
    config: input.config
  });

  if (isScenarioLlmAvailable(IMPLICIT_RELATION_RESULT_QA_SCENARIO.code)) {
    try {
      const answer = await askWithLlm(input, contextText);
      return { answer, source: 'llm' };
    } catch {
      // fallback
    }
  }

  return {
    answer: buildLocalAnswer(question, input.result, input.config),
    source: 'local'
  };
};

export const DEFAULT_RELATION_MINING_CHAT_CONFIG: RelationMiningChatConfig = {
  includeGraph: true,
  includeSummary: true,
  includeDiscoveries: true
};
