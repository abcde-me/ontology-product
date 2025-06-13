import UAPI from '@/api';
import { Get, Post } from '@/utils/request';

// 数据目录相关接口

/**
 * 下载文件API接口
 * @param id 文件ID
 * @param params 额外参数
 */

//这个下载接口可以使用，但是不是在这个模块中用的，以后可能会用到
export async function downloadFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDownloadApi({ file_id: id })//暂定只传一个id，后面再添加其他参数
    .get(params)
    .inRegion()
    .do();
}

export async function deleteFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDeleteApi({ file_id: id })//暂定只传一个id，后面再添加其他参数
    .delete(params)
    .inRegion()
    .do();
}

//查询指定目录下，已加载成功的文件记录
export async function getDataCatalogList(param:any = {}) {
  return await UAPI.RES.dataCatalogListApi({})
    .get(param)
    .inRegion()
    .do();
}

// 获取数据目录列表
export async function getCatalogList(param:any = {}) {
  return await UAPI.RES.CatalogListApi({})
    .get(param)
    .inRegion()
    .do();
}

// 创建数据集

export async function createCatalog(data: any) {
  return await UAPI.RES.CatalogCreateApi({})
    .post(data)
    .inRegion()
    .do();
}

export async function exportFile(params:any = {}) {
  return await UAPI.RES.fileExportApi({})
    .post(params)
    .inRegion()
    .do();
}