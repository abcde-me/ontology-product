/**
 * 隐性关系发现：社区分析 & 路径预测（实例级图谱）
 */
import {
  MAX_DISCOVERIES,
  SPATIAL_NEAR_KM,
  TEMPORAL_NEAR_HOURS
} from '../constants';
import type {
  ConfirmedGraphEdge,
  DiscoveredImplicitRelation,
  ImplicitAnalysisScope,
  ImplicitDiscoveryAlgorithm,
  ImplicitDiscoveryResult,
  ImplicitRelationEvidence
} from '../types';
import {
  buildInstanceRelationGraph,
  type InstanceGraphNode,
  type InstanceRelationGraph
} from './buildInstanceGraph';
import { resolveScopeInstances } from './scopeInstances';
import {
  haversineKm,
  loadSpatioTemporalFeatures,
  type SpatioTemporalFeature
} from './spatiotemporalFeatures';
import { summarizeDiscoveryResult } from './summarizeDiscovery';

type Adjacency = Map<string, Set<string>>;

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const buildAdjacency = (graph: InstanceRelationGraph): Adjacency => {
  const adjacency: Adjacency = new Map();
  const ensure = (id: string) => {
    if (!adjacency.has(id)) {
      adjacency.set(id, new Set());
    }
    return adjacency.get(id)!;
  };

  graph.nodes.forEach((node) => ensure(node.key));
  graph.edges.forEach((edge) => {
    ensure(edge.sourceKey).add(edge.targetKey);
    ensure(edge.targetKey).add(edge.sourceKey);
  });

  return adjacency;
};

const hasUndirectedEdge = (adjacency: Adjacency, a: string, b: string) =>
  adjacency.get(a)?.has(b) ?? false;

const commonNeighbors = (
  adjacency: Adjacency,
  a: string,
  b: string
): string[] => {
  const neighborsA = adjacency.get(a) ?? new Set();
  const neighborsB = adjacency.get(b) ?? new Set();
  const shared: string[] = [];
  neighborsA.forEach((id) => {
    if (neighborsB.has(id)) {
      shared.push(id);
    }
  });
  return shared;
};

const adamicAdarScore = (adjacency: Adjacency, shared: string[]): number => {
  let score = 0;
  shared.forEach((id) => {
    const degree = adjacency.get(id)?.size ?? 0;
    if (degree > 1) {
      score += 1 / Math.log(degree);
    }
  });
  return score;
};

const runLabelPropagation = (
  adjacency: Adjacency,
  nodeIds: string[],
  maxIter = 20
): Map<string, number> => {
  const labels = new Map<string, number>();
  nodeIds.forEach((id, index) => labels.set(id, index));

  for (let iter = 0; iter < maxIter; iter += 1) {
    let changed = false;
    nodeIds.forEach((id) => {
      const counter = new Map<number, number>();
      adjacency.get(id)?.forEach((neighbor) => {
        const label = labels.get(neighbor) ?? 0;
        counter.set(label, (counter.get(label) ?? 0) + 1);
      });
      if (counter.size === 0) {
        return;
      }
      let bestLabel = labels.get(id) ?? 0;
      let bestCount = -1;
      counter.forEach((count, label) => {
        if (count > bestCount || (count === bestCount && label < bestLabel)) {
          bestCount = count;
          bestLabel = label;
        }
      });
      if (bestLabel !== labels.get(id)) {
        labels.set(id, bestLabel);
        changed = true;
      }
    });
    if (!changed) {
      break;
    }
  }

  return labels;
};

const findShortestPath = (
  adjacency: Adjacency,
  source: string,
  target: string,
  maxDepth = 4
): string[] | null => {
  if (source === target) {
    return [source];
  }
  const queue = [source];
  const parent = new Map<string, string | null>([[source, null]]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    let depth = 0;
    let cursor: string | null = current;
    while (cursor && parent.get(cursor) != null) {
      cursor = parent.get(cursor)!;
      depth += 1;
    }
    if (depth >= maxDepth) {
      continue;
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      if (parent.has(neighbor)) {
        continue;
      }
      parent.set(neighbor, current);
      if (neighbor === target) {
        const path = [target];
        let walk: string | null = target;
        while (walk && parent.get(walk) != null) {
          walk = parent.get(walk)!;
          if (walk) {
            path.push(walk);
          }
        }
        return path.reverse();
      }
      queue.push(neighbor);
    }
  }

  return null;
};

const normalizeScores = <T extends { score: number }>(
  items: T[]
): Array<T & { confidence: number }> => {
  const max = Math.max(...items.map((item) => item.score), 0.0001);
  return items.map((item) => ({
    ...item,
    confidence: Math.min(0.99, Math.max(0.15, item.score / max))
  }));
};

const nodeLabel = (nodes: Map<string, InstanceGraphNode>, key: string) =>
  nodes.get(key)?.label || key;

const buildTypePairLabel = (
  source?: InstanceGraphNode,
  target?: InstanceGraphNode
): string => {
  const left = source?.objectTypeName?.trim();
  const right = target?.objectTypeName?.trim();
  if (left && right) {
    return left === right ? left : `${left}·${right}`;
  }
  if (left) {
    return left;
  }
  if (right) {
    return right;
  }
  return '实例';
};

const buildSuggestedRelationName = (params: {
  algorithm: ImplicitDiscoveryAlgorithm;
  source?: InstanceGraphNode;
  target?: InstanceGraphNode;
  sharedNeighborCount?: number;
  hasSpace?: boolean;
  hasTime?: boolean;
}): string => {
  const pair = buildTypePairLabel(params.source, params.target);

  switch (params.algorithm) {
    case 'community':
      return `${pair}·同社区关联`;
    case 'path-prediction':
      if ((params.sharedNeighborCount ?? 0) >= 3) {
        return `${pair}·强共同关联`;
      }
      return `${pair}·间接关联`;
    case 'spatiotemporal':
      if (params.hasSpace && params.hasTime) {
        return `${pair}·时空共现`;
      }
      if (params.hasSpace) {
        return `${pair}·空间邻近`;
      }
      if (params.hasTime) {
        return `${pair}·时间共现`;
      }
      return `${pair}·时空关联`;
    case 'core-node':
      return `${pair}·核心节点关联`;
    case 'weak-link':
      return `${pair}·薄弱环节`;
    default:
      return `${pair}·隐性关联`;
  }
};

const computeBetweennessCentrality = (
  adjacency: Adjacency,
  nodeIds: string[]
): Map<string, number> => {
  const scores = new Map<string, number>();
  nodeIds.forEach((id) => scores.set(id, 0));
  const nodeSet = new Set(nodeIds);

  nodeIds.forEach((source) => {
    const stack: string[] = [];
    const predecessors = new Map<string, string[]>();
    const sigma = new Map<string, number>();
    const distance = new Map<string, number>();
    const delta = new Map<string, number>();

    nodeIds.forEach((id) => {
      predecessors.set(id, []);
      sigma.set(id, 0);
      distance.set(id, -1);
      delta.set(id, 0);
    });

    sigma.set(source, 1);
    distance.set(source, 0);
    const queue = [source];

    while (queue.length > 0) {
      const current = queue.shift()!;
      stack.push(current);
      adjacency.get(current)?.forEach((neighbor) => {
        if (!nodeSet.has(neighbor)) {
          return;
        }
        if ((distance.get(neighbor) ?? -1) < 0) {
          queue.push(neighbor);
          distance.set(neighbor, (distance.get(current) ?? 0) + 1);
        }
        if (distance.get(neighbor) === (distance.get(current) ?? 0) + 1) {
          sigma.set(
            neighbor,
            (sigma.get(neighbor) ?? 0) + (sigma.get(current) ?? 0)
          );
          predecessors.get(neighbor)!.push(current);
        }
      });
    }

    while (stack.length > 0) {
      const node = stack.pop()!;
      predecessors.get(node)?.forEach((pred) => {
        const contribution =
          ((sigma.get(pred) ?? 0) / (sigma.get(node) ?? 1)) *
          (1 + (delta.get(node) ?? 0));
        delta.set(pred, (delta.get(pred) ?? 0) + contribution);
      });
      if (node !== source) {
        scores.set(node, (scores.get(node) ?? 0) + (delta.get(node) ?? 0));
      }
    }
  });

  return scores;
};

const pickCoreNodes = (
  adjacency: Adjacency,
  nodeIds: string[]
): { coreSet: Set<string>; centrality: Map<string, number> } => {
  const betweenness = computeBetweennessCentrality(adjacency, nodeIds);
  const maxDegree = Math.max(
    ...nodeIds.map((id) => adjacency.get(id)?.size ?? 0),
    1
  );
  const maxBetween = Math.max(
    ...nodeIds.map((id) => betweenness.get(id) ?? 0),
    0.0001
  );

  const centrality = new Map<string, number>();
  nodeIds.forEach((id) => {
    const degreeNorm = (adjacency.get(id)?.size ?? 0) / maxDegree;
    const betweenNorm = (betweenness.get(id) ?? 0) / maxBetween;
    centrality.set(id, degreeNorm * 0.35 + betweenNorm * 0.65);
  });

  const sorted = [...nodeIds].sort(
    (left, right) => (centrality.get(right) ?? 0) - (centrality.get(left) ?? 0)
  );
  const topCount = Math.max(2, Math.ceil(nodeIds.length * 0.25));
  const threshold =
    centrality.get(sorted[Math.min(topCount - 1, sorted.length - 1)]) ?? 0;

  const coreSet = new Set<string>();
  sorted.forEach((id) => {
    if (
      (centrality.get(id) ?? 0) >= threshold &&
      (adjacency.get(id)?.size ?? 0) >= 1
    ) {
      coreSet.add(id);
    }
  });

  return { coreSet, centrality };
};

const communityPairKey = (left: number, right: number) => {
  const min = Math.min(left, right);
  const max = Math.max(left, right);
  return `${min}|${max}`;
};

const countCrossCommunityEdges = (
  adjacency: Adjacency,
  communities: Map<string, number>
): Map<string, number> => {
  const counts = new Map<string, number>();
  const seen = new Set<string>();

  adjacency.forEach((neighbors, source) => {
    const sourceCommunity = communities.get(source);
    if (sourceCommunity == null) {
      return;
    }
    neighbors.forEach((target) => {
      if (source >= target) {
        return;
      }
      const edgeKey = pairKey(source, target);
      if (seen.has(edgeKey)) {
        return;
      }
      seen.add(edgeKey);
      const targetCommunity = communities.get(target);
      if (targetCommunity == null || sourceCommunity === targetCommunity) {
        return;
      }
      const key = communityPairKey(sourceCommunity, targetCommunity);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });

  return counts;
};

const discoverByCoreNode = (
  nodeMap: Map<string, InstanceGraphNode>,
  adjacency: Adjacency,
  now: string
): DiscoveredImplicitRelation[] => {
  const nodeIds = Array.from(adjacency.keys());
  const { coreSet, centrality } = pickCoreNodes(adjacency, nodeIds);
  if (coreSet.size === 0) {
    return [];
  }

  const candidates: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    score: number;
    shared: string[];
    path: string[] | null;
    sourceCore: number;
    targetCore: number;
  }> = [];
  const seen = new Set<string>();

  coreSet.forEach((coreId) => {
    nodeIds.forEach((otherId) => {
      if (coreId === otherId || hasUndirectedEdge(adjacency, coreId, otherId)) {
        return;
      }
      const key = pairKey(coreId, otherId);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);

      const shared = commonNeighbors(adjacency, coreId, otherId);
      const path = findShortestPath(adjacency, coreId, otherId, 4);
      if (shared.length === 0 && (!path || path.length <= 2)) {
        return;
      }

      const sourceCore = centrality.get(coreId) ?? 0;
      const targetCore = centrality.get(otherId) ?? 0;
      const pathBonus = path && path.length > 2 ? 1 / (path.length - 1) : 0;
      const score =
        sourceCore *
        Math.max(targetCore, 0.35) *
        (1 + shared.length * 0.15 + pathBonus * 0.25);

      if (score <= 0) {
        return;
      }

      candidates.push({
        sourceNodeId: coreId,
        targetNodeId: otherId,
        score,
        shared,
        path,
        sourceCore,
        targetCore
      });
    });
  });

  const ranked = normalizeScores(
    candidates.sort((left, right) => right.score - left.score)
  ).slice(0, MAX_DISCOVERIES);

  return ranked.map((item) => {
    const source = nodeMap.get(item.sourceNodeId);
    const target = nodeMap.get(item.targetNodeId);
    const sourceName = nodeLabel(nodeMap, item.sourceNodeId);
    const targetName = nodeLabel(nodeMap, item.targetNodeId);
    const evidence: ImplicitRelationEvidence[] = [
      {
        type: 'core-node',
        title: '核心节点结构',
        detail: `「${sourceName}」核心度 ${item.sourceCore.toFixed(2)}，「${targetName}」结构权重 ${item.targetCore.toFixed(2)}，二者尚未直连但处于网络关键位置。`
      },
      {
        type: 'score',
        title: '核心关联置信度',
        detail: `综合中心性与结构可达性得分 ${item.confidence.toFixed(2)}。`
      }
    ];

    if (item.shared.length > 0) {
      evidence.push({
        type: 'common-neighbor',
        title: '共同邻居',
        detail: `共享 ${item.shared.length} 个邻居：${item.shared
          .slice(0, 5)
          .map((id) => nodeLabel(nodeMap, id))
          .join('、')}${item.shared.length > 5 ? ' 等' : ''}。`
      });
    }

    if (item.path && item.path.length > 2) {
      evidence.push({
        type: 'path',
        title: '结构路径',
        detail: `经 ${item.path.length - 1} 跳可达：${item.path
          .map((id) => nodeLabel(nodeMap, id))
          .join(' → ')}。`
      });
    }

    return {
      id: `core-node-${item.sourceNodeId}-${item.targetNodeId}`,
      sourceNodeId: item.sourceNodeId,
      targetNodeId: item.targetNodeId,
      sourceNodeName: sourceName,
      targetNodeName: targetName,
      sourceObjectTypeId: source?.objectTypeId,
      targetObjectTypeId: target?.objectTypeId,
      sourceInstanceId: source?.instanceId,
      targetInstanceId: target?.instanceId,
      suggestedName: buildSuggestedRelationName({
        algorithm: 'core-node',
        source,
        target
      }),
      confidence: item.confidence,
      algorithm: 'core-node' as const,
      evidence,
      createdAt: now
    };
  });
};

const discoverByWeakLink = (
  nodeMap: Map<string, InstanceGraphNode>,
  adjacency: Adjacency,
  now: string
): DiscoveredImplicitRelation[] => {
  const nodeIds = Array.from(adjacency.keys());
  const communities = runLabelPropagation(adjacency, nodeIds);
  const crossEdges = countCrossCommunityEdges(adjacency, communities);
  const candidates: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    score: number;
    shared: string[];
    bridgeCount: number;
    path: string[] | null;
  }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      const sourceId = nodeIds[i];
      const targetId = nodeIds[j];
      if (hasUndirectedEdge(adjacency, sourceId, targetId)) {
        continue;
      }

      const sourceCommunity = communities.get(sourceId);
      const targetCommunity = communities.get(targetId);
      if (
        sourceCommunity == null ||
        targetCommunity == null ||
        sourceCommunity === targetCommunity
      ) {
        continue;
      }

      const key = pairKey(sourceId, targetId);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const bridgeCount =
        crossEdges.get(communityPairKey(sourceCommunity, targetCommunity)) ?? 0;
      if (bridgeCount > 4) {
        continue;
      }

      const shared = commonNeighbors(adjacency, sourceId, targetId);
      const path = findShortestPath(adjacency, sourceId, targetId, 5);
      const jaccard =
        shared.length /
        Math.max(
          1,
          (adjacency.get(sourceId)?.size ?? 0) +
            (adjacency.get(targetId)?.size ?? 0) -
            shared.length
        );
      const pathBonus = path && path.length > 2 ? 1 / (path.length - 1) : 0;
      const score =
        (1 / (bridgeCount + 1)) * (0.45 + jaccard * 0.35 + pathBonus * 0.2);

      if (score <= 0) {
        continue;
      }

      candidates.push({
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        score,
        shared,
        bridgeCount,
        path
      });
    }
  }

  const ranked = normalizeScores(
    candidates.sort((left, right) => right.score - left.score)
  ).slice(0, MAX_DISCOVERIES);

  return ranked.map((item) => {
    const source = nodeMap.get(item.sourceNodeId);
    const target = nodeMap.get(item.targetNodeId);
    const sourceName = nodeLabel(nodeMap, item.sourceNodeId);
    const targetName = nodeLabel(nodeMap, item.targetNodeId);
    const sourceCommunity = communities.get(item.sourceNodeId);
    const targetCommunity = communities.get(item.targetNodeId);
    const evidence: ImplicitRelationEvidence[] = [
      {
        type: 'weak-link',
        title: '跨群体桥接薄弱',
        detail: `「${sourceName}」与「${targetName}」分属不同群体（#${sourceCommunity} / #${targetCommunity}），群体间显式桥接仅 ${item.bridgeCount} 条，结构相对脆弱。`
      },
      {
        type: 'score',
        title: '薄弱环节置信度',
        detail: `综合桥接稀疏度与结构可达性得分 ${item.confidence.toFixed(2)}。`
      }
    ];

    if (item.shared.length > 0) {
      evidence.push({
        type: 'common-neighbor',
        title: '共同邻居',
        detail: `共享 ${item.shared.length} 个邻居：${item.shared
          .slice(0, 5)
          .map((id) => nodeLabel(nodeMap, id))
          .join('、')}${item.shared.length > 5 ? ' 等' : ''}。`
      });
    }

    if (item.path && item.path.length > 2) {
      evidence.push({
        type: 'path',
        title: '间接连通路径',
        detail: `存在长度 ${item.path.length - 1} 的间接路径：${item.path
          .map((id) => nodeLabel(nodeMap, id))
          .join(' → ')}。`
      });
    }

    return {
      id: `weak-link-${item.sourceNodeId}-${item.targetNodeId}`,
      sourceNodeId: item.sourceNodeId,
      targetNodeId: item.targetNodeId,
      sourceNodeName: sourceName,
      targetNodeName: targetName,
      sourceObjectTypeId: source?.objectTypeId,
      targetObjectTypeId: target?.objectTypeId,
      sourceInstanceId: source?.instanceId,
      targetInstanceId: target?.instanceId,
      suggestedName: buildSuggestedRelationName({
        algorithm: 'weak-link',
        source,
        target
      }),
      confidence: item.confidence,
      algorithm: 'weak-link' as const,
      evidence,
      createdAt: now
    };
  });
};

const discoverByCommunity = (
  nodeMap: Map<string, InstanceGraphNode>,
  adjacency: Adjacency,
  now: string
): {
  discoveries: DiscoveredImplicitRelation[];
  communities: Record<string, number>;
} => {
  const nodeIds = Array.from(adjacency.keys());
  const communities = runLabelPropagation(adjacency, nodeIds);
  const communityMap: Record<string, number> = {};
  communities.forEach((cid, nid) => {
    communityMap[nid] = cid;
  });

  const byCommunity = new Map<number, string[]>();
  communities.forEach((cid, nid) => {
    if (!byCommunity.has(cid)) {
      byCommunity.set(cid, []);
    }
    byCommunity.get(cid)!.push(nid);
  });

  const candidates: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    communityId: number;
    score: number;
    shared: string[];
  }> = [];
  const seen = new Set<string>();

  byCommunity.forEach((members, communityId) => {
    if (members.length < 2) {
      return;
    }
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        const a = members[i];
        const b = members[j];
        if (hasUndirectedEdge(adjacency, a, b)) {
          continue;
        }
        const key = pairKey(a, b);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        const shared = commonNeighbors(adjacency, a, b);
        const score =
          0.45 +
          Math.min(0.4, shared.length * 0.12) +
          Math.min(0.15, adamicAdarScore(adjacency, shared) * 0.08);
        candidates.push({
          sourceNodeId: a,
          targetNodeId: b,
          communityId,
          score,
          shared
        });
      }
    }
  });

  const ranked = normalizeScores(
    candidates.sort((left, right) => right.score - left.score)
  ).slice(0, MAX_DISCOVERIES);

  const discoveries: DiscoveredImplicitRelation[] = ranked.map((item) => {
    const source = nodeMap.get(item.sourceNodeId);
    const target = nodeMap.get(item.targetNodeId);
    const sourceName = nodeLabel(nodeMap, item.sourceNodeId);
    const targetName = nodeLabel(nodeMap, item.targetNodeId);
    const evidence: ImplicitRelationEvidence[] = [
      {
        type: 'community',
        title: '同社区共现',
        detail: `实例「${sourceName}」与「${targetName}」被划分至同一社区（#${item.communityId}），社区内实例通常存在潜在业务关联。`
      },
      {
        type: 'score',
        title: '置信评分',
        detail: `社区聚合与结构相似度综合得分 ${item.confidence.toFixed(2)}。`
      }
    ];

    if (item.shared.length > 0) {
      evidence.push({
        type: 'common-neighbor',
        title: '共同邻居',
        detail: `共享 ${item.shared.length} 个共同邻居：${item.shared
          .slice(0, 5)
          .map((id) => nodeLabel(nodeMap, id))
          .join('、')}${item.shared.length > 5 ? ' 等' : ''}。`
      });
    }

    const path = findShortestPath(
      adjacency,
      item.sourceNodeId,
      item.targetNodeId,
      4
    );
    if (path && path.length > 2) {
      evidence.push({
        type: 'path',
        title: '间接路径',
        detail: `存在长度 ${path.length - 1} 的间接路径：${path
          .map((id) => nodeLabel(nodeMap, id))
          .join(' → ')}。`
      });
    }

    return {
      id: `community-${item.sourceNodeId}-${item.targetNodeId}`,
      sourceNodeId: item.sourceNodeId,
      targetNodeId: item.targetNodeId,
      sourceNodeName: sourceName,
      targetNodeName: targetName,
      sourceObjectTypeId: source?.objectTypeId,
      targetObjectTypeId: target?.objectTypeId,
      sourceInstanceId: source?.instanceId,
      targetInstanceId: target?.instanceId,
      suggestedName: buildSuggestedRelationName({
        algorithm: 'community',
        source,
        target
      }),
      confidence: item.confidence,
      algorithm: 'community' as const,
      communityId: item.communityId,
      evidence,
      createdAt: now
    };
  });

  return { discoveries, communities: communityMap };
};

const discoverByPathPrediction = (
  nodeMap: Map<string, InstanceGraphNode>,
  adjacency: Adjacency,
  now: string
): DiscoveredImplicitRelation[] => {
  const nodeIds = Array.from(adjacency.keys());
  const candidates: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    score: number;
    shared: string[];
    path: string[] | null;
  }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      const a = nodeIds[i];
      const b = nodeIds[j];
      if (hasUndirectedEdge(adjacency, a, b)) {
        continue;
      }
      const shared = commonNeighbors(adjacency, a, b);
      if (shared.length === 0) {
        continue;
      }
      const key = pairKey(a, b);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const aa = adamicAdarScore(adjacency, shared);
      const jaccard =
        shared.length /
        Math.max(
          1,
          (adjacency.get(a)?.size ?? 0) +
            (adjacency.get(b)?.size ?? 0) -
            shared.length
        );
      const path = findShortestPath(adjacency, a, b, 4);
      const pathBonus = path && path.length > 2 ? 1 / (path.length - 1) : 0;
      const score = aa * 0.55 + jaccard * 0.3 + pathBonus * 0.15;
      if (score <= 0) {
        continue;
      }

      candidates.push({
        sourceNodeId: a,
        targetNodeId: b,
        score,
        shared,
        path
      });
    }
  }

  const ranked = normalizeScores(
    candidates.sort((left, right) => right.score - left.score)
  ).slice(0, MAX_DISCOVERIES);

  return ranked.map((item) => {
    const source = nodeMap.get(item.sourceNodeId);
    const target = nodeMap.get(item.targetNodeId);
    const sourceName = nodeLabel(nodeMap, item.sourceNodeId);
    const targetName = nodeLabel(nodeMap, item.targetNodeId);
    const evidence: ImplicitRelationEvidence[] = [
      {
        type: 'common-neighbor',
        title: '共同邻居（链路预测）',
        detail: `「${sourceName}」与「${targetName}」共享 ${item.shared.length} 个邻居：${item.shared
          .slice(0, 6)
          .map((id) => nodeLabel(nodeMap, id))
          .join('、')}${item.shared.length > 6 ? ' 等' : ''}。`
      },
      {
        type: 'score',
        title: 'Adamic-Adar / Jaccard 预测分',
        detail: `路径预测综合置信度 ${item.confidence.toFixed(2)}。`
      }
    ];

    if (item.path && item.path.length > 2) {
      evidence.push({
        type: 'path',
        title: '支撑路径',
        detail: `预测基于现有路径：${item.path
          .map((id) => nodeLabel(nodeMap, id))
          .join(' → ')}。`
      });
    }

    evidence.push({
      type: 'topology',
      title: '拓扑语义',
      detail:
        '二者在实例关系图中间接可达但无直接链接，推测存在尚未建模的业务关联。'
    });

    return {
      id: `path-pred-${item.sourceNodeId}-${item.targetNodeId}`,
      sourceNodeId: item.sourceNodeId,
      targetNodeId: item.targetNodeId,
      sourceNodeName: sourceName,
      targetNodeName: targetName,
      sourceObjectTypeId: source?.objectTypeId,
      targetObjectTypeId: target?.objectTypeId,
      sourceInstanceId: source?.instanceId,
      targetInstanceId: target?.instanceId,
      suggestedName: buildSuggestedRelationName({
        algorithm: 'path-prediction',
        source,
        target,
        sharedNeighborCount: item.shared.length
      }),
      confidence: item.confidence,
      algorithm: 'path-prediction' as const,
      evidence,
      createdAt: now
    };
  });
};

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} 米` : `${km.toFixed(1)} 公里`;

const formatDuration = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} 分钟`;
  }
  if (hours < 48) {
    return `${hours.toFixed(1)} 小时`;
  }
  return `${(hours / 24).toFixed(1)} 天`;
};

const discoverBySpatiotemporal = (
  nodeMap: Map<string, InstanceGraphNode>,
  adjacency: Adjacency,
  features: Map<string, SpatioTemporalFeature>,
  now: string
): DiscoveredImplicitRelation[] => {
  const nodeIds = Array.from(nodeMap.keys());
  const usable = nodeIds.filter((id) => {
    const feature = features.get(id);
    return (
      feature &&
      ((feature.lon != null && feature.lat != null) || feature.timeMs != null)
    );
  });

  if (usable.length < 2) {
    throw new Error(
      '时空分析需要实例具备经纬度或时间字段，当前范围内可用时空属性不足'
    );
  }

  const candidates: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    score: number;
    distanceKm?: number;
    hoursDiff?: number;
    hasSpace: boolean;
    hasTime: boolean;
    spaceSource?: string;
    timeSource?: string;
  }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < usable.length; i += 1) {
    for (let j = i + 1; j < usable.length; j += 1) {
      const a = usable[i];
      const b = usable[j];
      if (hasUndirectedEdge(adjacency, a, b)) {
        continue;
      }
      const key = pairKey(a, b);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const fa = features.get(a)!;
      const fb = features.get(b)!;
      let spaceScore = 0;
      let timeScore = 0;
      let hasSpace = false;
      let hasTime = false;
      let distanceKm: number | undefined;
      let hoursDiff: number | undefined;

      if (
        fa.lon != null &&
        fa.lat != null &&
        fb.lon != null &&
        fb.lat != null
      ) {
        distanceKm = haversineKm(fa.lon, fa.lat, fb.lon, fb.lat);
        if (distanceKm <= SPATIAL_NEAR_KM * 2) {
          hasSpace = true;
          spaceScore = 1 / (1 + distanceKm / SPATIAL_NEAR_KM);
        }
      }

      if (fa.timeMs != null && fb.timeMs != null) {
        hoursDiff = Math.abs(fa.timeMs - fb.timeMs) / (1000 * 60 * 60);
        if (hoursDiff <= TEMPORAL_NEAR_HOURS * 2) {
          hasTime = true;
          timeScore = 1 / (1 + hoursDiff / TEMPORAL_NEAR_HOURS);
        }
      }

      if (!hasSpace && !hasTime) {
        continue;
      }

      const score =
        hasSpace && hasTime
          ? spaceScore * 0.55 + timeScore * 0.45
          : hasSpace
            ? spaceScore * 0.85
            : timeScore * 0.8;

      if (score < 0.2) {
        continue;
      }

      candidates.push({
        sourceNodeId: a,
        targetNodeId: b,
        score,
        distanceKm,
        hoursDiff,
        hasSpace,
        hasTime,
        spaceSource: fa.spaceSource || fb.spaceSource,
        timeSource: fa.timeSource || fb.timeSource
      });
    }
  }

  if (!candidates.length) {
    throw new Error(
      '未发现满足时空邻近条件的关系（可检查经纬度/时间字段或放宽分析范围）'
    );
  }

  const ranked = normalizeScores(
    candidates.sort((left, right) => right.score - left.score)
  ).slice(0, MAX_DISCOVERIES);

  return ranked.map((item) => {
    const source = nodeMap.get(item.sourceNodeId);
    const target = nodeMap.get(item.targetNodeId);
    const sourceName = nodeLabel(nodeMap, item.sourceNodeId);
    const targetName = nodeLabel(nodeMap, item.targetNodeId);
    const evidence: ImplicitRelationEvidence[] = [];

    if (item.hasSpace && item.distanceKm != null) {
      evidence.push({
        type: 'spatiotemporal',
        title: '空间邻近',
        detail: `「${sourceName}」与「${targetName}」空间距离约 ${formatDistance(
          item.distanceKm
        )}（阈值 ${SPATIAL_NEAR_KM} 公里内显著），字段 ${item.spaceSource || '经纬度'}。`
      });
    }

    if (item.hasTime && item.hoursDiff != null) {
      evidence.push({
        type: 'spatiotemporal',
        title: '时间邻近',
        detail: `二者时间间隔约 ${formatDuration(
          item.hoursDiff
        )}（阈值 ${TEMPORAL_NEAR_HOURS} 小时内显著），字段 ${item.timeSource || '时间戳'}。`
      });
    }

    evidence.push({
      type: 'score',
      title: '时空共现置信度',
      detail: `综合空间与时间邻近性得分 ${item.confidence.toFixed(2)}。同一时空窗口内共现但尚未直连，推测存在隐性业务关联。`
    });

    const path = findShortestPath(
      adjacency,
      item.sourceNodeId,
      item.targetNodeId,
      4
    );
    if (path && path.length > 2) {
      evidence.push({
        type: 'path',
        title: '间接路径佐证',
        detail: `虽无直连，但存在间接路径：${path
          .map((id) => nodeLabel(nodeMap, id))
          .join(' → ')}。`
      });
    }

    return {
      id: `spatiotemporal-${item.sourceNodeId}-${item.targetNodeId}`,
      sourceNodeId: item.sourceNodeId,
      targetNodeId: item.targetNodeId,
      sourceNodeName: sourceName,
      targetNodeName: targetName,
      sourceObjectTypeId: source?.objectTypeId,
      targetObjectTypeId: target?.objectTypeId,
      sourceInstanceId: source?.instanceId,
      targetInstanceId: target?.instanceId,
      suggestedName: buildSuggestedRelationName({
        algorithm: 'spatiotemporal',
        source,
        target,
        hasSpace: item.hasSpace,
        hasTime: item.hasTime
      }),
      confidence: item.confidence,
      algorithm: 'spatiotemporal' as const,
      evidence,
      createdAt: now
    };
  });
};

export const runImplicitRelationDiscovery = async (params: {
  scope: ImplicitAnalysisScope;
  algorithm: ImplicitDiscoveryAlgorithm;
  signal?: AbortSignal;
}): Promise<ImplicitDiscoveryResult> => {
  const { scope, algorithm, signal } = params;
  const instances = await resolveScopeInstances(scope);
  const graph = await buildInstanceRelationGraph({
    sceneId: scope.ontologySceneId,
    instances
  });

  if (graph.nodes.length < 2) {
    throw new Error('参与分析的实例不足 2 个，无法进行关系挖掘');
  }

  const nodeMap = new Map(graph.nodes.map((node) => [node.key, node]));
  const adjacency = buildAdjacency(graph);
  const confirmedEdges: ConfirmedGraphEdge[] = graph.edges.map((edge) => ({
    id: edge.id,
    sourceNodeId: edge.sourceKey,
    targetNodeId: edge.targetKey,
    sourceNodeName: edge.sourceLabel,
    targetNodeName: edge.targetLabel,
    linkName: edge.linkName,
    linkId: edge.linkId
  }));

  const now = new Date().toISOString();
  let discoveries: DiscoveredImplicitRelation[] = [];
  let communities: Record<string, number> | undefined;

  if (algorithm === 'community') {
    const result = discoverByCommunity(nodeMap, adjacency, now);
    discoveries = result.discoveries;
    communities = result.communities;
  } else if (algorithm === 'path-prediction') {
    discoveries = discoverByPathPrediction(nodeMap, adjacency, now);
  } else if (algorithm === 'core-node') {
    discoveries = discoverByCoreNode(nodeMap, adjacency, now);
  } else if (algorithm === 'weak-link') {
    discoveries = discoverByWeakLink(nodeMap, adjacency, now);
  } else if (algorithm === 'spatiotemporal') {
    const features = await loadSpatioTemporalFeatures(instances);
    discoveries = discoverBySpatiotemporal(nodeMap, adjacency, features, now);
  }

  const { summary, items, source } = await summarizeDiscoveryResult({
    algorithm,
    sceneId: scope.ontologySceneId,
    confirmedCount: confirmedEdges.length,
    nodeCount: graph.nodes.length,
    discoveries,
    signal
  });

  return {
    algorithm,
    sceneId: scope.ontologySceneId,
    nodes: graph.nodes.map((node) => ({
      id: node.key,
      label: node.label,
      objectTypeId: node.objectTypeId,
      objectTypeName: node.objectTypeName,
      instanceId: node.instanceId,
      attributes: node.attributes
    })),
    confirmedEdges,
    discoveries,
    summary,
    summaryItems: items,
    summarySource: source,
    communities,
    ranAt: now
  };
};
