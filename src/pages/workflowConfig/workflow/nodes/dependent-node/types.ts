import type {
  CommonNodeType,
  VarType
} from '@/pages/workflowConfig/workflow/types';

export type OutputVar = Record<
  string,
  {
    type: VarType;
    children: null; // support nest in the future,
  }
>;

interface LocalParam {
  prop?: string;
  direct: string;
  type: string;
  value?: string;
}

export interface SQLNodeConfig extends CommonNodeType {
  // 自定义参数
  local_params: LocalParam[];
  // SQL脚本内容
  raw_script?: string;
  // 失败重试次数
  fail_retry_interval: string;
  // 失败重试间隔
  fail_retry_times: string;
  // 运行优先级
  task_priority: string;
  // 选择的SQL脚本ID
  sql_id: string;
}

export interface SQLScriptItem {
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
  status: number;
  /**
   * 最新版本状态名字
   */
  status_name: string;
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
  children?: any[];
}

export interface SQLVersion {
  /**
   * 脚本说明
   */
  script_desc: string;
  script_file_id: number;
  /**
   * 脚本id
   */
  script_id: number;
  /**
   * 脚本名字
   */
  script_name: string;
  /**
   * 版本号
   */
  version: string;
  /**
   * 版本名
   */
  version_name: string;
  // 脚本内容
  script_context: string;
  script_params: ConfigItem[];
}

export interface ConfigItem {
  config_key: string;
  config_value: string;
  config_desc: string;
  create_time: string; // ISO 时间字符串
  update_time: string; // ISO 时间字符串
}
