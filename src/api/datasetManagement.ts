import UAPI from '@/api';
import {
  DatasetVersionFileParams,
  DatasetVersionFileRes,
  GetDatasetListReq,
  GetDatasetListRes
} from '@/types/datasetManagement';
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
  scene_ids?: string[];
  src_name?: string[];
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
  id?: string;
  path?: string;
  page?: number;
  type?: string;
  page_size?: number;
}

interface UpdateDatasetParams {
  id: number;
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
  id: number;
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
    sort_order,
    scene_ids,
    src_name
  } = params;
  const queryParams: Record<string, any> = {
    page,
    limit
  };
  if (search_field && search) {
    queryParams[search_field] = search;
  }
  if (scene_ids && scene_ids.length > 0) {
    queryParams.scene_ids = scene_ids;
  }
  if (tag_names && tag_names.length > 0) {
    queryParams.tags = tag_names; // 直接赋值数组
  }
  if (storage_type && storage_type.length > 0) {
    queryParams.storage_type_list = storage_type; // 直接赋值数组
  }
  // 添加来源过滤参数
  if (params.src_name && params.src_name.length > 0) {
    queryParams.src_name = src_name; // 直接赋值数组
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
  return UAPI.RES.datasetsApi({}).post(queryParams).inRegion().do();
}

//获取数据集详情
// export async function getDatasetDetail(id: string) {
//   return UAPI.RES.datasetDetailApi({ id }).get().inRegion().do();
// }

//新建数据集
export async function createDataset(params: CreateDatasetParams) {
  return UAPI.RES.createDatasetApi({}).post(params).inRegion().do();
}

//获取标签列表
export async function getTagList() {
  return UAPI.RES.tagListApi({}).post({}).inRegion().do();
}

//查询连接器信息列表
export async function getConnectorList(params: ConnectorListParams = {}) {
  return UAPI.RES.connectorListApi({})
    .post(params)
    .inRegion()
    .do({ preCheck: false });
}

//查询指定连接器加载成功的文件信息
export async function getConnectorFileList(params: ConnectorFileListParams) {
  return UAPI.RES.connectorFileListApi({}).post(params).inRegion().do();
}

//修改数据集
export async function updateDataset(params: UpdateDatasetParams) {
  return UAPI.RES.updateDatasetApi({}).post(params).inRegion().do();
}

//获取数据集详情页
export async function getDatasetDetailPage(params: DatasetDetailPageParams) {
  return UAPI.RES.datasetDetailPageApi({}).post(params).inRegion().do();
}

//获取数据集详情页的数据内容
export async function getDatasetContents(params: DatasetContentsParams) {
  return UAPI.RES.datasetContentsApi({})
    .post({ ...params, id: Number(params.id) })
    .inRegion()
    .do();
}

//编辑数据集版本数据
export async function editDatasetVersion(params: EditDatasetVersionParams) {
  return UAPI.RES.editDatasetVersionApi({}).post(params).inRegion().do();
}

//获取数据集版本列表
export async function getDatasetVersionList(params: any) {
  return UAPI.RES.datasetVersionListApi({}).post(params).inRegion().do();
}

//删除数据集
export async function deleteDataset(params: any) {
  return UAPI.RES.deleteDatasetApi({}).post(params).inRegion().do();
}

//批量删除数据集
export async function batchDeleteDataset(params: BatchDeleteDatasetParams) {
  return UAPI.RES.batchDeleteDatasetApi({}).post(params).inRegion().do();
}

//版本重新生成
export async function datasetVersionRebuild(
  params: DatasetVersionRebuildParams
) {
  return UAPI.RES.datasetVersionRebuildApi({}).post(params).inRegion().do();
}

// 定义查询目标数据文件的参数接口
interface TargetDataFileQueryParams {
  page: number;
  full_path: string;
  limit: number;
}
//查询目标数据文件列表
export async function getTargetDataFileList(params: TargetDataFileQueryParams) {
  return await UAPI.RES.targetDataFileListApi({}).post(params).inRegion().do();
}
//查询数据内容文件列表
export async function getDataContentFileList(params: {
  id: number | string;
  version_id: string;
  page: number;
  page_size: number;
}) {
  return await UAPI.RES.dataContentFileList({})
    .post({ ...params, id: Number(params.id) })
    .inRegion()
    .do();
}
//查询数据内容数据库列表
export async function getDataContentTableList(params: {
  id: number | string;
  version_id: string;
}) {
  return await UAPI.RES.dataContentTableList({}).post(params).inRegion().do();
}

// 搜索数据集列表
export async function searchDatasetList(
  params: GetDatasetListReq
): Promise<ApiRes<GetDatasetListRes>> {
  return await UAPI.RES.datasetsApi({}).post(params).inRegion().do();
}

export async function getDatasetVersionFile(
  params: DatasetVersionFileParams
): Promise<ApiRes<DatasetVersionFileRes>> {
  // TODO: 联调
  return await UAPI.RES.dataContentFileList({})
    .post({ ...params, id: Number(params.id) })
    .inRegion()
    .do();
}

// 获取数据集场景分类列表
export async function getDatasetSceneList() {
  return await UAPI.RES.datasetSceneListApi({}).post().inRegion().do();
}
