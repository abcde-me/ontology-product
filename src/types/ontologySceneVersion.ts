/** 本体场景某一版本下的资源快照（用于对比） */
export interface OntologySceneVersionSnapshot {
  objectTypeNames: string[];
  linkTypeNames: string[];
  actionNames: string[];
  functionNames: string[];
  counts: {
    objectTypes: number;
    linkTypes: number;
    actions: number;
    functions: number;
  };
}

export interface OntologySceneVersion {
  id: string;
  /** 展示用版本号，如 v1.0 */
  label: string;
  /** 本版本主要更改说明 */
  changeSummary: string;
  createdAt: string;
  createdBy?: string;
  snapshot: OntologySceneVersionSnapshot;
}

export interface OntologySceneVersionStore {
  /** 当前生效/参考版本（最新创建默认生效） */
  activeVersionId: string | null;
  versions: OntologySceneVersion[];
}

export interface ResourceNameDiff {
  added: string[];
  removed: string[];
}

export interface OntologySceneVersionCompareResult {
  baseVersion: OntologySceneVersion;
  targetVersion: OntologySceneVersion;
  objectTypes: ResourceNameDiff;
  linkTypes: ResourceNameDiff;
  actions: ResourceNameDiff;
  functions: ResourceNameDiff;
  countsDelta: {
    objectTypes: number;
    linkTypes: number;
    actions: number;
    functions: number;
  };
}
