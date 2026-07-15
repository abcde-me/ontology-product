import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';

export interface SelectedObjectContext {
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  objectTypeCode?: string;
  instanceId: string;
  instanceLabel?: string;
  /** 是否已按图谱模式载入（含关联展开） */
  loadedAsGraph?: boolean;
}

export type RelationLoadMode = 'nodes-only' | 'graph';

export type QueryResultLoadStatus = 'pending' | 'loaded';

export interface QueryResultItem {
  key: string;
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  objectTypeCode?: string;
  instanceId: string;
  instanceLabel: string;
  phone?: string;
  rawRecord?: InstanceQueryRow;
  loadStatus: QueryResultLoadStatus;
}

/**
 * 图算法分析（对齐 NebulaGraph Algorithm 常见能力，侧重军工/科研分析场景）
 */
export type GraphAlgorithmKey =
  | 'neighbor-1'
  | 'neighbor-2'
  | 'bfs-khop'
  | 'connected'
  | 'shortest-path'
  | 'pagerank'
  | 'betweenness'
  | 'closeness'
  | 'degree'
  | 'louvain'
  | 'label-propagation'
  | 'k-core'
  | 'triangle-count'
  | 'jaccard';

export type GraphAlgorithmCategory =
  | 'path'
  | 'centrality'
  | 'community'
  | 'structure'
  | 'similarity';

/** 当前选中算法的可配置参数 */
export interface GraphAlgorithmParams {
  /** K-Hop / BFS / 最短路径深度 */
  maxDepth?: number;
  /** PageRank / Louvain / LPA 最大迭代次数 */
  maxIter?: number;
  /** PageRank 重置概率（阻尼系数对应 resetProb） */
  resetProb?: number;
  /** Louvain 内部迭代次数 */
  internalIter?: number;
  /** Louvain 收敛阈值 */
  tolerance?: number;
  /** K-Core 的 K 值 */
  k?: number;
  /** 高亮展示 Top-N 关键节点 */
  topN?: number;
  /** Jaccard 相似度阈值（0-1） */
  similarityThreshold?: number;
  /** 最短路径目标对象类型 ID（可选，默认取第二个已选对象类型） */
  targetObjectTypeId?: number;
}

export interface GraphAlgorithmParamField {
  key: keyof GraphAlgorithmParams;
  label: string;
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  tip?: string;
}

export interface GraphAlgorithmOption {
  value: GraphAlgorithmKey;
  label: string;
  description: string;
  /** NebulaGraph Algorithm 对应名称 */
  nebulaAlgo: string;
  category: GraphAlgorithmCategory;
  /** 军工/科研典型用途 */
  scenarios: string[];
  fields: GraphAlgorithmParamField[];
  defaults: GraphAlgorithmParams;
}

export type CanvasModeKey = 'minimal' | 'detail';

export type GraphLayoutKey =
  | 'force'
  | 'hierarchical'
  | 'circular'
  | 'grid'
  | 'neural'
  | 'radiation';

export interface KnowledgeGraphNodeData {
  label: string;
  subLabel?: string;
  isFocus?: boolean;
  objectTypeId?: number;
  objectTypeName?: string;
  instanceId?: string;
  sceneId?: number;
  color: string;
  size: number;
  detailFields?: Array<{ label: string; value: string }>;
  /** 图算法分析结果分值 */
  algoScore?: number;
  algoRank?: number;
  algoCommunity?: number;
}

export interface RelationGraphNode {
  id: string;
  type: 'knowledgeNode';
  data: KnowledgeGraphNodeData;
  position: { x: number; y: number };
}

export interface RelationGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'knowledgeEdge';
  data?: {
    linkName?: string;
    edgeColor?: string;
    /** 隐性关系边（虚线） */
    isImplicit?: boolean;
    discoveryId?: string;
    confidence?: number;
  };
}

export interface RelationGraphData {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
}

export interface RelationInsightFavorite {
  id: string;
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  instanceId: string;
  instanceLabel?: string;
  createdAt: number;
}
