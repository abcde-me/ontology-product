import UAPI from '@/api';

// 获取数据资产列表
export async function getDataAssetList(params: any = {}) {
  return await UAPI.RES.dataAssetList({}).post(params).inRegion().do();
}

// 获取数据资产详情
export async function getDataAssetDetail(id: string) {
  return await UAPI.RES.dataAssetDetail({}).post({ id }).inRegion().do();
}

// 创建数据资产
export async function createDataAsset(params: any) {
  return await UAPI.RES.dataAssetCreate({}).post(params).inRegion().do();
}

// 更新数据资产
export async function updateDataAsset(params: any) {
  return await UAPI.RES.dataAssetUpdate({}).post(params).inRegion().do();
}

// 删除数据资产
export async function deleteDataAsset(id: string) {
  return await UAPI.RES.dataAssetDelete({}).post({ id }).inRegion().do();
}
