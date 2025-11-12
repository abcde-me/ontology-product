/** 创建资产表头 */
export interface DataAssetField {
  /** 字段中文名称 */
  nameZh: string;
  /** 字段英文名称 */
  nameEn: string;
  /** 字段类型 */
  type: string | undefined;
  /** 默认值 */
  default: string;
  /** 是否必填 */
  required: boolean;
  /** 是否可修改 */
  allowModify: boolean;
}

/** 数据来源字段的映射关系 */
export interface MappingItem {
  /** 数据来源字段名 */
  feildName: string;
  /** 数据来源表名 */
  tableName: string;
  /** 数据来源类型 */
  type: string;
  /** 数据来源字段类型 */
  fieldType: string;
}

/** 查询数据资产表字段和映射关系 */
export interface FindDataAssetMappingItemRes extends DataAssetField {
  Mapping: {
    type: string;
    tableName: string;
    databaseName: string;
    fieldType: string;
    fieldName: string;
  }[];
}

export interface CreateDataAssetRes {
  /**
   * 字段自动映射
   */
  auto_map: boolean;
  /**
   * 字段列表
   */
  fields: (DataAssetField & {
    /**
     * 与数据来源字段的映射关系列表，一个字段可对应多个数据源
     */
    MappingItem: MappingItem[];
  })[];
}

export interface EditDataAssetColumnMapReq {
  /** 数据资产字段列表 */
  fields: Partial<DataAssetField>[];
  /** 数据来源字段列表 */
  source: {
    type: string;
    name: string;
    tableName: string;
    fields: {
      name: string;
      type: string;
    }[];
  }[];
}

export interface EditDataAssetColumnMapResItem {
  /** 数据资产字段英文名 */
  fieldNameEn: string;
  /** 与数据来源字段的映射关系 */
  mapping: MappingItem[];
}

export interface EditDataAssetColumnMapRes {
  data: {
    /** 数据资产字段英文名 */
    field_name_en: string;
    /** 与数据来源字段的映射关系 */
    MappingItem: MappingItem;
  };
}

export interface ListDataAssetSourceResItem {
  /** 数据来源类型 */
  type: string;
  /** 数据来源名称 */
  name?: string;
  /** 数据来源数据库名称 */
  databaseName: string;
  /** 数据来源表名 */
  tableName: string;
  /** 数据来源字段列表 */
  fields: {
    /** 数据来源字段名 */
    name: string;
    /** 数据来源字段类型 */
    type: string;
  }[];
}

export interface CreateDataAssetAndMappingReq
  extends FindDataAssetMappingItemRes {
  autoMap?: boolean;
}

export interface AutoMapDataAssetFieldAndSourceReq {
  fields: Partial<DataAssetField>[];
  source: {
    type: string;
    name: string;
    tableName: string;
    databaseName?: string;
    fields: {
      name: string;
      type: string;
    }[];
  }[];
}

export interface AutoMapDataAssetFieldAndSourceResItem {
  fieldNameEn: string;
  mapping: {
    type: string;
    tableName: string;
    databaseName?: string;
    fieldType: string;
    feildName: string;
  }[];
}

export interface ColumnField {
  /** 字段中文名 */
  nameZh: string;
  /** 字段英文名 */
  nameEn: string;
  /** 字段类型 */
  type: string;
  /** 默认值 */
  default: string;
  /** 是否为枚举类型 */
  isEnumAble: boolean;
  /** 是否可修改 */
  allowModify: boolean;
  /** 是否显示 */
  // isDisplay: boolean;
  /** 显示排序 0代表不显示，1代表第一列，2代表第二列，以此类推 */
  displaySort: number;
}

export interface EditDataAssetFieldsDisplayReq {
  /** 数据资产字段列表 */
  fields: ColumnField[];
}

export interface ListDataAssetDataReq {
  /** 通用搜索 */
  commonSearch: string;
  fieldSearch: {
    nameEn: string;
    type: string;
    searchContent: string[];
  }[];
  /** 页码，从1开始 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

/** 数据资产记录类型，对象的键对应 fields 中每个 ColumnField 的 nameEn */
export type DataAssetRecord = Record<string, unknown>;

export interface ListDataAssetDataRes {
  /** 字段列表 */
  fields: ColumnField[];
  /** 数据记录列表，每条记录的键对应 fields 中每个 ColumnField 的 nameEn 属性值 */
  records: ({
    id: string;
  } & DataAssetRecord)[];
  /** 总记录数 */
  total?: number;
  /** 当前页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

export enum ModifyMethod {
  /** 追加 */
  APPEND = 'APPEND',
  /** 覆盖 */
  COVER = 'COVER'
}

export interface EditDataAssetData {
  /** 修改方式 */
  modifyMethod: ModifyMethod;
  /** 数据资产字段列表 */
  modifyIds: string[];
  /** 数据资产记录 */
  modifyContext: {
    fieldEnName: string;
    fieldValue: string;
  }[];
}
