import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import type { OntologyFunctionItem } from '@/pages/ontologyScene/types/ontologyFunction';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { ONTOLOGY_BEHAVIOR_FUNCTION_RECOMMEND_SCENARIO } from '@/services/llmScenarioDefinitions';

export type BehaviorFunctionRecommendSource = 'llm' | 'local';

export interface BehaviorFunctionRecommendation {
  functionId: number;
  functionCode: string;
  functionName: string;
  reason: string;
  score: number;
}

export interface RecommendBehaviorFunctionsResult {
  recommendations: BehaviorFunctionRecommendation[];
  source: BehaviorFunctionRecommendSource;
}

const SYSTEM_PROMPT = `你是本体场景行为函数推荐助手。根据用户要创建的行为名称与描述，从当前场景已有函数列表中推荐最匹配的函数（用于绑定到该行为）。
规则：
1. 仅从提供的函数列表中选择，functionId 必须存在于列表中
2. 推荐 1～5 个函数，按匹配度从高到低排序
3. score 为 0～100 的整数，表示匹配度
4. reason 用简洁中文说明为何推荐（20～80 字）
5. 若行为描述为空，主要依据行为名称推断
6. 若无合适函数，返回空数组
仅输出合法 JSON，不要 markdown。结构：{"recommendations":[{"functionId":1,"reason":"...","score":90}]}`;

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

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const buildFunctionContextText = (functions: OntologyFunctionItem[]) =>
  functions
    .map((fn) => {
      const params = (fn.params || [])
        .map(
          (param) =>
            `${param.name || param.code || ''}(${param.inputType || ''})`
        )
        .filter(Boolean)
        .join('、');
      return [
        `- id: ${fn.id}`,
        `  code: ${fn.code || ''}`,
        `  name: ${fn.name || ''}`,
        `  description: ${fn.description || '（无）'}`,
        params ? `  params: ${params}` : ''
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

const sanitizeLlmRecommendations = (
  parsed: unknown,
  functions: OntologyFunctionItem[]
): BehaviorFunctionRecommendation[] => {
  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const rawList = (parsed as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(rawList)) {
    return [];
  }

  const functionById = new Map(
    functions.filter((fn) => fn.id != null).map((fn) => [fn.id as number, fn])
  );

  const seen = new Set<number>();

  return rawList
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const functionId = Number((item as { functionId?: unknown }).functionId);
      const fn = functionById.get(functionId);
      if (!fn || seen.has(functionId)) {
        return null;
      }

      seen.add(functionId);

      const score = Math.min(
        100,
        Math.max(
          0,
          Math.round(Number((item as { score?: unknown }).score) || 0)
        )
      );
      const reason = String((item as { reason?: unknown }).reason || '').trim();

      return {
        functionId,
        functionCode: fn.code || '',
        functionName: fn.name || '',
        reason: reason || '与行为描述语义相近',
        score: score || 50
      };
    })
    .filter((item): item is BehaviorFunctionRecommendation => !!item)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

const recommendWithHeuristic = (
  behaviorName: string,
  behaviorDescription: string,
  functions: OntologyFunctionItem[]
): BehaviorFunctionRecommendation[] => {
  const queryTokens = [
    ...tokenize(behaviorName),
    ...tokenize(behaviorDescription)
  ];
  const queryText = `${behaviorName} ${behaviorDescription}`.toLowerCase();

  const scored = functions
    .filter((fn) => fn.id != null)
    .map((fn) => {
      const fields = [fn.name, fn.code, fn.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const fieldTokens = tokenize(fields);

      let score = 0;
      queryTokens.forEach((token) => {
        if (fields.includes(token)) {
          score += 12;
        }
        fieldTokens.forEach((fieldToken) => {
          if (fieldToken.includes(token) || token.includes(fieldToken)) {
            score += 6;
          }
        });
      });

      if (queryText && fn.name && queryText.includes(fn.name.toLowerCase())) {
        score += 20;
      }
      if (queryText && fn.code && queryText.includes(fn.code.toLowerCase())) {
        score += 15;
      }

      const reason =
        score >= 30
          ? '名称或描述与行为意图关键词匹配'
          : score > 0
            ? '与行为描述存在部分语义关联'
            : '场景内可用函数';

      return {
        functionId: fn.id as number,
        functionCode: fn.code || '',
        functionName: fn.name || '',
        reason,
        score: Math.min(100, score)
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5);
  if (top.length) {
    return top;
  }

  return functions
    .filter((fn) => fn.id != null)
    .slice(0, 3)
    .map((fn, index) => ({
      functionId: fn.id as number,
      functionCode: fn.code || '',
      functionName: fn.name || '',
      reason: '暂无高匹配函数，展示场景内可用函数供参考',
      score: 30 - index * 5
    }));
};

const recommendWithLlm = async (params: {
  behaviorName: string;
  behaviorDescription: string;
  objectTypeName?: string;
  functions: OntologyFunctionItem[];
  signal?: AbortSignal;
}): Promise<BehaviorFunctionRecommendation[]> => {
  const llmConfig = resolveScenarioLlmConfig(
    ONTOLOGY_BEHAVIOR_FUNCTION_RECOMMEND_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;

  const userText = [
    `行为名称：${params.behaviorName}`,
    `行为描述：${params.behaviorDescription || '（未填写）'}`,
    params.objectTypeName
      ? `绑定对象类型：${params.objectTypeName}`
      : '绑定对象类型：全局行为',
    '',
    '--- 当前场景函数列表 ---',
    buildFunctionContextText(params.functions)
  ].join('\n');

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userText }
  ];

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
    }),
    signal: params.signal
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      errText?.slice(0, 200) || `大模型请求失败 (${response.status})`
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('大模型未返回有效内容');
  }

  const parsed = extractJsonFromLlmContent(content);
  return sanitizeLlmRecommendations(parsed, params.functions);
};

export const recommendBehaviorFunctions = async (params: {
  behaviorName: string;
  behaviorDescription?: string;
  objectTypeName?: string;
  functions: OntologyFunctionItem[];
  signal?: AbortSignal;
}): Promise<RecommendBehaviorFunctionsResult> => {
  const behaviorName = params.behaviorName?.trim();
  if (!behaviorName) {
    throw new Error('请先填写行为名称');
  }

  const functions = params.functions.filter((fn) => fn.id != null);
  if (!functions.length) {
    throw new Error('当前场景暂无可用函数，请先创建函数');
  }

  const behaviorDescription = params.behaviorDescription?.trim() || '';

  if (
    isScenarioLlmAvailable(ONTOLOGY_BEHAVIOR_FUNCTION_RECOMMEND_SCENARIO.code)
  ) {
    try {
      const recommendations = await recommendWithLlm({
        behaviorName,
        behaviorDescription,
        objectTypeName: params.objectTypeName,
        functions,
        signal: params.signal
      });

      if (recommendations.length) {
        return { recommendations, source: 'llm' };
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn('[Behavior] 智能推荐函数 LLM 失败，回退本地匹配', error);
    }
  }

  return {
    recommendations: recommendWithHeuristic(
      behaviorName,
      behaviorDescription,
      functions
    ),
    source: 'local'
  };
};
