import UAPI from '@/api';
// 数据集管理相关接口

/**
 * 获取数据集列表
 */

export async function getDatasetList(params: any = {}) {
  return UAPI.RES.datasets({}).get(params).inRegion().do();
}

//获取连接器列表
export async function getconnectorList(params: any = {}){
  return UAPI.RES.connectorListAPI({}).get(params).inRegion().do();
}

export async function getconnectorFileInformation(params: any = {}){
  return UAPI.RES.datasets({}).post(params).inRegion().do();
}