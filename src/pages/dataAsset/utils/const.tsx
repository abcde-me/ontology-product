// 系统保留字段（不允许编辑、删除、导入）
export const RESERVED_FIELD_ENS = new Set([
  'data_asset_name',
  'tags',
  'data_source',
  'data_update_time'
]);

export const TAGS_FIELD_EN_NAME = 'tags';
export const isTagsField = (nameEn: string) => nameEn === TAGS_FIELD_EN_NAME;
export const isDateType = (type: string) =>
  type === 'datetime' || type === 'date';
