// 请求参数
export interface PythonListParams {
  /** 搜索名称，模糊搜索 */
  name?: string;
  /** 搜索模式：0-不返回子目录中的文件，1-返回子目录中的文件 */
  mode?: 0 | 1;
  /** 页码，从1开始 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}

// 响应结构
export enum PythonItemType {
  Notebook = 'notebook',
  Directory = 'directory'
}

export interface PythonListItem {
  /** 项目标识 */
  id: number;
  /** 名称（文件或文件夹） */
  name: string;
  /** 类型：notebook | directory */
  type: PythonItemType;
  /** 文件的父目录，根目录为 . */
  path: string;
  /** 文件的父目录id */
  path_id: number;
  /** 创建时间，格式：YYYY-MM-DD HH:mm:ss */
  created: string;
  /** 更新时间，格式：YYYY-MM-DD HH:mm:ss */
  last_modified: string;
}

export interface PythonListRes {
  /** 父目录名称 */
  path_name: string;
  /** 父目录id */
  path_id: number;
  /** 列表项 */
  items: PythonListItem[];
  /** 总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
}

// 创建请求/响应
export interface CreatePythonItemReq {
  /** 创建文件/文件夹的位置目录id，若为根目录置为0 */
  path_id: number;
  /** notebook - 文件；directory - 文件夹 */
  type: PythonItemType;
  /** 文件/文件夹名称 */
  name: string;
}

export type CreatePythonItemRes = PythonListItem;

// 重命名请求/响应
export interface RenamePythonItemReq {
  /** 文件id */
  id: number;
  /** 重命名后的名称 */
  name: string;
  /** 文件路径 */
  path: string;
  /** notebook - 文件；directory - 文件夹 */
  type: PythonItemType;
}

export interface RenamePythonItemRes {
  /** 文件id */
  id: number;
}

export interface CopyPythonItemReq {
  /** 被复制文件的id */
  id: number;
  /** 复制后的文件名称 */
  name: string;
}

export type CopyPythonItemRes = PythonListItem;

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

// 打开Python项目响应结构
export interface OpenPythonItemRes {
  /** 任务执行id */
  execid: number;
  /** 运行状态：-1未运行 0失败 1成功 2运行中 */
  running_status: RunningStatus;
  /** Python文件代码内容 */
  data: string;
}
export interface SavePythonItemReq {
  /** 文件id */
  id: number;
  /** Python文件代码内容 */
  data: string;
}

export interface SavePythonItemRes {
  /** 文件id */
  id: number;
  /** 最后修改时间 */
  last_modified: string;
}

export interface RunPythonItemRes {
  /** 任务执行id */
  execid: string;
  /** 文件id */
  id: number;
}

export interface GetRunResultReq {
  /** 任务执行id */
  execid: string;
}

export interface GetRunResultRes {
  /** 运行结果 */
  run_result: string;
  /** 运行状态：0失败 1成功 2运行中 -1未运行 */
  run_status: RunningStatus;
  /** 运行耗时（秒） */
  run_duration: number;
  /** 运行结束时间（格式：yyyy-MM-dd HH:mm） */
  run_end_time: string;
}

export interface GetRunLogReq {
  /** 任务执行id */
  execid: string;
  /** 日志大小 */
  size?: number;
}

export interface GetRunLogRes {
  /** 日志 */
  log: string;
}

export enum OperatorCatalog {
  DATA_CLEANING = '数据清洗类',
  DATA_PARSING = '数据解析类',
  DATA_AUGMENTATION = '数据增强类'
}

export interface GetOperatorListItem {
  /** 算子分类 */
  catalog: string;
  /** 算子列表 */
  op_items: OperatorItem[];
}

export interface OperatorItem {
  /** 算子名称 */
  name: string;
  /** 算子描述 */
  description: string;
  /** 处理逻辑详细描述 */
  detail: string;
  /** 使用方式 */
  usage: {
    /** 输入 */
    input: string;
    /** 输出 */
    output: string;
  };
  /** 使用场景 */
  usage_scenarios: string;
  /** 标签 */
  tags: string[];
  /** 示例代码 */
  sample_code: string;
}

export interface GetExportFileReq {
  /** pyspark文件ID */
  pyspark_id: number;
  /** pyspark任务执行ID */
  pyspark_exec_id: string;
}

export enum StorageType {
  File = 'file',
  Jsonl = 'jsonl'
}

export interface ExportDatasetReq {
  /**
   * 数据集描述
   */
  description?: string;
  /**
   * 文件名列表
   */
  file_names?: string[];
  /**
   * 数据集名称
   */
  name: string;
  /**
   * pyspark文件ID
   */
  pyspark_id: number;
  /**
   * pyspark运行ID
   */
  pyspark_exec_id: string;
  /**
   * 存储类型：file,jsonl
   */
  storage_type: StorageType;
  /**
   * 标签列表
   */
  tag_names?: string[];
}

export interface ExportDatasetRes {
  // 导出任务id
  id: number;
}

export interface GetExportFile {
  /**
   * 修改时间
   */
  file_modify_time: string;
  /**
   * 文件名称
   */
  file_name: string;
  /**
   * 文件大小
   */
  file_size: string;
  /**
   * 文件类型
   */
  file_type: string;
}

export enum ExportStatus {
  /**
   * 导出中
   */
  Exporting = 'exporting',
  /**
   * 导出成功
   */
  ExportSuccess = 'export_success',
  /**
   * 导出失败
   */
  ExportFailed = 'export_failed',
  /**
   * 终止导出
   */
  ExportTerminated = 'export_terminated'
}

export interface GetExportJsonlReq {
  /**
   * pyspark文件ID
   */
  pyspark_id: number;
  /**
   * pyspark任务执行ID
   */
  pyspark_exec_id: string;
}

export interface GetExportJsonlRes {
  /**
   * 表头
   */
  field_names: string[];
  /**
   * 文件名称
   */
  list: any[];
}

export interface GetExportDatasetListReq {
  /**
   * 页码
   */
  page: number;
  /**
   * 页面大小
   */
  page_size: number;
  /**
   * created_at-创建时间
   */
  sort_field?: string;
  /**
   * asc-正序、desc-倒序
   */
  sort_order?: 'asc' | 'desc';
  /**
   * 导出状态（exporting-导出中、export_success-导出成功、export_failed-导出失败、export_terminated-终止导出），可配置多个
   */
  status?: ExportStatus[];
  /**
   * 搜索内容
   */
  file_name?: string;
}

export interface GetExportDatasetListItem {
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 数据集名称
   */
  dataset_name: string;
  /**
   * ID
   */
  id: number;
  /**
   * pyspark文件Id
   */
  pyspark_id: number;
  /**
   * pyspark文件名称
   */
  pyspark_name: string;
  /**
   * 数据集大小(字节)
   */
  size: number;
  /**
   * 导出状态：exporting-导出中、export_success-导出成功、export_failed-导出失败、export_terminated-导出终止
   */
  status: ExportStatus;
}

export interface GetExportDatasetListRes {
  items: GetExportDatasetListItem[];
  /**
   * 页码
   */
  page: number;
  /**
   * 页面大小
   */
  page_size: number;
  /**
   * 总条数
   */
  total: number;
}
