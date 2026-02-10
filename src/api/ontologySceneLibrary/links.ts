import {
  ListOntologyLinkTypeColumnReq,
  ListOntologyLinkTypeColumnRes,
  ListOntologyLinkTypeDataReq,
  ListOntologyLinkTypeDataRes,
  LinkTypeAttributeInfo,
  GetOntologyLinkTypeRes,
  LinkType
} from '@/types/links';
import { ObjectType } from '@/types/objectType';
import { SyncStatus } from '@/types/graphApi';
import UAPI from '@/api';

// 获取链接的属性列表
export const listOntologyLinkTypeColumn = async (
  params: ListOntologyLinkTypeColumnReq
): Promise<ApiRes<ListOntologyLinkTypeColumnRes>> => {
  return UAPI.RES.ListOntologyLinkTypeColumnApi({})
    .post(params)
    .inRegion()
    .do();

  // Mock 数据：链接类型属性列表
  // const mockAttributes: LinkTypeAttributeInfo[] = [
  //   {
  //     id: 1,
  //     name: 'link_id',
  //     comment: '链接ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 1,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 2,
  //     name: 'source_object_id',
  //     comment: '源对象ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 3,
  //     name: 'target_object_id',
  //     comment: '目标对象ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 4,
  //     name: 'link_type',
  //     comment: '链接类型',
  //     columnType: 'STRING',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 5,
  //     name: 'strength',
  //     comment: '关联强度',
  //     columnType: 'DOUBLE',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 6,
  //     name: 'create_time',
  //     comment: '创建时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 7,
  //     name: 'update_time',
  //     comment: '更新时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 8,
  //     name: 'description',
  //     comment: '描述信息',
  //     columnType: 'TEXT',
  //     isPrimary: 0,
  //     isUse: 0,
  //     isDeleted: 0,
  //     linkTypeID: params.linkTypeID || 1,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   }
  // ];

  // // 模拟筛选和分页
  // let filteredList = [...mockAttributes];

  // // 根据 filter 参数筛选
  // if (params.filter) {
  //   const filterLower = params.filter.toLowerCase();
  //   filteredList = filteredList.filter(
  //     (item) =>
  //       item.name?.toLowerCase().includes(filterLower) ||
  //       item.comment?.toLowerCase().includes(filterLower)
  //   );
  // }

  // // 根据 isUse 参数筛选
  // if (params.isUse !== undefined) {
  //   filteredList = filteredList.filter((item) => item.isUse === params.isUse);
  // }

  // // 根据 linkTypeID 筛选
  // if (params.linkTypeID) {
  //   filteredList = filteredList.filter(
  //     (item) => item.linkTypeID === params.linkTypeID
  //   );
  // }

  // // 模拟排序
  // if (params.orderBy) {
  //   filteredList.sort((a, b) => {
  //     const aValue = a[params.orderBy as keyof LinkTypeAttributeInfo];
  //     const bValue = b[params.orderBy as keyof LinkTypeAttributeInfo];
  //     if (aValue === undefined || bValue === undefined) {
  //       return 0;
  //     }
  //     if (params.order === 'asc') {
  //       return aValue > bValue ? 1 : -1;
  //     } else {
  //       return aValue < bValue ? 1 : -1;
  //     }
  //   });
  // }

  // // 模拟分页
  // const pageNo = params.pageNo || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (pageNo - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedList = filteredList.slice(startIndex, endIndex);

  // const mockData: ListOntologyLinkTypeColumnRes = {
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

// 获取链接的实例列表
export const listOntologyLinkTypeData = async (
  params: ListOntologyLinkTypeDataReq
): Promise<ApiRes<ListOntologyLinkTypeDataRes>> => {
  return UAPI.RES.ListOntologyLinkTypeDataApi({}).post(params).inRegion().do();

  // Mock 数据：链接实例列表
  // const mockLinkInstances: Record<string, any>[] = [
  //   {
  //     link_id: 1001,
  //     source_object_id: 2001,
  //     target_object_id: 2002,
  //     link_type: '关联',
  //     strength: 0.85,
  //     create_time: '2024-01-15 10:30:00',
  //     update_time: '2024-01-15 10:30:00',
  //     description: '对象A与对象B之间的关联关系'
  //   },
  //   {
  //     link_id: 1002,
  //     source_object_id: 2001,
  //     target_object_id: 2003,
  //     link_type: '依赖',
  //     strength: 0.72,
  //     create_time: '2024-01-15 10:35:00',
  //     update_time: '2024-01-15 10:35:00',
  //     description: '对象A依赖于对象C'
  //   },
  //   {
  //     link_id: 1003,
  //     source_object_id: 2002,
  //     target_object_id: 2004,
  //     link_type: '包含',
  //     strength: 0.95,
  //     create_time: '2024-01-15 11:00:00',
  //     update_time: '2024-01-15 11:00:00',
  //     description: '对象B包含对象D'
  //   },
  //   {
  //     link_id: 1004,
  //     source_object_id: 2003,
  //     target_object_id: 2005,
  //     link_type: '关联',
  //     strength: 0.68,
  //     create_time: '2024-01-15 11:05:00',
  //     update_time: '2024-01-15 11:05:00',
  //     description: '对象C与对象E之间的关联关系'
  //   },
  //   {
  //     link_id: 1005,
  //     source_object_id: 2004,
  //     target_object_id: 2006,
  //     link_type: '引用',
  //     strength: 0.8,
  //     create_time: '2024-01-15 11:10:00',
  //     update_time: '2024-01-15 11:10:00',
  //     description: '对象D引用对象F'
  //   },
  //   {
  //     link_id: 1006,
  //     source_object_id: 2005,
  //     target_object_id: 2007,
  //     link_type: '关联',
  //     strength: 0.55,
  //     create_time: '2024-01-15 11:15:00',
  //     update_time: '2024-01-15 11:15:00',
  //     description: '对象E与对象G之间的关联关系'
  //   },
  //   {
  //     link_id: 1007,
  //     source_object_id: 2006,
  //     target_object_id: 2008,
  //     link_type: '依赖',
  //     strength: 0.9,
  //     create_time: '2024-01-15 11:20:00',
  //     update_time: '2024-01-15 11:20:00',
  //     description: '对象F依赖于对象H'
  //   },
  //   {
  //     link_id: 1008,
  //     source_object_id: 2007,
  //     target_object_id: 2009,
  //     link_type: '包含',
  //     strength: 0.75,
  //     create_time: '2024-01-15 11:25:00',
  //     update_time: '2024-01-15 11:25:00',
  //     description: '对象G包含对象I'
  //   },
  //   {
  //     link_id: 1009,
  //     source_object_id: 2008,
  //     target_object_id: 2010,
  //     link_type: '关联',
  //     strength: 0.65,
  //     create_time: '2024-01-15 11:30:00',
  //     update_time: '2024-01-15 11:30:00',
  //     description: '对象H与对象J之间的关联关系'
  //   },
  //   {
  //     link_id: 1010,
  //     source_object_id: 2009,
  //     target_object_id: 2011,
  //     link_type: '引用',
  //     strength: 0.88,
  //     create_time: '2024-01-15 11:35:00',
  //     update_time: '2024-01-15 11:35:00',
  //     description: '对象I引用对象K'
  //   }
  // ];

  // // 模拟分页
  // const page = params.page || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (page - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedList = mockLinkInstances.slice(startIndex, endIndex);

  // const mockData: ListOntologyLinkTypeDataRes = {
  //   result: paginatedList,
  //   totalCount: mockLinkInstances.length
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
};

// 获取链接类型详细信息
export const getOntologyLinkType = async (params: {
  id: number;
}): Promise<ApiRes<GetOntologyLinkTypeRes>> => {
  return UAPI.RES.GetOntologyLinkTypeApi({}).post(params).inRegion().do();

  // Mock 链接类型列信息
  // const mockLinkTypeColumns: LinkTypeAttributeInfo[] = [
  //   {
  //     id: 1,
  //     name: 'link_id',
  //     comment: '链接ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 1,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 2,
  //     name: 'source_object_id',
  //     comment: '源对象ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 3,
  //     name: 'target_object_id',
  //     comment: '目标对象ID',
  //     columnType: 'BIGINT',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 4,
  //     name: 'strength',
  //     comment: '关联强度',
  //     columnType: 'DOUBLE',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 5,
  //     name: 'create_time',
  //     comment: '创建时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   },
  //   {
  //     id: 6,
  //     name: 'update_time',
  //     comment: '更新时间',
  //     columnType: 'TIMESTAMP',
  //     isPrimary: 0,
  //     isUse: 1,
  //     isDeleted: 0,
  //     linkTypeID: params.id,
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-10 09:00:00',
  //     updateUser: 'admin'
  //   }
  // ];

  // // Mock 源对象类型信息
  // const mockSourceObjectType: ObjectType = {
  //   id: 1,
  //   code: 'RAW_INTELLIGENCE',
  //   name: '原始情报',
  //   description: '原始情报对象类型，包含6项属性',
  //   icon: 'object-type-1',
  //   ontologyModelID: 1,
  //   ontologyDbName: 'ontology_db_1',
  //   ontologyTableName: 'raw_intelligence',
  //   originalDbName: 'source_db_1',
  //   originalTableName: 'raw_intelligence_source',
  //   sourceType: 1,
  //   syncStatus: SyncStatus.SUCCESS,
  //   syncTime: '2024-01-15 10:30:00',
  //   createTime: '2024-01-10 09:00:00',
  //   createUser: 'admin',
  //   updateTime: '2024-01-15 10:30:00',
  //   updateUser: 'admin',
  //   isDeleted: 0
  // };

  // // Mock 目标对象类型信息
  // const mockTargetObjectType: ObjectType = {
  //   id: 2,
  //   code: 'INTENT_HYPOTHESIS',
  //   name: '意图研判',
  //   description: '意图研判对象类型，包含4项属性',
  //   icon: 'object-type-2',
  //   ontologyModelID: 1,
  //   ontologyDbName: 'ontology_db_1',
  //   ontologyTableName: 'intent_hypothesis',
  //   originalDbName: 'source_db_1',
  //   originalTableName: 'intent_hypothesis_source',
  //   sourceType: 1,
  //   syncStatus: SyncStatus.SUCCESS,
  //   syncTime: '2024-01-15 10:35:00',
  //   createTime: '2024-01-10 09:05:00',
  //   createUser: 'admin',
  //   updateTime: '2024-01-15 10:35:00',
  //   updateUser: 'admin',
  //   isDeleted: 0
  // };

  // // Mock 链接类型详细信息
  // const mockData: GetOntologyLinkTypeRes = {
  //   id: params.id,
  //   code: 'LINK_RELATION',
  //   name: params.id === 101 ? '研判支撑' : '任务分配',
  //   description: '原始情报与意图研判之间的关联关系，用于描述两者之间的业务联系',
  //   type: LinkType.ONE_TO_MANY,
  //   ontologyModelID: 1,
  //   ontologyDbName: 'ontology_db_1',
  //   ontologyTableName: 'link_relation',
  //   linkDBName: 'source_db_1',
  //   linkTableName: 'link_relation_source',
  //   linkSourceType: 1,
  //   sourceObjectTypeID: 1,
  //   sourceObjectTypeInfo: mockSourceObjectType,
  //   sourcePropertyID: 101,
  //   targetObjectTypeID: 2,
  //   targetObjectTypeInfo: mockTargetObjectType,
  //   targetPropertyID: 201,
  //   linkSourceColumnID: 2,
  //   linkTargetColumnID: 3,
  //   syncStatus: SyncStatus.SUCCESS,
  //   syncTime: '2024-01-15 11:00:00',
  //   createTime: '2024-01-10 10:00:00',
  //   createUser: 'admin',
  //   updateTime: '2024-01-15 11:00:00',
  //   updateUser: 'admin',
  //   isDeleted: 0,
  //   filePath: undefined,
  //   ontologyLinkTypeColumnList: mockLinkTypeColumns
  // };

  // return Promise.resolve({
  //   code: '',
  //   data: mockData,
  //   message: 'mock success',
  //   requestId: 'mock-request-id',
  //   status: 200
  // });
};
