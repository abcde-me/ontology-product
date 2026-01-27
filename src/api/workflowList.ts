import UAPI from '@/api';
import { SearchWorkflowParams } from '@/pages/workflowList/types';
import { SQLScriptItem } from '@/pages/workflowConfig/workflow/nodes/sql-node/types';

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

// 工作流列表_结构化
export async function getStructuredWorkflowList(params: SearchWorkflowParams) {
  const res = await UAPI.RES.workflowListNew({}).post(params).inRegion().do();
  return (
    res.data || {
      items: [],
      total: 0
    }
  );
}

// 工作流执行状态枚举
export async function getProcessRunState() {
  const res = await UAPI.RES.getProcessRunState({}).post({}).inRegion().do();
  const statusMap: Record<string, string> = res.data || {};
  return Object.entries(statusMap).map(([key, value]) => {
    return {
      label: value,
      value: key
    };
  });
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

// 工作流删除
export async function workflowDeleteNew(params: {
  code: string;
  workflow_uuid: string;
}) {
  return await UAPI.RES.workflowDeleteNew({}).post(params).inRegion().do();
}

// 工作流复制
export async function workflowCopy(workflow_uuid: string | number) {
  return await UAPI.RES.workflowCopy({})
    .post({ workflow_uuid })
    .inRegion()
    .do();
}
