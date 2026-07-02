import type { ObjectType } from '@/types/objectType';

import type { LinkInfo, LinkType } from '@/types/graphApi';
import type { LinkTypeAttributeInfo } from '@/types/links';

export type OntologyQueryTabKey =
  | 'objectType'
  | 'attribute'
  | 'link'
  | 'behavior'
  | 'function';

export type InstanceSyncConfigFilter = 'all' | 'yes' | 'no';

export interface ObjectTypeQueryFormValues {
  objectTypeId?: string;
  objectTypeName?: string;
  sceneName?: string;
  description?: string;
  instanceSyncConfig?: InstanceSyncConfigFilter;
}

export interface ObjectTypeQueryRow extends ObjectType {
  sceneId: number;
  sceneName: string;
  businessDomain?: string;
}

export interface ObjectTypeQueryParams extends ObjectTypeQueryFormValues {
  pageNo: number;
  pageSize: number;
  /** 按场景 ID 精确过滤（优先于 sceneName） */
  sceneId?: number;
  forceRefresh?: boolean;
}

export interface ObjectTypeQueryResult {
  items: ObjectTypeQueryRow[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export type LinkTypeFilter = 'all' | '1:1' | '1:N' | 'N:N';

export interface LinkQueryFormValues {
  linkId?: string;
  linkName?: string;
  sceneName?: string;
  sourceEndpoint?: string;
  targetEndpoint?: string;
  linkType?: LinkTypeFilter;
}

export interface LinkQueryRow extends LinkInfo {
  sceneId: number;
  sceneName: string;
  linkSourceColumnName?: string;
  linkTargetColumnName?: string;
  ontologyLinkTypeColumnList?: LinkTypeAttributeInfo[];
}

export interface LinkQueryParams extends LinkQueryFormValues {
  pageNo: number;
  pageSize: number;
}

export interface LinkQueryResult {
  items: LinkQueryRow[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface AttributeQueryFormValues {
  attributeId?: string;
  attributeName?: string;
  attributeType?: string;
  objectTypeName?: string;
  sceneName?: string;
}

export interface AttributeQueryRow {
  id?: number;
  name?: string;
  comment?: string;
  columnType?: string;
  ontologyObjectTypeId?: number;
  ontologyObjectTypeName?: string;
  ontologyObjectTypeIcon?: string;
  sceneId: number;
  sceneName: string;
}

export interface AttributeQueryParams extends AttributeQueryFormValues {
  pageNo: number;
  pageSize: number;
}

export interface AttributeQueryResult {
  items: AttributeQueryRow[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface BehaviorQueryFormValues {
  behaviorId?: string;
  behaviorName?: string;
  description?: string;
  objectTypeName?: string;
  functionName?: string;
  sceneName?: string;
}

export interface BehaviorQueryRow {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  objectTypeId?: number;
  objectTypeName?: string;
  objectType?: string;
  objectTypeIcon?: string;
  ontologyObjectTypeId?: string;
  functionId?: number;
  functionName?: string;
  sceneId: number;
  sceneName: string;
}

export interface BehaviorQueryParams extends BehaviorQueryFormValues {
  pageNo: number;
  pageSize: number;
}

export interface BehaviorQueryResult {
  items: BehaviorQueryRow[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface FunctionQueryFormValues {
  functionCode?: string;
  functionName?: string;
  description?: string;
  relatedAction?: string;
  sceneName?: string;
}

export interface FunctionQueryRow {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  relatedActionId?: number;
  relatedActionName?: string;
  relatedActionCode?: string;
  relatedActionText?: string;
  sceneId: number;
  sceneName: string;
}

export interface FunctionQueryParams extends FunctionQueryFormValues {
  pageNo: number;
  pageSize: number;
}

export interface FunctionQueryResult {
  items: FunctionQueryRow[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export { LinkType };
