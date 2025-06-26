import UAPI from '@/api';

// 工作流列表
export async function getWorkflowList(
  params: any[] | Record<string | number, any> | undefined
) {
  return await UAPI.RES.workflowList({}).get(params).inRegion().do();
}

// 工作流操作
export async function workflowOperation(
  workflow_uuid: string | number,
  workflow_version: string
) {
  return await UAPI.RES.workflowOperation({ workflow_uuid, workflow_version })
    .delete()
    .inRegion()
    .do();
}
