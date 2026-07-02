export interface JointAxiom {
  id: string;
  sceneId: number;
  name: string;
  expression: string;
  description?: string;
  domain?: string;
  sourceObjectTypeCodes?: string[];
  targetObjectTypeCodes?: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JointSceneRule {
  id: string;
  sceneId: number;
  name: string;
  condition: string;
  action: string;
  description?: string;
  priority: number;
  enabled: boolean;
  linkedAxiomIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JointKnowledgeBundle {
  axioms: JointAxiom[];
  sceneRules: JointSceneRule[];
}

export type JointNlIntent =
  | 'create_axiom'
  | 'update_axiom'
  | 'create_scene_rule'
  | 'update_scene_rule'
  | 'query'
  | 'unknown';

export interface JointNlParseResult {
  intent: JointNlIntent;
  name?: string;
  content?: string;
  condition?: string;
  action?: string;
  queryText?: string;
  message: string;
}

export interface CrossDomainQueryHit {
  kind: 'objectType' | 'link' | 'axiom' | 'sceneRule';
  id: string | number;
  name: string;
  code?: string;
  description?: string;
  sceneId?: number;
  sceneName?: string;
  relevance: number;
}

export interface CrossDomainQueryResult {
  query: string;
  hits: CrossDomainQueryHit[];
  summary: string;
}
