import {
  CreateWorkflowParams,
  CreateWorkflowRes,
  WorkflowDetailRes,
  WorkflowOperationParams,
  WorkflowOperation
} from '@/types/workflowApi';
import UAPI from '@/api';

// 创建工作流
export async function createWorkflow(
  params: CreateWorkflowParams
): Promise<ApiRes<CreateWorkflowRes>> {
  // TODO: 联调
  return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
  // return Promise.resolve({
  //   code: '',
  //   message: 'ok',
  //   data: {
  //     ds_workflow_id: 3242242,
  //     workflow_uuid: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce'
  //   },
  //   requestId: '',
  //   status: 200
  // });
}

// 获取工作流详情
export async function getWorkflowDetail(
  workflow_uuid: string | number
): Promise<ApiRes<WorkflowDetailRes>> {
  // TODO: 联调
  return await UAPI.RES.workflowDetail({ workflow_uuid }).get().inRegion().do();
  // return Promise.resolve({
  //   code: 'Success',
  //   message: '请求成功',
  //   data: {
  //     ds_workflow_id: 3242242,
  //     workflow_uuid: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce',
  //     workflow_version: '',
  //     workflow_name: '新建工作流',
  //     source_path: '',
  //     target_path: '',
  //     run_cycle: '',
  //     create_time: new Date('2025-06-27T11:17:56.399+08:00').getTime(),
  //     update_time: '2025-06-27T14:23:24.143+08:00',
  //     is_online: 1,
  //     user_id: 'f7a41491-0dae-4754-94c1-ee1e8315196b',
  //     user_name: 'f7a41491-0dae-4754-94c1-ee1e8315196b'
  //   },
  //   requestId: '',
  //   status: 200
  // });
}

// 工作流操作（上下线、运行）
export async function operateWorkflow(
  workflow_uuid: string | number,
  params: WorkflowOperationParams
) {
  // TODO: 联调
  return UAPI.RES.workflowOperation({ workflow_uuid })
    .put(params)
    .inRegion()
    .do();

  // return Promise.resolve({
  //   code: '',
  //   message: 'ok',
  //   data: {},
  //   requestId: 'AIMDP-ff704d3e-388c-4929-9353-9ce7f5386616',
  //   status: 200
  // });
}

// 获取结束节点目标目录
export async function getWorkflowTargetPath(
  root_type: number, // 0: 获取所有数据目录，1: 获取源数据目录，2：获取目标数据目录
  search: string
) {
  return await UAPI.RES.workflowTargetPath({ root_type, search })
    .get({
      root_type,
      search
    })
    .inRegion()
    .do();
}
