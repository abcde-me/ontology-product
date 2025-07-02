import UAPI from '@/api';

// 工作流列表
export async function getWorkflowList(params: {
  uid: string | number;
  search_content: string;
  page: number;
  page_size: number;
}) {
  return await UAPI.RES.workflowList({}).get(params).inRegion().do();
}

// 工作流删除
export async function workflowDelete(
  workflow_uuid: string | number,
  workflow_version: string
) {
  return await UAPI.RES.workflowDelete({ workflow_uuid, workflow_version })
    .delete()
    .inRegion()
    .do();
}

// 工作流复制
export async function workflowCopy(workflow_uuid: string | number) {
  return await UAPI.RES.workflowCopy({ workflow_uuid }).post().inRegion().do();
}
