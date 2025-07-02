import UAPI from '.';
// 获取载入任务列表
export async function getLoadList(params: any) {
  return await UAPI.RES.getLoadListApi({})
    .post(params)
    // .withConfig({ baseURL: 'http://10.252.26.5:30183' })
    .inRegion()
    .do();
}
// 创建载入任务
export async function addLoad(params: any) {
  return await UAPI.RES.addLoadApi({}).post(params).inRegion().do();
}
// 删除载入任务
export async function delLoad(task_id) {
  return await UAPI.RES.delLoadApi({ task_id }).delete().inRegion().do();
}
// 修改载入任务
export async function editLoad(params) {
  console.log(params);
  return await UAPI.RES.editLoadApi({ task_id: params.task_id })
    .put(params)
    .inRegion()
    .do();
}
// 查看载入任务详情
export async function getLoad(task_id) {
  return await UAPI.RES.getLoadApi({ task_id }).get().inRegion().do();
}
// 启停单个载入任务
export async function startAndStopeLoad(params) {
  return await UAPI.RES.startAndStopeLoadApi({ task_id: params.task_id })
    .get(params.status)
    .inRegion()
    .do();
}
// 立即运行载入任务
export async function runLoad(params) {
  return await UAPI.RES.runLoadApi({ task_id: params.task_id })
    .post()
    .inRegion()
    .do();
}
// 查询载入任务记录
export async function getLoadRecord(task_id) {
  return await UAPI.RES.getLoadRecordApi({ task_id }).get().inRegion().do();
}
export async function getLoadRecordList(params) {
  return await UAPI.RES.getdetailListApi({}).post(params).inRegion().do();
}

interface CatalogListParams {
  root_type?: number; // 如果 root_type 是可选的，可以加上 ?
  // 其他可能的字段...
}
// 获取数据集列表
export async function getDirectoryList(params) {
  return await UAPI.RES.catalogListApi(params).get().inRegion().do();
}
// 停止单个载入任务
export async function stopeLoad(params) {
  console.log(params);
  return await UAPI.RES.stopLoadApi({}).post(params).inRegion().do();
}
