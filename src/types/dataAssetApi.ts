/** 创建资产表头 */
export interface DataAssetField {
  nameZh: string;
  nameEn: string;
  type: string | undefined;
  default: string;
  required: boolean;
  allowModify: boolean;
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
    mapping: Empty[];
  })[];
}

export interface Empty {
  /**
   * 数据来源字段名
   */
  feild_name_en: string;
  /**
   * 数据来源表名
   */
  table_name: string;
  /**
   * 数据来源类型
   */
  type: string;
}
