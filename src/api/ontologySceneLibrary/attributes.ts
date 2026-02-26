import {
  CreateOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesRes,
  PublicProperty,
  UpdateOntologyPublicPropertiesReq
} from '@/types/attributes';
import UAPI from '@/api';

export const listOntologyPublicProperties = async (
  params: ListOntologyPublicPropertiesReq
): Promise<ApiRes<ListOntologyPublicPropertiesRes>> => {
  return await UAPI.RES.ListOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
  // return await UAPI.RES.ListOntologyPublicPropertiesApi({})
  //   .post(params)
  //   .inRegion()
  //   .do();

  // 保留 params 参数以避免未使用告警
  // void params;

  // // Mock 数据
  // const mockPublicProperties: PublicProperty[] = [
  //   {
  //     id: 101,
  //     name: 'media_id',
  //     comment: '情报ID',
  //     description: '情报的唯一标识符',
  //     columnType: 'STRING',
  //     dataSource: 'Media_DATA_SET',
  //     ontologyObjectTypeCounts: 3,
  //     ontologyObjectTypeList: [
  //       { id: 1, name: '原始情报' },
  //       { id: 2, name: '意图研判' },
  //       { id: 4, name: '文件上传类型' }
  //     ],
  //     createTime: '2024-01-10 09:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 10:30:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 102,
  //     name: 'type',
  //     comment: '类别',
  //     description: '信息的分类类型',
  //     columnType: 'STRING',
  //     dataSource: 'Media_DATA_SET',
  //     ontologyObjectTypeCounts: 2,
  //     ontologyObjectTypeList: [
  //       { id: 1, name: '原始情报' },
  //       { id: 3, name: '作战事件' }
  //     ],
  //     createTime: '2024-01-10 09:05:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 10:35:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 103,
  //     name: 'source',
  //     comment: '来源',
  //     description: '信息的来源渠道',
  //     columnType: 'STRING',
  //     dataSource: 'Media_DATA_SET',
  //     ontologyObjectTypeCounts: 4,
  //     ontologyObjectTypeList: [
  //       { id: 1, name: '原始情报' },
  //       { id: 2, name: '意图研判' },
  //       { id: 3, name: '作战事件' },
  //       { id: 5, name: '传感器航迹' }
  //     ],
  //     createTime: '2024-01-10 09:10:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 11:00:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 104,
  //     name: 'wind_speed',
  //     comment: '风速',
  //     description: '风速属性，单位：m/s',
  //     columnType: 'DOUBLE',
  //     dataSource: 'Weather_DATA_SET',
  //     ontologyObjectTypeCounts: 1,
  //     ontologyObjectTypeList: [{ id: 1, name: '原始情报' }],
  //     createTime: '2024-01-10 09:15:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:00:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 105,
  //     name: 'visibility',
  //     comment: '能见度',
  //     description: '能见度属性，单位：km',
  //     columnType: 'DOUBLE',
  //     dataSource: 'Weather_DATA_SET',
  //     ontologyObjectTypeCounts: 1,
  //     ontologyObjectTypeList: [{ id: 1, name: '原始情报' }],
  //     createTime: '2024-01-10 09:20:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:05:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 106,
  //     name: 'temperature',
  //     comment: '温度',
  //     description: '温度属性，单位：摄氏度',
  //     columnType: 'DOUBLE',
  //     dataSource: 'Weather_DATA_SET',
  //     ontologyObjectTypeCounts: 2,
  //     ontologyObjectTypeList: [
  //       { id: 1, name: '原始情报' },
  //       { id: 5, name: '传感器航迹' }
  //     ],
  //     createTime: '2024-01-10 09:25:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:10:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 107,
  //     name: 'timestamp',
  //     comment: '时间戳',
  //     description: '事件发生的时间戳',
  //     columnType: 'TIMESTAMP',
  //     dataSource: 'Common_DATA_SET',
  //     ontologyObjectTypeCounts: 5,
  //     ontologyObjectTypeList: [
  //       { id: 1, name: '原始情报' },
  //       { id: 2, name: '意图研判' },
  //       { id: 3, name: '作战事件' },
  //       { id: 4, name: '文件上传类型' },
  //       { id: 5, name: '传感器航迹' }
  //     ],
  //     createTime: '2024-01-10 09:30:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:15:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   },
  //   {
  //     id: 108,
  //     name: 'location',
  //     comment: '位置',
  //     description: '地理位置信息',
  //     columnType: 'STRING',
  //     dataSource: 'Location_DATA_SET',
  //     ontologyObjectTypeCounts: 3,
  //     ontologyObjectTypeList: [
  //       { id: 3, name: '作战事件' },
  //       { id: 5, name: '传感器航迹' },
  //       { id: 1, name: '原始情报' }
  //     ],
  //     createTime: '2024-01-10 09:35:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-15 09:20:00',
  //     updateUser: 'admin',
  //     isDeleted: 0
  //   }
  // ];

  // // 模拟筛选和分页
  // let filteredList = [...mockPublicProperties];

  // // 根据 filter 参数筛选
  // if (params.filter) {
  //   const filterLower = params.filter.toLowerCase();
  //   filteredList = filteredList.filter(
  //     (item) =>
  //       item.name?.toLowerCase().includes(filterLower) ||
  //       item.comment?.toLowerCase().includes(filterLower) ||
  //       item.description?.toLowerCase().includes(filterLower) ||
  //       item.dataSource?.toLowerCase().includes(filterLower)
  //   );
  // }

  // // 模拟排序
  // if (params.orderBy) {
  //   filteredList.sort((a, b) => {
  //     const aValue = a[params.orderBy as keyof PublicProperty];
  //     const bValue = b[params.orderBy as keyof PublicProperty];
  //     if (aValue === undefined || bValue === undefined) return 0;
  //     const comparison = String(aValue).localeCompare(
  //       String(bValue),
  //       undefined,
  //       {
  //         numeric: true
  //       }
  //     );
  //     return params.order === 'asc' ? comparison : -comparison;
  //   });
  // }

  // // 模拟分页
  // const pageNo = params.pageNo || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (pageNo - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedList = filteredList.slice(startIndex, endIndex);

  // const mockData: ListOntologyPublicPropertiesRes = {
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

export const createOntologyPublicProperties = async (
  params: CreateOntologyPublicPropertiesReq
): Promise<
  ApiRes<{
    data: {
      id: number;
    };
  }>
> => {
  return await UAPI.RES.CreateOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
  // 保留 params 参数以避免未使用告警
  // void params;

  // // Mock 创建成功，返回新创建的 ID
  // const mockData = {
  //   data: {
  //     id: Math.floor(Math.random() * 10000) + 200
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

export const deleteOntologyPublicProperties = async (params: {
  id: number;
}): Promise<
  ApiRes<{
    data: string;
  }>
> => {
  return await UAPI.RES.DeleteOntologyPublicPropertiesApi({})
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

export const updateOntologyPublicProperties = async (
  params: UpdateOntologyPublicPropertiesReq
): Promise<ApiRes<string>> => {
  return await UAPI.RES.UpdateOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
};
