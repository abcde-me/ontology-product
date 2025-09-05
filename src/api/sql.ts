import UAPI from '@/api';
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
import {
  CreateSqlScriptData,
  CreateSqlScriptParams,
  DatasetListParams,
  ExportSqlResultData,
  ExportSqlResultListData,
  ExportSqlResultListParams,
  ExportSqlResultParams,
  ExportSqlResultVersionData,
  ExportSqlResultVersionParams,
  FileListParams,
  FileListData,
  RenameSqlScriptParams,
  RunCancelSqlScriptParams,
  RunResultSqlScriptData,
  RunResultSqlScriptParams,
  RunSqlScriptData,
  SqlScriptDetailData,
  SqlScriptListData,
  SqlScriptListParams,
  TableDetailData,
  TableDetailParams,
  TableListParams,
  TableListData,
  updateSqlScriptParams,
  SqlTaskDetailData
} from '@/types/sqlApi';

/** 查询目标目录文件列表 卷详情 文件列表 */
export async function getFileList(
  params: FileListParams
): Promise<ApiRes<FileListData>> {
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

/** 查询源库下的表详情 库详情 表列表 */
export async function getTableList(
  params: TableListParams
): Promise<ApiRes<TableListData>> {
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

/** 查询源库下的表详情 表详情 */
export async function getTableDetail(
  params: TableDetailParams
): Promise<ApiRes<TableDetailData>> {
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

/** 数据集目录 */
export async function getDatasetList(
  params: DatasetListParams
): Promise<ApiRes<{}>> {
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

/** 创建SQL脚本 */
export async function createSqlScript(
  params: CreateSqlScriptParams
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlCreateApi({}).post(params).inRegion().do();
}

/** 重命名SQL脚本 */
export async function renameSqlScript(
  id: number,
  params: RenameSqlScriptParams
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlRenameApi({ script_id: id })
    .put(params)
    .inRegion()
    .do();
}

/** 编辑SQL脚本 */
export async function updateSqlScript(
  id: number,
  params: updateSqlScriptParams
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlSaveApi({ scriptId: id })
    .put(params)
    .inRegion()
    .do();
}

/** 获取SQL脚本列表 */
export async function getSqlScriptList(
  params: SqlScriptListParams
): Promise<ApiRes<SqlScriptListData>> {
  return await UAPI.RES.sqlListApi({}).get(params).inRegion().do();
}

/** 删除SQL脚本 */
export async function deleteSqlScript(id: string): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlDeleteApi({ script_id: id })
    .delete()
    .inRegion()
    .do();
}

/** SQL脚本运行 */
export async function runSqlScript(
  id: string
): Promise<ApiRes<RunSqlScriptData>> {
  return await UAPI.RES.sqlRunApi({ script_id: id }).put().inRegion().do();
}

/** SQL脚本运行取消 */
export async function runCancelSqlScript(
  id: string,
  params: RunCancelSqlScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlRunCancelApi({ script_id: id })
    .put(params)
    .inRegion()
    .do();
}

/** 获取SQL脚本运行结果 前端可5-10s轮询一次 */
export async function getRunResultSqlScript(
  id: string,
  params: RunResultSqlScriptParams
): Promise<ApiRes<RunResultSqlScriptData>> {
  return await UAPI.RES.sqlRunResultApi({ script_id: id })
    .get(params)
    .inRegion()
    .do();
}

/** 获取脚本详情 */
export async function getSqlScriptDetail(
  id: string
): Promise<ApiRes<SqlScriptDetailData>> {
  return await UAPI.RES.sqlOpenApi({ script_id: id }).get().inRegion().do();
}

/** SQL脚本复制 */
export async function copySqlScript(
  id: string
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlCopyApi({ script_id: id }).post().inRegion().do();
}

/** SQL执行结果导出到新数据集 */
export async function exportSqlResult(
  id: string,
  params: ExportSqlResultParams
): Promise<ApiRes<ExportSqlResultData>> {
  return await UAPI.RES.sqlExportDataset({ script_id: id })
    .post(params)
    .inRegion()
    .do();
}

/** SQL执行结果导出到新版本 */
export async function exportSqlResultVersion(
  id: string,
  params: ExportSqlResultVersionParams
): Promise<ApiRes<ExportSqlResultVersionData>> {
  return await UAPI.RES.sqlExportDatasetVersion({ script_id: id })
    .post(params)
    .inRegion()
    .do();
}

/** SQL结果导出到数据集列表 */
export async function getExportSqlResultList(
  params: ExportSqlResultListParams
): Promise<ApiRes<ExportSqlResultListData>> {
  return await UAPI.RES.sqlExportDatasetList({}).get(params).inRegion().do();
}

/** SQL结果导出任务停止 */
export async function calcelExportSqlTask(id: string): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetStopApi({ id: id })
    .post()
    .inRegion()
    .do();
}

/** SQL结果导出任务停止 */
export async function retryExportSqlTask(id: string): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetRetryApi({ id: id })
    .post()
    .inRegion()
    .do();
}

/** 获取导出任务的SQL详情 */
export async function getSqlTaskDetail(id: string): Promise<SqlTaskDetailData> {
  return await UAPI.RES.sqlExportDatasetDetailApi({ id: id })
    .post()
    .inRegion()
    .do();
}
