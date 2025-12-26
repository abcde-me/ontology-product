import UAPI from '@/api';
import { SetStateAction } from 'react';

export interface MetadataMenuItem {
  id: number;
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

// 查询minio的基本信息
export async function getMetadataMinioBucket(
  params: Record<string | number, any>
) {
  return await UAPI.RES.getMetadataMinioBucketApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询minio的对象信息
export async function listMetadataMinioObject(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMinioObjectApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询iceberg表的基本信息
export async function getMetadataIcebergTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.getMetadataIcebergTableApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询iceberg表的字段信息
export async function listMetadataIcebergField(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataIcebergFieldApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询iceberg表的分区信息
export async function listMetadataIcebergPartition(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataIcebergPartitionApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询iceberg表的预览数据
export async function listMetadataIcebergData(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataIcebergDataApi({})
    .post(params)
    .inRegion()
    .do();
}

// 创建iceberg数据库
export async function createMetadataIcebergDatabase(
  params: Record<string | number, any>
) {
  return await UAPI.RES.createMetadataIcebergDatabaseApi({})
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

// 查询doris表的基本信息
export async function getMetadataMilvusCollection(
  params: Record<string | number, any>
) {
  return await UAPI.RES.getMetadataMilvusCollectionApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询milvus表的字段信息
export async function listMetadataMilvusField(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMilvusFieldApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询milvus表的分区信息
export async function listMetadataMilvusPartition(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMilvusPartitionApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询milvus表的预览数据
export async function listMetadataMilvusData(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataMilvusDataApi({})
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

// 查询doris表的基本信息
export async function getMetadataDorisTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.getMetadataDorisTableApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询doris表的字段信息
export async function listMetadataDorisField(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataDorisFieldApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询doris表的分区信息
export async function listMetadataDorisPartition(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataDorisPartitionApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询doris表的预览数据
export async function listMetadataDorisData(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataDorisDataApi({})
    .post(params)
    .inRegion()
    .do();
}

// 创建doris数据库
export async function createMetadataDorisDatabase(
  params: Record<string | number, any>
) {
  return await UAPI.RES.createMetadataDorisDatabaseApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询iceberg数据库的下拉列表
export async function listMetadataIcebergDatabaseName(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataIcebergDatabaseNameApi({})
    .post(params)
    .inRegion()
    .do();
}

// 创建iceberg表
export async function createMetadataIcebergTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.createMetadataIcebergTableApi({})
    .post(params)
    .inRegion()
    .do();
}

// 查询doris数据库的下拉列表
export async function listMetadataDorisDatabaseName(
  params: Record<string | number, any>
) {
  return await UAPI.RES.listMetadataDorisDatabaseNameApi({})
    .post(params)
    .inRegion()
    .do();
}

// 创建doris表
export async function createMetadataDorisTable(
  params: Record<string | number, any>
) {
  return await UAPI.RES.createMetadataDorisTableApi({})
    .post(params)
    .inRegion()
    .do();
}
