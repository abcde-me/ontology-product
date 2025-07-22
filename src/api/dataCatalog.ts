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
// 添加目录
export async function addCatalog(data: any) {
  const res = await UAPI.RES.catalogAddApi({}).post(data).inRegion().do();
  if (res.status !== 200) {
    Message.warning(res.message);
  }
  return res;
}
// 新建卷
export async function addVolume(data: any) {
  const res = await UAPI.RES.volumeAddApi({}).post(data).inRegion().do();
  if (res.status !== 200) {
    Message.warning(res.message);
  }
  return res;
}
// 删除数据卷
export async function deleteVolume(
  id: string,
  params?: { root_type?: string }
) {
  const res = await UAPI.RES.volumeDeleteApi({ id })
    .delete(params)
    .inRegion()
    .do();
  if (res.status !== 200) {
    Message.error(res.message);
  }
  return res;
}
// 重命名目录
export async function renameCatalog(id: string, params: any) {
  const res = await UAPI.RES.catalogRenameApi({ catalogId: id })
    .put(params)
    .inRegion()
    .do();
  if (res.status !== 200) {
    Message.warning(res.message);
  }
  return res;
}

// 定义查询目标数据文件的参数接口
interface TargetDataFileQueryParams {
  page: number;
  full_path: string;
  start_time: string;
  end_time: string;
  search_content: string;
  search_id: number;
  limit: number;
  file_type: Array<string>;
  sort_field?: string;
  sort_order?: string;
}

interface SourceFileTypeList {
  id: string;
}

// 定义删除目标文件的参数接口
interface TargetFileDeleteParams {
  file_ids: Array<number | string>;
  full_path: string;
  path_id: string;
}
//查询源数据文件参数接口
interface SourceDataFileQueryParams {
  page: number;
  page_size: number;
  file_name: string;
  data_path_id: number;
  start: string;
  end: string;
  file_type: Array<string>;
  sort_field?: string;
  sort_order?: string;
}
//查询目标数据文件列表
export async function getTargetDataFileList(params: TargetDataFileQueryParams) {
  const { file_type, ...restParams } = params;

  const queryParams = new URLSearchParams();

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert value to string without unnecessary assertion
      queryParams.append(key, String(value));
    }
  });

  if (file_type && Array.isArray(file_type)) {
    file_type.forEach((type) => {
      queryParams.append('file_type', type);
    });
  }

  return await UAPI.RES.targetDataFileListApi({})
    .get(queryParams)
    .inRegion()
    .do();
}
//查询目标数据文件类型列表
export async function getTargetFileTypeList() {
  return await UAPI.RES.targetFileTypeListApi({}).get().inRegion().do();
}
//查询源数据文件类型列表
export async function getSourceFileTypeList(params) {
  return await UAPI.RES.sourceFileTypeListApi({
    file_id: params.id
  })
    .get()
    .inRegion()
    .do();
}

//删除目标文件
export async function deleteTargetFile(params: TargetFileDeleteParams) {
  const { file_ids, ...restParams } = params;

  const queryParams = new URLSearchParams();

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  file_ids.forEach((id) => {
    queryParams.append('file_ids', String(id));
  });

  return await UAPI.RES.targetDataFileDeleteApi({})
    .delete()
    .withConfig({
      params: queryParams
    })
    .inRegion()
    .do();
}

//查询源数据文件列表
export async function getSourceDataFileList(params: SourceDataFileQueryParams) {
  return await UAPI.RES.sourceDataFileListApi({}).post(params).inRegion().do();
}
//删除源数据目录单个文件
export async function deleteSourceFile(id: string) {
  return await UAPI.RES.sourceDataFileDeleteApi({ file_id: id })
    .delete()
    .inRegion()
    .do();
}
//批量删除源数据文件
export async function deleteSourceFileBatch(params: any) {
  return await UAPI.RES.sourceDataFileDeleteBatcheApi({})
    .post(params)
    .inRegion()
    .do();
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
