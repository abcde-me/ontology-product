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
  GetRunLogRes,
  GetOperatorListItem,
  OperatorCatalog,
  ExportDatasetReq,
  ExportDatasetRes,
  ExportFileRes,
  GetExportFileReq,
  GetExportDatasetListReq,
  GetExportDatasetListRes,
  ExportStatus
} from '@/types/pythonApi';

// 获取数据目录列表
export async function getPythonList(
  id: string,
  params: PythonListParams
): Promise<ApiRes<PythonListRes>> {
  // 简单的模拟：根目录返回2个目录+1个文件；不同目录id返回不同的内容
  // const now = '2025-08-18 14:00';
  // const later = '2025-08-18 15:00';

  // let items: PythonListRes['items'] = [];
  // let path_name = '';

  // switch (String(id || '')) {
  //   case '':
  //     path_name = '';
  //     // items = [
  //     //   {
  //     //     id: 1001,
  //     //     name: '项目A',
  //     //     type: PythonItemType.Directory,
  //     //     path: '/',
  //     //     path_id: 1,
  //     //     created: now,
  //     //     last_modified: later
  //     //   },
  //     //   {
  //     //     id: 1002,
  //     //     name: '数据集',
  //     //     type: PythonItemType.Directory,
  //     //     path: '/',
  //     //     path_id: 1,
  //     //     created: now,
  //     //     last_modified: later
  //     //   },
  //     //   {
  //     //     id: 1003,
  //     //     name: '脚本1.py',
  //     //     type: PythonItemType.Notebook,
  //     //     path: '/',
  //     //     path_id: 1,
  //     //     created: now,
  //     //     last_modified: later
  //     //   }
  //     // ];
  //     items = [];
  //     break;
  //   case '1001':
  //     path_name = '项目A';
  //     items = [
  //       {
  //         id: 10011,
  //         name: '子目录-代码',
  //         type: PythonItemType.Directory,
  //         path: '/项目A',
  //         path_id: 1001,
  //         created: now,
  //         last_modified: later
  //       },
  //       {
  //         id: 10012,
  //         name: 'main.py',
  //         type: PythonItemType.Notebook,
  //         path: '/项目A',
  //         path_id: 1001,
  //         created: now,
  //         last_modified: later
  //       },
  //       {
  //         id: 10013,
  //         name: 'utils.py',
  //         type: PythonItemType.Notebook,
  //         path: '/项目A',
  //         path_id: 1001,
  //         created: now,
  //         last_modified: later
  //       }
  //     ];
  //     break;
  //   case '10011':
  //     path_name = '子目录-代码';
  //     items = [
  //       {
  //         id: 100111,
  //         name: 'train.py',
  //         type: PythonItemType.Notebook,
  //         path: '/项目A/子目录-代码',
  //         path_id: 10011,
  //         created: now,
  //         last_modified: later
  //       },
  //       {
  //         id: 100112,
  //         name: 'eval.py',
  //         type: PythonItemType.Notebook,
  //         path: '/项目A/子目录-代码',
  //         path_id: 10011,
  //         created: now,
  //         last_modified: later
  //       }
  //     ];
  //     break;
  //   case '1002':
  //     path_name = '数据集';
  //     items = [
  //       {
  //         id: 10021,
  //         name: '加载数据.ipynb',
  //         type: PythonItemType.Notebook,
  //         path: '/数据集',
  //         path_id: 1002,
  //         created: now,
  //         last_modified: later
  //       }
  //     ];
  //     break;
  //   default:
  //     path_name = '';
  //     items = [];
  //     break;
  // }

  // return Promise.resolve({
  //   code: '200',
  //   status: 200,
  //   requestId: '',
  //   message: 'success',
  //   data: {
  //     path_id: Number(id),
  //     path_name,
  //     items,
  //     total: items.length,
  //     page: 1,
  //     page_size: 10
  //   }
  // });

  // TODO: 联调
  // console.log('getPythonList', pyspark_id, params);
  return await UAPI.RES.pythonListApi({ pyspark_id: id })
    .get(params)
    .inRegion()
    .do();
}

// 文件/目录创建
export async function createPythonItem(
  params: CreatePythonItemReq
): Promise<ApiRes<CreatePythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonCreateApi({}).post(params).inRegion().do();

  // Mock implementation per spec
  // const now = '2025-08-18 14:00';
  // const later = '2025-08-18 15:00';
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     id: 2201,
  //     name: '加载数据.ipynb',
  //     type: PythonItemType.Notebook,
  //     path: '/数据集',
  //     path_id: 1002,
  //     created: now,
  //     last_modified: later
  //   }
  // });
}

// 文件/目录重命名
export async function renamePythonItem(
  id: string,
  params: RenamePythonItemReq
): Promise<ApiRes<RenamePythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonRenameApi({ pyspark_id: id })
    .put(params)
    .inRegion()
    .do();

  // Mock implementation per spec
  // const targetId = Number(id) || params.id;
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     id: targetId
  //   }
  // });
}

// 文件/目录删除
export async function deletePythonItem(id: string): Promise<ApiRes<null>> {
  // TODO: 联调
  return await UAPI.RES.pythonDeleteApi({ pyspark_id: id })
    .delete({})
    .inRegion()
    .do();

  // Mock implementation per spe
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: null
  // });
}

// 复制文件
export async function copyPythonItem(
  id: string,
  params: CopyPythonItemReq
): Promise<ApiRes<CopyPythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonCopyApi({ pyspark_id: id })
    .post(params)
    .inRegion()
    .do();

  // Mock implementation per spe
  // const now = '2025-08-18 14:00';
  // const later = '2025-08-18 15:00';
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     id: 2201,
  //     path_id: 1002,
  //     name: '加载数据.ipynb',
  //     type: PythonItemType.Notebook,
  //     path: '/数据集',
  //     created: now,
  //     last_modified: later
  //   }
  // });
}

// 打开文件
export async function openPythonItem(
  id: string
): Promise<ApiRes<OpenPythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonOpenApi({ pyspark_id: id })
    .get({})
    .inRegion()
    .do();

  // Mock implementation per spe
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     execid: 1,
  //     running_status: 1,
  //     //       data: `# Python文件代码内容示例
  //     // import pandas as pd
  //     // import numpy as np
  //     // import matplotlib.pyplot as plt

  //     // # 数据加载
  //     // def load_data():
  //     // """加载示例数据"""
  //     // data = pd.DataFrame({
  //     //     'x': np.random.randn(100),
  //     //     'y': np.random.randn(100)
  //     // })
  //     // return data

  //     // # 数据处理
  //     // def process_data(df):
  //     // """处理数据"""
  //     // df['z'] = df['x'] + df['y']
  //     // return df

  //     // # 数据可视化
  //     // def visualize_data(df):
  //     // """可视化数据"""
  //     // plt.figure(figsize=(10, 6))
  //     // plt.scatter(df['x'], df['y'], c=df['z'], cmap='viridis')
  //     // plt.colorbar(label='z value')
  //     // plt.xlabel('X values')
  //     // plt.ylabel('Y values')
  //     // plt.title('Data Visualization')
  //     // plt.show()

  //     // # 主函数
  //     // if __name__ == "__main__":
  //     // # 加载数据
  //     // df = load_data()
  //     // print("数据加载完成，共", len(df), "行")

  //     // # 处理数据
  //     // df = process_data(df)
  //     // print("数据处理完成")

  //     // # 显示统计信息
  //     // print("\\n数据统计信息:")
  //     // print(df.describe())

  //     // # 可视化数据
  //     // visualize_data(df)
  //     // print("数据可视化完成")`
  //     data: ''
  //   }
  // });
}

// 修改（保存）文件
export async function savePythonItem(
  id: string,
  params: SavePythonItemReq
): Promise<ApiRes<SavePythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonSaveApi({ pyspark_id: id })
    .put(params)
    .inRegion()
    .do();

  // Mock implementation per spe
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     id: 2201,
  //     last_modified: '2025-08-18 15:00'
  //   }
  // });
}

// 运行代码
export async function runPythonItem(
  id: string
): Promise<ApiRes<RunPythonItemRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonRunApi({ pyspark_id: id })
    .put({})
    .inRegion()
    .do();

  // Mock implementation per spe
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     execid: '1',
  //     id: 2201
  //   }
  // });
}

// 获取运行结果
export async function getRunResult(
  id: string,
  params: GetRunResultReq
): Promise<ApiRes<GetRunResultRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonRunResultApi({ pyspark_id: id })
    .get(params)
    .inRegion()
    .do();

  // Mock implementation per spe
  // return Promise.resolve({
  //   status: 200,
  //   code: '',
  //   message: 'OK',
  //   requestId: '1',
  //   data: {
  //     run_result: '运行成功',
  //     run_status: RunningStatus.SUCCESS,
  //     run_duration: 10,
  //     run_end_time: '2025-08-18 15:00'
  //   }
  // });
}

// 获取日志
export async function getRunLog(
  id: string,
  params: GetRunLogReq
): Promise<ApiRes<GetRunLogRes>> {
  // TODO: 联调
  return await UAPI.RES.pythonRunLogApi({ pyspark_id: id })
    .get(params)
    .inRegion()
    .do();
}

// 获取算子库
export async function getOperator(): Promise<ApiRes<GetOperatorListItem[]>> {
  // TODO: 联调
  // return await UAPI.RES.pythonOperatorApi({}).get({}).inRegion().do();

  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: [
      {
        catalog: OperatorCatalog.DATA_PARSING,
        op_items: [
          {
            name: '文本解析算子',
            description: '解析文本文件,支持OCR和文本...',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['文档挖掘', '知识抽取'],
            sample_code: '这是一串示例代码'
          },
          {
            name: '图片解析算子',
            description: '解析图片文件,生成图片描述和...',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['图像识别', '视觉分析'],
            sample_code: '这是一串示例代码'
          },
          {
            name: '音频解析算子',
            description: '解析音频文件,进行语音转文本',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['语音识别', '音频处理'],
            sample_code: '这是一串示例代码'
          }
        ]
      },
      {
        catalog: OperatorCatalog.DATA_CLEANING,
        op_items: [
          {
            name: '去重处理算子',
            description: '删除数据中的重复记录',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['数据清洗', '去重'],
            sample_code: '这是一串示例代码'
          },
          {
            name: '数据验证算子',
            description: '验证数据的完整性和格式',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['数据验证', '质量控制'],
            sample_code: '这是一串示例代码'
          }
        ]
      },
      {
        catalog: OperatorCatalog.DATA_AUGMENTATION,
        op_items: [
          {
            name: '通用场景增强算子',
            description: '生成通用场景的训练数据',
            detail: '这是一段处理逻辑详细描述',
            usage: {
              input: '',
              output: ''
            },
            usage_scenarios: '使用场景blabla...',
            tags: ['数据增强', '训练数据'],
            sample_code: '这是一串示例代码'
          }
        ]
      }
    ]
  });
}

// 导出数据集列表
export async function getExportDatasetList(
  params: GetExportDatasetListReq
): Promise<ApiRes<GetExportDatasetListRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonExportDatasetListApi({}).get(params).inRegion().do();
  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      items: [
        {
          created_at: '2025-08-18 15:00',
          dataset_name: '示例数据集',
          id: 1,
          pyspark_id: 1,
          pyspark_name: '示例数据集',
          size: 1024,
          status: ExportStatus.Exporting
        },
        {
          created_at: '2025-08-18 15:00',
          dataset_name: '示例数据集',
          id: 2,
          pyspark_id: 1,
          pyspark_name: '示例数据集',
          size: 1024,
          status: ExportStatus.ExportSuccess
        },
        {
          created_at: '2025-08-18 15:00',
          dataset_name: '示例数据集',
          id: 3,
          pyspark_id: 1,
          pyspark_name: '示例数据集',
          size: 1024,
          status: ExportStatus.ExportFailed
        },
        {
          created_at: '2025-08-18 15:00',
          dataset_name: '示例数据集',
          id: 4,
          pyspark_id: 1,
          pyspark_name: '示例数据集',
          size: 1024,
          status: ExportStatus.ExportTerminated
        }
      ],
      page: 1,
      page_size: 10,
      total: 4
    }
  });
}

// 导出数据集
export async function exportDataset(
  params: ExportDatasetReq
): Promise<ApiRes<ExportDatasetRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonExportDatasetApi({ pyspark_id: id })
  //   .post(params)
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      id: 1
    }
  });
}

// 查询导出文件列表
export async function getExportFile(
  params: GetExportFileReq
): Promise<ApiRes<ExportFileRes>> {
  // TODO: 联调
  // return await UAPI.RES.pythonExportDatasetStatusApi({ pyspark_id: id })
  //   .get({})
  //   .inRegion()
  //   .do();

  return Promise.resolve({
    status: 200,
    code: '',
    message: 'OK',
    requestId: '1',
    data: {
      file_modify_time: '2025-08-18 15:00',
      file_name: 'example.txt',
      file_size: '1024',
      file_type: 'file'
    }
  });
}

// 导出任务停止
export async function stopExportDataset(
  // 导出任务id
  id: number,
  params: {
    pyspark_id: number;
  }
): Promise<ApiRes<object>> {
  // TODO: 联调
  return await UAPI.RES.pythonExportDatasetStopApi({ id })
    .put(params)
    .inRegion()
    .do();
}

// 重试导出任务
export async function retryExportDataset(
  id: number,
  params: {
    pyspark_id: number;
  }
): Promise<ApiRes<object>> {
  // TODO: 联调
  return await UAPI.RES.pythonExportDatasetRetryApi({ id })
    .put(params)
    .inRegion()
    .do();
}
