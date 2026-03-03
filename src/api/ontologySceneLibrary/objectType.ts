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
  // Mock 数据
  // const mockObjectTypes: ObjectType[] = [
  //   {
  //     id: 1,
  //     code: 'RAW_INTELLIGENCE',
  //     name: '原始情报原始情报原始情报原始情报原始情报原始情报原始情报原始情报原始情报原始情报原始情报原始情报',
  //     description:
  //       '原始情报对象类型，包含6项属性原始情报对象类型，包含6项属性原始情报对象类型，包含6项属性原始情报对象类型，包含6项属性',
  //     icon: 'object-type-1',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db_1',
  //     ontologyTableName: 'raw_intelligence',
  //     originalDbName: 'source_db_1',
  //     originalTableName: 'raw_intelligence_source',
  //     sourceType: SourceType.ICEBERG,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-15 10:30:00',
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 10:30:00',
  //     updateUser: 'admin',
  //     isDeleted: 0,
  //     filePath: undefined
  //   },
  //   {
  //     id: 2,
  //     code: 'INTENT_HYPOTHESIS',
  //     name: '意图研判',
  //     description: '意图研判对象类型，包含4项属性',
  //     icon: 'object-type-2',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db_1',
  //     ontologyTableName: 'intent_hypothesis',
  //     originalDbName: 'source_db_1',
  //     originalTableName: 'intent_hypothesis_source',
  //     sourceType: SourceType.ICEBERG,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-15 10:35:00',
  //     createTime: '2024-01-10 09:05:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 10:35:00',
  //     updateUser: 'admin',
  //     isDeleted: 0,
  //     filePath: undefined
  //   },
  //   {
  //     id: 3,
  //     code: 'MILITARY_EVENT',
  //     name: '作战事件',
  //     description: '作战事件对象类型，包含6项属性',
  //     icon: 'object-type-3',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db_1',
  //     ontologyTableName: 'military_event',
  //     originalDbName: 'source_db_1',
  //     originalTableName: 'military_event_source',
  //     sourceType: SourceType.ICEBERG,
  //     syncStatus: SyncStatus.SYNCING,
  //     syncTime: '2024-01-15 11:00:00',
  //     createTime: '2024-01-10 09:10:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 11:00:00',
  //     updateUser: 'admin',
  //     isDeleted: 0,
  //     filePath: undefined
  //   },
  //   {
  //     id: 4,
  //     code: 'FILE_UPLOAD_TYPE',
  //     name: '文件上传类型',
  //     description: '通过文件上传创建的对象类型',
  //     icon: 'object-type-4',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db_1',
  //     ontologyTableName: 'file_upload_type',
  //     originalDbName: 'upload_db',
  //     originalTableName: 'upload_table',
  //     sourceType: SourceType.FILE_UPLOAD,
  //     syncStatus: SyncStatus.SUCCESS,
  //     syncTime: '2024-01-14 15:20:00',
  //     createTime: '2024-01-14 15:00:00',
  //     createUser: 'user1',
  //     updateTime: '2024-01-14 15:20:00',
  //     updateUser: 'user1',
  //     isDeleted: 0,
  //     filePath: '/minio/bucket/file_upload_type.csv'
  //   },
  //   {
  //     id: 5,
  //     code: 'SENSOR_TRACK',
  //     name: '传感器航迹',
  //     description: '传感器航迹对象类型，包含6项属性',
  //     icon: 'object-type-5',
  //     ontologyModelID: 1,
  //     ontologyDbName: 'ontology_db_1',
  //     ontologyTableName: 'sensor_track',
  //     originalDbName: 'source_db_1',
  //     originalTableName: 'sensor_track_source',
  //     sourceType: SourceType.ICEBERG,
  //     syncStatus: SyncStatus.FAILED,
  //     syncTime: '2024-01-15 09:00:00',
  //     createTime: '2024-01-10 09:15:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:00:00',
  //     updateUser: 'admin',
  //     isDeleted: 0,
  //     filePath: undefined
  //   }
  // ];

  // // 模拟分页和筛选
  // let filteredList = [...mockObjectTypes];

  // // 根据 filter 参数筛选
  // if (params.filter) {
  //   const filterLower = params.filter.toLowerCase();
  //   filteredList = filteredList.filter(
  //     (item) =>
  //       item.name?.toLowerCase().includes(filterLower) ||
  //       item.code?.toLowerCase().includes(filterLower) ||
  //       item.description?.toLowerCase().includes(filterLower)
  //   );
  // }

  // // 根据 ontologyModelID 筛选
  // // if (params.ontologyModelID) {
  // //   filteredList = filteredList.filter(
  // //     (item) => item.ontologyModelID === params.ontologyModelID
  // //   );
  // // }

  // // 模拟分页
  // const pageNo = params.pageNo || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (pageNo - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedList = filteredList.slice(startIndex, endIndex);

  // const mockData: ListOntologyObjectTypeRes = {
  //   result: paginatedList,
  //   totalCount: filteredList.length
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
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
  // 保留 params 参数以避免未使用告警
  // void params;

  // // Mock 创建成功，返回新创建的 ID
  // const mockData = {
  //   data: {
  //     id: Math.floor(Math.random() * 10000) + 100
  //   }
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
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
  // // 保留 params 参数以避免未使用告警
  // void params;

  // // Mock 更新成功，返回更新的 ID
  // const mockData = {
  //   data: {
  //     id: params.id
  //   }
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
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
  // 保留 params 参数以避免未使用告警
  // void params;

  // // Mock 删除成功
  // const mockData = {
  //   data: '删除成功'
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
};

export const getOntologyObjectTypeDetail = async (params: {
  id: number;
}): Promise<ApiRes<GetOntologyObjectTypeDetailRes>> => {
  return await UAPI.RES.GetOntologyObjectTypeApi({})
    .post(params)
    .inRegion()
    .do();
  // await sleep(1000);

  // // Mock 物理属性列表数据
  // const mockPhysicalProperties: CreateOntologyPhysicalProperty[] = [
  //   {
  //     id: '1',
  //     name: 'media_id',
  //     comment: '情报ID',
  //     columnType: 'STRING',
  //     isPrimary: 1,
  //     publicPropertyID: 101,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   },
  //   {
  //     id: '2',
  //     name: 'type',
  //     comment: '类别',
  //     columnType: 'STRING',
  //     isPrimary: 0,
  //     publicPropertyID: 102,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   },
  //   {
  //     id: '3',
  //     name: 'source',
  //     comment: '来源',
  //     columnType: 'STRING',
  //     isPrimary: 0,
  //     publicPropertyID: 103,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   },
  //   {
  //     id: '4',
  //     name: 'content',
  //     comment: '内容',
  //     columnType: 'TEXT',
  //     isPrimary: 0,
  //     publicPropertyID: 104,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   },
  //   {
  //     id: '5',
  //     name: 'create_time',
  //     comment: '创建时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     publicPropertyID: 105,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   },
  //   {
  //     id: '6',
  //     name: 'update_time',
  //     comment: '更新时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     publicPropertyID: 106,
  //     isSelected: 1,
  //     isStoreAsPublic: 0
  //   }
  // ];

  // // Mock 对象类型详情数据
  // const mockData: GetOntologyObjectTypeDetailRes = {
  //   id: params.id,
  //   code: 'RAW_INTELLIGENCE',
  //   name: '原始情报原始情报原始情报原始情报原始情报原始情报',
  //   description: '原始情报对象类型，包含6项属性。这是详细的对象类型描述信息。',
  //   icon: 'object-type-1',
  //   ontologyModelID: 1,
  //   originalDbName: 'source_db_1',
  //   originalTableName: 'raw_intelligence_source',
  //   sourceType: SourceType.ICEBERG,
  //   filePath: undefined,
  //   ontologyPhysicalPropertiesList: mockPhysicalProperties
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
};

export const uploadOntologyCSVFileAndParse = async (params: {
  file: File;
}): Promise<ApiRes<UploadOntologyCSVFileAndParseRes>> => {
  return await UAPI.RES.UploadOntologyEntityDataFileApi({})
    .post(params)
    .inRegion()
    .do();
  // 保留 params 参数以避免未使用告警
  // void params;

  // Mock 数据：模拟 CSV 文件解析结果
  // const mockData: UploadOntologyCSVFileAndParseRes = {
  //   data: {
  //     columnList: [
  //       'id',
  //       'name',
  //       'code',
  //       'description',
  //       'type',
  //       'status',
  //       'createTime',
  //       'updateTime'
  //     ],
  //     path: `/minio/bucket/ontology/${params.file.name || 'uploaded_file.csv'}`
  //   }
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
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
export const getObjectTypeSyncLog = async (params: {
  id: number;
  pageNo: number;
  pageSize: number;
}): Promise<ApiRes<string>> => {
  return await UAPI.RES.GetObjectTypeSyncTaskLogApi({})
    .post(params)
    .inRegion()
    .do();
};
