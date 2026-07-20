export type InferenceType =
  | 'root_cause'
  | 'anomaly_detection'
  | 'simulation_prediction';

export type InferenceTaskStatus = 'not_started' | 'running' | 'completed';

/** 推理路径步骤 */
export interface InferencePathStep {
  id: string;
  /** 步骤序号，从 1 开始 */
  order: number;
  /** 步骤标题 */
  title: string;
  /** 步骤说明 */
  description: string;
  /** 起点节点名称 */
  fromNode?: string;
  /** 终点节点名称 */
  toNode?: string;
  /** 推导关系 / 所用规则 */
  relation?: string;
}

/** 关联节点及其结论 */
export interface InferenceRelatedNode {
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点类型 */
  nodeType:
    | 'scene'
    | 'semantic_mapping'
    | 'domain_axiom'
    | 'concept'
    | 'conclusion';
  /** 在路径中的角色，如：起点 / 中间节点 / 结论节点 */
  role: string;
  /** 该节点结论 */
  conclusion: string;
  /** 支撑证据（可选） */
  evidence?: string;
}

export interface InferenceAnalysisTask {
  id: string;
  name: string;
  description?: string;
  inferenceType: InferenceType;
  status: InferenceTaskStatus;
  /** 关联本体场景库（多选） */
  ontologySceneIds: number[];
  /** 关联语义映射（多选，非必填） */
  semanticMappingIds?: string[];
  /** 关联领域公理（多选，非必填） */
  domainAxiomIds?: string[];
  /** 推理结果内容 */
  resultContent?: string;
  /** 推理路径 */
  inferencePath?: InferencePathStep[];
  /** 关联节点结论 */
  relatedNodes?: InferenceRelatedNode[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface InferenceAnalysisTaskListItem extends InferenceAnalysisTask {
  ontologySceneNames?: string[];
  semanticMappingNames?: string[];
  domainAxiomNames?: string[];
}

export interface CreateInferenceAnalysisTaskInput {
  name: string;
  description?: string;
  inferenceType: InferenceType;
  ontologySceneIds: number[];
  semanticMappingIds?: string[];
  domainAxiomIds?: string[];
  /** 一般由创建后的大模型推理自动写入，创建表单不再手填 */
  resultContent?: string;
  inferencePath?: InferencePathStep[];
  relatedNodes?: InferenceRelatedNode[];
}
