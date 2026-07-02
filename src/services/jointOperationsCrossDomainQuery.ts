import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type {
  CrossDomainQueryHit,
  CrossDomainQueryResult,
  JointKnowledgeBundle
} from '@/types/jointOperationsKnowledge';
import { isOntologyApiSuccess } from '@/utils/apiResponse';

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/[\s,，;；、。]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);

const scoreText = (text: string, tokens: string[]) => {
  const normalized = text.toLowerCase();
  return tokens.reduce(
    (score, token) => (normalized.includes(token) ? score + 1 : score),
    0
  );
};

export const executeJointOperationsCrossDomainQuery = async (params: {
  sceneId: number;
  query: string;
  knowledge: JointKnowledgeBundle;
  extraSceneIds?: number[];
}): Promise<CrossDomainQueryResult> => {
  const { sceneId, query, knowledge, extraSceneIds = [] } = params;
  const tokens = tokenize(query);
  const sceneIds = Array.from(new Set([sceneId, ...extraSceneIds]));
  const hits: CrossDomainQueryHit[] = [];

  const sceneNameMap = new Map<number, string>();
  const sceneRes = await listOntologyModel({
    pageNo: 1,
    pageSize: 100,
    order: 'desc',
    orderBy: 'create_time'
  });
  if (isOntologyApiSuccess(sceneRes) && sceneRes.data?.result) {
    sceneRes.data.result.forEach((scene) => {
      if (scene.id != null) {
        sceneNameMap.set(scene.id, scene.name || String(scene.id));
      }
    });
  }

  for (const currentSceneId of sceneIds) {
    const topologyRes = await getOntologyTopology({ id: currentSceneId });
    if (!isOntologyApiSuccess(topologyRes) || !topologyRes.data) {
      continue;
    }

    const sceneName = sceneNameMap.get(currentSceneId);

    topologyRes.data.nodes?.forEach((node) => {
      const text = `${node.name || ''} ${node.code || ''} ${node.description || ''}`;
      const relevance = scoreText(text, tokens);
      if (relevance > 0) {
        hits.push({
          kind: 'objectType',
          id: node.id ?? node.code ?? node.name ?? '',
          name: node.name || node.code || '未命名对象类型',
          code: node.code,
          description: node.description,
          sceneId: currentSceneId,
          sceneName,
          relevance
        });
      }
    });

    topologyRes.data.edges?.forEach((edge) => {
      const text = `${edge.name || ''} ${edge.description || ''}`;
      const relevance = scoreText(text, tokens);
      if (relevance > 0) {
        hits.push({
          kind: 'link',
          id: edge.id ?? `${edge.sourceId}-${edge.targetId}`,
          name: edge.name || '未命名链接',
          description: edge.description,
          sceneId: currentSceneId,
          sceneName,
          relevance
        });
      }
    });
  }

  knowledge.axioms
    .filter((item) => item.enabled)
    .forEach((axiom) => {
      const text = `${axiom.name} ${axiom.expression} ${axiom.description || ''} ${axiom.domain || ''}`;
      const relevance = scoreText(text, tokens);
      if (relevance > 0) {
        hits.push({
          kind: 'axiom',
          id: axiom.id,
          name: axiom.name,
          description: axiom.expression,
          sceneId: axiom.sceneId,
          sceneName: sceneNameMap.get(axiom.sceneId),
          relevance: relevance + 0.5
        });
      }
    });

  knowledge.sceneRules
    .filter((item) => item.enabled)
    .forEach((rule) => {
      const text = `${rule.name} ${rule.condition} ${rule.action} ${rule.description || ''}`;
      const relevance = scoreText(text, tokens);
      if (relevance > 0) {
        hits.push({
          kind: 'sceneRule',
          id: rule.id,
          name: rule.name,
          description: `${rule.condition} → ${rule.action}`,
          sceneId: rule.sceneId,
          sceneName: sceneNameMap.get(rule.sceneId),
          relevance: relevance + 0.3
        });
      }
    });

  const sortedHits = hits
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 30);

  const summary =
    sortedHits.length > 0
      ? `在 ${sceneIds.length} 个图谱场景下命中 ${sortedHits.length} 条结果，已结合公理 ${knowledge.axioms.filter((item) => item.enabled).length} 条、场景规则 ${knowledge.sceneRules.filter((item) => item.enabled).length} 条进行跨域关联。`
      : '未命中图谱对象或规则，可尝试使用「军事行动」「平台」「武器」「地理位置」等关键词。';

  return {
    query,
    hits: sortedHits,
    summary
  };
};
