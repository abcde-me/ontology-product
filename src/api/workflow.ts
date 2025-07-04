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
  return await UAPI.RES.createWorkflow({}).post(params).inRegion().do();
}

// 编辑工作流
export async function editWorkflow(
  workflow_uuid: string | number,
  params: CreateWorkflowParams
): Promise<ApiRes<CreateWorkflowRes>> {
  return await UAPI.RES.editWorkflow({ workflow_uuid })
    .put(params)
    .inRegion()
    .do();
}

// 获取工作流详情
export async function getWorkflowDetail(
  workflow_uuid: string | number
): Promise<ApiRes<WorkflowDetailRes>> {
  return await UAPI.RES.workflowDetail({ workflow_uuid }).get().inRegion().do();
}

// 工作流操作（上下线、运行）
export async function operateWorkflow(
  workflow_uuid: string | number,
  params: WorkflowOperationParams
) {
  return UAPI.RES.workflowOperation({ workflow_uuid })
    .put(params)
    .inRegion()
    .do();
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
