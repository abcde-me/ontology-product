import UAPI from '@/api';

export interface MetadataMenuItem {
  datasourceType: string;
  datasourceName: string;
}

// 数据API
// 获取数据API列表
export async function openDataList(params: Record<string | number, any>) {
  return await UAPI.RES.openDataListApi({}).post(params).inRegion().do();
}

// 查看数据API文档
export async function openDataGetApiDoc(params: Record<string | number, any>) {
  return await UAPI.RES.openDataGetApiDocApi({}).post(params).inRegion().do();
}

// 上线数据API
export async function openDataPublish(params: Record<string | number, any>) {
  return await UAPI.RES.openDataPublishApi({}).post(params).inRegion().do();
}

// 下线数据API
export async function openDataUnpublish(params: Record<string | number, any>) {
  return await UAPI.RES.openDataUnpublishApi({}).post(params).inRegion().do();
}

// 数据源列表
export async function openDataListDatabase(
  params: Record<string | number, any>
) {
  return await UAPI.RES.openDataListDatabaseApi({})
    .post(params)
    .inRegion()
    .do();
}

// 表字段列表
export async function openDataListFields(params: Record<string | number, any>) {
  return await UAPI.RES.openDataListFieldsApi({}).post(params).inRegion().do();
}

// 搜索表
export async function openDataSearchTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.openDataSearchTableApi({}).post(params).inRegion().do();
}

// 解析SQL
export async function openDataParseSql(params: Record<string | number, any>) {
  return await UAPI.RES.openDataParseSqlApi({}).post(params).inRegion().do();
}

// 测试数据API
export async function openDataTestApi(params: Record<string | number, any>) {
  return await UAPI.RES.openDataTestApi({}).post(params).inRegion().do();
}

// 创建数据API
export async function openDataCreateApi(params: Record<string | number, any>) {
  return await UAPI.RES.openDataCreateApi({}).post(params).inRegion().do();
}

// 获取数据API详情
export async function openDataGetApiDetail(
  params: Record<string | number, any>
) {
  return await UAPI.RES.openDataGetApiDetailApi({})
    .post(params)
    .inRegion()
    .do();
}

// 更新数据API
export async function openDataUpdateDataAPI(
  params: Record<string | number, any>
) {
  return await UAPI.RES.openDataUpdateDataAPI({}).post(params).inRegion().do();
}

// 删除数据API
export async function openDataDeleteApi(params: Record<string | number, any>) {
  return await UAPI.RES.openDataDeleteApi({}).post(params).inRegion().do();
}

// 授权列表
export async function openDataAuthList(params: Record<string | number, any>) {
  return await UAPI.RES.openDataAuthListApi({}).post(params).inRegion().do();
}

// 授权数据API
export async function openDataAuthorizeApi(
  params: Record<string | number, any>
) {
  return await UAPI.RES.openDataAuthorizeApi({}).post(params).inRegion().do();
}

// 取消授权数据API
export async function openDataRevokeApi(params: Record<string | number, any>) {
  return await UAPI.RES.openDataRevokeApi({}).post(params).inRegion().do();
}
