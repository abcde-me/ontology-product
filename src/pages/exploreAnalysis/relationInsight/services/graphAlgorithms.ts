import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import type { GraphAlgorithmKey, GraphAlgorithmParams } from '../types';

export interface TopologyAlgoResult {
  topology: GetOntologyTopologyResponse;
  /** 对象类型 ID → 算法分值 */
  scores: Map<number, number>;
  /** 对象类型 ID → 社区编号 */
  communities: Map<number, number>;
  summary?: string;
}

type Adjacency = Map<number, Set<number>>;

const buildAdjacency = (
  edges: NonNullable<GetOntologyTopologyResponse['edges']>
): Adjacency => {
  const adjacency: Adjacency = new Map();

  const ensure = (id: number) => {
    if (!adjacency.has(id)) {
      adjacency.set(id, new Set());
    }
    return adjacency.get(id)!;
  };

  edges.forEach((edge) => {
    const sourceId = edge.sourceId;
    const targetId = edge.targetId;
    if (sourceId == null || targetId == null) {
      return;
    }
    ensure(sourceId).add(targetId);
    ensure(targetId).add(sourceId);
  });

  return adjacency;
};

const collectKHop = (
  adjacency: Adjacency,
  focusNodeId: number,
  maxDepth: number
): Set<number> => {
  const visible = new Set<number>([focusNodeId]);
  let frontier = new Set<number>([focusNodeId]);

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const nextFrontier = new Set<number>();
    frontier.forEach((nodeId) => {
      adjacency.get(nodeId)?.forEach((neighbor) => {
        if (!visible.has(neighbor)) {
          visible.add(neighbor);
          nextFrontier.add(neighbor);
        }
      });
    });
    frontier = nextFrontier;
    if (frontier.size === 0) {
      break;
    }
  }

  return visible;
};

const collectConnectedComponent = (
  adjacency: Adjacency,
  focusNodeId: number
): Set<number> => {
  const visible = new Set<number>([focusNodeId]);
  const queue = [focusNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    adjacency.get(current)?.forEach((neighbor) => {
      if (!visible.has(neighbor)) {
        visible.add(neighbor);
        queue.push(neighbor);
      }
    });
  }

  return visible;
};

const bfsDistances = (
  adjacency: Adjacency,
  sourceId: number,
  limitNodes?: Set<number>
): Map<number, number> => {
  const distances = new Map<number, number>([[sourceId, 0]]);
  const queue = [sourceId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const nextDistance = (distances.get(current) ?? 0) + 1;
    adjacency.get(current)?.forEach((neighbor) => {
      if (limitNodes && !limitNodes.has(neighbor)) {
        return;
      }
      if (distances.has(neighbor)) {
        return;
      }
      distances.set(neighbor, nextDistance);
      queue.push(neighbor);
    });
  }

  return distances;
};

const findShortestPathNodes = (
  adjacency: Adjacency,
  sourceId: number,
  targetId: number,
  maxDepth: number
): Set<number> => {
  if (sourceId === targetId) {
    return new Set([sourceId]);
  }

  const parent = new Map<number, number>();
  const depthMap = new Map<number, number>([[sourceId, 0]]);
  const queue = [sourceId];
  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift()!;
    const currentDepth = depthMap.get(current) ?? 0;
    if (currentDepth >= maxDepth) {
      continue;
    }

    adjacency.get(current)?.forEach((neighbor) => {
      if (depthMap.has(neighbor)) {
        return;
      }
      depthMap.set(neighbor, currentDepth + 1);
      parent.set(neighbor, current);
      if (neighbor === targetId) {
        found = true;
        return;
      }
      queue.push(neighbor);
    });
  }

  if (!found) {
    return collectKHop(adjacency, sourceId, Math.min(maxDepth, 2));
  }

  const path = new Set<number>([targetId]);
  let cursor = targetId;
  while (parent.has(cursor)) {
    cursor = parent.get(cursor)!;
    path.add(cursor);
    if (cursor === sourceId) {
      break;
    }
  }
  return path;
};

const computeDegreeScores = (
  adjacency: Adjacency,
  nodeIds: Set<number>
): Map<number, number> => {
  const scores = new Map<number, number>();
  nodeIds.forEach((id) => {
    const degree = [...(adjacency.get(id) ?? [])].filter((n) =>
      nodeIds.has(n)
    ).length;
    scores.set(id, degree);
  });
  return scores;
};

const computePageRank = (
  adjacency: Adjacency,
  nodeIds: Set<number>,
  maxIter: number,
  resetProb: number
): Map<number, number> => {
  const nodes = Array.from(nodeIds);
  if (nodes.length === 0) {
    return new Map();
  }

  const damping = 1 - resetProb;
  const scores = new Map<number, number>();
  nodes.forEach((id) => scores.set(id, 1 / nodes.length));

  for (let iter = 0; iter < maxIter; iter += 1) {
    const next = new Map<number, number>();
    nodes.forEach((id) => next.set(id, resetProb / nodes.length));

    nodes.forEach((id) => {
      const neighbors = [...(adjacency.get(id) ?? [])].filter((n) =>
        nodeIds.has(n)
      );
      if (neighbors.length === 0) {
        const share = ((scores.get(id) ?? 0) * damping) / nodes.length;
        nodes.forEach((target) => {
          next.set(target, (next.get(target) ?? 0) + share);
        });
        return;
      }

      const share = ((scores.get(id) ?? 0) * damping) / neighbors.length;
      neighbors.forEach((neighbor) => {
        next.set(neighbor, (next.get(neighbor) ?? 0) + share);
      });
    });

    scores.clear();
    next.forEach((value, key) => scores.set(key, value));
  }

  return scores;
};

const computeBetweenness = (
  adjacency: Adjacency,
  nodeIds: Set<number>
): Map<number, number> => {
  const scores = new Map<number, number>();
  nodeIds.forEach((id) => scores.set(id, 0));
  const nodes = Array.from(nodeIds);

  nodes.forEach((source) => {
    const stack: number[] = [];
    const predecessors = new Map<number, number[]>();
    const sigma = new Map<number, number>();
    const distance = new Map<number, number>();
    const delta = new Map<number, number>();

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
        if (!nodeIds.has(neighbor)) {
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
          predecessors.get(neighbor)?.push(current);
        }
      });
    }

    while (stack.length > 0) {
      const current = stack.pop()!;
      predecessors.get(current)?.forEach((pred) => {
        const ratio =
          ((sigma.get(pred) ?? 0) / Math.max(sigma.get(current) ?? 1, 1)) *
          (1 + (delta.get(current) ?? 0));
        delta.set(pred, (delta.get(pred) ?? 0) + ratio);
      });
      if (current !== source) {
        scores.set(
          current,
          (scores.get(current) ?? 0) + (delta.get(current) ?? 0)
        );
      }
    }
  });

  return scores;
};

const computeCloseness = (
  adjacency: Adjacency,
  nodeIds: Set<number>
): Map<number, number> => {
  const scores = new Map<number, number>();
  nodeIds.forEach((id) => {
    const distances = bfsDistances(adjacency, id, nodeIds);
    let total = 0;
    let reached = 0;
    distances.forEach((distance, target) => {
      if (target === id || distance <= 0) {
        return;
      }
      total += distance;
      reached += 1;
    });
    scores.set(id, reached === 0 || total === 0 ? 0 : reached / total);
  });
  return scores;
};

const computeTriangleCounts = (
  adjacency: Adjacency,
  nodeIds: Set<number>
): Map<number, number> => {
  const scores = new Map<number, number>();
  nodeIds.forEach((id) => {
    const neighbors = [...(adjacency.get(id) ?? [])].filter((n) =>
      nodeIds.has(n)
    );
    let count = 0;
    for (let i = 0; i < neighbors.length; i += 1) {
      for (let j = i + 1; j < neighbors.length; j += 1) {
        if (adjacency.get(neighbors[i])?.has(neighbors[j])) {
          count += 1;
        }
      }
    }
    scores.set(id, count);
  });
  return scores;
};

const runLabelPropagation = (
  adjacency: Adjacency,
  nodeIds: Set<number>,
  maxIter: number
): Map<number, number> => {
  const labels = new Map<number, number>();
  nodeIds.forEach((id) => labels.set(id, id));

  for (let iter = 0; iter < maxIter; iter += 1) {
    let changed = false;
    const order = Array.from(nodeIds);

    order.forEach((id) => {
      const counter = new Map<number, number>();
      adjacency.get(id)?.forEach((neighbor) => {
        if (!nodeIds.has(neighbor)) {
          return;
        }
        const label = labels.get(neighbor) ?? neighbor;
        counter.set(label, (counter.get(label) ?? 0) + 1);
      });

      if (counter.size === 0) {
        return;
      }

      let bestLabel = labels.get(id) ?? id;
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

const runLouvainLike = (
  adjacency: Adjacency,
  nodeIds: Set<number>,
  maxIter: number,
  internalIter: number
): Map<number, number> => {
  let communities = runLabelPropagation(adjacency, nodeIds, internalIter);

  for (let iter = 0; iter < maxIter; iter += 1) {
    const next = runLabelPropagation(adjacency, nodeIds, internalIter);
    let changed = false;
    next.forEach((label, id) => {
      if (communities.get(id) !== label) {
        changed = true;
      }
    });
    communities = next;
    if (!changed) {
      break;
    }
  }

  return communities;
};

const extractKCore = (
  adjacency: Adjacency,
  nodeIds: Set<number>,
  k: number
): Set<number> => {
  const remaining = new Set(nodeIds);
  let changed = true;

  while (changed) {
    changed = false;
    const toRemove: number[] = [];
    remaining.forEach((id) => {
      const degree = [...(adjacency.get(id) ?? [])].filter((n) =>
        remaining.has(n)
      ).length;
      if (degree < k) {
        toRemove.push(id);
      }
    });
    if (toRemove.length > 0) {
      changed = true;
      toRemove.forEach((id) => remaining.delete(id));
    }
  }

  if (remaining.size === 0) {
    return new Set([...nodeIds.values()].slice(0, 1));
  }

  return remaining;
};

const computeJaccardNeighbors = (
  adjacency: Adjacency,
  focusNodeId: number,
  nodeIds: Set<number>,
  threshold: number,
  topN: number
): { visible: Set<number>; scores: Map<number, number> } => {
  const focusNeighbors = new Set(
    [...(adjacency.get(focusNodeId) ?? [])].filter((n) => nodeIds.has(n))
  );
  const scores = new Map<number, number>();

  nodeIds.forEach((id) => {
    if (id === focusNodeId) {
      scores.set(id, 1);
      return;
    }
    const neighbors = new Set(
      [...(adjacency.get(id) ?? [])].filter((n) => nodeIds.has(n))
    );
    let intersection = 0;
    focusNeighbors.forEach((n) => {
      if (neighbors.has(n)) {
        intersection += 1;
      }
    });
    const union = new Set([...focusNeighbors, ...neighbors]).size;
    const score = union === 0 ? 0 : intersection / union;
    scores.set(id, score);
  });

  const ranked = Array.from(scores.entries())
    .filter(([id, score]) => id === focusNodeId || score >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return {
    visible: new Set(ranked.map(([id]) => id)),
    scores: new Map(ranked)
  };
};

const filterTopologyByNodeIds = (
  topology: GetOntologyTopologyResponse,
  visibleNodeIds: Set<number>,
  topN?: number
): GetOntologyTopologyResponse => {
  let retained = Array.from(visibleNodeIds);
  if (topN != null && retained.length > topN) {
    retained = retained.slice(0, topN);
  }
  const retainedSet = new Set(retained);

  return {
    nodes: (topology.nodes ?? []).filter(
      (node) => node.id != null && retainedSet.has(node.id)
    ),
    edges: (topology.edges ?? []).filter(
      (edge) =>
        edge.sourceId != null &&
        edge.targetId != null &&
        retainedSet.has(edge.sourceId) &&
        retainedSet.has(edge.targetId)
    )
  };
};

const keepTopScoreNodes = (
  focusNodeId: number,
  nodeIds: Set<number>,
  scores: Map<number, number>,
  topN: number
): Set<number> => {
  const ranked = Array.from(nodeIds)
    .filter((id) => id !== focusNodeId)
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0))
    .slice(0, Math.max(topN - 1, 0));

  return new Set([focusNodeId, ...ranked]);
};

export const analyzeTopologyByAlgorithm = (
  topology: GetOntologyTopologyResponse,
  focusNodeId: number,
  algorithm: GraphAlgorithmKey,
  params: GraphAlgorithmParams = {},
  fallbackTargetId?: number
): TopologyAlgoResult => {
  const nodes = topology.nodes ?? [];
  const edges = topology.edges ?? [];
  const adjacency = buildAdjacency(edges);
  const empty: TopologyAlgoResult = {
    topology: { nodes: [], edges: [] },
    scores: new Map(),
    communities: new Map()
  };

  if (!nodes.some((node) => node.id === focusNodeId)) {
    return empty;
  }

  const maxDepth = params.maxDepth ?? 2;
  const topN = params.topN ?? 40;
  const maxIter = params.maxIter ?? 10;
  const resetProb = params.resetProb ?? 0.15;
  const k = params.k ?? 2;
  const threshold = params.similarityThreshold ?? 0.2;
  const internalIter = params.internalIter ?? 10;
  const targetId = params.targetObjectTypeId ?? fallbackTargetId;

  if (algorithm === 'neighbor-1') {
    const visible = collectKHop(adjacency, focusNodeId, 1);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores: computeDegreeScores(adjacency, visible),
      communities: new Map()
    };
  }

  if (algorithm === 'neighbor-2') {
    const visible = collectKHop(adjacency, focusNodeId, 2);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores: computeDegreeScores(adjacency, visible),
      communities: new Map()
    };
  }

  if (algorithm === 'bfs-khop') {
    const visible = collectKHop(adjacency, focusNodeId, maxDepth);
    const limited = keepTopScoreNodes(
      focusNodeId,
      visible,
      computeDegreeScores(adjacency, visible),
      topN
    );
    return {
      topology: filterTopologyByNodeIds(topology, limited),
      scores: computeDegreeScores(adjacency, limited),
      communities: new Map(),
      summary: `BFS ${maxDepth} 跳扩展`
    };
  }

  if (algorithm === 'connected') {
    const visible = collectConnectedComponent(adjacency, focusNodeId);
    const limited = Array.from(visible).slice(0, topN);
    return {
      topology: filterTopologyByNodeIds(topology, new Set(limited)),
      scores: computeDegreeScores(adjacency, new Set(limited)),
      communities: new Map([[focusNodeId, focusNodeId]]),
      summary: '连通分量'
    };
  }

  if (algorithm === 'shortest-path') {
    const visible =
      targetId != null
        ? findShortestPathNodes(adjacency, focusNodeId, targetId, maxDepth)
        : collectKHop(adjacency, focusNodeId, Math.min(maxDepth, 2));
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores: computeDegreeScores(adjacency, visible),
      communities: new Map(),
      summary:
        targetId != null
          ? `最短路径 → 对象类型 ${targetId}`
          : '未指定目标，返回邻域近似'
    };
  }

  const baseVisible = collectKHop(adjacency, focusNodeId, maxDepth);

  if (algorithm === 'pagerank') {
    const scores = computePageRank(adjacency, baseVisible, maxIter, resetProb);
    const visible = keepTopScoreNodes(focusNodeId, baseVisible, scores, topN);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: 'PageRank 关键节点'
    };
  }

  if (algorithm === 'betweenness') {
    const scores = computeBetweenness(adjacency, baseVisible);
    const visible = keepTopScoreNodes(focusNodeId, baseVisible, scores, topN);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: '介数中心性'
    };
  }

  if (algorithm === 'closeness') {
    const scores = computeCloseness(adjacency, baseVisible);
    const visible = keepTopScoreNodes(focusNodeId, baseVisible, scores, topN);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: '接近中心性'
    };
  }

  if (algorithm === 'degree') {
    const scores = computeDegreeScores(adjacency, baseVisible);
    const visible = keepTopScoreNodes(focusNodeId, baseVisible, scores, topN);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: '度中心性'
    };
  }

  if (algorithm === 'louvain') {
    const communities = runLouvainLike(
      adjacency,
      baseVisible,
      maxIter,
      internalIter
    );
    return {
      topology: filterTopologyByNodeIds(topology, baseVisible, topN),
      scores: computeDegreeScores(adjacency, baseVisible),
      communities,
      summary: 'Louvain 社区'
    };
  }

  if (algorithm === 'label-propagation') {
    const communities = runLabelPropagation(adjacency, baseVisible, maxIter);
    return {
      topology: filterTopologyByNodeIds(topology, baseVisible, topN),
      scores: computeDegreeScores(adjacency, baseVisible),
      communities,
      summary: '标签传播社区'
    };
  }

  if (algorithm === 'k-core') {
    const core = extractKCore(adjacency, baseVisible, k);
    const withFocus = new Set(core);
    withFocus.add(focusNodeId);
    return {
      topology: filterTopologyByNodeIds(topology, withFocus),
      scores: computeDegreeScores(adjacency, withFocus),
      communities: new Map(),
      summary: `${k}-Core 核心子图`
    };
  }

  if (algorithm === 'triangle-count') {
    const scores = computeTriangleCounts(adjacency, baseVisible);
    const visible = keepTopScoreNodes(focusNodeId, baseVisible, scores, topN);
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: '三角形计数'
    };
  }

  if (algorithm === 'jaccard') {
    const { visible, scores } = computeJaccardNeighbors(
      adjacency,
      focusNodeId,
      baseVisible,
      threshold,
      topN
    );
    return {
      topology: filterTopologyByNodeIds(topology, visible),
      scores,
      communities: new Map(),
      summary: 'Jaccard 相似邻居'
    };
  }

  const fallback = collectKHop(adjacency, focusNodeId, 1);
  return {
    topology: filterTopologyByNodeIds(topology, fallback),
    scores: computeDegreeScores(adjacency, fallback),
    communities: new Map()
  };
};
