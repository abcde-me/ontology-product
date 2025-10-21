import UAPI from '@/api';
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
  RenameSqlScriptParams,
  RunCancelSqlScriptParams,
  RunResultSqlScriptData,
  RunResultSqlScriptParams,
  RunSqlScriptData,
  SqlScriptDetailData,
  SqlScriptListData,
  SqlScriptListParams,
  updateSqlScriptParams,
  SqlTaskDetailData,
  DatasetsOptionsParams,
  DatasetsOptionsData,
  CopySqlScriptReq
} from '@/types/sqlApi';

/** 数据集目录 */
export async function getDatasetList(
  params: DatasetListParams
): Promise<ApiRes<{}>> {
  return UAPI.RES.datasetsApi({}).post(params).inRegion().do();
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
  return await UAPI.RES.sqlRenameApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** 编辑SQL脚本 */
export async function updateSqlScript(
  id: number,
  params: updateSqlScriptParams
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlSaveApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** 获取SQL脚本列表 */
export async function getSqlScriptList(
  params: SqlScriptListParams
): Promise<ApiRes<SqlScriptListData>> {
  return await UAPI.RES.sqlListApi({}).post(params).inRegion().do();
}

/** 删除SQL脚本 */
export async function deleteSqlScript(id: string): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlDeleteApi({})
    .post({ script_id: id })
    .inRegion()
    .do();
}

/** SQL脚本运行 */
export async function runSqlScript(
  id: string
): Promise<ApiRes<RunSqlScriptData>> {
  return await UAPI.RES.sqlRunApi({}).post({ script_id: id }).inRegion().do();
}

/** SQL脚本运行取消 */
export async function runCancelSqlScript(
  id: string,
  params: RunCancelSqlScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlRunCancelApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** 获取SQL脚本运行结果 前端可5-10s轮询一次 */
export async function getRunResultSqlScript(
  id: string,
  params: RunResultSqlScriptParams
): Promise<ApiRes<RunResultSqlScriptData>> {
  return await UAPI.RES.sqlRunResultApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** 获取SQL脚本运行日志 */
export async function getRunLogSqlScript(
  id: string,
  params: { script_execid: string }
): Promise<ApiRes<any>> {
  return await UAPI.RES.sqlRunLogApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** 获取脚本详情 */
export async function getSqlScriptDetail(
  id: string
): Promise<ApiRes<SqlScriptDetailData>> {
  return await UAPI.RES.sqlOpenApi({}).post({ script_id: id }).inRegion().do();
}

/** SQL脚本复制 */
export async function copySqlScript(
  id: string,
  params: CopySqlScriptReq
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlCopyApi({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** SQL执行结果导出到新数据集 */
export async function exportSqlResult(
  id: string,
  params: ExportSqlResultParams
): Promise<ApiRes<ExportSqlResultData>> {
  return await UAPI.RES.sqlExportDataset({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** SQL执行结果导出到新版本 */
export async function exportSqlResultVersion(
  id: string,
  params: ExportSqlResultVersionParams
): Promise<ApiRes<ExportSqlResultVersionData>> {
  return await UAPI.RES.sqlExportDatasetVersion({})
    .post({ ...params, script_id: id })
    .inRegion()
    .do();
}

/** SQL结果导出到数据集列表 */
export async function getExportSqlResultList(
  params: ExportSqlResultListParams
): Promise<ApiRes<ExportSqlResultListData>> {
  return await UAPI.RES.sqlExportDatasetList({}).post(params).inRegion().do();

  // return Promise.resolve({
  //   "message": "string",
  //   "data": {
  //     "items": [
  //       {
  //         "id": 5,
  //         "script_id": 5,
  //         "script_name": "string",
  //         "dataset_name": "string",
  //         "dataset_table_name": "string",
  //         "export_status": 0,
  //         "export_start_time": "string",
  //         "export_end_time": "string",
  //         "failed_reason": "string"
  //       },
  //       {
  //         "id": 1,
  //         "script_id": 1,
  //         "script_name": "string",
  //         "dataset_name": "string",
  //         "dataset_table_name": "string",
  //         "export_status": 1,
  //         "export_start_time": "string",
  //         "export_end_time": "string",
  //         "failed_reason": "string"
  //       },
  //       {
  //         "id": 2,
  //         "script_id": 1,
  //         "script_name": "string",
  //         "dataset_name": "string",
  //         "dataset_table_name": "string",
  //         "export_status": 2,
  //         "export_start_time": "string",
  //         "export_end_time": "string",
  //         "failed_reason": "错误原因"
  //       },
  //       {
  //         "id": 3,
  //         "script_id": 1,
  //         "script_name": "string",
  //         "dataset_name": "string",
  //         "dataset_table_name": "string",
  //         "export_status": 3,
  //         "export_start_time": "string",
  //         "export_end_time": "string",
  //         "failed_reason": "string"
  //       }
  //     ],
  //     "total": "1",
  //     "page": "1",
  //     "page_size": "10"
  //   },
  //   "status": 0,
  //   "code": '0',
  //   requestId: '0'
  // })
}

/** SQL结果导出任务停止 */
export async function calcelExportSqlTask(
  id: number,
  script_id: number
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetStopApi({})
    .post({ item_id: id, script_id })
    .inRegion()
    .do();
}

/** SQL结果导出任务重试 */
export async function retryExportSqlTask(
  id: number,
  script_id: number
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetRetryApi({})
    .post({ item_id: id, script_id })
    .inRegion()
    .do();
}

/** 获取导出任务的SQL详情 */
export async function getSqlTaskDetail(
  id: number,
  script_id: number
): Promise<ApiRes<SqlTaskDetailData>> {
  return await UAPI.RES.sqlExportDatasetDetailApi({})
    .post({ item_id: id, script_id })
    .inRegion()
    .do();
}

/** 获取目标数据集 */
export async function getDatasetsOptions(
  params: DatasetsOptionsParams
): Promise<ApiRes<DatasetsOptionsData>> {
  return await UAPI.RES.datasetsOptionsApi({}).post(params).inRegion().do();
}
