import UAPI from '@/api';

interface FileListParams {
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

interface FileItem {
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

interface FileListRes {
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 页大小 */
  limit: number;
  /** 列表数据 */
  list: FileItem[];
}

/** 查询目标目录文件列表 卷详情 文件列表 */
export async function getFileList(
  params: FileListParams
): Promise<ApiRes<FileListRes>> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/directory/dst/file
  // return await UAPI.RES.FileListApi().post(params).inRegion().do();

  return Promise.resolve({
    code: '',
    message: 'ok',
    requestId: 'AIMDP-473529c1-1abb-4ed7-953d-4975e5a94daf',
    status: 200,
    data: {
      total: 1,
      page: 1,
      limit: 10,
      list: [
        {
          id: 10001,
          FileName: 'data_01.csv',
          file_type: 'csv',
          created_at: '2025-06-23 10:00:00',
          file_size: 2048,
          generated_at: '2025-06-23 10:00:00',
          connection: 1
        }
      ]
    }
  });
}

interface TableListParams {
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

interface TableItem {
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

interface TableListRes {
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 页大小 */
  limit: number;
  /** 列表数据 */
  list: TableItem[];
}

/** 查询源库下的表详情 库详情 表列表 */
export async function getTableList(
  params: TableListParams
): Promise<ApiRes<TableListRes>> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/directory/get-table-list
  // return await UAPI.RES.TableListApi().post(params).inRegion().do();

  return Promise.resolve({
    code: '',
    message: 'ok',
    requestId: 'AIMDP-473529c1-1abb-4ed7-953d-4975e5a94daf',
    status: 200,
    data: {
      total: 1,
      page: 1,
      limit: 10,
      list: [
        {
          id: 10001,
          table_name: '员工信息表',
          db_type: 'MySQL',
          cnt_rows: '2048',
          created_at: '2025-06-23 10:00:00',
          generated_at: '2025-06-23 10:00:00',
          connection: 1
        }
      ]
    }
  });
}

interface TableDetailParams {
  /** 文件所属目录ID，卷ID */
  path_id: string;
  /** 库名 */
  database: string;
  /** 表名 */
  table: string;
  /** 获取的信息类型 sample -> 示例数据，ddl -> 表定义，loader -> 载入信息 */
  detail_type: string;
}

interface TableDetailColumnItem {
  name: string;
  type: string;
  comment: string;
}

interface TableDetailRes {
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

/** 查询源库下的表详情 表详情 */
export async function getTableDetail(
  params: TableDetailParams
): Promise<ApiRes<TableDetailRes>> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/directory/get-table-detail
  // return await UAPI.RES.TableListApi().post(params).inRegion().do();

  return Promise.resolve({
    code: '',
    message: 'ok',
    requestId: 'AIMDP-473529c1-1abb-4ed7-953d-4975e5a94daf',
    status: 200,
    data: {
      request_params: {},
      sample: {
        columns: ['id', 'name', 'age', 'address'],
        data: [
          { id: '1001', name: '张三', age: '18', address: '北京市朝阳区' },
          { id: '1002', name: '李四', age: '20', address: '上海市浦东新区' },
          { id: '1003', name: '王五', age: '22', address: '深圳市南山区' },
          { id: '1004', name: '赵六', age: '19', address: '广州市天河区' },
          { id: '1005', name: '钱七', age: '21', address: '杭州市西湖区' }
        ]
      },
      ddl: {
        tableInfo: `CREATE TABLE \`employee_info\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(50) NOT NULL,
          \`age\` int NOT NULL,
          \`address\` varchar(100) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        columns: [
          { name: 'id', type: 'int', comment: '员工ID' },
          { name: 'name', type: 'varchar(50)', comment: '员工姓名' },
          { name: 'age', type: 'int', comment: '员工年龄' },
          { name: 'address', type: 'varchar(100)', comment: '员工地址' }
        ]
      },
      loader: {
        created_time: '2025-06-23 10:00:00',
        updated_time: '2025-06-24 12:00:00',
        username: 'admin',
        connector_name: '企业微信数据源',
        load_task_name: '员工信息数据导入任务'
      }
    }
  });
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

export interface DatasetListResponse {
  msg: string;
  stat: number;
  code: number;
  data: {};
}

/** 数据集目录 */
export async function getDatasetList(
  params: DatasetListParams
): Promise<DatasetListResponse> {
  return UAPI.RES.datasetsApi({}).post(params).inRegion().do();
}

// export interface CatalogListParams {
//   /** 获取目录类型，0: 获取所有数据目录，1: 获取源数据目录，2：获取目标数据目录 */
//   root_type: number;
//   /** 文件夹类型，0: 获取全部，2: 仅获取卷，3：仅获取库，默认0 */
//   dir_type?: number;
//   /** 搜索关键字 TODO: 匹配字段？ */
//   search?: string;
// }

// export interface CatalogItem {
//   /** id */
//   id: string | number;
//   /** 名称 */
//   name: string;
//   /** 父节点 */
//   parent_id: string | number;
//   /** 1: 元数据目录 2: 卷 3: 库 4: 表 */
//   type: number;
//   /** 子节点 */
//   children: {
//     volume?: CatalogItem[],
//     db?: CatalogItem[],
//     table?: CatalogItem[]
//   }
//   type_name: 'catalog' | 'volume' | 'db' | 'table';
//   perms: string[];
//   base_dir: string;
// }

// export interface CatalogListResponse {
//   msg: string;
//   stat: number;
//   code: number;
//   data: {
//     src: CatalogItem[],
//   };
// }

// /** 源数据目录 */
// export async function getCatalogList(
//   param: CatalogListParams
// ): Promise<CatalogListResponse> {
//   const defaultParam: CatalogListParams = {
//     root_type: 1,
//     dir_type: 3,
//     search: ''
//   }
//   const targetParam = { ...defaultParam, ...param }
//   return await UAPI.RES.catalogListApi({}).get(targetParam).inRegion().do();
// }
