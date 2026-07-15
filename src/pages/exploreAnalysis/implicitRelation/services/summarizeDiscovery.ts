/**
 * 隐性关系发现结果总结：优先大模型，失败则本地模板。
 * 输出分条要点，避免整段难读。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { IMPLICIT_RELATION_DISCOVERY_SUMMARY_SCENARIO } from '@/services/llmScenarios/definitions/implicitRelationDiscoverySummary.scenario';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  DiscoveredImplicitRelation,
  ImplicitDiscoveryAlgorithm,
  ImplicitDiscoveryResult
} from '../types';

export type SummarySource = 'llm' | 'local';

export interface SummarizeDiscoveryInput {
  algorithm: ImplicitDiscoveryAlgorithm;
  sceneId: number;
  confirmedCount: number;
  nodeCount?: number;
  discoveries: DiscoveredImplicitRelation[];
  signal?: AbortSignal;
}

export interface SummarizeDiscoveryOutput {
  /** 分条要点 */
  items: string[];
  /** 兼容旧字段 / 问答上下文的拼接文本 */
  summary: string;
  source: SummarySource;
}

const SYSTEM_PROMPT = `你是本体知识图谱分析助手。根据关系挖掘发现结果，用简洁中文输出可扫描的结论要点。
仅输出合法 JSON，不要 markdown。结构：
{"items":["要点1","要点2","要点3"]}
要求：
1. items 为 3～6 条短句，每条只讲一个重点（算法概况、数量、代表性关联、业务建议等）
2. 每条不超过 40 字，不要写成一整段
3. 点名 1～3 对最具代表性的对象/节点关系（不得编造未给出的节点名）
4. 语气专业、可执行；不要编号前缀（如 1. / - ）`;

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

const normalizeItems = (items: unknown): string[] => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .map((item) => String(item ?? '').trim())
    .map((item) => item.replace(/^[\d]+[.)、]\s*/, '').replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
    .slice(0, 8);
};

/** 将历史整段总结拆成可展示的要点 */
export const splitSummaryToItems = (summary?: string | null): string[] => {
  if (!summary?.trim()) {
    return [];
  }
  const text = summary.trim();
  const byLine = text
    .split(/\n+/)
    .map((line) =>
      line
        .trim()
        .replace(/^[\d]+[.)、]\s*/, '')
        .replace(/^[-•*]\s*/, '')
    )
    .filter(Boolean);
  if (byLine.length > 1) {
    return byLine;
  }

  const bySentence = text
    .split(/(?<=[。！？；])/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 6);
  if (bySentence.length > 1) {
    return bySentence;
  }

  return [text];
};

export const resolveSummaryItems = (
  result: Pick<ImplicitDiscoveryResult, 'summary' | 'summaryItems'> | null
): string[] => {
  if (!result) {
    return [];
  }
  if (result.summaryItems?.length) {
    return result.summaryItems;
  }
  return splitSummaryToItems(result.summary);
};

const buildLocalSummaryItems = (input: SummarizeDiscoveryInput): string[] => {
  const algoLabel = DISCOVERY_ALGORITHM_LABEL[input.algorithm];
  const items: string[] = [
    `采用「${algoLabel}」完成关系挖掘`,
    `显性关系 ${input.confirmedCount} 条，隐性候选 ${input.discoveries.length} 条`
  ];

  if (input.nodeCount != null) {
    items.push(`参与分析节点 ${input.nodeCount} 个`);
  }

  const top = [...input.discoveries]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (top.length) {
    top.forEach((item, index) => {
      items.push(
        `代表关联${index + 1}：${item.sourceNodeName} → ${item.targetNodeName}（${item.suggestedName}，置信度 ${(item.confidence * 100).toFixed(0)}%）`
      );
    });
    items.push('建议结合业务语义复核后，再补充链接类型建模');
  } else {
    items.push('当前未形成有效隐性候选，可检查拓扑连接或扩大实例范围');
  }

  return items;
};

const generateWithLlm = async (
  input: SummarizeDiscoveryInput
): Promise<string[]> => {
  const llmConfig = resolveScenarioLlmConfig(
    IMPLICIT_RELATION_DISCOVERY_SUMMARY_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const payload = {
    algorithm: DISCOVERY_ALGORITHM_LABEL[input.algorithm],
    confirmedCount: input.confirmedCount,
    nodeCount: input.nodeCount,
    discoveryCount: input.discoveries.length,
    topDiscoveries: input.discoveries.slice(0, 8).map((item) => ({
      source: item.sourceNodeName,
      target: item.targetNodeName,
      confidence: Number(item.confidence.toFixed(2)),
      suggestedName: item.suggestedName,
      evidenceTitles: item.evidence.map((e) => e.title)
    }))
  };

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请分条总结以下关系挖掘结果：\n${JSON.stringify(payload, null, 2)}`
    }
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
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('大模型未返回内容');
  }

  const parsed = extractJsonFromLlmContent(content) as {
    items?: unknown;
    summary?: unknown;
  } | null;

  const items = normalizeItems(parsed?.items);
  if (items.length) {
    return items;
  }

  if (typeof parsed?.summary === 'string' && parsed.summary.trim()) {
    return splitSummaryToItems(parsed.summary);
  }

  throw new Error('大模型返回格式无效');
};

export const summarizeDiscoveryResult = async (
  input: SummarizeDiscoveryInput
): Promise<SummarizeDiscoveryOutput> => {
  if (
    isScenarioLlmAvailable(IMPLICIT_RELATION_DISCOVERY_SUMMARY_SCENARIO.code)
  ) {
    try {
      const items = await generateWithLlm(input);
      return {
        items,
        summary: items.join('\n'),
        source: 'llm'
      };
    } catch {
      // fallback
    }
  }

  const items = buildLocalSummaryItems(input);
  return {
    items,
    summary: items.join('\n'),
    source: 'local'
  };
};
