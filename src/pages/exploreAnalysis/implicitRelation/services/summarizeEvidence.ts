/**
 * 单条关系证据的通俗 AI 解读：结合关系图谱与发现算法说明，失败则本地模板。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { IMPLICIT_RELATION_EVIDENCE_SUMMARY_SCENARIO } from '@/services/llmScenarios/definitions/implicitRelationEvidenceSummary.scenario';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  DiscoveredImplicitRelation,
  ImplicitDiscoveryAlgorithm
} from '../types';

export type EvidenceSummarySource = 'llm' | 'local';

const ALGORITHM_GUIDE: Record<ImplicitDiscoveryAlgorithm, string> = {
  community:
    '社区分析：在关系图谱中，联系紧密的实例会聚成同一社区。若两端实例同属一个社区、但当前图谱里还没有直接连边，则可能存在尚未显式建模的潜在关联。',
  'path-prediction':
    '路径预测：依据图谱中的共同邻居、多跳路径等结构信号，评估两端实例之间尚未出现的直连是否合理；共同中介实例越多、路径越短，关联可信度通常越高。',
  spatiotemporal:
    '时空分析：结合实例在图谱关联之外的空间位置（邻近）与时间戳（时间窗口接近），判断是否存在共现或协同可能，从而提示潜在关系。'
};

const SYSTEM_PROMPT = `你是本体「关系挖掘」场景下的解读助手。面向业务同事，把单条隐性关系证据讲清楚。
场景背景：结果展示在关系图谱中——实线是已确认的显性关系，虚线是算法发现的隐性候选；解读必须贴合图谱结构与所用发现算法，不要脱离该业务语境。

仅输出合法 JSON，不要 markdown。结构：
{"summary":"解读文本"}

要求：
1. 2～4 句中文，语气平实专业；可使用「关系图谱 / 节点 / 直连 / 路径 / 社区 / 共同邻居 / 时空邻近」等业务可懂表述
2. 必须点明本次算法（社区分析 / 路径预测 / 时空分析）在图谱上具体说明了什么，并结合证据中的事实
3. 说清：两端实例是谁、建议关系名、为何被标为隐性候选、置信度大致把握、建议如何在业务侧复核
4. 禁止生活化无关比喻（如小区住户、同学、亲戚、朋友圈等）；禁止编造证据中没有的实体或关系；不要写成已确认关系
5. 置信度用「把握大约百分之多少」表述，勿只报小数`;

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

const buildLocalSummary = (discovery: DiscoveredImplicitRelation): string => {
  const confidencePct = Math.round(discovery.confidence * 100);
  const algoLabel = DISCOVERY_ALGORITHM_LABEL[discovery.algorithm];
  const evidenceHint =
    discovery.evidence[0]?.detail ||
    discovery.evidence[0]?.title ||
    '当前图谱结构信号';

  const pair = `「${discovery.sourceNodeName}」与「${discovery.targetNodeName}」`;
  const relationHint = `建议关系「${discovery.suggestedName}」`;

  if (discovery.algorithm === 'community') {
    const communityHint =
      discovery.communityId != null
        ? `同属社区 ${discovery.communityId}`
        : '同属一个图谱社区';
    return (
      `在关系图谱的「社区分析」中，${pair}${communityHint}，但两端尚未建立直接连边，因此被标为隐性候选（${relationHint}），当前把握大约 ${confidencePct}%。` +
      `主要依据：${evidenceHint}。` +
      `请对照业务规则核对二者是否应补建显式关系后再写入本体。`
    );
  }

  if (discovery.algorithm === 'path-prediction') {
    return (
      `在关系图谱的「路径预测」中，系统根据共同邻居或多跳路径，认为${pair}之间虽无直连，但结构上接近，故给出${relationHint}候选，当前把握大约 ${confidencePct}%。` +
      `主要依据：${evidenceHint}。` +
      `建议业务侧沿证据路径核查中介节点与业务含义，确认后再落为显性关系。`
    );
  }

  return (
    `在关系图谱的「时空分析」中，${pair}因位置或时间上的邻近被识别为潜在关联，给出${relationHint}候选，当前把握大约 ${confidencePct}%。` +
    `主要依据：${evidenceHint}。` +
    `建议结合现场时空业务规则复核共现是否成立，确认后再写入本体关系。`
  );
};

const generateWithLlm = async (
  discovery: DiscoveredImplicitRelation,
  signal?: AbortSignal
): Promise<string> => {
  const llmConfig = resolveScenarioLlmConfig(
    IMPLICIT_RELATION_EVIDENCE_SUMMARY_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const payload = {
    scene: '本体关系挖掘 / 关系图谱（显性实线 + 隐性虚线候选）',
    algorithm: DISCOVERY_ALGORITHM_LABEL[discovery.algorithm],
    algorithmGuide: ALGORITHM_GUIDE[discovery.algorithm],
    source: discovery.sourceNodeName,
    target: discovery.targetNodeName,
    suggestedName: discovery.suggestedName,
    confidence: Number(discovery.confidence.toFixed(2)),
    communityId: discovery.communityId ?? null,
    evidence: discovery.evidence.map((item) => ({
      type: item.type,
      title: item.title,
      detail: item.detail
    }))
  };

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content:
        `请结合关系图谱场景与当前算法，写一段通俗解读（禁止生活化无关比喻）：\n` +
        JSON.stringify(payload, null, 2)
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
    signal
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
    summary?: unknown;
  } | null;
  if (!parsed || typeof parsed.summary !== 'string' || !parsed.summary.trim()) {
    throw new Error('大模型返回格式无效');
  }

  return parsed.summary.trim();
};

export const summarizeRelationEvidence = async (params: {
  discovery: DiscoveredImplicitRelation;
  signal?: AbortSignal;
}): Promise<{ summary: string; source: EvidenceSummarySource }> => {
  const { discovery, signal } = params;

  if (
    isScenarioLlmAvailable(IMPLICIT_RELATION_EVIDENCE_SUMMARY_SCENARIO.code)
  ) {
    try {
      const summary = await generateWithLlm(discovery, signal);
      return { summary, source: 'llm' };
    } catch {
      // fallback
    }
  }

  return {
    summary: buildLocalSummary(discovery),
    source: 'local'
  };
};
