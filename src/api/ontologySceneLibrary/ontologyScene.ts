import UAPI from '@/api';
import { sleep } from '@/pages/workflowConfig/utils';
import {
  CreateOntologyModelReq,
  ListOntologyModelReq,
  ListOntologyModelRes,
  UpdateOntologyModelReq,
  OntologScene
} from '@/types/ontologySceneApi';

export const listOntologyModel = async (
  params: ListOntologyModelReq
): Promise<ApiRes<ListOntologyModelRes>> => {
  return await UAPI.RES.ListOntologyModelApi({}).post(params).inRegion().do();
  // await sleep(1000);
  // // Mock 数据
  // const mockData: OntologScene[] = [
  //   {
  //     id: 1,
  //     name: '作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景作战本体场景',
  //     description:
  //       '用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型',
  //     icon: 'ontology-scene-1',
  //     createTime: '2024-01-15 10:00:00',
  //     createUser: 'admin',
  //     updateTime: '2024-01-20 14:30:00',
  //     updateUser: 'admin',
  //     isDeleted: 0,
  //     ontologyLinkTypeCounts: 15,
  //     ontologyObjectTypeCounts: 8,
  //     ontologyActionCounts: 12,
  //     ontologyFunctionCounts: 6,
  //     tagList: [
  //       { id: 1, name: '作战' },
  //       { id: 2, name: '军事' }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: '情报分析场景',
  //     description: '用于情报分析和处理的本体模型',
  //     icon: 'ontology-scene-2',
  //     createTime: '2024-01-16 09:00:00',
  //     createUser: 'user1',
  //     updateTime: '2024-01-21 16:00:00',
  //     updateUser: 'user1',
  //     isDeleted: 0,
  //     ontologyLinkTypeCounts: 10,
  //     ontologyObjectTypeCounts: 6,
  //     ontologyActionCounts: 8,
  //     ontologyFunctionCounts: 4,
  //     tagList: [
  //       { id: 3, name: '情报' },
  //       { id: 4, name: '分析' }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: '资源管理场景',
  //     description: '用于资源管理和调度的本体模型',
  //     icon: 'ontology-scene-3',
  //     createTime: '2024-01-17 11:00:00',
  //     createUser: 'user2',
  //     updateTime: '2024-01-22 10:00:00',
  //     updateUser: 'user2',
  //     isDeleted: 0,
  //     ontologyLinkTypeCounts: 12,
  //     ontologyObjectTypeCounts: 7,
  //     ontologyActionCounts: 10,
  //     ontologyFunctionCounts: 5,
  //     tagList: [
  //       { id: 5, name: '资源' },
  //       { id: 6, name: '管理' }
  //     ]
  //   }
  // ];

  // // 分页处理
  // const pageNo = params.pageNo || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (pageNo - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedResult = mockData.slice(startIndex, endIndex);

  // // 搜索过滤
  // let filteredResult = paginatedResult;
  // if (params.filter) {
  //   const filterLower = params.filter.toLowerCase();
  //   filteredResult = paginatedResult.filter(
  //     (item) =>
  //       item.name?.toLowerCase().includes(filterLower) ||
  //       item.description?.toLowerCase().includes(filterLower)
  //   );
  // }

  // return Promise.resolve({
  //   code: '',
  //   status: 200,
  //   data: {
  //     result: filteredResult,
  //     totalCount: mockData.length
  //   },
  //   message: 'success',
  //   requestId: 'mock-request-id'
  // });
};

export const createOntologyModel = (
  params: CreateOntologyModelReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  return UAPI.RES.CreateOntologyModelApi({}).post(params).inRegion().do();
  // Mock 数据：返回新创建的 id
  // const newId = Math.floor(Math.random() * 10000) + 100;

  // return Promise.resolve({
  //   code: '',
  //   status: 200,
  //   data: {
  //     id: newId
  //   },
  //   message: '创建成功',
  //   requestId: 'mock-request-id'
  // });
};

export const updateOntologyModel = (
  params: UpdateOntologyModelReq
): Promise<ApiRes<string>> => {
  return UAPI.RES.UpdateOntologyModelApi({}).post(params).inRegion().do();
  // Mock 数据：返回成功消息
  // return Promise.resolve({
  //   code: '',
  //   status: 200,
  //   data: '更新成功',
  //   message: '更新成功',
  //   requestId: 'mock-request-id'
  // });
};

export const deleteOntologyModel = (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  return UAPI.RES.DeleteOntologyModelApi({}).post(params).inRegion().do();
  // Mock 数据：返回成功消息
  // return Promise.resolve({
  //   code: '',
  //   status: 200,
  //   data: '删除成功',
  //   message: '删除成功',
  //   requestId: 'mock-request-id'
  // });
};

export const getOntologyModelDetail = async (params: {
  id: number;
}): Promise<ApiRes<OntologScene>> => {
  return await UAPI.RES.GetOntologyModelDetailApi({})
    .post(params)
    .inRegion()
    .do();
  // await sleep(1000);
  // // Mock 数据：根据 id 返回对应的详情
  // const mockData: OntologScene = {
  //   id: params.id,
  //   name: '作战本体场景',
  //   description:
  //     '用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型用于作战场景的本体模型',
  //   icon: 'ontology-scene-1',
  //   createTime: '2024-01-15 10:00:00',
  //   createUser: 'admin',
  //   updateTime: '2024-01-20 14:30:00',
  //   updateUser: 'admin',
  //   isDeleted: 0,
  //   ontologyLinkTypeCounts: 15,
  //   ontologyObjectTypeCounts: 8,
  //   ontologyActionCounts: 12,
  //   ontologyFunctionCounts: 6,
  //   tagList: [
  //     { id: 1, name: '作战' },
  //     { id: 2, name: '军事' }
  //   ]
  // };

  // return Promise.resolve({
  //   code: '',
  //   status: 200,
  //   data: mockData,
  //   message: 'success',
  //   requestId: 'mock-request-id'
  // });
};
