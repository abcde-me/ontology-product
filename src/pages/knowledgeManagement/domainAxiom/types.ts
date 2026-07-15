/** 公理创建来源 */
export type AxiomSourceType = 'manual' | 'file' | 'llm';

export interface DomainAxiom {
  id: string;
  /** 公理名称 */
  name: string;
  /** 公理表达式 / 约束内容 */
  expression: string;
  description?: string;
  /** 所属业务领域 */
  domain?: string;
  /** 关联本体场景（供推理分析引用） */
  ontologySceneId?: number;
  /** 场景名称快照 */
  ontologySceneName?: string;
  /** 关联应用场景 */
  applicationScenarioId?: string;
  /** 应用场景名称快照 */
  applicationScenarioName?: string;
  sourceType: AxiomSourceType;
  /** 文件提取时的源文件名 */
  sourceFileName?: string;
  enabled: boolean;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export type DomainAxiomListItem = DomainAxiom;

export interface CreateDomainAxiomInput {
  name: string;
  expression: string;
  description?: string;
  domain?: string;
  ontologySceneId?: number;
  ontologySceneName?: string;
  applicationScenarioId?: string;
  applicationScenarioName?: string;
  sourceType: AxiomSourceType;
  sourceFileName?: string;
  enabled?: boolean;
}

export interface UpdateDomainAxiomInput {
  name?: string;
  expression?: string;
  description?: string;
  domain?: string;
  ontologySceneId?: number | null;
  ontologySceneName?: string | null;
  applicationScenarioId?: string | null;
  applicationScenarioName?: string | null;
  enabled?: boolean;
}

/** 提取 / 生成过程中的候选公理（尚未入库） */
export interface DomainAxiomCandidate {
  key: string;
  name: string;
  expression: string;
  description?: string;
  domain?: string;
}
