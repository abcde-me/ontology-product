import UAPI from '@/api';
// 数据集管理相关接口

// 类型定义
interface DatasetListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_field?: string;
  tag_names?: string[];
  storage_type?: string[];
  status?: string[];
  sort_field?: string;
  sort_order?: string;
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
  type?: string;
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
  id: string;
  page?: number;
  page_size?: number;
  search?: string;
}

interface DatasetDetailPageParams {
  id: string;
}

// 数据变更类型枚举
export enum DataChangeType {
  MODIFY = 1, // 修改
  DELETE = 2, // 删除
  ADD = 3 // 新增，目前不用后期开发可能会用
}

// 数据变更项接口
export interface DataChangeItem {
  line: number; // 行号
  change_type: DataChangeType; // 变更类型
  new_data: Record<string, any>; // 新数据，key-value格式
}

// 编辑数据集版本参数接口
export interface EditDatasetVersionParams {
  id: number;
  version_id: string;
  datas: DataChangeItem[]; // 数据变更列表
}

//批量删除数据集参数接口
export interface BatchDeleteDatasetParams {
  ids: number[];
}
//版本重新生成参数接口
export interface DatasetVersionRebuildParams {
  id: string | number;
  version_id: string;
}

/**
 * 获取数据集列表
 */

//获取数据集列表
export async function getDatasetList(params: DatasetListParams = {}) {
  const {
    page,
    limit,
    search_field,
    search,
    tag_names,
    storage_type,
    status,
    sort_field,
    sort_order
  } = params;
  const queryParams: Record<string, any> = {
    page,
    limit
  };
  if (search_field && search) {
    queryParams[search_field] = search;
  }
  if (tag_names && tag_names.length > 0) {
    queryParams.tags = tag_names; // 直接赋值数组
  }
  if (storage_type && storage_type.length > 0) {
    queryParams.storage_type_list = storage_type; // 直接赋值数组
  }
  if (status && status.length > 0) {
    queryParams.status_list = status; // 直接赋值数组
  }
  // 添加排序参数
  if (sort_field) {
    queryParams.sort_field = sort_field; // created_at 或 updated_at
  }
  if (sort_order) {
    queryParams.sort_order = sort_order; // asc 或 desc
  }
  console.log('queryParams', queryParams);
  return UAPI.RES.datasetsApi({}).post(queryParams).inRegion().do();
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
    .get({ type: params.type })
    .inRegion()
    .do();
}

//修改数据集
export async function updateDataset(params: UpdateDatasetParams) {
  return UAPI.RES.updateDatasetApi({ dataset_id: params.id })
    .put(params)
    .inRegion()
    .do();
}

//获取数据集详情页
export async function getDatasetDetailPage(params: DatasetDetailPageParams) {
  return UAPI.RES.datasetDetailPageApi({ dataset_id: params.id })
    .get()
    .inRegion()
    .do();
}

//获取数据集详情页的数据内容
export async function getDatasetContents(params: DatasetContentsParams) {
  return UAPI.RES.datasetContentsApi({}).get(params).inRegion().do();
}

//编辑数据集版本数据
export async function editDatasetVersion(params: EditDatasetVersionParams) {
  return UAPI.RES.editDatasetVersionApi({}).put(params).inRegion().do();
}

//获取数据集版本列表
export async function getDatasetVersionList(params: any) {
  return UAPI.RES.datasetVersionListApi({}).get(params).inRegion().do();
}

//删除数据集
export async function deleteDataset(params: any) {
  return UAPI.RES.deleteDatasetApi({ dataset_id: params.id })
    .delete()
    .inRegion()
    .do();
}

//批量删除数据集
export async function batchDeleteDataset(params: BatchDeleteDatasetParams) {
  return UAPI.RES.batchDeleteDatasetApi({}).delete(params).inRegion().do();
}

//版本重新生成
export async function datasetVersionRebuild(
  params: DatasetVersionRebuildParams
) {
  return UAPI.RES.datasetVersionRebuildApi({}).post(params).inRegion().do();
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
