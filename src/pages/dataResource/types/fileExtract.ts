/** 文件信息提取类型 */
export type FileExtractType = 'entity_relation' | 'ontology_model' | 'instance';

export type FileExtractTaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export interface ExtractedEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface ExtractedRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
}

export interface EntityRelationExtractResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
  summary?: string;
  markdown?: string;
}

/** 与对象类型 CSV 导入模板一致的 Schema 结构 */
export interface OntologyModelSchema {
  columnList: string[];
  typeList: string[];
  commentList: string[];
  instances: Record<string, string>[];
}

export interface OntologyModelObjectType {
  id: string;
  name: string;
  code: string;
  description?: string;
  schema: OntologyModelSchema;
}

export interface OntologyModelLink {
  id: string;
  name: string;
  sourceObjectTypeId: string;
  targetObjectTypeId: string;
  description?: string;
}

export interface OntologyModelExtractResult {
  objectTypes: OntologyModelObjectType[];
  links: OntologyModelLink[];
  summary?: string;
  markdown?: string;
}

export interface ExtractedInstance {
  id: string;
  objectType: string;
  name: string;
  attributes: Record<string, string>;
}

export interface InstanceTableRow {
  [fieldName: string]: string;
}

export interface InstanceExtractResult {
  instances: ExtractedInstance[];
  /** 按数据资源表字段结构提取的行数据 */
  rows?: InstanceTableRow[];
  targetTableId?: string;
  targetTableName?: string;
  summary?: string;
  markdown?: string;
}

export type FileExtractResultPayload =
  | EntityRelationExtractResult
  | OntologyModelExtractResult
  | InstanceExtractResult;

export interface FileExtractTask {
  id: string;
  fileId: string;
  fileName: string;
  extractType: FileExtractType;
  requirement: string;
  /** 实例提取时关联的数据资源表 id */
  targetTableId?: string;
  targetTableName?: string;
  status: FileExtractTaskStatus;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  result?: FileExtractResultPayload;
}
