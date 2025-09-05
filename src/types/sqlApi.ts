export interface CreateSqlScriptParams {
  script_content?: string;
  script_desc?: string;
  script_name: string;
  /** 用户id */
  uid: string;
}

export interface CreateSqlScriptData {
  script_id: string;
}

export interface SqlScriptListParams {
  /** 页码 */
  page?: number;
  /** 页大小 */
  page_size?: number;
  /** 搜索内容 */
  search_content?: string;
}

export interface SqlScriptListData {
  items: SqlScriptItem[];
  page: string;
  page_size: string;
  total: string;
}

export interface SqlScriptItem {
  /**
   * 创建时间
   */
  create_time: string;
  /**
   * 数据集名字
   */
  data_set_name: string;
  /**
   * 依赖的表，逗号分割
   */
  dependent_tables: string;
  /**
   * 权限的
   */
  perms: string[];
  /**
   * 脚本说明
   */
  script_desc: string;
  /**
   * 脚本id
   */
  script_id: number;
  /**
   * 脚本名字
   */
  script_name: string;
  /**
   * 更新时间
   */
  update_time: string;
  /**
   * 创建人姓名
   */
  user_account: string;
}

export interface RenameSqlScriptParams {
  script_name: string;
}

export interface updateSqlScriptParams {
  /** sql脚本内容 */
  script_content: string;
  /** sql脚本说明 */
  script_desc?: string;
  /** 脚本id，新建不传或者传0。更新传对应的脚步id */
  script_id: number | string;
  /** sql 脚本名字 */
  script_name: string;
  /** 用户id */
  uid: string;
}
