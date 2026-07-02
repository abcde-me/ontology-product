import {
  isScenarioLlmAvailable,
  resolveScenarioLlmConfig
} from '@/services/llmScenarioStorage';
import { SCENE_VERSION_SUMMARY_SCENARIO } from '@/services/llmScenarios/definitions/sceneVersionSummary.scenario';
import {
  resolveDirectLlmRequestUrl,
  type DirectLlmMessage
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import type { OntologySceneVersionCompareResult } from '@/types/ontologySceneVersion';
import {
  formatCompareResultAsText,
  hasCompareDiff
} from './compareSceneVersions';

const SUMMARIZE_SYSTEM_PROMPT = `你是本体工程助手。用户会提供两个本体场景版本之间的结构化差异。
请用简洁中文输出，且全文仅允许两级结构：
- 小标题：仅使用 markdown 四级标题 ####（例如 #### 概述、#### 对象类型）
- 正文：紧跟小标题的普通段落或「-」列表
禁止使用 #、##、### 标题，禁止使用分隔线 ---，不要加「关键变更」等额外大章节。
重要：输入文本中未列出的资源类型表示无变更，不要为其输出任何 #### 章节，也不要写「无变更」。
仅对输入里实际出现的资源类型（对象类型、链接、行为、函数）按顺序输出对应 #### 章节。
#### 概述用 2-3 句概括有变更的部分即可；若输入标明无任何变更，概述说明两版本一致即可。
不要编造差异中未出现的内容。`;

const UNCHANGED_SECTION_MARKERS = [
  '无变更',
  '无名称级变更',
  '均无名称或数量变更',
  '均无差异',
  '无差异',
  '没有变更',
  '没有变化'
];

/** 移除 AI 总结中仅描述「无变更」的章节 */
export const stripUnchangedSummarySections = (markdown: string): string => {
  const blocks = markdown.split(/(?=####\s)/);
  const kept: string[] = [];

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) {
      return;
    }

    if (!trimmed.startsWith('####')) {
      kept.push(trimmed);
      return;
    }

    const lines = trimmed.split('\n');
    const body = lines.slice(1).join('\n').trim().replace(/\s+/g, '');

    if (!body) {
      return;
    }

    const isOverview = /^####\s*概述/.test(trimmed);
    if (isOverview) {
      const isOnlyUnchanged = UNCHANGED_SECTION_MARKERS.some((marker) =>
        body.includes(marker.replace(/\s+/g, ''))
      );
      if (isOnlyUnchanged && body.length < 80) {
        return;
      }
      kept.push(trimmed);
      return;
    }

    const isUnchangedSection = UNCHANGED_SECTION_MARKERS.some((marker) => {
      const normalizedMarker = marker.replace(/\s+/g, '');
      return (
        body === normalizedMarker ||
        body.startsWith(normalizedMarker) ||
        (body.length <= 12 && body.includes(normalizedMarker))
      );
    });

    if (!isUnchangedSection) {
      kept.push(trimmed);
    }
  });

  return kept.join('\n\n').trim();
};

const buildLocalCompareSummary = (
  result: OntologySceneVersionCompareResult
): string => {
  if (!hasCompareDiff(result)) {
    return '#### 概述\n\n两个版本在对象类型、链接、行为、函数名称与数量上均无差异。';
  }

  const { baseVersion, targetVersion } = result;
  const compareText = formatCompareResultAsText(result, { onlyChanged: true });
  const changedSections = compareText
    .split('\n\n')
    .filter((block) => block.startsWith('## '))
    .map((block) => block.replace(/^## /, '#### '));

  return [
    `基准版本: ${baseVersion.label}（${baseVersion.changeSummary || '无说明'}）`,
    `对比版本: ${targetVersion.label}（${targetVersion.changeSummary || '无说明'}）`,
    ...changedSections
  ].join('\n\n');
};

export const summarizeVersionCompareWithLlm = async (
  compareText: string,
  signal?: AbortSignal
): Promise<string> => {
  if (!isScenarioLlmAvailable(SCENE_VERSION_SUMMARY_SCENARIO.code)) {
    throw new Error(
      '未配置大模型或该环节已关闭，无法生成 AI 总结。请在模型管理中启用「版本差异总结」'
    );
  }

  const llmConfig = resolveScenarioLlmConfig(
    SCENE_VERSION_SUMMARY_SCENARIO.code
  );
  const { apiKey, model } = llmConfig!;
  const url = resolveDirectLlmRequestUrl();
  const messages: DirectLlmMessage[] = [
    { role: 'system', content: SUMMARIZE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请总结以下本体场景版本差异：\n\n${compareText}`
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

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('大模型未返回有效内容');
  }

  return stripUnchangedSummarySections(content);
};

export const buildVersionCompareSummary = async (
  result: OntologySceneVersionCompareResult,
  options?: { useLlm?: boolean; signal?: AbortSignal }
): Promise<{ text: string; source: 'llm' | 'local' }> => {
  if (!hasCompareDiff(result)) {
    const text = buildLocalCompareSummary(result);
    return { text, source: 'local' };
  }

  const compareText = formatCompareResultAsText(result, { onlyChanged: true });

  if (
    options?.useLlm !== false &&
    isScenarioLlmAvailable(SCENE_VERSION_SUMMARY_SCENARIO.code)
  ) {
    try {
      const text = await summarizeVersionCompareWithLlm(
        compareText,
        options?.signal
      );
      const trimmed = stripUnchangedSummarySections(text);
      return {
        text: trimmed || buildLocalCompareSummary(result),
        source: 'llm'
      };
    } catch (error) {
      console.warn('[SceneVersion] LLM 总结失败，回退本地摘要', error);
    }
  }

  return {
    text: buildLocalCompareSummary(result),
    source: 'local'
  };
};
