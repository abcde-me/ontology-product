import UAPI from '@/api';

// TODO: 待补充类型
export async function createWorkflow(params: Record<string, any>) {
  return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
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
