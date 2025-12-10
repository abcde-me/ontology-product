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
  ListDevelopScriptParams,
  ListDevelopScriptParamsData,
  GetDevelopScriptLogByScriptIdData,
  ListDevelopScriptLogByKeyData,
  ListSqlFileParams,
  ListDevelopSystemParamParams,
  ListDevelopSystemParamParamsData,
  UpdateDevelopSystemParamParams,
  // getDevelopStandardsData,
  CopyDevelopScriptParams,
  DeleteDevelopScriptParams,
  SearchDevelopScriptLogByKeyParams,
  SearchDevelopScriptLogByKeyData,
  DeleteDevelopScriptLogByVersionParams,
  RenameDevelopScriptParams
} from '@/types/sqlApi';
import { AxiosResponse } from 'axios';

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
  return await UAPI.RES.ListDevelopScriptApi({}).post(params).inRegion().do();
}

/** 删除SQL脚本 */
export async function deleteSqlScript(id: string): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlDeleteApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}

/** SQL脚本运行 */
export async function runSqlScript(
  id: string
): Promise<ApiRes<RunSqlScriptData>> {
  return await UAPI.RES.sqlRunApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}

/** SQL脚本运行取消 */
export async function runCancelSqlScript(
  id: string,
  params: RunCancelSqlScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlRunCancelApi({})
    .post({ ...params, script_id: Number(id) })
    .inRegion()
    .do();
}

/** 获取SQL脚本运行结果 前端可5-10s轮询一次 */
export async function getRunResultSqlScript(
  id: string,
  params: RunResultSqlScriptParams
): Promise<ApiRes<RunResultSqlScriptData>> {
  return await UAPI.RES.sqlRunResultApi({})
    .post({ ...params, size: Number(params.size), script_id: Number(id) })
    .inRegion()
    .do();
}

/** 获取SQL脚本运行日志 */
export async function getRunLogSqlScript(
  id: string,
  params: { script_execid: string }
): Promise<ApiRes<any>> {
  return await UAPI.RES.sqlRunLogApi({})
    .post({ ...params, script_id: Number(id) })
    .inRegion()
    .do();
}

/** 获取脚本详情 */
export async function getSqlScriptDetail(
  id: string
): Promise<ApiRes<SqlScriptDetailData>> {
  return await UAPI.RES.sqlOpenApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}

/** SQL脚本复制 */
export async function copySqlScript(
  id: string,
  script_file_id: string
): Promise<ApiRes<CreateSqlScriptData>> {
  return await UAPI.RES.sqlCopyApi({})
    .post({
      script_file_id: script_file_id,
      copy_script_id: Number(id)
    })
    .inRegion()
    .do();
}

/** SQL执行结果导出到新数据集 */
export async function exportSqlResult(
  id: string,
  params: ExportSqlResultParams
): Promise<ApiRes<ExportSqlResultData>> {
  return await UAPI.RES.sqlExportDataset({})
    .post({ ...params, script_id: Number(id) })
    .inRegion()
    .do();
}

/** SQL执行结果导出到新版本 */
export async function exportSqlResultVersion(
  id: string,
  params: ExportSqlResultVersionParams
): Promise<ApiRes<ExportSqlResultVersionData>> {
  return await UAPI.RES.sqlExportDatasetVersion({})
    .post({ ...params, script_id: Number(id) })
    .inRegion()
    .do();
}

/** SQL结果导出到数据集列表 */
export async function getExportSqlResultList(
  params: ExportSqlResultListParams
): Promise<ApiRes<ExportSqlResultListData>> {
  return await UAPI.RES.sqlExportDatasetList({}).post(params).inRegion().do();
}

/** SQL结果导出任务停止 */
export async function calcelExportSqlTask(
  id: number,
  script_id: number
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetStopApi({})
    .post({ id, script_id })
    .inRegion()
    .do();
}

/** SQL结果导出任务重试 */
export async function retryExportSqlTask(
  id: number,
  script_id: number
): Promise<ApiRes<{}>> {
  return await UAPI.RES.sqlExportDatasetRetryApi({})
    .post({ id, script_id })
    .inRegion()
    .do();
}

/** 获取导出任务的SQL详情 */
export async function getSqlTaskDetail(
  id: number,
  script_id: number
): Promise<ApiRes<SqlTaskDetailData>> {
  return await UAPI.RES.sqlExportDatasetDetailApi({})
    .post({ id, script_id })
    .inRegion()
    .do();
}

/** 获取目标数据集 */
export async function getDatasetsOptions(
  params: DatasetsOptionsParams
): Promise<ApiRes<DatasetsOptionsData>> {
  return await UAPI.RES.datasetsOptionsApi({}).post(params).inRegion().do();
}

// 获取开发脚本列表
export async function getDevelopScriptList(
  params: ListDevelopScriptParams
): Promise<ApiRes<ListDevelopScriptParamsData>> {
  return await UAPI.RES.listDevelopScriptApi({}).post(params).inRegion().do();
}
// 下载开发脚本
export async function downloadDevelopScript(): Promise<AxiosResponse<Blob>> {
  return (await UAPI.RES.DownloadDevelopScriptApi({})
    .get()
    .withConfig({ responseType: 'blob' })
    .inRegion()
    .do({ preCheck: false })) as AxiosResponse<Blob>;
}

// 获取开发脚本历史版本
export async function getDevelopScriptLogByScriptId(
  id: string
): Promise<ApiRes<GetDevelopScriptLogByScriptIdData>> {
  return await UAPI.RES.GetDevelopScriptLogByScriptIdApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}
/** 历史版本复制 */
export async function copyDevelopScript(
  params: CopyDevelopScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.OldGetDevelopScriptLogByVersionApi({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 历史版本删除
export async function deleteOldDevelopScript(
  params: DeleteDevelopScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteDevelopScriptLogApi({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 删除开发脚本
export async function deleteDevelopScript(id: number): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteDevelopScriptApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}
// 获取开发脚本卡片内容
export async function listDevelopScriptLogByKeyApi(
  params
): Promise<ApiRes<ListDevelopScriptLogByKeyData>> {
  return await UAPI.RES.ListDevelopScriptLogByKeyApi({})
    .post(params)
    .inRegion()
    .do();
}
// 查询脚本列表
export async function listSqlFile(
  params: ListSqlFileParams
): Promise<ApiRes<ListSqlFileParams>> {
  return await UAPI.RES.ListSqlFileApi({}).post(params).inRegion().do();
}
// 查询脚本 - 删除脚本
export async function deleteSqlFile(id: number): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteSqlFileApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}
// 参数列表表格
export async function listDevelopSystemParam(
  params: ListDevelopSystemParamParams
): Promise<ApiRes<ListDevelopSystemParamParamsData>> {
  return await UAPI.RES.ListDevelopSystemParamApi({})
    .post(params)
    .inRegion()
    .do();
}
// 开发规范查看
export async function getDevelopStandards(params): Promise<ApiRes<string>> {
  return await UAPI.RES.GetDevelopStandardsApi({}).post().inRegion().do();
}
// 开发规范保存
export async function updateDevelopSystemParam(
  params: UpdateDevelopSystemParamParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.UpdateDevelopSystemParamApi({})
    .post(params)
    .inRegion()
    .do();
}

// 脚本内容搜索
export async function getDevelopScriptLogByVersion(
  params: SearchDevelopScriptLogByKeyParams
): Promise<ApiRes<SearchDevelopScriptLogByKeyData>> {
  return await UAPI.RES.GetDevelopScriptLogByVersionApi({})
    .post(params)
    .inRegion()
    .do();
}
// 脚本内容 删除
export async function deleteDevelopScriptLogByVersion(
  params: DeleteDevelopScriptLogByVersionParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteDevelopScriptLogByVersionApi({})
    .post(params)
    .inRegion()
    .do();
}
// 加工脚本列表 - 新建
export async function createDevelopSqlScript(
  params: CreateSqlScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.CreateDevelopScriptApi({}).post(params).inRegion().do();
}
// 加工脚本列表 - 重命名
export async function renameDevelopScript(
  params: RenameDevelopScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.RenameDevelopScriptApi({}).post(params).inRegion().do();
}
// 加工脚本列表 - 复制
export async function copyDevelopScriptList(params: {
  script_id?: number; // 脚本id
}): Promise<ApiRes<{}>> {
  return await UAPI.RES.CopyDevelopScriptApi({})
    .post({ ...params })
    .inRegion()
    .do();
}
// 加工脚本列表 - 删除
export async function deleteDevelopScriptList(params: {
  script_id?: number; // 脚本id
}): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteDevelopScriptNewApi({})
    .post({ ...params })
    .inRegion()
    .do();
}
