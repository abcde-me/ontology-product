import UAPI from '@/api';
import { SetStateAction } from 'react';

export interface MetadataMenuItem {
  datasourceType: string;
  datasourceName: string;
}

// 元数据管理
// 获取元数据数据源列表
export async function listMetadataDataSource(): Promise<
  ApiRes<{ data: SetStateAction<never[]> }>
> {
  return await UAPI.RES.listMetadataDataSourceApi({}).post().inRegion().do();
}

// 查询iceberg的所有表
export async function listMetadataIcebergTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataIcebergTableApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询minio的所有表
export async function listMetadataMinioBucket(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMinioBucketApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询milvus的所有表
export async function listMetadataMilvusDatabase(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMilvusDatabaseApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询doris的所有表
export async function listMetadataDorisTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataDorisTableApi({})
    .post(params)
    .inRegion()
    .do();
}
