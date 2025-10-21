// import { Organization } from '../organization/types';
// import { Role } from '../role/types';

/**
 * User
 */
export interface User {
  /**
   * 用户账户
   */
  account?: string;
  /**
   * 权限按钮
   */
  actions?: string[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 用户描述
   */
  description?: string;
  id?: string;
  /**
   * 用户名称
   */
  name?: string;
  // organization?: Organization;
  /**
   * 用户手机号
   */
  phone?: string;
  /**
   * 用户职位
   */
  position?: string;
  /**
   * 用户角色
   */
  // roles?: Role[];
  /**
   * 用户状态
   */
  status?: string;
  [property: string]: any;
}

export interface UserListParams {
  /**
   * 用户需要校验的权限
   */
  actions?: string[];
  /**
   * 用户ids的集合
   */
  ids?: string[];
  /**
   * 名字过滤条件
   */
  nameFilter?: string;
  /**
   * 排序规则: asc: 升序, desc: 倒序, 默认倒序
   *
   * Example: desc
   */
  order?: Order;
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
   * 项目所属的组织的ID
   */
  organizationId?: string;
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
  [property: string]: any;
}

/**
 * 排序规则: asc: 升序, desc: 倒序, 默认倒序
 *
 * Example: desc
 */
export enum Order {
  Asc = 'asc',
  Desc = 'desc'
}
