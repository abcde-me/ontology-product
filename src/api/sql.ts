import UAPI from '@/api';
import { Get, Post } from '@/utils/request';
import {
  PythonListRes,
  PythonListParams,
  PythonItemType,
  CreatePythonItemReq,
  CreatePythonItemRes,
  RenamePythonItemReq,
  RenamePythonItemRes,
  CopyPythonItemReq,
  CopyPythonItemRes,
  OpenPythonItemRes,
  SavePythonItemReq,
  SavePythonItemRes,
  RunPythonItemRes,
  GetRunResultReq,
  GetRunResultRes,
  RunningStatus,
  GetRunLogReq,
  GetRunLogRes
} from '@/types/pythonApi';

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

// -------------------------------- 目前先用pyspark api 开发，后续再使用sql api 开发 --------------------------------

// // 获取数据目录列表
// export async function getPythonList(
//   id: string,
//   params: PythonListParams
// ): Promise<ApiRes<PythonListRes>> {
//   // 简单的模拟：根目录返回2个目录 + 1个文件；不同目录id返回不同的内容
//   const now = '2025-08-18 14:00';
//   const later = '2025-08-18 15:00';

//   let items: PythonListRes['items'] = [];
//   let path_name = '';

//   switch (String(id || '')) {
//     case '0':
//       path_name = '';
//       items = [
//         {
//           id: 1001,
//           name: '项目A',
//           type: PythonItemType.Directory,
//           path: '/',
//           path_id: 1,
//           created: now,
//           last_modified: later
//         },
//         {
//           id: 1002,
//           name: '数据集',
//           type: PythonItemType.Directory,
//           path: '/',
//           path_id: 1,
//           created: now,
//           last_modified: later
//         },
//         {
//           id: 1003,
//           name: '脚本1.py',
//           type: PythonItemType.Notebook,
//           path: '/',
//           path_id: 1,
//           created: now,
//           last_modified: later
//         }
//       ];
//       // items = [];
//       break;
//     case '1001':
//       path_name = '项目A';
//       items = [
//         {
//           id: 10011,
//           name: '子目录-代码',
//           type: PythonItemType.Directory,
//           path: '/项目A',
//           path_id: 1001,
//           created: now,
//           last_modified: later
//         },
//         {
//           id: 10012,
//           name: 'main.py',
//           type: PythonItemType.Notebook,
//           path: '/项目A',
//           path_id: 1001,
//           created: now,
//           last_modified: later
//         },
//         {
//           id: 10013,
//           name: 'utils.py',
//           type: PythonItemType.Notebook,
//           path: '/项目A',
//           path_id: 1001,
//           created: now,
//           last_modified: later
//         }
//       ];
//       break;
//     case '10011':
//       path_name = '子目录-代码';
//       items = [
//         {
//           id: 100111,
//           name: 'train.py',
//           type: PythonItemType.Notebook,
//           path: '/项目A/子目录-代码',
//           path_id: 10011,
//           created: now,
//           last_modified: later
//         },
//         {
//           id: 100112,
//           name: 'eval.py',
//           type: PythonItemType.Notebook,
//           path: '/项目A/子目录-代码',
//           path_id: 10011,
//           created: now,
//           last_modified: later
//         }
//       ];
//       break;
//     case '1002':
//       path_name = '数据集';
//       items = [
//         {
//           id: 10021,
//           name: '加载数据.ipynb',
//           type: PythonItemType.Notebook,
//           path: '/数据集',
//           path_id: 1002,
//           created: now,
//           last_modified: later
//         }
//       ];
//       break;
//     default:
//       path_name = '';
//       items = [];
//       break;
//   }

//   return Promise.resolve({
//     code: '200',
//     status: 200,
//     requestId: '',
//     message: 'success',
//     data: {
//       path_id: Number(id),
//       path_name,
//       items,
//       total: items.length,
//       page: 1,
//       page_size: 10
//     }
//   });

//   // TODO: 联调
//   // return await UAPI.RES.pythonListApi({ pyspark_id: id })
//   //   .get(params)
//   //   .inRegion()
//   //   .do();
// }

// 文件/目录创建
export async function createPythonItem(
  params: CreatePythonItemReq
): Promise<ApiRes<CreatePythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonCreateApi({}).post(params).inRegion().do();

  // Mock implementation per spec
  const now = '2025-08-18 14:00';
  const later = '2025-08-18 15:00';
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      id: 2201,
      name: '加载数据.ipynb',
      type: PythonItemType.Notebook,
      path: '/数据集',
      path_id: 1002,
      created: now,
      last_modified: later
    }
  });
}

// 文件/目录重命名
export async function renamePythonItem(
  id: string,
  params: RenamePythonItemReq
): Promise<ApiRes<RenamePythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonRenameApi({ pyspark_id: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  // Mock implementation per spec
  const targetId = Number(id) || params.id;
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      id: targetId
    }
  });
}

// 文件/目录删除
export async function deletePythonItem(id: string): Promise<ApiRes<null>> {
  // TODO: 联调
  // return await UAPI.RES.pythonDeleteApi({ pyspark_id: id })
  // .delete({})
  // .inRegion()
  // .do();

  // Mock implementation per spe
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: null
  });
}

// 复制文件
export async function copyPythonItem(
  id: string,
  params: CopyPythonItemReq
): Promise<ApiRes<CopyPythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonCopyApi({ pyspark_id: id })
  //   .post(params)
  //   .inRegion()
  //   .do();

  // Mock implementation per spe
  const now = '2025-08-18 14:00';
  const later = '2025-08-18 15:00';
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      id: 2201,
      path_id: 1002,
      name: '加载数据.ipynb',
      type: PythonItemType.Notebook,
      path: '/数据集',
      created: now,
      last_modified: later
    }
  });
}

// 打开文件
export async function openPythonItem(
  id: string
): Promise<ApiRes<OpenPythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonOpenApi({ pyspark_id: id })
  //   .get({})
  //   .inRegion()
  //   .do();

  // Mock implementation per spe
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      execid: 1,
      running_status: 1,
      data: `# Python文件代码内容示例
      import pandas as pd
      import numpy as np
      import matplotlib.pyplot as plt

      # 数据加载
      def load_data():
      """加载示例数据"""
      data = pd.DataFrame({
          'x': np.random.randn(100),
          'y': np.random.randn(100)
      })
      return data

      # 数据处理
      def process_data(df):
      """处理数据"""
      df['z'] = df['x'] + df['y']
      return df

      # 数据可视化
      def visualize_data(df):
      """可视化数据"""
      plt.figure(figsize=(10, 6))
      plt.scatter(df['x'], df['y'], c=df['z'], cmap='viridis')
      plt.colorbar(label='z value')
      plt.xlabel('X values')
      plt.ylabel('Y values')
      plt.title('Data Visualization')
      plt.show()

      # 主函数
      if __name__ == "__main__":
      # 加载数据
      df = load_data()
      print("数据加载完成，共", len(df), "行")

      # 处理数据
      df = process_data(df)
      print("数据处理完成")

      # 显示统计信息
      print("\\n数据统计信息:")
      print(df.describe())

      # 可视化数据
      visualize_data(df)
      print("数据可视化完成")`
    }
  });
}

// 修改（保存）文件
export async function savePythonItem(
  id: string,
  params: SavePythonItemReq
): Promise<ApiRes<SavePythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonSaveApi({ pyspark_id: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  // Mock implementation per spe
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      id: 2201,
      last_modified: '2025-08-18 15:00'
    }
  });
}

// 运行代码
export async function runPythonItem(
  id: string
): Promise<ApiRes<RunPythonItemRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonRunApi({ pyspark_id: id })
  //   .put({})
  //   .inRegion()
  //   .do();

  // Mock implementation per spe
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      execid: '1',
      id: 2201
    }
  });
}

// 获取运行结果
export async function getRunResult(
  id: string,
  params: GetRunResultReq
): Promise<ApiRes<GetRunResultRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonRunResultApi({ pyspark_id: id })
  //   .get(params)
  //   .inRegion()
  //   .do();

  // Mock implementation per spe
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      run_result: '运行成功',
      run_status: RunningStatus.SUCCESS,
      run_duration: 10,
      run_end_time: '2025-08-18 15:00'
    }
  });
}

// 获取日志
export async function getRunLog(
  id: string,
  params: GetRunLogReq
): Promise<ApiRes<GetRunLogRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonRunLogApi({ pyspark_id: id })
  //   .get(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      log: '运行成功'
    }
  });
}

export interface CreateSqlScriptParams {
  script_content?: string;
  script_desc?: string;
  script_name: string;
  /** 用户id */
  uid: string;
}

export interface SqlScriptData {
  script_id: string;
}

export interface SqlScriptRes {
  code: number;
  data: SqlScriptData;
  message: string;
  status: number;
}

/** 创建SQL脚本 */
export async function createSqlScript(
  params: CreateSqlScriptParams
): Promise<SqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/create
  // return UAPI.RES.createSqlScript({})
  //   .post(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    code: 200,
    data: {
      script_id: '1'
    },
    message: 'ok',
    status: 200
  });
}

export interface RenameSqlScriptParams {
  script_name: string;
}

/** 重命名SQL脚本 */
export async function renameSqlScript(
  params: RenameSqlScriptParams
): Promise<SqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/rename
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    code: 200,
    data: {
      script_id: '1'
    },
    message: 'ok',
    status: 200
  });
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

/** 编辑SQL脚本 */
export async function updateSqlScript(
  params: updateSqlScriptParams
): Promise<SqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/edit
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    code: 200,
    data: {
      script_id: '1'
    },
    message: 'ok',
    status: 200
  });
}

interface SqlScriptListParams {
  /** 页码 */
  page?: number;
  /** 页大小 */
  page_size?: number;
  /** 搜索内容 */
  search_content?: string;
}

export interface SqlScriptListRes {
  code: number;
  data: {
    items: SqlScriptItem[];
    page: string;
    page_size: string;
    total: string;
  };
  message: string;
  status: number;
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

/** 获取SQL脚本列表 */
export async function getSqlScriptList(
  params: SqlScriptListParams
): Promise<SqlScriptListRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/list
  // return await UAPI.RES.getSqlScriptList({})
  //   .GET(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      items: [
        {
          script_id: 1,
          script_name: 'SQL查询 2025-06-06 14:14:14',
          script_desc: 'string',
          dependent_tables: 'string',
          data_set_name: 'string',
          user_account: 'string',
          create_time: 'string',
          update_time: 'string',
          perms: ['string']
        },
        {
          script_id: 2,
          script_name: 'SQL查询 2025-06-06 13:14:14',
          script_desc: 'string',
          dependent_tables: 'string',
          data_set_name: 'string',
          user_account: 'string',
          create_time: 'string',
          update_time: 'string',
          perms: ['string']
        },
        {
          script_id: 3,
          script_name: 'SQL查询 2025-06-06 12:14:14',
          script_desc: 'string',
          dependent_tables: 'string',
          data_set_name: 'string',
          user_account: 'string',
          create_time: 'string',
          update_time: 'string',
          perms: ['string']
        },
        {
          script_id: 4,
          script_name: 'SQL查询 2025-06-06 11:14:14',
          script_desc: 'string',
          dependent_tables: 'string',
          data_set_name: 'string',
          user_account: 'string',
          create_time: 'string',
          update_time: 'string',
          perms: ['string']
        },
        {
          script_id: 5,
          script_name: 'SQL查询 2025-06-06 10:14:14',
          script_desc: 'string',
          dependent_tables: 'string',
          data_set_name: 'string',
          user_account: 'string',
          create_time: 'string',
          update_time: 'string',
          perms: ['string']
        }
      ],
      page: 'string',
      page_size: 'string',
      total: 'string'
    },
    status: 200,
    code: 0
  });
}

export interface DeleteSqlScriptParams {
  script_id: string;
}

export interface DeleteSqlScriptRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** 删除SQL脚本 */
export async function deleteSqlScript(
  params: DeleteSqlScriptParams
): Promise<DeleteSqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/delete
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .delete()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {},
    status: 200,
    code: 0
  });
}

export interface RunSqlScriptParams {
  script_id: string;
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

export interface RunSqlScriptRes {
  code: number;
  data: RunSqlScriptData;
  message: string;
  status: number;
}

/** SQL脚本运行 */
export async function runSqlScript(
  params: RunSqlScriptParams
): Promise<RunSqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/run
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0,
      script_execid: 'string',
      warning_msg: 'string'
    },
    status: 200,
    code: 0
  });
}

export interface RunCancelSqlScriptParams {
  script_id: string;
  script_execid: string;
}

export interface RunCancelSqlScriptRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** SQL脚本运行取消 */
export async function runCancelSqlScript(
  params: RunCancelSqlScriptParams
): Promise<RunCancelSqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/run_cancel
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {},
    status: 200,
    code: 0
  });
}

export interface RunResultSqlScriptParams {
  script_id: string;
  script_execid?: string;
  size?: string;
}

export interface RunResultItem {
  data: string;
  field4: string;
  id: string;
  pk_id: number;
}

export interface RunResultSqlScriptRes {
  code: number;
  data: {
    /**
     * 运行耗时 单位：毫秒
     */
    run_duration: string;
    /**
     * 运行状态 0-失败 1-成功 2-运行中
     */
    run_status: number;
    /**
     * 执行结果
     */
    sql_result: {
      list: RunResultItem;
    }[];
  };
  message: string;
  status: number;
}

/** 获取SQL脚本运行结果 前端可5-10s轮询一次 */
export async function runResultSqlScript(
  params: RunResultSqlScriptParams
): Promise<RunResultSqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/get_run_result
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .put(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      sql_result: [
        {
          list: {
            pk_id: 0,
            id: 'string',
            data: 'string',
            field4: 'string'
          }
        }
      ],
      run_status: 0,
      run_duration: 'string'
    },
    status: 200,
    code: 0
  });
}

export interface SqlScriptDetailParams {
  script_id: string;
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

export interface SqlScriptDetailRes {
  code: number;
  data: SqlScriptDetailData;
  message: string;
  status: number;
}

/** 获取脚本详情 */
export async function getSqlScriptDetail(
  params: SqlScriptDetailParams
): Promise<SqlScriptDetailRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/info
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .get()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0,
      script_name: 'string',
      script_content: 'string',
      script_desc: 'string',
      script_execid: 'string',
      create_time: 'string',
      update_time: 'string',
      persm: ['string']
    },
    status: 200,
    code: 0
  });
}

export interface CopySqlScriptParams {
  script_id: string;
}

export interface CopySqlScriptRes {
  code: number;
  data: {
    script_id: number;
  };
  message: string;
  status: number;
}

/** SQL脚本复制 */
export async function copySqlScript(
  params: CopySqlScriptParams
): Promise<CopySqlScriptRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}

export interface ExportSqlResultParams {
  script_id: string;
}

export interface ExportSqlResultRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** SQL执行结果导出到新数据集 */
export async function exportSqlResult(
  params: ExportSqlResultParams
): Promise<ExportSqlResultRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}

export interface ExportSqlResultVersionParams {
  script_id: string;
}

export interface ExportSqlResultVersionRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** SQL执行结果导出到新版本 */
export async function exportSqlResultVersion(
  params: ExportSqlResultVersionParams
): Promise<ExportSqlResultVersionRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}

export interface ExportSqlResultListParams {
  script_id: string;
}

export interface ExportSqlResultListRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** SQL结果导出到数据集列表 */
export async function getExportSqlResultList(
  params: ExportSqlResultListParams
): Promise<ExportSqlResultListRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}

export interface CalcelExportSqlTaskParams {
  script_id: string;
}

export interface CalcelExportSqlTaskRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** SQL结果导出任务停止 */
export async function calcelExportSqlTask(
  params: CalcelExportSqlTaskParams
): Promise<CalcelExportSqlTaskRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}

export interface SqlTaskDetailParams {
  script_id: string;
}

export interface SqlTaskDetailRes {
  code: number;
  data: {};
  message: string;
  status: number;
}

/** 获取导出任务的SQL详情 */
export async function getSqlTaskDetail(
  params: SqlTaskDetailParams
): Promise<SqlTaskDetailRes> {
  // TODO: 联调 10.1.4.73:31183/api/aimdp/v1/sql_script/{script_id}/copy
  // return await UAPI.RES.renameSqlScript({ scriptId: id })
  //   .post()
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    message: 'string',
    data: {
      script_id: 0
    },
    status: 200,
    code: 0
  });
}
