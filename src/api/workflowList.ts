import UAPI from '@/api';

// 工作流列表
export async function getWorkflowList(
  params: any[] | Record<string | number, any> | undefined
) {
  return await UAPI.RES.workflowList({}).get(params).inRegion().do();
}

// 工作流操作
export async function workflowOperation(
  params: any[] | Record<string | number, any> | undefined
) {
  return await UAPI.RES.workflowOperation({}).post(params).inRegion().do();
}
