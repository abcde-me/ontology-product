import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { ScenePlanIntroPageKey } from '@/types/scenePlanIntro';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { getScenePlanIntro } from '@/utils/devScenePlanIntroStore';

export interface OntologySceneOption {
  id: number;
  name: string;
  description?: string;
  objectCount: number;
  linkCount: number;
}

export interface KnowledgeBaseOption {
  id: string;
  name: string;
  description?: string;
  sceneId: number;
  pageKey: ScenePlanIntroPageKey;
  hasContent: boolean;
}

const KNOWLEDGE_PAGE_KEYS: ScenePlanIntroPageKey[] = [
  'implicitRelation',
  'jointOperations',
  'intelligenceAnalysis'
];

const KNOWLEDGE_PAGE_LABEL: Record<ScenePlanIntroPageKey, string> = {
  implicitRelation: '场景介绍',
  jointOperations: '联合作战方案',
  intelligenceAnalysis: '情报分析方案'
};

export const loadOntologySceneOptions = async (): Promise<
  OntologySceneOption[]
> => {
  const res = await listOntologyModel({
    pageNo: 1,
    pageSize: 200,
    order: 'desc',
    orderBy: 'create_time'
  });

  if (!isOntologyApiSuccess(res) || !res.data?.result) {
    return [];
  }

  return res.data.result
    .filter((scene) => scene.id != null)
    .map((scene) => ({
      id: scene.id!,
      name: scene.name || `场景 #${scene.id}`,
      description: scene.description,
      objectCount: scene.ontologyObjectTypeCounts || 0,
      linkCount: scene.ontologyLinkTypeCounts || 0
    }));
};

export const buildKnowledgeBaseOptions = (
  scenes: Array<Pick<OntologySceneOption, 'id' | 'name'>>
): KnowledgeBaseOption[] => {
  const options: KnowledgeBaseOption[] = [];

  scenes.forEach((scene) => {
    KNOWLEDGE_PAGE_KEYS.forEach((pageKey) => {
      const intro = getScenePlanIntro(pageKey, scene.id);
      options.push({
        id: `${pageKey}:${scene.id}`,
        name: `${scene.name || '未命名场景'} · ${KNOWLEDGE_PAGE_LABEL[pageKey]}`,
        description: intro.content?.trim()
          ? `已配置 ${intro.content.trim().length} 字`
          : '暂无内容',
        sceneId: scene.id,
        pageKey,
        hasContent: Boolean(intro.content?.trim())
      });
    });
  });

  return options;
};

export const parseKnowledgeBaseId = (knowledgeBaseId: string) => {
  const separatorIndex = knowledgeBaseId.indexOf(':');
  if (separatorIndex <= 0) {
    return null;
  }

  const pageKey = knowledgeBaseId.slice(
    0,
    separatorIndex
  ) as ScenePlanIntroPageKey;
  const sceneId = Number(knowledgeBaseId.slice(separatorIndex + 1));

  if (!KNOWLEDGE_PAGE_KEYS.includes(pageKey) || !Number.isFinite(sceneId)) {
    return null;
  }

  return { pageKey, sceneId };
};

export const getKnowledgeBaseContent = (knowledgeBaseId: string) => {
  const parsed = parseKnowledgeBaseId(knowledgeBaseId);
  if (!parsed) {
    return '';
  }

  return (
    getScenePlanIntro(parsed.pageKey, parsed.sceneId).content?.trim() || ''
  );
};

export const resolveSceneNameMap = (scenes: OntologySceneOption[]) =>
  scenes.reduce<Record<number, string>>((map, scene) => {
    map[scene.id] = scene.name;
    return map;
  }, {});
