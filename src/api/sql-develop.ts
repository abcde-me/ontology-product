import UAPI from '@/api';
import {
  CreateDevelopScriptParams,
  CreateDevelopScriptResponse,
  DeleteDevelopScriptLogByVersionParams,
  EditDevelopScriptParams,
  EditDevelopScriptResponse,
  GetDevelopScriptInfoParams,
  GetDevelopScriptInfoResponse,
  ListDevelopScriptParams,
  ListDevelopScriptResponse,
  ListDevelopSystemParamParams,
  ListDevelopSystemParamParamsData,
  RenameDevelopScriptParams,
  SearchDevelopScriptLogByKeyData,
  SearchDevelopScriptLogByKeyParams,
  UpdateDevelopSystemParamParams
} from '@/types/sqlDevelopApi';

/**
 * 获取开发SQL脚本列表
 */
export const listDevelopScript = (
  params: ListDevelopScriptParams
): Promise<ApiRes<ListDevelopScriptResponse>> => {
  return UAPI.RES.listDevelopScriptApi({}).post(params).inRegion().do();
};

/**
 * 创建开发SQL脚本
 */
export const createDevelopScript = (
  params: CreateDevelopScriptParams
): Promise<ApiRes<CreateDevelopScriptResponse>> => {
  return UAPI.RES.createDevelopScriptApi({}).post(params).inRegion().do();
};

// 加工脚本列表 - 重命名
export async function renameDevelopScript(
  params: RenameDevelopScriptParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.RenameDevelopScriptApi({}).post(params).inRegion().do();
}

// 加工脚本列表 - 复制
export async function copyDevelopScript(params: {
  script_id?: number; // 脚本id
}): Promise<ApiRes<{}>> {
  return await UAPI.RES.CopyDevelopScriptApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

// 加工脚本列表 - 删除
export async function deleteDevelopScript(params: {
  script_id?: number; // 脚本id
}): Promise<ApiRes<{}>> {
  return await UAPI.RES.DeleteDevelopScriptApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

/**
 * 保存开发SQL脚本
 */
export const editDevelopScript = (
  params: EditDevelopScriptParams
): Promise<ApiRes<EditDevelopScriptResponse>> => {
  return UAPI.RES.editDevelopScriptApi({}).post(params).inRegion().do();
};

/**
 * 获取开发SQL脚本详情
 */
export const getDevelopScriptInfo = (
  params: GetDevelopScriptInfoParams
): Promise<ApiRes<GetDevelopScriptInfoResponse>> => {
  return UAPI.RES.getDevelopScriptInfoApi({}).post(params).inRegion().do();
};

// 锁定开发脚本
export async function lockDevelopScript(id: number): Promise<ApiRes<{}>> {
  // return Promise.resolve({
  //   status: 200,
  //   code: '0',
  //   requestId: '',
  //   message: 'success',
  //   data: {}
  // });
  return await UAPI.RES.LockDevelopScriptApi({})
    .post({ script_id: Number(id) })
    .inRegion()
    .do();
}

// 解锁开发脚本
export async function unlockDevelopScript(id: number): Promise<ApiRes<{}>> {
  // return Promise.resolve({
  //   status: 200,
  //   code: '0',
  //   requestId: '',
  //   message: 'success',
  //   data: {}
  // });
  return await UAPI.RES.UnlockDevelopScriptApi({})
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

// 发布加工脚本
export async function releaseDevelopScript(params: {
  script_id: number;
  script_desc: string;
}): Promise<ApiRes<{}>> {
  return await UAPI.RES.NewVersionDevelopScriptApi({})
    .post(params)
    .inRegion()
    .do();
}
