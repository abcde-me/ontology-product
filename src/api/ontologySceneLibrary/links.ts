import {
  ListOntologyLinkTypeColumnReq,
  ListOntologyLinkTypeColumnRes,
  ListOntologyLinkTypeDataReq,
  ListOntologyLinkTypeDataRes,
  LinkTypeAttributeInfo,
  GetOntologyLinkTypeRes,
  CreateOntologyLinkTypeReq,
  UpdateOntologyLinkTypeReq
} from '@/types/links';
import UAPI from '@/api';

// 获取链接的属性列表
export const listOntologyLinkTypeColumn = async (
  params: ListOntologyLinkTypeColumnReq
): Promise<ApiRes<ListOntologyLinkTypeColumnRes>> => {
  return await UAPI.RES.ListOntologyLinkTypeColumnApi({})
    .post(params)
    .inRegion()
    .do();
};

// 获取链接的实例列表
export const listOntologyLinkTypeData = async (
  params: ListOntologyLinkTypeDataReq
): Promise<ApiRes<ListOntologyLinkTypeDataRes>> => {
  return await UAPI.RES.ListOntologyLinkTypeDataApi({})
    .post(params)
    .inRegion()
    .do();
};

// 获取链接类型详细信息
export const getOntologyLinkType = async (params: {
  id: number;
}): Promise<ApiRes<GetOntologyLinkTypeRes>> => {
  return await UAPI.RES.GetOntologyLinkTypeApi({}).post(params).inRegion().do();
};

// 创建链接类型
export const createOntologyLinkType = async (
  params: CreateOntologyLinkTypeReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  return await UAPI.RES.CreateOntologyLinkTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

// 更新链接类型
export const updateOntologyLinkType = async (
  params: UpdateOntologyLinkTypeReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  return await UAPI.RES.UpdateOntologyLinkTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

// 删除链接类型
export const deleteOntologyLinkType = async (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  return await UAPI.RES.DeleteOntologyLinkTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

// 获取链接类型同步日志
export const getLinkTypeSyncTaskLog = async (
  params: {
    id: number;
    pageNo: number;
    pageSize: number;
  } & Record<string, any>
): Promise<
  ApiRes<{
    message: string;
  }>
> => {
  return await UAPI.RES.GetLinkTypeSyncTaskLogApi({})
    .post(params)
    .inRegion()
    .do();
};
