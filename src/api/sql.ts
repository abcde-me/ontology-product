import UAPI from '@/api';

export interface CatalogListParams {
  /** 获取目录类型，0: 获取所有数据目录，1: 获取源数据目录，2：获取目标数据目录 */
  root_type: number;
  /** 搜索关键字 TODO: 匹配字段？ */
  search?: string;
}

export interface CatalogListResponse {
  msg: string;
  stat: number;
  code: number;
  data: {};
}

/** 源数据目录 */
export async function getCatalogList(
  param: CatalogListParams
): Promise<CatalogListResponse> {
  return await UAPI.RES.catalogListApi({}).get(param).inRegion().do();
}

export interface DatasetListParams {
  /** 排序方式：asc-正序、desc-倒序 */
  sort_order: string;
  /** 页码 */
  page?: number;
  /** 页大小 */
  limit?: number;
  /** 排序字段：created_at-创建时间、updated_at-更新时间 */
  sort_field?: string;
  /** 数据集名称 */
  name?: string;
  /** 数据集描述 */
  description?: string;
  /** 数据集状态列表（
   * creating-创建中、
   * create_failed-创建失败、
   * normal-正常、
   * version_updating-版本更新中、
   * version_update_failed-版本更新失败）
   * */
  status_list?: string[];
  /** 存储方式列表：jsonl、file */
  storage_type_list?: string[];
  /** 标签名称列表 */
  tags?: string[];
}

export interface DatasetListResponse {
  msg: string;
  stat: number;
  code: number;
  data: {};
}

/** 数据集目录 */
export async function getDatasetList(
  params: DatasetListParams
): Promise<DatasetListResponse> {
  return UAPI.RES.datasetsApi({}).post(params).inRegion().do();
}
