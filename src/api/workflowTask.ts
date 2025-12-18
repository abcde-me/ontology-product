import UAPI from '@/api';
import {
  GetTaskNodeListParams,
  GetTaskNodeListResponse,
  GetWorkflowRunResultListParams,
  GetWorkflowRunResultListResponse,
  GetWorkflowTaskListParams,
  GetWorkflowTaskListResponse,
  WorkflowOperationParams
} from '@/types/workflowTaskApi';

// 工作流运行记录列表
export async function getWorkflowTaskList(
  params: GetWorkflowTaskListParams
): Promise<ApiRes<GetWorkflowTaskListResponse>> {
  return await UAPI.RES.ListProcessInstanceApi({}).post(params).inRegion().do();
}

// 任务节点运行记录列表
export async function getTaskNodeList(
  params: GetTaskNodeListParams
): Promise<ApiRes<GetTaskNodeListResponse>> {
  return await UAPI.RES.ListTaskInstanceApi({}).post(params).inRegion().do();
}

// 工作流操作（重新运行，暂停，继续运行，结束运行，重试失败任务）
export async function workflowOperation(
  params: WorkflowOperationParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.ExecuteProcessApi({}).post(params).inRegion().do();
}

// 获取工作流运行结果列表
export async function getWorkflowRunResultList(
  params: GetWorkflowRunResultListParams
): Promise<ApiRes<GetWorkflowRunResultListResponse>> {
  return await UAPI.RES.GetWorkflowInstanceInfoApi({})
    .post(params)
    .inRegion()
    .do();
}
