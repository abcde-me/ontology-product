import type { OntologyFunctionParam } from '@/pages/ontologyScene/types/ontologyFunction';

/** 函数某一版本下的完整快照 */
export interface OntologyFunctionVersionSnapshot {
  name: string;
  code: string;
  description: string;
  content: string;
  params: OntologyFunctionParam[];
}

export interface OntologyFunctionVersion {
  id: string;
  /** 展示用版本号，如 v1.0 */
  label: string;
  /** 本版本主要更改说明 */
  changeSummary: string;
  createdAt: string;
  createdBy?: string;
  snapshot: OntologyFunctionVersionSnapshot;
}

export interface OntologyFunctionVersionStore {
  /** 当前最新保存的版本 */
  activeVersionId: string | null;
  versions: OntologyFunctionVersion[];
}
