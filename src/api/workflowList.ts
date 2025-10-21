import UAPI from '@/api';

// 工作流列表
export async function getWorkflowList(params: {
  uid: string | number;
  search_content: string;
  page: number;
  page_size: number;
  run_cycle: string;
  sort: string;
}) {
  return await UAPI.RES.workflowList({}).post(params).inRegion().do();
}

// 工作流删除
export async function workflowDelete(
  workflow_uuid: string | number,
  workflow_version: string
) {
  return await UAPI.RES.workflowDelete({})
    .post({ workflow_uuid, workflow_version })
    .inRegion()
    .do();
}

// 工作流复制
export async function workflowCopy(workflow_uuid: string | number) {
  return await UAPI.RES.workflowCopy({})
    .post({ workflow_uuid })
    .inRegion()
    .do();
}
