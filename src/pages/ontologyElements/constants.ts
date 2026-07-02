import type { OntologyElementTabKey } from './types';

export const ONTOLOGY_ELEMENTS_BASE_PATH =
  '/tenant/compute/onto/ontologyElements';

export const ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH = `${ONTOLOGY_ELEMENTS_BASE_PATH}/objectType`;

export const ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH = `${ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH}/create`;

export const getOntologyElementsObjectTypeCopyPath = (
  sourceObjectTypeId: number | string
) =>
  `${ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH}?copyFrom=${encodeURIComponent(String(sourceObjectTypeId))}`;

export const getOntologyElementsObjectTypeEditPath = (
  objectTypeId: number | string
) => `${ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH}/edit/${objectTypeId}`;

export const getOntologyElementsObjectTypeInstanceSyncPath = (
  objectTypeId: number | string
) => `${getOntologyElementsObjectTypeEditPath(objectTypeId)}?step=3`;

export const ONTOLOGY_ELEMENT_TABS: {
  key: OntologyElementTabKey;
  label: string;
}[] = [
  { key: 'objectType', label: '对象类型' },
  { key: 'attribute', label: '属性' },
  { key: 'link', label: '链接' }
];

export const isOntologyElementTabKey = (
  key: string
): key is OntologyElementTabKey =>
  ONTOLOGY_ELEMENT_TABS.some((tab) => tab.key === key);
