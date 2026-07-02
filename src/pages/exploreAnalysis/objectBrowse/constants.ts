import type { ObjectBrowseQueryTabKey } from './types';

export const OBJECT_BROWSE_QUERY_TABS: {
  key: ObjectBrowseQueryTabKey;
  label: string;
}[] = [
  { key: 'condition', label: '条件查询' },
  { key: 'semantic', label: '语义查询' },
  { key: 'semantic2', label: '相似性查询' }
];

export const SEMANTIC_QUERY_EMPTY_INTENT = '未输入语义，返回当前类型全部实例';

/** 相似性查询：向量字段下拉「全部」选项值 */
export const ALL_VECTOR_FIELDS_VALUE = '__all_vector_fields__';

export const ALL_VECTOR_FIELDS_LABEL = '全部';
