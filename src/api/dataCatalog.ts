import UAPI from '@/api';
import { Get, Post } from '@/utils/request';
import { Message } from '@arco-design/web-react';

// 数据目录相关接口

/**
 * 下载文件API接口
 * @param id 文件ID
 * @param params 额外参数
 */

//这个下载接口可以使用，但是不是在这个模块中用的，以后可能会用到
export async function downloadFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDownloadApi({ file_id: id }) //暂定只传一个id，后面再添加其他参数
    .get(params)
    .inRegion()
    .do();
}

//获取目录列表
// export async function getCatalogList(param: any = {}) {
//   return await UAPI.RES.catalogListApi({})
//     .get(param)
//     // .withConfig({baseURL: 'http://172.27.195.188:8080'})
//     .inRegion()
//     .do({ preCheck: false });
// }

// 获取数据目录列表
export async function getCatalogList(param: any = {}) {
  return await UAPI.RES.catalogListApi({}).get(param).inRegion().do();
}
//添加目录
export async function addCatalog(data: any) {
  return await UAPI.RES.catalogAddApi({}).post(data).inRegion().do();
}
//新建卷
export async function addVolume(data: any) {
  return await UAPI.RES.volumeAddApi({}).post(data).inRegion().do();
}
//删除数据卷
export async function deleteVolume(id: string) {
  return await UAPI.RES.volumeDeleteApi({ id }).delete().inRegion().do();
}
//重命名目录
export async function renameCatalog(id: string, params: any) {
  return await UAPI.RES.catalogRenameApi({ catalogId: id })
    .put(params)
    .inRegion()
    .do();
}

// 定义查询目标数据文件的参数接口
interface TargetDataFileQueryParams {
  page: number;
  full_path: string;
  start_time: string;
  end_time: string;
  search_content:string;
  search_id:number;
  limit:number;
}

// 定义删除目标文件的参数接口
interface TargetFileDeleteParams {
  file_ids: Array<string>;
  full_path: string;
  path_id: string;
}

//查询目标数据文件列表
export async function getTargetDataFileList(params: TargetDataFileQueryParams) {
  return await UAPI.RES.targetDataFileListApi({}).get(params).inRegion().do();
}
//删除目标文件
export async function deleteTargetFile(param: TargetFileDeleteParams) {
  return await UAPI.RES.targetDataFileDeleteApi({}).delete(param).inRegion().do();
}

//预览/搜索数据集
export async function getCatalogPreview(param: any = {}) {
  return await UAPI.RES.catalogPreviewApi({}).get(param).inRegion().do();
}

//删除目录文件接口
export async function deleteFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDeleteApi({ file_id: id }) //暂定只传一个id，后面再添加其他参数
    .delete(params)
    .inRegion()
    .do();
}

//查询指定目录下，已加载成功的文件记录
export async function getDataCatalogList(param: any = {}) {
  return await UAPI.RES.dataCatalogListApi({}).get(param).inRegion().do();
}

// 获取数据目录列表

// 创建数据集

export async function createCatalog(data: any) {
  return await UAPI.RES.CatalogCreateApi({}).post(data).inRegion().do();
}
//导出文件
export async function exportFile(params: any = {}) {
  return await UAPI.RES.fileExportApi({}).post(params).inRegion().do();
}
