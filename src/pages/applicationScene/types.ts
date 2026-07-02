export interface ApplicationScenario {
  id: string;
  name: string;
  description?: string;
  ontologySceneId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationScenarioRule {
  id: string;
  scenarioId: string;
  name: string;
  condition: string;
  action: string;
  description?: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationScenarioListItem extends ApplicationScenario {
  ruleCount: number;
  ontologySceneName?: string;
}

export interface CreateApplicationScenarioInput {
  name: string;
  description?: string;
}

export type ApplicationScenarioNlIntent =
  | 'create_rule'
  | 'update_rule'
  | 'query_instances'
  | 'chat'
  | 'unknown';

export interface ApplicationScenarioNlParseResult {
  intent: ApplicationScenarioNlIntent;
  name?: string;
  condition?: string;
  action?: string;
  queryText?: string;
  reply?: string;
  message: string;
}

export interface InstanceInferenceHit {
  objectTypeId: number;
  objectTypeName: string;
  instanceCount: number;
  matchedRuleNames: string[];
  sampleInstances: Array<Record<string, unknown>>;
  /** 字段 code → 属性名称（comment） */
  fieldLabels?: Record<string, string>;
}

export interface ResolvedAttributeValue {
  objectTypeName: string;
  fieldName: string;
  fieldLabel?: string;
  value: string;
  instance?: Record<string, unknown>;
}

export interface RelationshipInferenceStep {
  step: number;
  description: string;
}

export interface InstanceInferenceResult {
  query: string;
  summary: string;
  hits: InstanceInferenceHit[];
  appliedRules: string[];
  inferenceMode?: 'rule' | 'keyword' | 'relationship';
  inferencePath?: string;
  resolvedValues?: ResolvedAttributeValue[];
}

export interface ThinkingProgressCallbacks {
  /** 追加一行思考日志（带换行） */
  onThinkingLine?: (line: string) => void;
  /** 追加流式文本片段（不换行，用于大模型 reasoning 流） */
  onThinkingChunk?: (chunk: string) => void;
}
