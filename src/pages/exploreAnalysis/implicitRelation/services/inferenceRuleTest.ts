import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type {
  Ontologymetadataservicev1TopologyEdge,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';
import { GRAPH_ALGORITHM_OPTIONS } from '../constants';
import type {
  InferenceRule,
  InferenceRuleTestHit,
  InferenceRuleTestResult,
  RichRelationKind
} from '../types';
import { generateRichRelations } from './richRelationGenerator';

const MAX_HITS = 20;

const nodeName = (
  nodes: Map<number, Ontologymetadataservicev1TopologyNode>,
  id?: number
) => (id != null ? nodes.get(id)?.name : undefined) || `节点#${id ?? '?'}`;

const inferRelationKinds = (rule: InferenceRule): RichRelationKind[] => {
  const text = `${rule.condition || ''} ${rule.action || ''} ${rule.description || ''}`;
  const kinds: RichRelationKind[] = [];

  if (/对称/.test(text)) {
    kinds.push('symmetric');
  }
  if (/传递/.test(text)) {
    kinds.push('transitive');
  }
  if (/逆/.test(text)) {
    kinds.push('inverse');
  }

  return kinds.length ? kinds : ['symmetric', 'transitive', 'inverse'];
};

const buildAdjacency = (edges: Ontologymetadataservicev1TopologyEdge[]) => {
  const adjacency = new Map<number, number[]>();
  const addEdge = (sourceId?: number, targetId?: number) => {
    if (sourceId == null || targetId == null) {
      return;
    }
    const next = adjacency.get(sourceId) || [];
    next.push(targetId);
    adjacency.set(sourceId, next);
  };

  edges.forEach((edge) => addEdge(edge.sourceId, edge.targetId));
  return adjacency;
};

const hasDirectedEdge = (
  edges: Ontologymetadataservicev1TopologyEdge[],
  sourceId: number,
  targetId: number
) =>
  edges.some(
    (edge) => edge.sourceId === sourceId && edge.targetId === targetId
  );

const testLogicalRule = async (
  sceneId: number,
  rule: InferenceRule
): Promise<InferenceRuleTestResult> => {
  const kinds = inferRelationKinds(rule);
  const generated = await generateRichRelations(sceneId, kinds);
  const hits = generated.slice(0, MAX_HITS).map((item) => ({
    path: `${item.sourceNodeName || item.sourceNodeId} → ${item.targetNodeName || item.targetNodeId}`,
    description: item.description
  }));

  return {
    summary: `逻辑推理测试完成，命中 ${generated.length} 条潜在隐性关系（展示前 ${hits.length} 条）`,
    hits
  };
};

const testGraphRule = async (
  sceneId: number,
  rule: InferenceRule
): Promise<InferenceRuleTestResult> => {
  const response = await getOntologyTopology({ id: sceneId });
  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '获取图谱拓扑失败');
  }

  const topology = response.data || {};
  const edges = topology.edges || [];
  const nodes = new Map<number, Ontologymetadataservicev1TopologyNode>();
  (topology.nodes || []).forEach((node) => {
    if (node.id != null) {
      nodes.set(node.id, node);
    }
  });

  if (!edges.length) {
    return {
      summary: '当前图谱暂无链接，无法执行图推理测试',
      hits: []
    };
  }

  const maxDepth = rule.maxDepth || 2;
  const algorithmLabel =
    GRAPH_ALGORITHM_OPTIONS.find((item) => item.value === rule.graphAlgorithm)
      ?.label ||
    rule.graphAlgorithm ||
    '图算法';
  const adjacency = buildAdjacency(edges);
  const hits: InferenceRuleTestHit[] = [];
  const seen = new Set<string>();

  const expandFrom = (startId: number) => {
    const queue: Array<{ nodeId: number; depth: number; path: number[] }> = [
      { nodeId: startId, depth: 0, path: [startId] }
    ];

    while (queue.length && hits.length < MAX_HITS) {
      const current = queue.shift();
      if (!current || current.depth >= maxDepth) {
        continue;
      }

      const neighbors = adjacency.get(current.nodeId) || [];
      neighbors.forEach((nextId) => {
        if (current.path.includes(nextId)) {
          return;
        }

        const nextPath = [...current.path, nextId];
        const sourceId = nextPath[0];
        const targetId = nextPath[nextPath.length - 1];

        if (
          sourceId !== targetId &&
          !hasDirectedEdge(edges, sourceId, targetId)
        ) {
          const key = `${sourceId}-${targetId}-${nextPath.join('>')}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push({
              path: nextPath.map((id) => nodeName(nodes, id)).join(' → '),
              description: `${algorithmLabel}：${current.depth + 1} 跳路径推导潜在关联`
            });
          }
        }

        if (current.depth + 1 < maxDepth) {
          queue.push({
            nodeId: nextId,
            depth: current.depth + 1,
            path: nextPath
          });
        }
      });
    }
  };

  const startNodes = (topology.nodes || [])
    .map((node) => node.id)
    .filter((id): id is number => id != null)
    .slice(0, 5);

  startNodes.forEach((nodeId) => expandFrom(nodeId));

  return {
    summary: `图推理测试完成（${algorithmLabel}，深度 ${maxDepth}），发现 ${hits.length} 条候选隐性关联`,
    hits
  };
};

const testLlmRule = async (
  sceneId: number,
  rule: InferenceRule
): Promise<InferenceRuleTestResult> => {
  const response = await getOntologyTopology({ id: sceneId });
  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '获取图谱拓扑失败');
  }

  const topology = response.data || {};
  const objectTypes = (topology.nodes || [])
    .map((node) => String(node.name || node.code || '').trim())
    .filter(Boolean)
    .slice(0, 8);
  const linkNames = [
    ...new Set(
      (topology.edges || [])
        .map((edge) => String(edge.name || edge.code || '').trim())
        .filter(Boolean)
    )
  ].slice(0, 8);

  const hits: InferenceRuleTestHit[] = [];

  if (objectTypes.length >= 2) {
    hits.push({
      path: `${objectTypes[0]} ↔ ${objectTypes[1]}`,
      description: '基于对象类型组合的常识联想候选（待大模型进一步验证）'
    });
  }

  linkNames.slice(0, 3).forEach((linkName) => {
    hits.push({
      path: linkName,
      description: '基于已有链接类型的常识联想扩展候选'
    });
  });

  const promptPreview = rule.prompt?.trim() || '未配置提示词';

  return {
    summary: `大模型常识联想测试完成。对象类型 ${objectTypes.length} 个，链接 ${linkNames.length} 种。提示词：${promptPreview.slice(0, 80)}${promptPreview.length > 80 ? '…' : ''}`,
    hits: hits.slice(0, MAX_HITS)
  };
};

export const testInferenceRule = async (
  sceneId: number,
  rule: InferenceRule
): Promise<InferenceRuleTestResult> => {
  let result: InferenceRuleTestResult;

  if (rule.category === 'rule') {
    result = await testLogicalRule(sceneId, rule);
  } else if (rule.category === 'graphAlgorithm') {
    result = await testGraphRule(sceneId, rule);
  } else {
    result = await testLlmRule(sceneId, rule);
  }

  if (!rule.enabled) {
    return {
      ...result,
      summary: `规则当前未启用。${result.summary}`
    };
  }

  return result;
};
