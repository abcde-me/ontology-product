/**
 * 根据推理任务填写的信息调用大模型进行推理。
 * 输出：推理结果正文、推理路径、关联节点结论。
 * 优先大模型；不可用或失败时使用本地规则回退。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { INFERENCE_ANALYSIS_RUN_SCENARIO } from '@/services/llmScenarios/definitions/inferenceAnalysisRun.scenario';
import { INFERENCE_TYPE_DESC, INFERENCE_TYPE_LABEL } from '../constants';
import type {
  InferencePathStep,
  InferenceRelatedNode,
  InferenceType
} from '../types';

export type InferenceResultSource = 'llm' | 'local';

export interface InferenceKnowledgeContext {
  ontologySceneNames: string[];
  semanticMappings: Array<{
    standardTerm: string;
    synonyms?: string[];
    description?: string;
    objectTypeNames?: string[];
  }>;
  domainAxioms: Array<{
    name: string;
    expression: string;
    description?: string;
    domain?: string;
  }>;
}

export interface RunInferenceInput {
  name: string;
  description?: string;
  inferenceType: InferenceType;
  knowledge: InferenceKnowledgeContext;
  signal?: AbortSignal;
}

export interface RunInferenceResult {
  resultContent: string;
  inferencePath: InferencePathStep[];
  relatedNodes: InferenceRelatedNode[];
  source: InferenceResultSource;
}

const generateStepId = (index: number) =>
  `path-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;

const generateNodeId = (index: number) =>
  `node-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;

const SYSTEM_PROMPT = `你是本体知识推理助手。根据用户给出的推理任务配置，输出结构化推理结果。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{
  "resultContent": "分节推理结果说明（中文，400～1000字，必须换行分节）",
  "inferencePath": [
    {
      "order": 1,
      "title": "步骤标题",
      "description": "步骤说明",
      "fromNode": "起点节点",
      "toNode": "终点节点",
      "relation": "推导关系或所用规则"
    }
  ],
  "relatedNodes": [
    {
      "name": "节点名称",
      "nodeType": "scene|semantic_mapping|domain_axiom|concept|conclusion",
      "role": "起点|中间节点|结论节点",
      "conclusion": "该节点在本次推理中的结论",
      "evidence": "支撑证据（可选）"
    }
  ]
}
规则：
1. 按推理类型执行：正向由因推果；逆向由果溯因
2. inferencePath 给出 3～6 个有序步骤，体现完整推导链路
3. relatedNodes 覆盖路径中出现的关键节点，结论具体、可解释
4. 必须引用已提供的语义映射与领域公理，不得编造未给出的对象
5. resultContent 必须按下列标题分行输出（每节标题独占一行，正文换行书写；多条要点用「· 」开头）：
一、推理目标
二、知识依据
三、推理过程
四、结论
五、局限与建议
禁止把全部内容写成不分节的长段落。`;

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

const NODE_TYPES: InferenceRelatedNode['nodeType'][] = [
  'scene',
  'semantic_mapping',
  'domain_axiom',
  'concept',
  'conclusion'
];

const isRelatedNodeType = (
  value: string
): value is InferenceRelatedNode['nodeType'] =>
  (NODE_TYPES as readonly string[]).includes(value);

const normalizePathFromUnknown = (value: unknown): InferencePathStep[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const title = String(row.title ?? '').trim();
      const description = String(row.description ?? '').trim();
      if (!title && !description) {
        return null;
      }
      return {
        id: generateStepId(index),
        order: Number(row.order) || index + 1,
        title: title || `步骤 ${index + 1}`,
        description,
        fromNode: String(row.fromNode ?? '').trim() || undefined,
        toNode: String(row.toNode ?? '').trim() || undefined,
        relation: String(row.relation ?? '').trim() || undefined
      } satisfies InferencePathStep;
    })
    .filter((item): item is InferencePathStep => item != null)
    .sort((a, b) => a.order - b.order);
};

const normalizeNodesFromUnknown = (value: unknown): InferenceRelatedNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? '').trim();
      const conclusion = String(row.conclusion ?? '').trim();
      if (!name && !conclusion) {
        return null;
      }
      const rawType = String(row.nodeType ?? '').trim();
      return {
        id: generateNodeId(index),
        name: name || `节点 ${index + 1}`,
        nodeType: isRelatedNodeType(rawType) ? rawType : 'concept',
        role: String(row.role ?? '').trim() || '中间节点',
        conclusion: conclusion || '-',
        evidence: String(row.evidence ?? '').trim() || undefined
      } satisfies InferenceRelatedNode;
    })
    .filter((item): item is InferenceRelatedNode => item != null);
};

const buildUserPrompt = (input: RunInferenceInput): string => {
  const typeLabel = INFERENCE_TYPE_LABEL[input.inferenceType];
  const typeDesc = INFERENCE_TYPE_DESC[input.inferenceType];

  const sceneText =
    input.knowledge.ontologySceneNames.length > 0
      ? input.knowledge.ontologySceneNames.map((name) => `- ${name}`).join('\n')
      : '- （未选择）';

  const mappingText =
    input.knowledge.semanticMappings.length > 0
      ? input.knowledge.semanticMappings
          .map((item) => {
            const synonyms = item.synonyms?.length
              ? `；同义词：${item.synonyms.join('、')}`
              : '';
            const objectTypes = item.objectTypeNames?.length
              ? `；关联对象类型：${item.objectTypeNames.join('、')}`
              : '';
            const desc = item.description ? `；说明：${item.description}` : '';
            return `- ${item.standardTerm}${synonyms}${objectTypes}${desc}`;
          })
          .join('\n')
      : '- （未选择）';

  const axiomText =
    input.knowledge.domainAxioms.length > 0
      ? input.knowledge.domainAxioms
          .map((item) => {
            const domain = item.domain ? `［${item.domain}］` : '';
            const desc = item.description ? `；说明：${item.description}` : '';
            return `- ${domain}${item.name}：${item.expression}${desc}`;
          })
          .join('\n')
      : '- （未选择）';

  return [
    `任务名称：${input.name.trim()}`,
    `任务描述：${input.description?.trim() || '（未填写）'}`,
    `推理类型：${typeLabel}`,
    `类型说明：${typeDesc}`,
    '',
    '本体场景：',
    sceneText,
    '',
    '语义映射：',
    mappingText,
    '',
    '领域公理：',
    axiomText,
    '',
    '请输出包含 resultContent、inferencePath、relatedNodes 的 JSON。'
  ].join('\n');
};

const generateLocalStructuredResult = (
  input: RunInferenceInput
): Omit<RunInferenceResult, 'source'> => {
  const typeLabel = INFERENCE_TYPE_LABEL[input.inferenceType];
  const isForward = input.inferenceType === 'forward';
  const scenes =
    input.knowledge.ontologySceneNames.join('、') || '（未指定场景）';
  const firstScene = input.knowledge.ontologySceneNames[0] || '目标本体场景';
  const mappings = input.knowledge.semanticMappings;
  const axioms = input.knowledge.domainAxioms;
  const firstMapping = mappings[0]?.standardTerm || '业务概念';
  const firstAxiom = axioms[0]?.name || '约束公理';
  const firstAxiomExpr = axioms[0]?.expression || '相关业务约束成立';

  const goal =
    input.description?.trim() ||
    (isForward
      ? `基于场景「${scenes}」的已知事实与约束，推导可成立的业务结论`
      : `针对任务「${input.name}」的目标结论，反推所需前提与证据条件`);

  const conclusionNodeName = isForward
    ? `${input.name.trim()}-推导结论`
    : `${input.name.trim()}-必要条件`;

  const inferencePath: InferencePathStep[] = isForward
    ? [
        {
          id: generateStepId(0),
          order: 1,
          title: '汇聚场景事实',
          description: `从本体场景「${firstScene}」汇聚对象与关系事实，明确推理起点。`,
          fromNode: firstScene,
          toNode: firstMapping,
          relation: '场景事实锚定'
        },
        {
          id: generateStepId(1),
          order: 2,
          title: '语义对齐',
          description: `通过语义映射「${firstMapping}」统一术语与别名，对齐业务概念。`,
          fromNode: firstMapping,
          toNode: firstAxiom,
          relation: '术语语义映射'
        },
        {
          id: generateStepId(2),
          order: 3,
          title: '公理约束检查',
          description: `应用领域公理「${firstAxiom}」进行一致性与可达性检查。`,
          fromNode: firstAxiom,
          toNode: conclusionNodeName,
          relation: firstAxiomExpr
        },
        {
          id: generateStepId(3),
          order: 4,
          title: '形成正向结论',
          description: '综合事实、映射与公理，输出可解释的正向推理结论。',
          fromNode: firstAxiom,
          toNode: conclusionNodeName,
          relation: '由因推果'
        }
      ]
    : [
        {
          id: generateStepId(0),
          order: 1,
          title: '明确目标结论',
          description: `将任务「${input.name}」的目标结论作为逆向推理起点。`,
          fromNode: conclusionNodeName,
          toNode: firstAxiom,
          relation: '目标锚定'
        },
        {
          id: generateStepId(1),
          order: 2,
          title: '反推公理前提',
          description: `从领域公理「${firstAxiom}」反推必要前提与边界条件。`,
          fromNode: firstAxiom,
          toNode: firstMapping,
          relation: firstAxiomExpr
        },
        {
          id: generateStepId(2),
          order: 3,
          title: '语义落地校验',
          description: `用语义映射「${firstMapping}」验证术语能否落地到本体对象。`,
          fromNode: firstMapping,
          toNode: firstScene,
          relation: '术语—对象对齐'
        },
        {
          id: generateStepId(3),
          order: 4,
          title: '回溯场景证据',
          description: `回溯至场景「${firstScene}」，形成需满足的证据与条件清单。`,
          fromNode: firstScene,
          toNode: conclusionNodeName,
          relation: '由果溯因'
        }
      ];

  const relatedNodes: InferenceRelatedNode[] = [
    {
      id: generateNodeId(0),
      name: firstScene,
      nodeType: 'scene',
      role: isForward ? '起点' : '证据落点',
      conclusion: isForward
        ? `场景「${firstScene}」提供推理所需的对象与关系事实基础。`
        : `目标成立需在场景「${firstScene}」中找到可核验的证据实例。`,
      evidence: `关联场景：${scenes}`
    },
    {
      id: generateNodeId(1),
      name: firstMapping,
      nodeType: 'semantic_mapping',
      role: '中间节点',
      conclusion: mappings.length
        ? `术语「${firstMapping}」在本次推理中作为核心语义锚点完成对齐。`
        : '未指定语义映射，概念对齐依赖任务描述，结论需进一步校验。',
      evidence: mappings[0]?.synonyms?.length
        ? `同义词：${mappings[0].synonyms.slice(0, 5).join('、')}`
        : undefined
    },
    {
      id: generateNodeId(2),
      name: firstAxiom,
      nodeType: 'domain_axiom',
      role: '中间节点',
      conclusion: axioms.length
        ? `公理「${firstAxiom}」约束了推导合法性：${firstAxiomExpr}`
        : '未引用领域公理，约束检查较弱，建议补充后再复核。',
      evidence: axioms[0]?.domain ? `所属领域：${axioms[0].domain}` : undefined
    },
    {
      id: generateNodeId(3),
      name: conclusionNodeName,
      nodeType: 'conclusion',
      role: '结论节点',
      conclusion: isForward
        ? mappings.length || axioms.length
          ? `在场景「${firstScene}」下，结合映射与公理可形成与「${input.name}」一致的正向推断结论。`
          : '知识引用偏少，仅形成框架性正向结论，建议补充映射与公理。'
        : mappings.length || axioms.length
          ? `若目标成立，需同时满足所列公理，并确保「${firstMapping}」可在场景中落地。`
          : '可用于逆向追溯的知识不足，仅给出原则性必要条件框架。',
      evidence: goal
    }
  ];

  const mappingLines = mappings.length
    ? mappings
        .slice(0, 5)
        .map((item) => `  · ${item.standardTerm}`)
        .join('\n')
    : '  · 未引用语义映射';
  const axiomLines = axioms.length
    ? axioms
        .slice(0, 5)
        .map((item) => `  · ${item.name}：${item.expression}`)
        .join('\n')
    : '  · 未引用领域公理';

  const resultContent = [
    '一、推理目标',
    goal,
    '',
    '二、推理类型',
    `${typeLabel}：${INFERENCE_TYPE_DESC[input.inferenceType]}`,
    '',
    '三、知识依据',
    `本体场景：${scenes}`,
    '语义映射：',
    mappingLines,
    '领域公理：',
    axiomLines,
    '',
    '四、推理路径摘要',
    ...inferencePath.map(
      (step) =>
        `${step.order}. ${step.title}：${step.fromNode || '-'} → ${
          step.toNode || '-'
        }（${step.relation || step.description}）`
    ),
    '',
    '五、关联节点结论',
    ...relatedNodes.map(
      (node) => `· ${node.name}（${node.role}）：${node.conclusion}`
    ),
    '',
    '六、局限与建议',
    '本结果由规则引擎基于任务配置生成。若已配置大模型环节，可获得更贴合业务语境的路径与节点结论。'
  ].join('\n');

  return { resultContent, inferencePath, relatedNodes };
};

const sanitizeLlmPayload = (
  parsed: unknown,
  fallback: Omit<RunInferenceResult, 'source'>
): Omit<RunInferenceResult, 'source'> => {
  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }
  const row = parsed as Record<string, unknown>;
  const resultContent = String(row.resultContent ?? '')
    .trim()
    .replace(/^```(?:markdown|text)?\s*|\s*```$/g, '')
    .trim();
  const inferencePath = normalizePathFromUnknown(row.inferencePath);
  const relatedNodes = normalizeNodesFromUnknown(row.relatedNodes);

  return {
    resultContent: resultContent || fallback.resultContent,
    inferencePath: inferencePath.length
      ? inferencePath
      : fallback.inferencePath,
    relatedNodes: relatedNodes.length ? relatedNodes : fallback.relatedNodes
  };
};

const generateWithLlm = async (
  input: RunInferenceInput,
  fallback: Omit<RunInferenceResult, 'source'>
): Promise<Omit<RunInferenceResult, 'source'>> => {
  const llmConfig = resolveScenarioLlmConfig(
    INFERENCE_ANALYSIS_RUN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(input) }
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

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('大模型未返回有效内容');
  }

  const parsed = extractJsonFromLlmContent(content);
  return sanitizeLlmPayload(parsed, fallback);
};

export const runInferenceAnalysis = async (
  input: RunInferenceInput
): Promise<RunInferenceResult> => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('任务名称不能为空');
  }
  if (!input.inferenceType) {
    throw new Error('请选择推理类型');
  }

  const local = generateLocalStructuredResult(input);

  if (isScenarioLlmAvailable(INFERENCE_ANALYSIS_RUN_SCENARIO.code)) {
    try {
      const llmResult = await generateWithLlm(input, local);
      return { ...llmResult, source: 'llm' };
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn('[InferenceAnalysis] 大模型推理失败，使用本地规则', error);
    }
  }

  return { ...local, source: 'local' };
};
