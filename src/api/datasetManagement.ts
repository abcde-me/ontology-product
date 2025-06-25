import UAPI from '@/api';
// 数据集管理相关接口

// 类型定义
interface DatasetListParams {
  page?: number;
  page_size?: number;
  name?: string;
  tag_id?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface CreateDatasetParams {
  name: string;
  description?: string;
  tag_ids?: string[];
  connector_id?: string;
  file_paths?: string[];
  config?: Record<string, unknown>;
}

interface ConnectorListParams {
  page?: number;
  page_size?: number;
  name?: string;
  connector_type?: string;
}

interface ConnectorFileListParams {
  connector_id: string;
  path?: string;
  page?: number;
  page_size?: number;
}

interface UpdateDatasetParams {
  id: string;
  name?: string;
  description?: string;
  tag_ids?: string[];
  config?: Record<string, unknown>;
}

interface DatasetContentsParams {
  dataset_id: string;
  page?: number;
  page_size?: number;
  search?: string;
}

/**
 * 获取数据集列表
 */

//获取数据集列表
export async function getDatasetList(params: DatasetListParams = {}) {
  return UAPI.RES.datasetsApi({}).get(params).inRegion().do();
}

//获取数据集详情
export async function getDatasetDetail(id: string) {
  return UAPI.RES.datasetDetailApi({ id }).get().inRegion().do();
}

//新建数据集
export async function createDataset(params: CreateDatasetParams) {
  return UAPI.RES.createDatasetApi({}).post(params).inRegion().do();
}

//获取标签列表
export async function getTagList() {
  return UAPI.RES.tagListApi({}).get().inRegion().do();
}

//查询连接器信息列表
export async function getConnectorList(params: ConnectorListParams = {}) {
  return UAPI.RES.connectorListApi({})
    .get(params)
    .inRegion()
    .do({ preCheck: false });
}

//查询指定连接器加载成功的文件信息
export async function getConnectorFileList(params: ConnectorFileListParams) {
  return UAPI.RES.connectorFileListApi({ connector_id: params.connector_id })
    .get(params)
    .inRegion()
    .do();
}

//修改数据集
export async function updateDataset(params: UpdateDatasetParams) {
  return UAPI.RES.updateDatasetApi({ id: params.id })
    .put(params)
    .inRegion()
    .do();
}

//获取数据集详情页

//获取数据集详情页的数据内容
export async function getDatasetContents(params: DatasetContentsParams) {
  return UAPI.RES.datasetContentsApi({}).get(params).inRegion().do();
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
