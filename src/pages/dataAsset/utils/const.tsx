export const TAGS_FIELD_EN_NAME = 'tags';
export const DATA_ASSET_NAME_FIELD_EN_NAME = 'data_asset_name';
export const DATA_SOURCE_FIELD_EN_NAME = 'data_source';
export const DATA_UPDATE_TIME_FIELD_EN_NAME = 'data_update_time';
// 系统保留字段（不允许编辑、删除、导入）
export const RESERVED_FIELD_ENS = new Set([
  DATA_ASSET_NAME_FIELD_EN_NAME,
  TAGS_FIELD_EN_NAME,
  DATA_SOURCE_FIELD_EN_NAME,
  DATA_UPDATE_TIME_FIELD_EN_NAME
]);
export const isTagsField = (nameEn: string) => nameEn === TAGS_FIELD_EN_NAME;
export const isDateType = (type: string) =>
  type === 'datetime' || type === 'date';
export const SYSTEM_FIELDS = [
  {
    id: `field_system_data_asset_name`,
    nameZh: '数据资产名称',
    nameEn: DATA_ASSET_NAME_FIELD_EN_NAME,
    type: 'string',
    default: '',
    required: true,
    allowModify: false,
    system: true,
    isEnumAble: false,
    displaySort: 1
  },
  {
    id: `field_system_tags`,
    nameZh: '标签',
    nameEn: TAGS_FIELD_EN_NAME,
    type: 'array<varchar(64)>',
    default: '',
    required: true,
    allowModify: false,
    system: true,
    isEnumAble: false,
    displaySort: 2
  },
  {
    id: `field_system_data_source`,
    nameZh: '来源',
    nameEn: DATA_SOURCE_FIELD_EN_NAME,
    type: 'string',
    default: '',
    required: true,
    allowModify: false,
    system: true,
    isEnumAble: false,
    displaySort: 3
  },
  {
    id: `field_system_data_update_time`,
    nameZh: '数据更新时间',
    nameEn: DATA_UPDATE_TIME_FIELD_EN_NAME,
    type: 'datetime',
    default: '',
    required: true,
    allowModify: false,
    system: true,
    isEnumAble: false,
    displaySort: 4
  }
];
