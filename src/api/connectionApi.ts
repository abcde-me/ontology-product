import UAPI from '@/api';

// 获取连接器的列表
export async function getConnectionList(params) {
  return await UAPI.RES.getConnection({}).post(params).inRegion().do();
}
// 添加的api
export async function addconnectionList(params) {
  return await UAPI.RES.addconnection({}).post(params).inRegion().do();
}
// 删除的api
export async function delconnectionList(connector_id) {
  return await UAPI.RES.delconnection({ connector_id })
    .delete()
    .inRegion()
    .do();
}
// 查看的api
export async function getdetailList(connector_id) {
  return await UAPI.RES.getconnection({ connector_id }).get().inRegion().do();
}
// 修改的api
export async function updataConnectionList(params: any) {
  return await UAPI.RES.editconnection({ connector_id: params.connector_id })
    .put(params.newfrom)
    .inRegion()
    .do();
}
