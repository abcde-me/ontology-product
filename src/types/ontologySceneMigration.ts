import type { PublicProperty } from '@/types/attributes';
import type { GetOntologyLinkTypeRes } from '@/types/links';
import type { GetOntologyObjectTypeDetailRes } from '@/types/objectType';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { BehaviorActionDetail } from '@/pages/ontologyScene/types/behaviorActions';
import type { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';

export const ONTOLOGY_SCENE_EXPORT_VERSION = '1.0';

export interface OntologySceneExportMeta {
  name: string;
  description?: string;
  icon?: string;
}

export interface ExportedObjectType {
  exportId: number;
  code: string;
  detail: GetOntologyObjectTypeDetailRes;
}

export interface ExportedLinkType {
  exportId: number;
  code: string;
  sourceObjectTypeCode: string;
  targetObjectTypeCode: string;
  detail: GetOntologyLinkTypeRes;
}

export interface ExportedFunction {
  exportId: number;
  code: string;
  detail: OntologyFunctionDetail;
}

export interface ExportedAction {
  exportId: number;
  code: string;
  objectTypeCode?: string;
  functionCode?: string;
  detail: BehaviorActionDetail;
}

export interface ExportedPublicProperty {
  exportId: number;
  name: string;
  detail: PublicProperty;
}

/** 本体场景完整导出包，用于跨环境迁移 */
export interface OntologySceneExportPackage {
  version: typeof ONTOLOGY_SCENE_EXPORT_VERSION;
  exportedAt: string;
  sourceScene?: Pick<OntologScene, 'id' | 'name' | 'updateTime' | 'updateUser'>;
  scene: OntologySceneExportMeta;
  publicProperties: ExportedPublicProperty[];
  objectTypes: ExportedObjectType[];
  linkTypes: ExportedLinkType[];
  functions: ExportedFunction[];
  actions: ExportedAction[];
}

export interface OntologySceneImportResult {
  sceneId: number;
  counts: {
    publicProperties: number;
    objectTypes: number;
    linkTypes: number;
    functions: number;
    actions: number;
  };
}

export const isOntologySceneExportPackage = (
  value: unknown
): value is OntologySceneExportPackage => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const pkg = value as OntologySceneExportPackage;

  return (
    pkg.version === ONTOLOGY_SCENE_EXPORT_VERSION &&
    typeof pkg.scene?.name === 'string' &&
    Array.isArray(pkg.objectTypes) &&
    Array.isArray(pkg.linkTypes) &&
    Array.isArray(pkg.functions) &&
    Array.isArray(pkg.actions) &&
    Array.isArray(pkg.publicProperties)
  );
};
