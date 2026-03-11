import type {
  GetOntologyTopologyResponse,
  LinkInfo,
  ListOntologyLinkTypeReq,
  ListOntologyLinkTypeRes,
  ListOntologyObjectTypeDataRes,
  ListOntologyPhysicalPropertiesReq,
  ListOntologyPhysicalPropertiesRes
} from '@/types/graphApi';
import UAPI from '@/api';

// 获取本体拓扑（mock 数据）
export async function getOntologyTopology(params: {
  id: number;
}): Promise<ApiRes<GetOntologyTopologyResponse>> {
  return await UAPI.RES.GetOntologyTopologyApi({}).post(params).inRegion().do();
}

// 分页查询对象类型实例数据
export async function listOntologyObjectTypeData(params: {
  id: number;
  page: number;
  pageSize: number;
  /**
   * 查询条件列表
   */
  fieldList?: {
    /**
     * 字段名
     */
    fieldName?: string;
    /**
     * 字段值（支持模糊查询）
     */
    fieldValue?: string;
    /**
     * 字段值列表（支持IN条件查询）
     */
    fieldValueList?: string[];
  }[];
}): Promise<ApiRes<ListOntologyObjectTypeDataRes>> {
  return await UAPI.RES.ListOntologyObjectTypeDataApi({})
    .post(params)
    .inRegion()
    .do();
}

// 获取物理属性列表
export async function listOntologyPhysicalProperties(
  params: ListOntologyPhysicalPropertiesReq
): Promise<ApiRes<ListOntologyPhysicalPropertiesRes>> {
  return await UAPI.RES.ListOntologyPhysicalPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
}

export async function listOntologyLinkType(
  params: ListOntologyLinkTypeReq
): Promise<ApiRes<ListOntologyLinkTypeRes>> {
  return await UAPI.RES.ListOntologyLinkTypeApi({})
    .post(params)
    .inRegion()
    .do();
}
