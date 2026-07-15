/**
 * 根据多个本体场景库与生成要求，批量生成语义映射候选。
 * 优先大模型；不可用或失败时按对象类型启发式回退。
 */
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { SEMANTIC_MAPPING_BATCH_GEN_SCENARIO } from '@/services/llmScenarios/definitions/semanticMappingBatchGen.scenario';
import type { ObjectType } from '@/types/objectType';
import type {
  SemanticMappingCandidate,
  SemanticMappingObjectTypeRef
} from '../types';

export type MappingGenerateSource = 'llm' | 'local';

export interface SceneObjectTypeBundle {
  sceneId: number;
  sceneName: string;
  objectTypes: ObjectType[];
}

export interface GenerateMappingsInput {
  scenes: SceneObjectTypeBundle[];
  /** 生成要求 / 提示 */
  requirements?: string;
  signal?: AbortSignal;
}

export interface GenerateMappingsResult {
  candidates: SemanticMappingCandidate[];
  source: MappingGenerateSource;
}

const MAX_CANDIDATES = 20;
const MAX_OBJECT_TYPES_FOR_LLM = 40;

const generateKey = () =>
  `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildObjectTypeRef = (
  item: ObjectType,
  sceneId: number,
  sceneName: string
): SemanticMappingObjectTypeRef | null => {
  if (item.id == null) {
    return null;
  }
  return {
    id: item.id,
    name: item.name || item.code || `对象类型 #${item.id}`,
    code: item.code,
    sceneId,
    sceneName
  };
};

const normalizeSynonyms = (values: unknown, standardTerm: string): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = new Set<string>([standardTerm.trim()]);
  const result: string[] = [];
  values.forEach((item) => {
    const value = String(item ?? '')
      .trim()
      .replace(/\s+/g, '');
    if (!value || seen.has(value) || value === standardTerm.trim()) {
      return;
    }
    if (value.length < 2 || value.length > 32) {
      return;
    }
    seen.add(value);
    result.push(value);
  });
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

const flattenObjectTypes = (scenes: SceneObjectTypeBundle[]) => {
  const rows: Array<{
    objectType: ObjectType;
    sceneId: number;
    sceneName: string;
    ref: SemanticMappingObjectTypeRef;
  }> = [];

  scenes.forEach((scene) => {
    scene.objectTypes.forEach((objectType) => {
      const ref = buildObjectTypeRef(
        objectType,
        scene.sceneId,
        scene.sceneName
      );
      if (!ref) {
        return;
      }
      rows.push({
        objectType,
        sceneId: scene.sceneId,
        sceneName: scene.sceneName,
        ref
      });
    });
  });

  return rows;
};

const SYSTEM_PROMPT = `你是本体语义映射助手。根据多个本体场景库中的对象类型与用户生成要求，批量产出标准术语及映射。
仅输出合法 JSON，不要 markdown 或其它说明。结构：
{"mappings":[{"standardTerm":"标准术语","description":"映射描述","synonyms":["别名1"],"objectTypeIds":[1]}]}
规则：
1. 生成 5～15 条语义映射，优先覆盖重要对象类型，避免重复术语
2. standardTerm 使用规范业务术语，简明准确（一般 2～16 字）
3. synonyms 给出 2～5 个同义词/别名，不要重复标准术语本身
4. description 说明业务含义与适用场景，可结合用户生成要求
5. objectTypeIds 仅使用输入中提供的对象类型 id，可为空数组
6. 全部使用中文或业界通用中英文缩写`;

const generateLocalCandidates = (
  input: GenerateMappingsInput
): SemanticMappingCandidate[] => {
  const rows = flattenObjectTypes(input.scenes);
  const requirements = input.requirements?.trim();
  const candidates: SemanticMappingCandidate[] = [];
  const seenTerms = new Set<string>();

  if (requirements) {
    candidates.push({
      key: generateKey(),
      standardTerm: requirements.slice(0, 16) || '自定义术语',
      description: `根据生成要求与所选本体场景库推断：${requirements}`,
      synonyms: [],
      objectTypes: rows.slice(0, 2).map((item) => item.ref)
    });
    seenTerms.add(candidates[0].standardTerm);
  }

  rows.slice(0, MAX_CANDIDATES).forEach((row) => {
    const term =
      row.objectType.name?.trim() ||
      row.objectType.code?.trim() ||
      `对象类型-${row.ref.id}`;
    if (seenTerms.has(term)) {
      return;
    }
    seenTerms.add(term);

    const synonyms: string[] = [];
    if (row.objectType.code?.trim() && row.objectType.code.trim() !== term) {
      synonyms.push(row.objectType.code.trim());
    }

    candidates.push({
      key: generateKey(),
      standardTerm: term,
      description:
        row.objectType.description?.trim() ||
        `来自本体场景库「${row.sceneName}」的对象类型映射`,
      synonyms,
      objectTypes: [row.ref]
    });
  });

  if (!candidates.length) {
    input.scenes.forEach((scene) => {
      candidates.push({
        key: generateKey(),
        standardTerm: `${scene.sceneName}-核心概念`,
        description: requirements
          ? `结合生成要求「${requirements}」与场景「${scene.sceneName}」生成的兜底术语`
          : `场景「${scene.sceneName}」暂无对象类型时的兜底术语`,
        synonyms: [scene.sceneName],
        objectTypes: []
      });
    });
  }

  return candidates.slice(0, MAX_CANDIDATES);
};

const sanitizeLlmMappings = (
  parsed: unknown,
  objectTypeMap: Map<number, SemanticMappingObjectTypeRef>
): SemanticMappingCandidate[] | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const mappings = (parsed as { mappings?: unknown }).mappings;
  if (!Array.isArray(mappings) || !mappings.length) {
    return null;
  }

  const seen = new Set<string>();
  const candidates: SemanticMappingCandidate[] = [];

  mappings.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const row = item as {
      standardTerm?: unknown;
      description?: unknown;
      synonyms?: unknown;
      objectTypeIds?: unknown;
    };
    const standardTerm = String(row.standardTerm ?? '').trim();
    if (!standardTerm || seen.has(standardTerm)) {
      return;
    }
    seen.add(standardTerm);

    const objectTypes: SemanticMappingObjectTypeRef[] = [];
    if (Array.isArray(row.objectTypeIds)) {
      row.objectTypeIds.forEach((idValue) => {
        const id = Number(idValue);
        const ref = objectTypeMap.get(id);
        if (ref && !objectTypes.some((ot) => ot.id === ref.id)) {
          objectTypes.push(ref);
        }
      });
    }

    candidates.push({
      key: generateKey(),
      standardTerm,
      description: String(row.description ?? '').trim() || undefined,
      synonyms: normalizeSynonyms(row.synonyms, standardTerm),
      objectTypes
    });
  });

  return candidates.length ? candidates.slice(0, MAX_CANDIDATES) : null;
};

const generateWithLlm = async (
  input: GenerateMappingsInput
): Promise<SemanticMappingCandidate[]> => {
  const llmConfig = resolveScenarioLlmConfig(
    SEMANTIC_MAPPING_BATCH_GEN_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();

  const rows = flattenObjectTypes(input.scenes).slice(
    0,
    MAX_OBJECT_TYPES_FOR_LLM
  );
  const objectTypeMap = new Map(
    rows.map((item) => [item.ref.id, item.ref] as const)
  );

  const sceneSummary = input.scenes
    .map(
      (scene) =>
        `- ${scene.sceneName}（id=${scene.sceneId}，对象类型 ${scene.objectTypes.length} 个）`
    )
    .join('\n');

  const objectTypeSummary = rows
    .map((item) => {
      const desc = item.objectType.description?.trim();
      return `- id=${item.ref.id} name=${item.ref.name}${
        item.ref.code ? ` code=${item.ref.code}` : ''
      } scene=${item.sceneName}${desc ? ` desc=${desc.slice(0, 80)}` : ''}`;
    })
    .join('\n');

  const userText = [
    '本体场景库：',
    sceneSummary || '（无）',
    '',
    '对象类型列表：',
    objectTypeSummary || '（无对象类型）',
    '',
    `生成要求：${input.requirements?.trim() || '（未填写，请按场景与对象类型推断核心业务术语）'}`
  ].join('\n');

  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userText }
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
  const sanitized = sanitizeLlmMappings(parsed, objectTypeMap);
  if (!sanitized?.length) {
    throw new Error('大模型返回的映射格式无效');
  }

  return sanitized;
};

export const generateSemanticMappingsFromScenes = async (
  input: GenerateMappingsInput
): Promise<GenerateMappingsResult> => {
  if (!input.scenes.length) {
    throw new Error('请先选择至少一个本体场景库');
  }

  if (isScenarioLlmAvailable(SEMANTIC_MAPPING_BATCH_GEN_SCENARIO.code)) {
    try {
      const candidates = await generateWithLlm(input);
      return { candidates, source: 'llm' };
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      console.warn('[SemanticMapping] 大模型批量生成失败，使用本地规则', error);
    }
  }

  return {
    candidates: generateLocalCandidates(input),
    source: 'local'
  };
};
