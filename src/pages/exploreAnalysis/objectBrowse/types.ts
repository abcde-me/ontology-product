export type ObjectBrowseQueryTabKey = 'condition' | 'semantic' | 'semantic2';

export type FieldQueryType = 'id' | 'string' | 'range';

export interface RangeFieldValue {
  min?: string;
  max?: string;
  minInclusive?: boolean;
  maxInclusive?: boolean;
}

export interface QueryableProperty {
  fieldName: string;
  label: string;
  columnType?: string;
  queryType: FieldQueryType;
}

export interface ConditionQueryFormValues {
  sceneId?: number;
  objectTypeId?: number;
  attributes: Record<string, string | RangeFieldValue>;
}

export interface ConditionQueryParams {
  sceneId?: number;
  objectTypeId: number;
  fieldList: ObjectTypeDataFieldFilter[];
  page: number;
  pageSize: number;
}

export interface ConditionSearchContext {
  sceneId: number;
  objectTypeId: number;
  objectTypeCode?: string;
  fieldList: ObjectTypeDataFieldFilter[];
}

export interface ObjectBrowseSelectionContext {
  sceneId: number;
  objectTypeId: number;
  objectTypeCode?: string;
}

export interface ObjectTypeDataFieldFilter {
  fieldName?: string;
  fieldValue?: string;
  fieldValueList?: string[];
  matchType?: 'exact' | 'fuzzy' | 'range';
  /** 相同 orGroup 的条件之间为 OR，不同 orGroup 之间为 AND */
  orGroup?: string;
  minValue?: string;
  maxValue?: string;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  rangeExpression?: string;
}

export interface InstanceQueryResult {
  items: InstanceQueryRow[];
  total: number;
  page: number;
  pageSize: number;
  resourceNotFound?: boolean;
}

export interface InstanceQueryRow {
  score?: number;
  [key: string]: unknown;
}

export interface VectorFieldOption {
  label: string;
  value: string;
  comment?: string;
  dimension?: number;
}

export interface SemanticQueryFormValues {
  sceneId?: number;
  objectTypeId?: number;
  queryText?: string;
}

export interface SemanticSearchParams {
  ontologyModelID: number;
  objectTypeId: number;
  query?: string;
  sql?: string;
  fieldList?: ObjectTypeDataFieldFilter[];
  page: number;
  pageSize: number;
}

export interface SemanticParseResult {
  parseIntent: string;
  sql?: string;
  fieldList?: ObjectTypeDataFieldFilter[];
}

export interface SemanticSearchResult {
  items: InstanceQueryRow[];
  total: number;
  page: number;
  pageSize: number;
  parseIntent?: string;
  sql?: string;
}

export interface SemanticSearchContext {
  ontologyModelID: number;
  objectTypeId: number;
  objectTypeCode?: string;
  query?: string;
  sql?: string;
  mode: 'query' | 'sql';
}

export interface SemanticQuery2FormValues {
  sceneId?: number;
  objectTypeId?: number;
  vectorFieldName?: string;
  queryText?: string;
  topK: number;
  scoreThreshold: number;
}

export interface VectorSearchRow extends InstanceQueryRow {
  /** 多字段检索时命中的向量字段（展示名） */
  matchedVectorField?: string;
}

export interface VectorSearchParams {
  ontologyModelID: number;
  objectTypeId: number;
  vectorFieldName: string;
  query: string;
  topK: number;
  scoreThreshold: number;
}

export interface VectorSearchResult {
  items: VectorSearchRow[];
  total: number;
}
