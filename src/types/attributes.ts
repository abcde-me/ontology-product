export interface ListOntologyPublicPropertiesReq {
  /**
   * 搜索内容
   */
  filter?: string;
  /**
   * 排序规则: asc: 升序, desc: 倒序, 默认倒序
   *
   * Example: desc
   */
  order?: 'asc' | 'desc';
  /**
   * 排序依据
   *
   * Example: name
   */
  orderBy?: string;
  /**
   * mongo 排序规则
   *
   * Example: []string{ "{order: desc}", "{id:asc}" }
   */
  orders?: string[];
  /**
   * 页码
   *
   * Example: 1
   */
  pageNo?: number;
  /**
   * 每页的大小
   *
   * Example: 10
   */
  pageSize?: number;
}

export interface PublicProperty {
  /**
   * 支持字段类型
   */
  columnType?: string;
  /**
   * 公共属性名称
   */
  comment?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * ID
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 唯一标识
   */
  name?: string;
  /**
   * 绑定的对象类型数量
   */
  ontologyObjectTypeCounts?: number;
  /**
   * 绑定的对象类型列表
   */
  ontologyObjectTypeList?: {
    /**
     * 对象类型图标
     */
    icon?: string;
    /**
     * 对象类型ID
     */
    id?: number;
    /**
     * 对象类型名称
     */
    name?: string;
  }[];
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
  /**
   * 数据源
   */
  dataSource?: string;
}

export interface ListOntologyPublicPropertiesRes {
  result: PublicProperty[];
  totalCount?: number;
}

export interface CreateOntologyPublicPropertiesReq {
  /**
   * 列类型
   */
  columnType: string;
  /**
   * 属性名称
   */
  comment: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 列名
   */
  name: string;
}

export interface UpdateOntologyPublicPropertiesReq {
  /**
   * 支持字段类型
   */
  columnType?: string;
  /**
   * 公共属性名称
   */
  comment?: string;
  /**
   * 描述说明
   */
  description?: string;
  /**
   * 唯一标识
   */
  id: number;
  /**
   * 公共属性id
   */
  name?: string;
}
