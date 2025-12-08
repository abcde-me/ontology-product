export interface GetDatasetListReq {
  /**
   * 数据集名称
   */
  name?: string;
  /**
   * 数据集类型：file、jsonl、table;多个以","分隔
   */
  storage_type_list?: string[];
  /**
   * 表名称
   */
  table_name?: string;
}

export interface Scheam {
  /**
   * 字段中文名
   */
  cn_name?: string;
  /**
   * 字段名称
   */
  name?: string;
}

export interface DatasetListItem {
  perms: Array<string>;
  /**
   * 存储数据库名称
   */
  database: string;
  /**
   * 数据集ID
   */
  id: number;
  /**
   * 最新版本大小(字节)
   */
  size: number;
  /**
   * 最新版本存储表名
   */
  table?: string;
  /**
   * 最新版本ID
   */
  latest_version: string;
  /**
   * 数据集名称
   */
  name: string;
  /**
   * 存储表字段
   */
  scheams?: Scheam[];
  /**
   * 数据集状态
   */
  status: string;
  /**
   * 数据集类型：file、jsonl、table
   */
  storage_type: 'file' | 'jsonl' | 'table';
  /**
   * 数据集文件key
   */
  file_key?: string;
}

export interface GetDatasetListRes {
  /**
   * 页大小
   */
  limit: number;
  /**
   * 数据集列表
   */
  list: DatasetListItem[];
  /**
   * 页码
   */
  page: number;
  /**
   * 总条数
   */
  total: number;
}

export interface DatasetVersionFileParams {
  /**
   * 数据集ID
   */
  id: number;
  /**
   * 数据集版本号
   */
  // version_id: string;
  /**
   * 页码
   */
  page?: number;
  /**
   * 页大小
   */
  limit?: number;
  /**
   * 文件名称
   */
  file_name?: string;
}

export interface DatasetVersionFileItem {
  /**
   * 创建时间
   */
  created_at: string;
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
  file_type: 'file' | 'jsonl' | 'table';
}

export interface DatasetVersionFileRes {
  /**
   * 总条数
   */
  total: number;
  /**
   * 页码
   */
  page: number;
  /**
   * 页大小
   */
  limit: number;
  /**
   * 数据集文件列表
   */
  list: DatasetVersionFileItem[];
}
