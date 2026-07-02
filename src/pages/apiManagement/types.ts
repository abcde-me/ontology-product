export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type OntologyApiStatus = 'editing' | 'online' | 'offline';

export interface OntologyApiCustomMeta {
  code: string;
  name: string;
  method: HttpMethod;
  path: string;
  category: string;
}

export interface OntologyApiCatalogItem {
  id: string;
  code: string;
  name: string;
  method: HttpMethod;
  path: string;
  category: string;
  description: string;
  useCase: string;
  requestExample: string;
  responseExample: string;
  notes?: string;
}

export interface OntologyApiConfig {
  baseUrl: string;
  path: string;
  description: string;
  useCase: string;
  requestExample: string;
  responseExample: string;
  notes?: string;
}

export interface OntologyApiRuntimeRecord {
  id: string;
  status: OntologyApiStatus;
  isCustom?: boolean;
  customMeta?: OntologyApiCustomMeta;
  draftConfig: OntologyApiConfig;
  publishedConfig: OntologyApiConfig;
  publishedAt?: string;
  updatedAt?: string;
}

export interface OntologyApiListItem extends OntologyApiCatalogItem {
  status: OntologyApiStatus;
  isCustom?: boolean;
  baseUrl: string;
  publishedAt?: string;
  updatedAt?: string;
  hasDraftChanges: boolean;
}

export interface CreateOntologyApiInput {
  name: string;
  method: HttpMethod;
  path: string;
  category?: string;
  baseUrl?: string;
}

export interface UpdateOntologyApiDraftPayload {
  config: OntologyApiConfig;
  customMeta?: OntologyApiCustomMeta;
}

export interface ApiTestRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiTestResult {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  errorMessage?: string;
}

export type ApiAuthScopeType = 'project' | 'organization';

export type ApiAuthUserScope = 'all' | 'partial';

export interface ApiAuthorizationUser {
  id: string;
  name: string;
  account?: string;
}

export interface ApiAuthorizationRule {
  id: string;
  scopeType: ApiAuthScopeType;
  orgId: string;
  orgName: string;
  projectId?: string;
  projectName?: string;
  userScope: ApiAuthUserScope;
  userIds?: string[];
  users?: ApiAuthorizationUser[];
  updatedAt: string;
}

export interface ApiAuthorizationFormValues {
  scopeType: ApiAuthScopeType;
  projectSelection?: string[];
  orgId?: string;
  userScope: ApiAuthUserScope;
  userIds?: string[];
}
