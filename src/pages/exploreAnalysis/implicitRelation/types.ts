export type RichRelationKind = 'symmetric' | 'transitive' | 'inverse';

export type InferenceRuleCategory =
  | 'rule'
  | 'graphAlgorithm'
  | 'llmCommonSense';

export interface GeneratedRichRelation {
  id: string;
  sceneId: number;
  kind: RichRelationKind;
  name: string;
  description: string;
  sourceNodeId: number;
  targetNodeId: number;
  sourceNodeName?: string;
  targetNodeName?: string;
  basedOnLinkId?: number;
  basedOnLinkName?: string;
  viaNodeId?: number;
  viaNodeName?: string;
  enabled: boolean;
  createdAt: string;
}

export interface InferenceRule {
  id: string;
  sceneId: number;
  name: string;
  category: InferenceRuleCategory;
  enabled: boolean;
  /** 规则推理：触发条件 */
  condition?: string;
  /** 规则推理：执行动作 */
  action?: string;
  priority?: number;
  /** 图算法：算法类型 */
  graphAlgorithm?: string;
  maxDepth?: number;
  /** 大模型常识：提示词片段 */
  prompt?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImplicitRelationKnowledge {
  richRelations: GeneratedRichRelation[];
  inferenceRules: InferenceRule[];
  llmCommonSensePrompt: string;
}

export interface ImplicitRelationTask {
  id: string;
  name: string;
  description?: string;
  ontologySceneId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImplicitRelationTaskListItem extends ImplicitRelationTask {
  ontologySceneName?: string;
  ruleCount: number;
  richRelationCount: number;
}

export interface CreateImplicitRelationTaskInput {
  name: string;
  description?: string;
}

export interface InferenceRuleLlmParseResult {
  intent: 'create_rule' | 'update_rule' | 'convert_rule' | 'chat';
  category?: InferenceRuleCategory;
  name?: string;
  condition?: string;
  action?: string;
  graphAlgorithm?: string;
  maxDepth?: number;
  prompt?: string;
  description?: string;
  reply?: string;
  message?: string;
}

export interface InferenceRuleTestHit {
  path: string;
  description: string;
}

export interface InferenceRuleTestResult {
  summary: string;
  hits: InferenceRuleTestHit[];
}
