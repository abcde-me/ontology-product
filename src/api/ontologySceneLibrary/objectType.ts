import {
  CreateOntologyObjectTypeReq,
  CreateOntologyPhysicalProperty,
  GetOntologyObjectTypeDetailRes,
  ListMetadataIcebergDatabaseNameRes,
  ListMetadataIcebergTableReq,
  ListMetadataIcebergTableRes,
  ListMetadataIcebergTiDBTableReq,
  ListMetadataIcebergTiDBTableRes,
  ListOntologyObjectTypeReq,
  ListOntologyObjectTypeRes,
  ObjectType,
  SourceType,
  UpdateOntologyObjectTypeReq,
  UploadOntologyCSVFileAndParseRes
} from '@/types/objectType';
import { SyncStatus } from '@/types/graphApi';
import { sleep } from '@/pages/workflowConfig/utils';
import UAPI from '@/api';

export const listOntologyObjectType = async (
  params: ListOntologyObjectTypeReq
): Promise<ApiRes<ListOntologyObjectTypeRes>> => {
  return await UAPI.RES.ListOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

export const createOntologyObjectType = async (
  params: CreateOntologyObjectTypeReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  return await UAPI.RES.CreateOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

export const updateOntologyObjectType = async (
  params: UpdateOntologyObjectTypeReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  return await UAPI.RES.UpdateOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

export const deleteOntologyObjectType = async (params: {
  id: number;
}): Promise<
  ApiRes<{
    data: string;
  }>
> => {
  return await UAPI.RES.DeleteOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

export const getOntologyObjectTypeDetail = async (params: {
  id: number;
}): Promise<ApiRes<GetOntologyObjectTypeDetailRes>> => {
  return await UAPI.RES.GetOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
};

export const uploadOntologyCSVFileAndParse = async (params: {
  file: File;
}): Promise<ApiRes<UploadOntologyCSVFileAndParseRes>> => {
  return await UAPI.RES.UploadOntologyEntityDataFileApi({})
    .post(params)
    .inRegion()
    .do();
};

// 创建iceberg表时-数据库下拉列表
export const listMetadataIcebergDatabaseName = async (params: {
  instanceId: number;
}): Promise<ApiRes<ListMetadataIcebergDatabaseNameRes>> => {
  return await UAPI.RES.listMetadataIcebergDatabaseNameApi({})
    .post(params)
    .inRegion()
    .do();
};

// 查询iceberg的所有表
export const listMetadataIcebergTable = async (
  params: ListMetadataIcebergTableReq
): Promise<ApiRes<ListMetadataIcebergTableRes>> => {
  return await UAPI.RES.listMetadataIcebergTableApi({})
    .post(params)
    .inRegion()
    .do();
};

// 本体查询iceberg表的字段信息
export const listMetadataIcebergTiDBTable = async (
  params: ListMetadataIcebergTiDBTableReq
): Promise<ApiRes<ListMetadataIcebergTiDBTableRes>> => {
  return await UAPI.RES.ListMetadataIcebergTiDBTableApi({})
    .post(params)
    .inRegion()
    .do();
};

// 下载标准模版
export const getTemplateFile = async (params: {
  file_name: 'link_type' | 'object_type';
}): Promise<ApiRes<string>> => {
  return await UAPI.RES.GetTemplateFileApi({}).post(params).inRegion().do();
};

// 获取对象类型同步日志
export const getObjectTypeSyncLog = async (
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
  return await UAPI.RES.GetObjectTypeSyncTaskLogApi({})
    .post(params)
    .inRegion()
    .do();
};
