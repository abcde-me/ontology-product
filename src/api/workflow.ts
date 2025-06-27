import UAPI from '@/api';

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

// TODO: 待补充类型
export async function getWorkflowDetail(id: string | number) {
  return await UAPI.RES.appDetailV2({ appId: id }).get().inRegion().do();
}

// 工作流操作（上下线、运行）
// TODO: 待补充类型
export async function publishWorkflow(workflowId: number, params: any = {}) {
  return UAPI.RES.workflowPublish({ workflowId }).post(params).inRegion().do();
}
