export interface ListOntologyModelReq {
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

export interface OntologScene {
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
  icon?: string;
  /**
   * ID,唯一标识
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 链接类型数
   */
  ontologyLinkTypeCounts?: number;
  /**
   * 对象类型数
   */
  ontologyObjectTypeCounts?: number;
  /**
   * 行为动作数
   */
  ontologyActionCounts?: number;
  /**
   * 函数数
   */
  ontologyFunctionCounts?: number;
  /**
   * 标签列表
   */
  tagList?: any[];
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
}

export interface ListOntologyModelRes {
  /**
   * 当前页结果
   */
  result?: OntologScene[];
  /**
   * 总数
   */
  totalCount?: number;
}

export interface CreateOntologyModelReq {
  name: string;
  description: string;
  icon: string;
}

export interface CreateOntologyModelRes {
  id: number;
}

export interface UpdateOntologyModelReq {
  id: number;
  name: string;
  description: string;
  icon: string;
}
