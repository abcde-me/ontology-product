import UAPI from '@/api';

// TODO: 待补充类型
export async function createWorkflow(params: Record<string, any>) {
  return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
}

// TODO: 待补充类型
export async function getWorkflowDetail(id: string | number) {
  return await UAPI.RES.appDetailV2({ appId: id }).get().inRegion().do();
}
