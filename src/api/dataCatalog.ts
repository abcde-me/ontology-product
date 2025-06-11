import UAPI from '@/api';

// 数据目录相关接口

/**
 * 下载文件API接口
 * @param id 文件ID
 * @param params 额外参数
 */
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

