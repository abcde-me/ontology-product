/** 隐性关系发现算法 */
export type ImplicitDiscoveryAlgorithm =
  | 'community'
  | 'path-prediction'
  | 'spatiotemporal'
  | 'core-node'
  | 'weak-link';

/** 实例选择范围：对象类型下全部实例，或指定部分实例 */
export type InstanceScopeMode = 'all' | 'selected';

export interface ImplicitScopeObjectType {
  id: number;
  name?: string;
  code?: string;
}

export interface ImplicitScopeInstance {
  objectTypeId: number;
  objectTypeName?: string;
  instanceId: string;
  instanceLabel?: string;
}

/** 分析范围：本体图谱 + 对象类型 + 实例 */
export interface ImplicitAnalysisScope {
  ontologySceneId: number;
  ontologySceneName?: string;
  objectTypes: ImplicitScopeObjectType[];
  instanceMode: InstanceScopeMode;
  /** instanceMode=selected 时有效 */
  instances: ImplicitScopeInstance[];
}

/** 证据条目 */
export interface ImplicitRelationEvidence {
  type:
    | 'community'
    | 'common-neighbor'
    | 'path'
    | 'topology'
    | 'score'
    | 'spatiotemporal'
    | 'core-node'
    | 'weak-link';
  title: string;
  detail: string;
}

/** 发现的隐性关系（节点 ID 为实例图节点 key） */
export interface DiscoveredImplicitRelation {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNodeName: string;
  targetNodeName: string;
  sourceObjectTypeId?: number;
  targetObjectTypeId?: number;
  sourceInstanceId?: string;
  targetInstanceId?: string;
  /** 建议关系名 */
  suggestedName: string;
  /** 置信分 0-1 */
  confidence: number;
  algorithm: ImplicitDiscoveryAlgorithm;
  communityId?: number;
  /** 支撑证据 */
  evidence: ImplicitRelationEvidence[];
  createdAt: string;
}

/** 本体已确认的显式关系（用于实线渲染） */
export interface ConfirmedGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNodeName: string;
  targetNodeName: string;
  linkName: string;
  linkId?: number;
}

/** 分析结果中的图节点（分析范围内全部实例） */
export interface ImplicitDiscoveryGraphNode {
  id: string;
  label: string;
  objectTypeId?: number;
  objectTypeName?: string;
  instanceId?: string;
  /** 实例属性（点击节点展示） */
  attributes?: Array<{ label: string; value: string }>;
}

export interface ImplicitDiscoveryResult {
  algorithm: ImplicitDiscoveryAlgorithm;
  sceneId: number;
  /** 分析范围内的全部节点（默认全部展示；旧结果可能缺失） */
  nodes?: ImplicitDiscoveryGraphNode[];
  /** 显性/确认关系 */
  confirmedEdges: ConfirmedGraphEdge[];
  /** 隐性/挖掘关系 */
  discoveries: DiscoveredImplicitRelation[];
  /** 大模型/本地总结（整段文本，兼容问答） */
  summary: string;
  /** 分条总结要点（优先展示） */
  summaryItems?: string[];
  summarySource: 'llm' | 'local';
  /** 社区分析结果：节点 key → 社区编号 */
  communities?: Record<string, number>;
  ranAt: string;
}

export interface ImplicitRelationKnowledge {
  result: ImplicitDiscoveryResult | null;
}

export interface ImplicitRelationTask {
  id: string;
  name: string;
  description?: string;
  ontologySceneId?: number;
  ontologySceneName?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
  /** 分析范围（对象类型 + 实例） */
  scope?: ImplicitAnalysisScope;
  createdAt: string;
  updatedAt: string;
}

export interface ImplicitRelationTaskListItem extends ImplicitRelationTask {
  ontologySceneName?: string;
  objectTypeSummary?: string;
  instanceSummary?: string;
  discoveryCount: number;
  lastRanAt?: string;
}

export interface CreateImplicitRelationTaskInput {
  name: string;
  description?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
  scope?: ImplicitAnalysisScope;
}

/** 关系挖掘列表页 — 面向业务目标的场景模板 */
export interface ImplicitRelationUsageScenario {
  id: string;
  goalQuestion: string;
  title: string;
  description: string;
  expectedOutcome: string;
  algorithm: ImplicitDiscoveryAlgorithm;
  defaultTaskName: string;
  defaultDescription: string;
  tip: string;
  /** 演示场景对象类型 code，用于一键预填分析范围 */
  objectTypeCodes: string[];
}
