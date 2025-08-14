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
export interface PythonListItem {
  /** 项目标识 */
  id: number;
  /** 名称（文件或文件夹） */
  name: string;
  /** 类型：notebook | directory */
  type: 'notebook' | 'directory';
  /** 文件的父目录，根目录为 . */
  path: string;
  /** 创建时间，格式：YYYY-MM-DD HH:mm:ss */
  created: string;
  /** 更新时间，格式：YYYY-MM-DD HH:mm:ss */
  last_modified: string;
}

export interface PythonListRes {
  /** 父目录名称 */
  path_name: string;
  /** 列表项 */
  items: PythonListItem[];
  /** 总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
}
