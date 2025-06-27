import UAPI from '@/api';

// 创建工作流
export async function createWorkflow(
  params: CreateWorkflowParams
): Promise<ApiRes<CreateWorkflowRes>> {
  // TODO: 联调
  // return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
  return Promise.resolve({
    code: '',
    message: 'ok',
    data: {
      ds_workflow_id: '3242242',
      workflow_uuid: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce'
    },
    requestId: '',
    status: 200
  });
}

// 获取工作流详情
export async function getWorkflowDetail(
  workflow_uuid: string
): Promise<ApiRes<WorkflowDetailRes>> {
  // TODO: 联调
  // return await UAPI.RES.workflowDetail({ workflow_uuid }).get().inRegion().do();
  // return Promise.resolve({
  //   code: 'Success',
  //   message: '请求成功',
  //   data: {
  //     id: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce',
  //     name: '新建工作流',
  //     description: '',
  //     mode: 'workflow',
  //     icon_type: '',
  //     icon: '',
  //     icon_background: '',
  //     icon_url: null,
  //     model_config: null,
  //     workflow: null,
  //     created_by: 'f7a41491-0dae-4754-94c1-ee1e8315196b',
  //     created_at: '2025-06-27T11:17:56.399+08:00',
  //     updated_by: 'f7a41491-0dae-4754-94c1-ee1e8315196b',
  //     status: 'unpublished',
  //     updated_at: '2025-06-27T14:23:24.143+08:00',
  //     favorite_count: 0,
  //     usage_count: 0,
  //     is_favorite: false,
  //     app_type_infos: null,
  //     model_infos: null,
  //     user_name: '',
  //     workflow_infos: null,
  //     private_workflow_num: 0,
  //     published_at: null,
  //     publish_type: '',
  //     published_organization_infos: null,
  //     list_api_user_perms: null
  //   },
  //   requestId: '',
  //   status: null
  // });
  return Promise.resolve({
    code: 'Success',
    message: '请求成功',
    data: {
      ds_workflow_id: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce',
      workflow_uuid: 'app-903a7d22-dd9d-4ab9-8748-2659c2dbf1ce',
      workflow_version: '',
      workflow_name: '新建工作流',
      source_path: '',
      target_path: '',
      run_cycle: '',
      create_time: new Date('2025-06-27T11:17:56.399+08:00').getTime(),
      update_time: '2025-06-27T14:23:24.143+08:00',
      is_online: 0,
      user_id: 'f7a41491-0dae-4754-94c1-ee1e8315196b',
      user_name: 'f7a41491-0dae-4754-94c1-ee1e8315196b'
    },
    requestId: '',
    status: 200
  });
}

// 工作流操作（上下线、运行）
// TODO: 待补充类型
export async function publishWorkflow(workflowId: number, params: any = {}) {
  return UAPI.RES.workflowPublish({ workflowId }).post(params).inRegion().do();
}
