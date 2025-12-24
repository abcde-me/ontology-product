import UAPI from '@/api';
import {
  GetRunLogsParams,
  GetRunLogsResponse,
  GetTaskNodeListParams,
  GetTaskNodeListResponse,
  GetWorkflowRunResultListParams,
  GetWorkflowRunResultListResponse,
  GetWorkflowTaskListParams,
  GetWorkflowTaskListResponse,
  ListTaskInstanceParams,
  ListTaskInstanceResponse,
  TaskDetailParams,
  TaskDetailResponse,
  TaskNodeForceSuccessParams,
  TaskNodeRetryParams,
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

// 获取工作流单节点运行结果
export async function listTaskInstance(
  params: ListTaskInstanceParams
): Promise<ApiRes<ListTaskInstanceResponse>> {
  return await UAPI.RES.ListTaskInstanceApi({}).post(params).inRegion().do();
}

// 任务节点强制成功
export async function taskNodeForcesSuccess(
  params: TaskNodeForceSuccessParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.TaskForcesSuccessApi({}).post(params).inRegion().do();
}

// 任务节点重试
export async function taskNodeRetry(
  params: TaskNodeRetryParams
): Promise<ApiRes<{}>> {
  return await UAPI.RES.RunTaskIntanceApi({}).post(params).inRegion().do();
}

// 获取任务运行日志
export async function getRunLogs(
  params: GetRunLogsParams
): Promise<ApiRes<GetRunLogsResponse>> {
  return await UAPI.RES.GetRunLogsApi({}).post(params).inRegion().do();
}

// 作业详情
export async function getTaskDetail(
  params: TaskDetailParams
): Promise<ApiRes<TaskDetailResponse>> {
  return await UAPI.RES.taskDetail({}).post(params).inRegion().do();
}
