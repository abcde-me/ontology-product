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
  return await UAPI.RES.delLoadApi({}).post({ task_id }).inRegion().do();
}
// 修改载入任务
export async function editLoad(params) {
  console.log(params.formData);
  if (params.dest_path_id) {
    params.dest_path_id = Number(params.dest_path_id);
  }
  return await UAPI.RES.editLoadApi({}).post(params).inRegion().do();
}
// 查看载入任务详情
export async function getLoad(task_id) {
  return await UAPI.RES.getLoadApi({})
    .post({ task_id: Number(task_id) })
    .inRegion()
    .do();
}
// 启停单个载入任务
export async function startAndStopeLoad(params) {
  console.log(params);
  return await UAPI.RES.startAndStopeLoadApi({}).post(params).inRegion().do();
}
// 立即运行载入任务
export async function runLoad(params) {
  console.log(params);
  return await UAPI.RES.runLoadApi({}).post(params).inRegion().do();
}
// 查询载入任务记录
export async function getLoadRecord(id) {
  return await UAPI.RES.getLoadRecordDetailApi({})
    .post({
      execution_id: id
    })
    .inRegion()
    .do();
}
export async function getLoadRecordList(params) {
  return await UAPI.RES.getdetailListApi({}).post(params).inRegion().do();
}

interface CatalogListParams {
  root_type?: number; // 如果 root_type 是可选的，可以加上 ?
  dir_type?: number;
  // 其他可能的字段...
}
// 获取数据集列表
export async function getDirectoryList(params: CatalogListParams) {
  return await UAPI.RES.catalogListApi({}).post(params).inRegion().do();
}
// 停止单个载入任务
export async function stopeLoad(params) {
  console.log(params);
  return await UAPI.RES.stopLoadApi({}).post(params).inRegion().do();
}

export async function getLoadTaskFiles(params: any = {}) {
  return await UAPI.RES.getLoadTaskFiles({}).post(params).inRegion().do();
  // return await UAPI.RES.getLoadTaskFiles({}).post({...params, data_path_id: 122, file_type: ['jsonl']}).inRegion().do();
}
// 查询单个任务已加载文件列表分页
export async function getLoadRecordLists(params: any = {}) {
  return await UAPI.RES.getLoadRecordListApi({}).post(params).inRegion().do();
}
//重试载入任务
interface reTryLoadParams {
  execution_id: string;
  task_id: number;
}
export async function reTryLoad(params: reTryLoadParams) {
  return await UAPI.RES.reTryLoadApi({}).post(params).inRegion().do();
}
//载入时获取表名
interface getTableNameParams {
  connector_id: string;
}
export async function getTableName(params: getTableNameParams) {
  return await UAPI.RES.getTableNameApi({}).post(params).inRegion().do();
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       data: {
  //         table_name: '模拟的数据名'
  //       }
  //     });
  //   }, 500);
  // });
}

export enum CheckSQLStatus {
  /** 未校验 */
  NONE = -1,
  /** 校验成功 */
  SUCCESS = 0,
  /** 校验失败 */
  ERROR = 1,
  /** 校验中 */
  CHECKING = 3
}

// 校验SQL语句
export async function checkSQL(params: {
  sql: string;
  connectorId: number;
}): Promise<
  ApiRes<{
    status: CheckSQLStatus;
    message: string;
  }>
> {
  return await UAPI.RES.checkSQLApi({}).post(params).inRegion().do();
}
