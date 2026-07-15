/** 语义映射所属领域（历史数据兼容；新建时不再填写） */
export interface SemanticDomain {
  id: string;
  name: string;
  createdAt: string;
}

/** 关联的对象类型属性快照 */
export interface SemanticMappingAttributeRef {
  /** 物理属性 id（若有） */
  id?: number;
  /** 字段名 */
  fieldName: string;
  /** 展示名 / 注释 */
  displayName?: string;
  /** 字段类型 */
  columnType?: string;
}

/** 关联的对象类型快照（便于详情展示，不依赖实时查询） */
export interface SemanticMappingObjectTypeRef {
  id: number;
  name: string;
  code?: string;
  sceneId?: number;
  sceneName?: string;
  /** 该对象类型下选中的属性（可选） */
  attributes?: SemanticMappingAttributeRef[];
}

export interface SemanticMapping {
  id: string;
  /** 标准术语 */
  standardTerm: string;
  /** 所属领域 id（可选，历史数据兼容） */
  domainId?: string;
  /** 映射描述 */
  description?: string;
  /** 同义词 / 别名 */
  synonyms: string[];
  /** 关联对象类型（非必填） */
  objectTypes: SemanticMappingObjectTypeRef[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface SemanticMappingListItem extends SemanticMapping {
  domainName?: string;
}

export interface CreateSemanticMappingInput {
  standardTerm: string;
  /** @deprecated 新建映射不再填写领域；保留字段以兼容旧调用 */
  domainId?: string;
  /** @deprecated 新建映射不再填写领域；保留字段以兼容旧调用 */
  domainName?: string;
  description?: string;
  synonyms?: string[];
  objectTypes?: SemanticMappingObjectTypeRef[];
}

export interface UpdateSemanticMappingInput {
  standardTerm?: string;
  domainId?: string;
  domainName?: string;
  description?: string;
  synonyms?: string[];
  objectTypes?: SemanticMappingObjectTypeRef[];
}

/** AI 生成预览候选项 */
export interface SemanticMappingCandidate {
  key: string;
  standardTerm: string;
  description?: string;
  synonyms: string[];
  objectTypes: SemanticMappingObjectTypeRef[];
}
