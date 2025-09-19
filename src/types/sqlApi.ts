export interface FileListParams {
  /** 排序字段 generated_at */
  sort_field: string;
  /** 排序方式 desc */
  sort_order: string;
  /** 文件所属目录ID，卷ID */
  path_id: string;
  /** 搜索数据内容 */
  search_content?: string;
  /** 开始时间 2025-06-23 10:00:00 */
  start_time?: string;
  /** 结束时间 2025-06-23 10:00:00 */
  end_time?: string;
  /** 页码 */
  page?: number;
  /** 页大小 */
  limit?: number;
}

export interface FileItem {
  /** id */
  id: number;
  /** 文件名 */
  FileName: string;
  /** 类型 import { FileType } from '@/utils/type'; */
  file_type: string;
  /** 载入开始时间 */
  created_at: string;
  /** 文件大小 TODO */
  file_size?: number;
  /** 上传用户 TODO */
  generated_at?: string;
  /** 连接器名称 TODO */
  connection?: number;
}

export interface FileListData {
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 页大小 */
  limit: number;
  /** 列表数据 */
  list: FileItem[];
}

export interface TableListParams {
  /** 文件所属目录ID，卷ID */
  path_id: string;
  /** 搜索关键词，模糊搜索表名 */
  search: string;
  /** 库名 */
  database: string;
  /** 页码 */
  page: number;
  /** 页大小 */
  limit: number;
  /** 开始时间 2025-06-23 10:00:00 */
  start_time?: string;
  /** 结束时间 2025-06-23 10:00:00 */
  end_time?: string;
}

export interface TableItem {
  /** id */
  id: number;
  /** 表名 */
  table_name: string;
  /** 数据库类型 */
  db_type: string;
  /** 表行数 */
  cnt_rows: string;
  /** 载入开始时间 */
  created_at: string;
  /** 上传用户 TODO */
  generated_at?: string;
  /** 连接器名称 TODO */
  connection?: number;
}

export interface TableListData {
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 页大小 */
  limit: number;
  /** 列表数据 */
  list: TableItem[];
}

export interface TableDetailParams {
  /** 文件所属目录ID，卷ID */
  path_id: string;
  /** 库名 */
  database: string;
  /** 表名 */
  table: string;
  /** 获取的信息类型 sample -> 示例数据，ddl -> 表定义，loader -> 载入信息 */
  detail_type: string;
}

export interface TableDetailColumnItem {
  name: string;
  type: string;
  comment: string;
}

export interface TableDetailData {
  /** 请求信息 ??? */
  request_params: {};
  /** 示例数据 */
  sample: {
    /** 列信息 */
    columns: string[];
    /** 数据记录 50条 */
    data: Record<string, string>[];
  };
  /** 表定义 */
  ddl: {
    /** 表DDL */
    tableInfo: string;
    /** 字段信息 */
    columns: TableDetailColumnItem[];
  };
  /** 载入信息 */
  loader: {
    /** 创建时间 */
    created_time: string;
    /** 最近更新时间 */
    updated_time: string;
    /** 载入用户 */
    username: string;
    /** 连接器名称 */
    connector_name: string;
    /** 数据载入任务 */
    load_task_name: string;
  };
}

export interface DatasetListParams {
  /** 排序方式：asc-正序、desc-倒序 */
  sort_order: string;
  /** 页码 */
  page?: number;
  /** 页大小 */
  limit?: number;
  /** 排序字段：created_at-创建时间、updated_at-更新时间 */
  sort_field?: string;
  /** 数据集名称 */
  name?: string;
  /** 数据集描述 */
  description?: string;
  /** 数据集状态列表（
   * creating-创建中、
   * create_failed-创建失败、
   * normal-正常、
   * version_updating-版本更新中、
   * version_update_failed-版本更新失败）
   * */
  status_list?: string[];
  /** 存储方式列表：jsonl、file */
  storage_type_list?: string[];
  /** 标签名称列表 */
  tags?: string[];
}

export interface CreateSqlScriptParams {
  script_file_id?: string;
  script_content?: string;
  script_desc?: string;
  script_name: string;
  /** 用户id */
  uid: string;
}

export interface CopySqlScriptReq {
  script_file_id?: string;
}

export interface CreateSqlScriptData {
  perms: Array<string>;
  script_id: string;
  script_file_id: string;
  update_time: string;
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
  /** sql 脚本名字 */
  script_name: string;
  /** 用户id */
  uid: string;
}

export interface RunSqlScriptData {
  /**
   * 运行任务的执行id
   */
  script_execid: string;
  script_id: number;
  /**
   * 检测出来有多个Select SQL，只执行第一个。
   */
  warning_msg: string;
}

export interface RunResultSqlScriptParams {
  script_execid?: string;
  size?: string;
}

export interface RunResult {
  list: Record<string, unknown>[];
}

export enum RunningStatus {
  /** 未运行 */
  IDLE = -1,
  /** 运行失败 */
  FAILED = 0,
  /** 运行成功 */
  SUCCESS = 1,
  /** 运行中 */
  RUNNING = 2
}

export interface RunResultSqlScriptData {
  /**
   * 运行耗时 单位：毫秒
   */
  run_duration: string;
  /**
   * 运行状态 0-失败 1-成功 2-运行中
   */
  run_status: RunningStatus;
  /**
   * 执行结果
   */
  sql_result_lists: RunResult[];
  /**
   * 运行结束时间
   */
  run_end_time?: string;
  // /**
  //  * 运行结果行数
  //  */
  // size: string;
}

export interface RunCancelSqlScriptParams {
  script_execid: string;
}

export interface SqlScriptDetailData {
  /**
   * 创建时间
   */
  create_time: string;
  /**
   * 权限点
   */
  persm: string[];
  /**
   * 脚本内容
   */
  script_content: string;
  /**
   * 脚本描述
   */
  script_desc: string;
  /**
   * 运行任务的执行id
   */
  script_execid: string;
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
}

export interface ExportSqlResultField {
  /**
   * 字段中文名
   */
  cn_name: string;
  /**
   * 字段名称
   */
  name: string;
}

export interface ExportSqlResultParams {
  /**
   * 数据集名称（中文名字）  新建数据集必传，更新可不传
   */
  dataset_name: string;
  /**
   * 数据集英文名字  新建数据集必传，更新可不传
   */
  dataset_table_name: string;
  /**
   * 数据集描述  新建数据集必传，更新可不传
   */
  desc: string;
  /**
   * 更新和新建都必传
   */
  fields: ExportSqlResultField[];
  script_execid: string;
  /**
   * 只传table
   */
  strage_type: string;
  /**
   * 标签名字
   */
  tag_names: string[];
}

export interface ExportSqlResultData {
  /**
   * 数据集id
   */
  dataset_id: number;
  /**
   * 任务id
   */
  id: number;
  /**
   * 版本id
   */
  version_id: string;
}

export interface ExportSqlResultVersionParams {
  /**
   * 数据集id
   */
  dataset_id: number;
  dataset_name: string;
  /**
   * 版本描述
   */
  desc: string;
  /**
   * 字段信息
   */
  fields: ExportSqlResultField[];
  script_execid: string;
  /**
   * 数据集版本
   */
  version_id: string;
}

export interface ExportSqlResultVersionData {
  /**
   * 数据集id
   */
  dataset_id: string;
  /**
   * 导出任务id
   */
  id: number;
  /**
   * 数据集版本id
   */
  version_id: string;
}

export interface ExportSqlResultListParams {
  /**
   * 1-导出中 2-导出成功 3-导出失败 4-导出停止
   */
  export_status?: string[];
  /**
   * 第几页
   */
  page?: number;
  /**
   * 每页个数
   */
  page_size?: number;
  /**
   * 搜索内容，数据集名字
   */
  search_content?: string;
  /**
   * 排序字段：操作时间update_time
   */
  sort_field?: string;
  /**
   * 倒序-DESC  正序-ASC
   */
  sort_order?: string;
}

export interface ExportSqlResultListData {
  items: ExportSqlResultItem[];
  page: string;
  page_size: string;
  total: string;
}

export interface ExportSqlResultItem {
  /**
   * 数据集名称
   */
  dataset_name: string;
  /**
   * 数据集表名称
   */
  dataset_table_name: string;
  /**
   * 导出结束时间
   */
  export_end_time: string;
  /**
   * 导出开始时间
   */
  export_start_time: string;
  /**
   * 导出状态 0-导出中 1-导出成功 2-导出失败
   */
  export_status: number;
  /**
   * 导出任务唯一id
   */
  id: number;
  /**
   * 脚本id
   */
  script_id: number;
  /**
   * 脚本名称
   */
  script_name: string;
}

export interface SqlTaskDetailData {
  /**
   * sql内容
   */
  sql_content: string;
}

export interface DatasetsOptionsParams {
  /**
   * 页大小
   */
  limit?: number;
  /**
   * 页码
   */
  page?: number;
  /**
   * 存储方式列表：jsonl、file、table
   */
  storage_type_list?: string[];
  name: string;
}

export interface DatasetsOptionsDataList {
  created_at: string;
  creator_id: string;
  creator_name: string;
  /**
   * 存储库名
   */
  database?: string;
  description: string;
  /**
   * 版本生成失败原因
   */
  error_reason?: string;
  id: number;
  /**
   * 最新版本文件名称
   */
  latest_file_name: string;
  /**
   * 最新版本文件路径
   */
  latest_file_path: string;
  /**
   * 版本大小(字节)
   */
  latest_size: number;
  /**
   * 最新版本存储表
   */
  latest_table?: string;
  /**
   * 最新版本ID
   */
  latest_version: string;
  name: string;
  /**
   * 权限点列表
   */
  perms?: string[];
  /**
   * 存储表字段
   */
  scheams?: DatasetsOptionsDataScheam[];
  src: number;
  /**
   * 生成模型
   */
  src_model: string;
  /**
   *
   * 状态（creating-创建中、create_failed-创建失败、normal-正常、version_updating-版本更新中、version_update_failed-版本更新失败）
   */
  status: string;
  /**
   * 存储格式：file，jsonl
   */
  storage_type: string;
  /**
   * 标签名称列表
   */
  tag_names: string[];
  tags: string[];
  updated_at: string;
}

export interface DatasetsOptionsDataScheam {
  /**
   * 字段中文名
   */
  cn_name?: string;
  /**
   * 字段名
   */
  name?: string;
}

export interface DatasetsOptionsData {
  /**
   * 页大小
   */
  limit: number;
  list: DatasetsOptionsDataList[];
  /**
   * 页码
   */
  page: number;
  /**
   * 总条数
   */
  total: number;
}
