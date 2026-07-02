import {
  resolveDirectLlmRequestUrl,
  runDirectLlmChatStream,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { AI_WORKBENCH_LLM_CONFIG } from '@/pages/aiOntologyWorkbench/config/llm';
import type {
  GetOntologyTopologyResponse,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';
import type { ThinkingProgressCallbacks } from '../types';

export interface RelationshipInferenceSemanticIntent {
  parseIntent: string;
  entityHints: string[];
  anchorObjectTypeNames: string[];
  targetObjectTypeNames: string[];
  targetConcepts: string[];
  targetFieldKeywords: string[];
  source: 'llm' | 'heuristic';
}

const EMPTY_INTENT: RelationshipInferenceSemanticIntent = {
  parseIntent: '',
  entityHints: [],
  anchorObjectTypeNames: [],
  targetObjectTypeNames: [],
  targetConcepts: [],
  targetFieldKeywords: [],
  source: 'heuristic'
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

const sanitizeStringList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length >= 1)
    )
  ];
};

const buildTopologyDescription = (
  topology: GetOntologyTopologyResponse
): string => {
  const nodeLines = (topology.nodes || []).map((node) => {
    const properties = (node.ontologyPhysicalPropertiesList || [])
      .slice(0, 12)
      .map((property) => property.name || property.type || '')
      .filter(Boolean)
      .join(', ');
    return `- id=${node.id} name=${node.name || '-'} code=${node.code || '-'} desc=${node.description || '-'} fields=${properties || '-'}`;
  });

  const edgeLines = (topology.edges || []).map((edge) => {
    return `- link=${edge.name || edge.id} ${edge.sourceId} -> ${edge.targetId}`;
  });

  return ['对象类型：', ...nodeLines, '', '链接：', ...edgeLines].join('\n');
};

const scoreNodeByNames = (
  node: Ontologymetadataservicev1TopologyNode,
  names: string[]
) => {
  if (!names.length) {
    return 0;
  }

  const nodeText =
    `${node.name || ''} ${node.code || ''} ${node.description || ''}`.toLowerCase();
  return names.reduce((score, name) => {
    const normalized = name.toLowerCase();
    if (!normalized) {
      return score;
    }
    if (nodeText.includes(normalized)) {
      return score + 3;
    }
    if (
      (node.name || '').toLowerCase() === normalized ||
      (node.code || '').toLowerCase() === normalized
    ) {
      return score + 5;
    }
    return score;
  }, 0);
};

const inferHeuristicIntent = (params: {
  query: string;
  topology: GetOntologyTopologyResponse;
  entityHints: string[];
  targetConcepts: string[];
  queryContextTokens: string[];
}): RelationshipInferenceSemanticIntent => {
  const { query, topology, entityHints, targetConcepts, queryContextTokens } =
    params;
  const nodes = topology.nodes || [];

  const anchorObjectTypeNames = [...nodes]
    .map((node) => ({
      name: node.name || node.code || '',
      score:
        scoreNodeByNames(node, entityHints) +
        scoreNodeByNames(node, queryContextTokens) +
        (/车|vehicle|plate|vin/i.test(
          `${node.name || ''} ${node.code || ''} ${node.description || ''}`
        ) && /车|vehicle|车牌|plate/i.test(query)
          ? 2
          : 0)
    }))
    .filter((item) => item.name && item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.name);

  const targetObjectTypeNames = [...nodes]
    .map((node) => ({
      name: node.name || node.code || '',
      score:
        scoreNodeByNames(
          node,
          targetConcepts.length ? targetConcepts : queryContextTokens
        ) +
        (/fleet|车队|油耗|fuel|driver|驾驶员/i.test(
          `${node.name || ''} ${node.code || ''} ${node.description || ''}`
        ) && /车队|油耗|fuel|驾驶员|司机/.test(query)
          ? 2
          : 0)
    }))
    .filter((item) => item.name && item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.name);

  return {
    parseIntent: targetConcepts.length
      ? `查询${targetConcepts.join('、')}相关信息`
      : `按语义在图谱中推理：${query}`,
    entityHints,
    anchorObjectTypeNames,
    targetObjectTypeNames,
    targetConcepts,
    targetFieldKeywords: targetConcepts,
    source: 'heuristic'
  };
};

const sanitizeLlmIntent = (
  parsed: unknown,
  fallback: RelationshipInferenceSemanticIntent
): RelationshipInferenceSemanticIntent => {
  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }

  const record = parsed as Record<string, unknown>;
  const entityHints = sanitizeStringList(record.entityHints);
  const anchorObjectTypeNames = sanitizeStringList(
    record.anchorObjectTypeNames
  );
  const targetObjectTypeNames = sanitizeStringList(
    record.targetObjectTypeNames
  );
  const targetConcepts = sanitizeStringList(record.targetConcepts);
  const targetFieldKeywords = sanitizeStringList(record.targetFieldKeywords);

  return {
    parseIntent:
      String(record.parseIntent || '').trim() || fallback.parseIntent,
    entityHints: entityHints.length ? entityHints : fallback.entityHints,
    anchorObjectTypeNames: anchorObjectTypeNames.length
      ? anchorObjectTypeNames
      : fallback.anchorObjectTypeNames,
    targetObjectTypeNames: targetObjectTypeNames.length
      ? targetObjectTypeNames
      : fallback.targetObjectTypeNames,
    targetConcepts: targetConcepts.length
      ? targetConcepts
      : fallback.targetConcepts,
    targetFieldKeywords: targetFieldKeywords.length
      ? targetFieldKeywords
      : targetConcepts.length
        ? targetConcepts
        : fallback.targetFieldKeywords,
    source: 'llm'
  };
};

const SYSTEM_PROMPT = `你是本体图谱关系推理助手。用户查询未命中预定义规则，需像「查某车油耗/品牌」一样：先在起点对象类型定位实体，优先检查该对象类型自身属性是否已包含目标信息；若属性/schema 已满足则无需跨类型跳转，否则再沿图谱链接找到目标对象类型。
根据用户问题与图谱拓扑，解析推理意图并输出合法 JSON（不要 markdown）：
{"parseIntent":"中文意图说明","entityHints":["实体标识如车牌/VIN/名称/编号"],"anchorObjectTypeNames":["起点对象类型名称"],"targetObjectTypeNames":["目标对象类型名称"],"targetConcepts":["用户想查的信息语义如油耗/里程/维修/品牌"],"targetFieldKeywords":["目标字段语义关键词"]}
要求：
1. anchorObjectTypeNames 是定位具体实体的对象类型（如车辆、人员、装备）
2. targetObjectTypeNames / targetConcepts 是用户最终想获取的信息所在类型或语义；若信息可能已在 anchor 对象类型属性中（如车辆基础主数据含品牌），target 可与 anchor 相同
3. entityHints 只放问题中的具体标识，不要放「油耗」「维修」「品牌」等概念词
4. 名称必须来自提供的对象类型列表，不可编造不存在的类型
5. 若问题只涉及单一对象类型且无跨类型关系，target 可与 anchor 相同
6. 无法解析时各数组可为空，parseIntent 说明原因`;

export const resolveRelationshipInferenceIntent = async (params: {
  query: string;
  topology: GetOntologyTopologyResponse;
  entityHints: string[];
  targetConcepts: string[];
  queryContextTokens: string[];
  progress?: ThinkingProgressCallbacks;
}): Promise<RelationshipInferenceSemanticIntent> => {
  const fallback = inferHeuristicIntent(params);
  const { apiKey, model } = AI_WORKBENCH_LLM_CONFIG;

  if (!apiKey?.trim()) {
    return fallback;
  }

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        buildTopologyDescription(params.topology),
        '',
        `用户问题：${params.query}`,
        '',
        `已提取实体线索：${params.entityHints.join('、') || '无'}`,
        `已提取目标概念：${params.targetConcepts.join('、') || '无'}`
      ].join('\n')
    }
  ];

  const useStreamThinking = Boolean(
    params.progress?.onThinkingLine || params.progress?.onThinkingChunk
  );

  try {
    if (useStreamThinking) {
      let answerContent = '';
      let reasoningStarted = false;

      params.progress?.onThinkingLine?.('  图谱语义推理：');

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
                }
                params.progress?.onThinkingChunk?.(chunk);
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
        params.progress?.onThinkingLine?.('');
      }

      const parsed = extractJsonFromLlmContent(answerContent);
      return sanitizeLlmIntent(parsed, fallback);
    }

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
      return fallback;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content || '';
    const parsed = extractJsonFromLlmContent(content);
    return sanitizeLlmIntent(parsed, fallback);
  } catch {
    return fallback;
  }
};

export const boostNodeScoreBySemanticNames = (
  node: Ontologymetadataservicev1TopologyNode,
  names: string[],
  baseScore: number
) => baseScore + scoreNodeByNames(node, names);
