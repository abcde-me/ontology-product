import type { OntologyQueryTabKey } from './types';

export const ONTOLOGY_QUERY_TABS: {
  key: OntologyQueryTabKey;
  label: string;
}[] = [
  { key: 'objectType', label: '对象类型' },
  { key: 'attribute', label: '属性' },
  { key: 'link', label: '链接' },
  { key: 'behavior', label: '行为' },
  { key: 'function', label: '函数' }
];

export const SCENE_QUERY_ALL_VALUE = 'all';

export const INSTANCE_SYNC_CONFIG_OPTIONS = [
  { label: '不限', value: 'all' },
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' }
] as const;

export const LINK_TYPE_QUERY_OPTIONS = [
  { label: '不限', value: 'all' },
  { label: '1:1', value: '1:1' },
  { label: '1:N', value: '1:N' },
  { label: 'N:N', value: 'N:N' }
] as const;
