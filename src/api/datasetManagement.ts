import UAPI from '@/api';
// 数据集管理相关接口

/**
 * 获取数据集列表
 */

//获取数据集列表
export async function getDatasetList(params:any) {
  return UAPI.RES.datasetsApi({}).get(params).inRegion().do();
}

//获取数据详情列表
export async function getDatasetDetail(id:any){
  return UAPI.RES.datasetDetailApi({id}).get().inRegion().do();
}


//新建数据集
export async function createDataset(params:any){
  return UAPI.RES.createDatasetApi({}).post(params).inRegion().do();
}


//获取标签列表
export async function getTagList(){
  return UAPI.RES.tagListApi({}).get().inRegion().do();
}




//查询连接器信息列表
export async function getConnectorList(params:any){
  return UAPI.RES.connectorListApi({}).get(params).inRegion().do();
}


//查询指定连接器加载成功的文件信息
export async function getConnectorFileList(params:any){
  return UAPI.RES.connectorFileListApi({connector_id:params.connector_id}).get(params).inRegion().do();
}


//获取连接器列表
// export async function getconnectorList(params: any = {}){
//   return UAPI.RES.connectorListAPI({}).get(params).inRegion().do();
// }
// //获取连接器文件信息
// export async function getconnectorFileInformation(params: any = {}){
//   return UAPI.RES.datasets({}).post(params).inRegion().do();
// }

// export async function deleteDataset(params:any){
//   return UAPI.RES.datasets({}).delete(params).inRegion().do();
// }