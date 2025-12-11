/**
 * 脚本状态枚举
 * 0: 编辑中
 * 1: 编辑完成
 * 2: 已发版
 * 3: 调度中
 */
export enum ScriptStatus {
  /** 编辑中 */
  Editing = 0,
  /** 编辑完成 */
  EditCompleted = 1,
  /** 已发版 */
  Released = 2,
  /** 调度中 */
  Scheduling = 3
}

/**
 * 脚本状态名称枚举
 * 注意：0和1在前端展示时都显示为"未发版"
 */
export enum ScriptStatusName {
  /** 未发版（编辑中） */
  Editing = '未发版',
  /** 未发版（编辑完成） */
  EditCompleted = '未发版',
  /** 已发版 */
  Released = '已发版',
  /** 调度中 */
  Scheduling = '调度中'
}

export interface ListDevelopScriptParams {
  page_size?: number;
  page?: number;
  script_name?: string;
  status?: string;
  create_user?: string;
  orders?: {
    column: string;
    order_flag: 'asc' | 'desc';
  }[];
}

export interface ListDevelopScriptItem {
  /**
   * 创建时间
   */
  create_time: string;
  /**
   * 创建人 开发人
   */
  create_user: string;
  /**
   * 最新版本号，最大版本号
   */
  max_version: number;
  /**
   * 最新版本号名字，最大版本名称
   */
  max_version_name: string;
  /**
   * 所属工作流，所属工作流名称
   */
  process_name: string;
  /**
   * 脚本描述
   */
  script_desc: string;
  /**
   * 脚本ID，脚本id
   */
  script_id: number;
  /**
   * 脚本名字
   */
  script_name: string;
  /**
   * 最新版本状态
   */
  status: ScriptStatus;
  /**
   * 最新版本状态名字
   */
  status_name: ScriptStatusName;
  /**
   * 所属任务节点，所属任务名称
   */
  task_name: string;
  /**
   * 更新时间，更新时间
   */
  update_time: null | string;
  /**
   * 修改人 开发人
   */
  update_user: string;
  /**
   * 调度版本号，任务使用版本
   */
  version: number;
  /**
   * 调度版本号名字，任务使用版本名
   */
  version_name: string;
}

export interface ListDevelopScriptResponse {
  items: ListDevelopScriptItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface ScriptParam {
  config_key: string;
  config_value: string;
  config_desc: string;
}

export interface CreateDevelopScriptParams {
  /**
   * 脚本内容
   */
  script_context?: string;
  /**
   * 脚本描述
   */
  script_desc?: string;
  /**
   * 脚本名字
   */
  script_name: string;
  /**
   * 脚本参数
   */
  script_params?: ScriptParam[];
}

export interface CreateDevelopScriptResponse {
  script_id: number;
}

export interface EditDevelopScriptParams {
  /**
   * sql脚本内容
   */
  script_content: string;
  /**
   * sql脚本说明
   */
  script_desc?: string;
  /**
   * 脚本id，新建不传或者传0。更新传对应的脚步id
   */
  script_id: number;
  /**
   * sql 脚本名字
   */
  script_name: string;
  /**
   * 脚本参数
   */
  script_params: ScriptParam[];
}

export interface EditDevelopScriptResponse {
  script_id: number;
  script_name: string;
  script_desc: string;
  update_time: string;
  update_user: string;
  create_time: string;
  create_user: string;
}

export interface GetDevelopScriptInfoParams {
  script_id: number;
}

export interface GetDevelopScriptInfoResponse {
  /**
   * 创建时间
   */
  create_time: string;
  /**
   * 最大版本
   */
  max_version: number;
  /**
   * 更新者
   */
  update_user: string;
  /**
   * 最大版本名称
   */
  max_version_name: string;
  /**
   * 发版时间 当已发版状态时候有
   */
  release_time: string;
  /**
   * 发版人 当已发版状态时候有
   */
  release_user: string;
  /**
   * 脚本内容
   */
  script_content: string;
  /**
   * 脚本描述
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
   * 脚本参数
   */
  script_params: ScriptParam[];
  /**
   * 最新版本状态
   */
  status: ScriptStatus;
  /**
   * 最新版本状态名字
   */
  status_name: ScriptStatusName;
  /**
   * 更新时间
   */
  update_time: string;
}
