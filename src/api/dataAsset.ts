import UAPI from '@/api';
import { CreateDataAssetRes, DataAssetField } from '@/types/dataAssetApi';

// 获取数据资产列表
export async function getDataAssetList(params: any = {}) {
  return await UAPI.RES.dataAssetList({}).post(params).inRegion().do();
}

// 获取数据资产详情
export async function getDataAssetDetail(id: string) {
  return await UAPI.RES.dataAssetDetail({}).post({ id }).inRegion().do();
}

// 创建数据资产
export async function createDataAsset(params: CreateDataAssetRes) {
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

// 分析数据资产字段文件
export async function analyzeDataAssetFieldsFile(params: {
  file: File;
}): Promise<ApiRes<DataAssetField[]>> {
  return await UAPI.RES.analyzeDataAssetFieldsFile({})
    .post(params)
    .inRegion()
    .do();
}

// 查询支持的字段类型
export async function listDataAssetFieldTypes(): Promise<ApiRes<string[]>> {
  return Promise.resolve({
    code: '0',
    status: 200,
    data: ['string', 'number', 'boolean', 'date', 'object'],
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.listDataAssetFieldTypes({}).post().inRegion().do();
}
